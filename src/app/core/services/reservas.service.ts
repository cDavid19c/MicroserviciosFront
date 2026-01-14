import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, catchError, of, throwError, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Reserva,
  ReservaDisplay,
  HabxRes,
  Hold,
  PreReservaRequest,
  ConfirmarReservaRequest
} from '../models/reserva.model';
import { HabitacionesService } from './habitaciones.service';

// Interface para reservas guardadas localmente
export interface LocalReserva {
  id: string;
  idHold: string;
  idReserva?: number;
  idHabitacion: string;
  nombreHabitacion: string;
  nombreHotel?: string;
  nombreCiudad?: string;
  fechaInicio: string;
  fechaFin: string;
  numeroHuespedes: number;
  precioTotal?: number;
  estado: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'EXPIRADA';
  fechaCreacion: string;
  fechaExpiracion: string;
  usuarioId: number;
  imagen?: string;
  facturaGenerada?: boolean;
  urlFactura?: string;
}

const RESERVAS_STORAGE_KEY = 'hotel_reservas';

@Injectable({
  providedIn: 'root'
})
export class ReservasService {
  private http = inject(HttpClient);
  // private habitacionesService = inject(HabitacionesService); // Removed to avoid circular dependency if needed later

  // URLs directas a los microservicios
  private usuariosPagosUrl = environment.usuariosPagosServiceUrl;
  private graphqlUrl = environment.habitacionesGraphqlUrl;

  // ==================== LOCAL STORAGE METHODS ====================

  /**
   * Guarda una nueva reserva en localStorage
   */
  saveLocalReserva(reserva: LocalReserva): void {
    const reservas = this.getLocalReservas();
    reservas.push(reserva);
    localStorage.setItem(RESERVAS_STORAGE_KEY, JSON.stringify(reservas));
  }

  /**
   * Obtiene todas las reservas del localStorage
   */
  getLocalReservas(): LocalReserva[] {
    const data = localStorage.getItem(RESERVAS_STORAGE_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data) as LocalReserva[];
    } catch {
      return [];
    }
  }

  /**
   * Marca una reserva como facturada localmente
   */
  setFacturaGenerada(idReserva: number, urlFactura?: string): void {
    const reservas = this.getLocalReservas();
    const index = reservas.findIndex(r => r.idReserva === idReserva);
    if (index !== -1) {
      reservas[index].facturaGenerada = true;
      if (urlFactura) {
        reservas[index].urlFactura = urlFactura;
      }
      localStorage.setItem(RESERVAS_STORAGE_KEY, JSON.stringify(reservas));
    }
  }

  /**
   * Obtiene reservas de un usuario específico, limpiando expiradas
   */
  getLocalReservasUsuario(usuarioId: number): LocalReserva[] {
    this.cleanExpiredReservas();
    return this.getLocalReservas()
      .filter(r => r.usuarioId === usuarioId)
      .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());
  }

  /**
   * Actualiza el estado de una reserva local
   */
  updateLocalReservaEstado(idHold: string, estado: LocalReserva['estado'], idReserva?: number): void {
    const reservas = this.getLocalReservas();
    const index = reservas.findIndex(r => r.idHold === idHold);
    if (index !== -1) {
      reservas[index].estado = estado;
      if (idReserva) {
        reservas[index].idReserva = idReserva;
      }
      localStorage.setItem(RESERVAS_STORAGE_KEY, JSON.stringify(reservas));
    }
  }

  /**
   * Elimina una reserva local por idHold
   */
  removeLocalReserva(idHold: string): void {
    const reservas = this.getLocalReservas().filter(r => r.idHold !== idHold);
    localStorage.setItem(RESERVAS_STORAGE_KEY, JSON.stringify(reservas));
  }

  /**
   * Limpia las reservas expiradas (pendientes que pasaron su tiempo)
   */
  private cleanExpiredReservas(): void {
    const now = new Date().getTime();
    const reservas = this.getLocalReservas();
    const updated = reservas.map(r => {
      if (r.estado === 'PENDIENTE' && new Date(r.fechaExpiracion).getTime() < now) {
        return { ...r, estado: 'EXPIRADA' as const };
      }
      return r;
    });
    localStorage.setItem(RESERVAS_STORAGE_KEY, JSON.stringify(updated));
  }

  // ==================== API METHODS ====================

  /**
   * Obtiene reservas del usuario (desde localStorage)
   */
  getReservas(): Observable<Reserva[]> {
    return of([]);
  }

  getReservaById(id: number): Observable<Reserva | null> {
    return of(null);
  }

  /**
   * Obtiene relaciones habitación-reserva
   */
  getHabxRes(): Observable<HabxRes[]> {
    return of([]);
  }

  /**
   * Obtiene holds (pre-reservas)
   */
  getHolds(): Observable<Hold[]> {
    return of([]);
  }

  /**
   * Obtiene las reservas de un usuario específico con datos enriquecidos
   * Usa el API Gateway que expone el gRPC como REST y GraphQL para habitaciones
   */
  getMisReservas(usuarioId: number): Observable<ReservaDisplay[]> {
    const apiGatewayUrl = environment.apiGatewayUrl;
    const graphqlUrl = environment.habitacionesGraphqlUrl;
    const reservasUrl = `${apiGatewayUrl}/reservas-grpc/reservas`;
    const habxresUrl = `${apiGatewayUrl}/reservas-grpc/habxres`;

    console.log('[ReservasService] Fetching reservas, habxres and habitaciones...');

    // Query GraphQL para obtener habitaciones con nombres
    const habitacionesQuery = {
      query: `query {
        habitaciones {
          idHabitacion
          nombreHabitacion
          hotel {
            nombreHotel
            ciudad {
              nombreCiudad
            }
          }
          imagenes {
            urlImagenHabitacion
          }
        }
      }`
    };

    // Obtener reservas, habxres y habitaciones en paralelo
    return forkJoin({
      reservas: this.http.get<any[]>(reservasUrl),
      habxres: this.http.get<any[]>(habxresUrl),
      habitacionesResp: this.http.post<any>(graphqlUrl, habitacionesQuery)
    }).pipe(
      map(({ reservas, habxres, habitacionesResp }) => {
        console.log('[ReservasService] Got', reservas?.length || 0, 'reservas,', habxres?.length || 0, 'habxres');

        if (!Array.isArray(reservas)) {
          return this.getLocalDisplays(usuarioId);
        }

        // Crear mapa de idHabitacion -> datos de habitación
        const habitacionesMap: { [key: string]: any } = {};
        const habitaciones = habitacionesResp?.data?.habitaciones || [];
        habitaciones.forEach((h: any) => {
          habitacionesMap[h.idHabitacion] = {
            nombre: h.nombreHabitacion || h.idHabitacion,
            hotel: h.hotel?.nombreHotel || '',
            ciudad: h.hotel?.ciudad?.nombreCiudad || '',
            imagen: h.imagenes?.[0]?.urlImagenHabitacion || 'https://imageness3realdecuenca.s3.us-east-2.amazonaws.com/Imagen4.png'
          };
        });

        // Crear mapa de idReserva -> idHabitacion desde habxres
        const reservaToHabitacion: { [key: number]: string } = {};
        if (Array.isArray(habxres)) {
          habxres.forEach((h: any) => {
            const idReserva = h.idReserva || h.IdReserva;
            const idHabitacion = h.idHabitacion || h.IdHabitacion;
            if (idReserva && idHabitacion) {
              reservaToHabitacion[idReserva] = idHabitacion;
            }
          });
        }

        // Filtrar reservas del usuario actual
        const userReservas = reservas.filter((r: any) =>
          r.idUsuario === usuarioId ||
          r.IdUsuario === usuarioId
        );

        console.log('[ReservasService] Found', userReservas.length, 'reservas for user', usuarioId);

        // Mapear a ReservaDisplay
        const backendDisplays: ReservaDisplay[] = userReservas.map((r: any) => {
          const idReserva = r.idReserva || r.IdReserva || 0;
          const idHabitacion = reservaToHabitacion[idReserva] || '';
          const habData = habitacionesMap[idHabitacion] || {};

          return {
            idReserva: idReserva,
            idUsuario: r.idUsuario || r.IdUsuario || usuarioId,
            idHabitacion: idHabitacion,
            idHold: '',
            habitacion: habData.nombre || idHabitacion || `Reserva #${idReserva}`,
            hotel: habData.hotel || '',
            ciudad: habData.ciudad || '',
            pais: '',
            fechaInicio: r.fechaInicio || r.FechaInicio || '',
            fechaFin: r.fechaFinal || r.FechaFinal || '',
            huespedes: 1,
            estado: r.estadoGeneral || r.EstadoGeneral || 'CONFIRMADA',
            subtotal: r.costoTotal || r.CostoTotal || 0,
            totalDescuentos: 0,
            totalImpuestos: 0,
            total: r.costoTotal || r.CostoTotal || 0,
            capacidadEscogida: 1,
            capacidadHabitacion: 1,
            imagen: habData.imagen || 'https://imageness3realdecuenca.s3.us-east-2.amazonaws.com/Imagen4.png',
            fechaRegistro: r.fechaRegistro || r.FechaRegistro || ''
          };
        });

        // Agregar pre-reservas locales pendientes
        const localPendientes = this.getLocalReservasUsuario(usuarioId)
          .filter(r => r.estado === 'PENDIENTE');

        const localDisplays: ReservaDisplay[] = localPendientes.map(r => ({
          idReserva: r.idReserva || 0,
          idUsuario: r.usuarioId,
          idHabitacion: r.idHabitacion,
          idHold: r.idHold,
          habitacion: r.nombreHabitacion,
          hotel: r.nombreHotel || '',
          ciudad: r.nombreCiudad || '',
          pais: '',
          fechaInicio: r.fechaInicio,
          fechaFin: r.fechaFin,
          huespedes: r.numeroHuespedes,
          estado: r.estado,
          subtotal: r.precioTotal || 0,
          totalDescuentos: 0,
          totalImpuestos: 0,
          total: r.precioTotal || 0,
          capacidadEscogida: r.numeroHuespedes,
          capacidadHabitacion: r.numeroHuespedes,
          imagen: r.imagen || 'https://imageness3realdecuenca.s3.us-east-2.amazonaws.com/Imagen4.png'
        }));

        // Combinar y ordenar de más nuevo a más viejo (por idReserva descendente)
        const allReservas = [...localDisplays, ...backendDisplays];
        allReservas.sort((a, b) => b.idReserva - a.idReserva);

        return allReservas;
      }),
      catchError(err => {
        console.error('[ReservasService] Error fetching from API Gateway:', err);
        return of(this.getLocalDisplays(usuarioId));
      })
    );
  }

  private getLocalDisplays(usuarioId: number): ReservaDisplay[] {
    const localReservas = this.getLocalReservasUsuario(usuarioId);
    return localReservas.map(r => ({
      idReserva: r.idReserva || 0,
      idUsuario: r.usuarioId,
      idHabitacion: r.idHabitacion,
      idHold: r.idHold,
      habitacion: r.nombreHabitacion,
      hotel: r.nombreHotel || '',
      ciudad: r.nombreCiudad || '',
      pais: '',
      fechaInicio: r.fechaInicio,
      fechaFin: r.fechaFin,
      huespedes: r.numeroHuespedes,
      estado: r.estado,
      subtotal: r.precioTotal || 0,
      totalDescuentos: 0,
      totalImpuestos: 0,
      total: r.precioTotal || 0,
      capacidadEscogida: r.numeroHuespedes,
      capacidadHabitacion: r.numeroHuespedes,
      imagen: r.imagen || 'https://imageness3realdecuenta.s3.us-east-2.amazonaws.com/Imagen4.png'
    }));
  }

  /**
   * Crea una pre-reserva (HOLD) via funciones especiales del microservicio
   */
  crearPreReserva(data: PreReservaRequest): Observable<any> {
    const payload = {
      IdHabitacion: data.idHabitacion,
      FechaInicio: data.fechaInicio,
      FechaFin: data.fechaFin,
      NumeroHuespedes: data.numeroHuespedes,
      DuracionHoldSeg: 1800,
      PrecioActual: 0,
      IdUsuario: data.usuarioId
    };

    return this.http.post(`${this.usuariosPagosUrl}/funciones-especiales/prereserva`, payload).pipe(
      catchError(error => {
        console.error('Error al crear pre-reserva:', error);
        return throwError(() => new Error(error.error?.message || 'Error al crear la pre-reserva'));
      })
    );
  }

  /**
   * Confirma una reserva via funciones especiales del microservicio
   */
  confirmarReserva(data: ConfirmarReservaRequest): Observable<any> {
    const payload = {
      IdHabitacion: data.idHabitacion,
      IdHold: data.idHold,
      Nombre: data.nombre,
      Apellido: data.apellido,
      Correo: data.correo,
      TipoDocumento: data.tipoDocumento,
      Documento: data.documento,
      FechaInicio: data.fechaInicio,
      FechaFin: data.fechaFin,
      NumeroHuespedes: data.numeroHuespedes
    };

    return this.http.post(`${this.usuariosPagosUrl}/funciones-especiales/confirmar`, payload).pipe(
      tap((response: any) => {
        // Actualizar el estado local a CONFIRMADA
        const idReserva = response?.idReserva || response?.IdReserva;
        this.updateLocalReservaEstado(data.idHold, 'CONFIRMADA', idReserva);
      }),
      catchError(error => {
        console.error('Error al confirmar reserva:', error);
        return throwError(() => new Error(error.error?.message || 'Error al confirmar la reserva'));
      })
    );
  }

  /**
   * Cancela una pre-reserva via funciones especiales del microservicio
   */
  cancelarReserva(idHold?: string, idReserva?: number): Observable<any> {
    if (idHold) {
      return this.http.delete(`${this.usuariosPagosUrl}/funciones-especiales/prereserva/${idHold}`).pipe(
        tap(() => {
          // Actualizar el estado local a CANCELADA
          this.updateLocalReservaEstado(idHold, 'CANCELADA');
        }),
        catchError(error => {
          console.error('Error al cancelar reserva:', error);
          // Aún así marcar como cancelada localmente
          if (idHold) {
            this.updateLocalReservaEstado(idHold, 'CANCELADA');
          }
          return throwError(() => new Error(error.error?.message || 'Error al cancelar la reserva'));
        })
      );
    }

    return throwError(() => new Error('Se requiere idHold para cancelar'));
  }

  /**
   * Obtiene información de un hold específico
   */
  getHoldInfo(idHold: string): Observable<any> {
    return this.http.get(`${this.usuariosPagosUrl}/funciones-especiales/prereserva/${idHold}`).pipe(
      catchError(error => {
        console.error('Error al obtener info del hold:', error);
        return of(null);
      })
    );
  }
}
