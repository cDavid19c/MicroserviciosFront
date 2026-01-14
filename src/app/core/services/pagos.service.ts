import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, catchError, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pago, PagoDisplay, Factura, GenerarFacturaRequest } from '../models/pago.model';
import { ReservasService } from './reservas.service';

@Injectable({
  providedIn: 'root'
})
export class PagosService {
  private http = inject(HttpClient);
  private reservasService = inject(ReservasService);

  // URLs directas a los microservicios
  private usuariosPagosUrl = environment.usuariosPagosServiceUrl;

  // URL para gestión de pagos - usa el mismo servicio de Render que tiene CORS habilitado
  private gestionPagoUrl = `${environment.usuariosPagosServiceUrl}/gestion/pago`;

  /**
   * Obtiene todos los pagos desde UsuariosPagosService
   */
  getPagos(): Observable<Pago[]> {
    return this.http.get<Pago[]>(`${this.usuariosPagosUrl}/Pagos`).pipe(
      catchError(() => of([]))
    );
  }

  /**
   * Obtiene todas las facturas desde UsuariosPagosService
   */
  getFacturas(): Observable<Factura[]> {
    return this.http.get<Factura[]>(`${this.usuariosPagosUrl}/Facturas`).pipe(
      catchError(() => of([]))
    );
  }

  /**
   * Obtiene todos los PDFs desde UsuariosPagosService
   */
  getPdfs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.usuariosPagosUrl}/Pdfs`).pipe(
      catchError(() => of([]))
    );
  }

  /**
   * Obtiene los pagos de un usuario específico con datos enriquecidos
   * Combina pagos de la API con pagos derivados de reservas locales confirmadas
   */
  getMisPagos(usuarioId: number): Observable<PagoDisplay[]> {
    return forkJoin({
      pagos: this.getPagos(),
      facturas: this.getFacturas(),
      pdfs: this.getPdfs(),
      localReservas: of(this.reservasService.getLocalReservasUsuario(usuarioId))
    }).pipe(
      map(({ pagos, facturas, pdfs, localReservas }) => {
        // 1. Procesar pagos reales de la API
        const pagosUsuario = pagos.filter(p => p.IdUnicoUsuario === usuarioId);

        const facturasIdx: Record<number, Factura> = {};
        facturas.forEach(f => facturasIdx[f.IdFactura] = f);

        const pdfsIdx: Record<number, any> = {};
        pdfs.forEach(p => {
          if (p.IdFactura) pdfsIdx[p.IdFactura] = p;
        });

        const pagosDisplay: PagoDisplay[] = pagosUsuario.map(p => {
          const factura = facturasIdx[p.IdFactura || 0];
          const pdf = pdfsIdx[p.IdFactura || 0];

          let fecha = '';
          if (p.FechaEmisionPago && typeof p.FechaEmisionPago === 'string') {
            fecha = p.FechaEmisionPago.includes('-')
              ? p.FechaEmisionPago.substring(0, 10)
              : 'Fecha no disponible';
          }

          return {
            id: p.IdPago,
            idReserva: p.IdReserva,
            facturaId: p.IdFactura,
            monto: p.MontoTotalPago,
            fecha,
            estado: p.EstadoPago ? 'Pagado' : 'Pendiente',
            cuentaOrigen: p.CuentaOrigenPago,
            cuentaDestino: p.CuentaDestinoPago,
            metodo: p.IdMetodoPago,
            factura,
            pdfEstado: pdf?.EstadoPdf,
            pdfUrl: pdf?.UrlPdf
          } as PagoDisplay;
        });

        // 2. Integrar pagos derivados de reservas locales CONFIRMADAS
        // Si una reserva está confirmada y no tiene un pago asociado en la API, mostramos un pago pendiente simulado
        // 2. Integrar pagos derivados de reservas locales CONFIRMADAS
        // Si una reserva está confirmada y no tiene un pago asociado en la API, mostramos un pago pendiente simulado
        // Si tiene pago pero localmente ya generamos factura, actualizamos el estado visual
        localReservas.forEach(reserva => {
          if (reserva.estado === 'CONFIRMADA') {
            // Verificar si ya existe un pago real para esta reserva (por idReserva)
            // Aseguramos comparar números
            const pagoExistente = pagosDisplay.find(p => Number(p.idReserva) === Number(reserva.idReserva));

            if (pagoExistente) {
              // Si existe el pago pero localmente sabemos que ya generamos factura
              if (reserva.facturaGenerada) {
                pagoExistente.facturaId = 99999; // ID Simulado
                pagoExistente.pdfEstado = true;
                pagoExistente.pdfUrl = reserva.urlFactura || pagoExistente.pdfUrl || '';
                // Forzar estado visual si se requiere
              }
            } else {
              // Si no existe el pago en API, lo simulamos
              pagosDisplay.push({
                id: 0, // ID 0 indica que es simulado/pendiente en backend pero confirmado en frontend
                idReserva: reserva.idReserva,
                facturaId: reserva.facturaGenerada ? 99999 : 0, // 99999 indica generado localmente
                monto: reserva.precioTotal || 0,
                fecha: reserva.fechaCreacion.substring(0, 10),
                estado: 'Pagado', // Al estar confirmada, asumimos pagado
                cuentaOrigen: 'Pago en línea',
                cuentaDestino: 'Hotel Andino',
                metodo: 1, // Tarjeta por defecto
                factura: undefined,
                pdfEstado: !!reserva.facturaGenerada,
                pdfUrl: reserva.urlFactura || ''
              });
            }
          }
        });

        return pagosDisplay.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      })
    );
  }

  /**
   * Genera una factura para una reserva via funciones especiales
   */
  generarFactura(data: GenerarFacturaRequest): Observable<any> {
    // Construir query params para el endpoint de funciones especiales
    const params = new URLSearchParams();
    params.append('idReserva', String(data.idReserva));
    if (data.correo) params.append('correo', data.correo);
    if (data.nombre) params.append('nombre', data.nombre);
    if (data.apellido) params.append('apellido', data.apellido);
    if (data.tipoDocumento) params.append('tipoDocumento', data.tipoDocumento);
    if (data.documento) params.append('documento', data.documento);

    return this.http.post(`${this.usuariosPagosUrl}/funciones-especiales/emitir-factura?${params.toString()}`, {}).pipe(
      catchError(error => {
        console.error('Error al generar factura:', error);
        return throwError(() => new Error(error.error?.message || 'Error al generar la factura'));
      })
    );
  }

  /**
   * Genera el PDF de una factura existente
   * TODO: Implementar cuando el endpoint esté disponible en el microservicio
   */
  generarPdfFactura(facturaId: number): Observable<any> {
    return throwError(() => new Error('Función de generación de PDF no disponible aún en microservicios'));
  }

  /**
   * Registra un pago de reserva interna en la tabla PAGO
   * Llama al endpoint POST /api/gestion/pago/reserva-interna
   * Replica la lógica de Django's PagoGestionRest.registrar_pago_reserva_interna()
   */
  registrarPagoReservaInterna(data: {
    idReserva: number;
    idUnicoUsuario: number;
    montoTotal: number;
    cuentaOrigen: string;
    cuentaDestino: string;
    idMetodoPago?: number;
  }): Observable<any> {
    const payload = {
      IdReserva: data.idReserva,
      IdUnicoUsuario: data.idUnicoUsuario,
      MontoTotalPago: data.montoTotal,
      CuentaOrigenPago: data.cuentaOrigen,
      CuentaDestinoPago: data.cuentaDestino,
      IdUnicoUsuarioExterno: null,
      IdMetodoPago: data.idMetodoPago || 2  // 2 = Pago en línea por defecto
    };

    console.log('[PagosService] Registrando pago en BD:', payload);

    return this.http.post(`${this.gestionPagoUrl}/reserva-interna`, payload).pipe(
      map(response => {
        console.log('[PagosService] Pago registrado correctamente:', response);
        return response || { mensaje: 'Pago registrado correctamente' };
      }),
      catchError(error => {
        console.error('[PagosService] Error al registrar pago:', error);
        return throwError(() => new Error(error.error?.message || 'Error al registrar el pago en la base de datos'));
      })
    );
  }
}
