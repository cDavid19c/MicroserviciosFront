import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, catchError, of, throwError, switchMap } from 'rxjs';

/**
 * BancoService - Cliente REST para el API del banco
 * Replica la lógica de Django's BancoRest.py
 * Base URL: http://mibanca.runasp.net
 */
@Injectable({
    providedIn: 'root'
})
export class BancoService {
    private http = inject(HttpClient);

    private readonly BANCO_URL = 'http://mibanca.runasp.net';

    // Cuentas fijas del sistema 
    readonly CUENTA_CLIENTE = '1727115820';  // Cuenta que usan todos los clientes
    readonly CUENTA_HOTEL = '1727115810';    // Cuenta donde se reciben los pagos

    /**
     * Obtiene un cliente por su cédula
     */
    getCliente(cedula: string): Observable<any> {
        return this.http.get(`${this.BANCO_URL}/api/clientes/${cedula}`).pipe(
            catchError(error => {
                console.error('Error al obtener cliente:', error);
                return throwError(() => new Error('Error al obtener cliente del banco'));
            })
        );
    }

    /**
     * Obtiene las cuentas de un cliente por su cédula
     */
    getCuentasCliente(cedula: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.BANCO_URL}/api/Cuentas/cliente/${cedula}`).pipe(
            catchError(error => {
                console.error('Error al obtener cuentas:', error);
                return of([]);
            })
        );
    }

    /**
     * Crea una transacción entre dos cuentas
     */
    crearTransaccion(cuentaOrigen: number, cuentaDestino: number, monto: number): Observable<{ ok: boolean; mensaje: string }> {
        const payload = {
            cuenta_origen: cuentaOrigen,
            cuenta_destino: cuentaDestino,
            monto: monto
        };

        return this.http.post(`${this.BANCO_URL}/api/Transacciones`, payload, { responseType: 'text' }).pipe(
            map(response => {
                const respuestaLower = (response || '').toLowerCase();
                if (respuestaLower.includes('correctamente') || respuestaLower.includes('éxito')) {
                    return { ok: true, mensaje: response || 'Transacción realizada correctamente' };
                } else {
                    return { ok: false, mensaje: response || 'Error en la transacción' };
                }
            }),
            catchError(error => {
                console.error('Error al crear transacción:', error);
                return of({ ok: false, mensaje: error.error || 'Error al procesar la transacción bancaria' });
            })
        );
    }

    /**
     * Realiza un pago desde la cuenta compartida del cliente hacia la cuenta del hotel.
     * Replica exactamente la lógica de Django's BancoRest.realizar_pago()
     * 
     * Flow:
     * 1. Obtener cliente y cuentas de CUENTA_CLIENTE (0707001320)
     * 2. Obtener cliente y cuentas de CUENTA_HOTEL (0707001310)
     * 3. Verificar saldo suficiente
     * 4. Ejecutar transacción con los cuenta_id correctos
     */
    realizarPago(monto: number): Observable<{ ok: boolean; mensaje: string }> {
        console.log('[BancoService] Iniciando pago por monto:', monto);

        // 1. Obtener cuentas del cliente y del hotel en paralelo
        return forkJoin({
            cuentasCliente: this.getCuentasCliente(this.CUENTA_CLIENTE),
            cuentasHotel: this.getCuentasCliente(this.CUENTA_HOTEL)
        }).pipe(
            switchMap(({ cuentasCliente, cuentasHotel }) => {
                console.log('[BancoService] Cuentas cliente:', cuentasCliente);
                console.log('[BancoService] Cuentas hotel:', cuentasHotel);

                // Validar que existan cuentas
                if (!cuentasCliente || cuentasCliente.length === 0) {
                    return of({ ok: false, mensaje: 'No se encontró la cuenta del cliente (origen)' });
                }

                if (!cuentasHotel || cuentasHotel.length === 0) {
                    return of({ ok: false, mensaje: 'No se encontró la cuenta del hotel (destino)' });
                }

                // Buscar cuenta con saldo suficiente (o usar la primera)
                let cuentaOrigenObj = cuentasCliente.find(c => (c.saldo || 0) >= monto);
                if (!cuentaOrigenObj) {
                    cuentaOrigenObj = cuentasCliente[0];
                }

                const cuentaDestinoObj = cuentasHotel[0];

                const cuentaOrigenId = cuentaOrigenObj.cuenta_id;
                const cuentaDestinoId = cuentaDestinoObj.cuenta_id;
                const saldoCliente = cuentaOrigenObj.saldo || 0;

                if (!cuentaOrigenId || !cuentaDestinoId) {
                    return of({ ok: false, mensaje: 'No se pudo obtener los IDs de las cuentas' });
                }

                // Verificar saldo
                if (saldoCliente < monto) {
                    return of({ ok: false, mensaje: `Saldo insuficiente. Saldo disponible: $${saldoCliente.toFixed(2)}` });
                }

                console.log(`[BancoService] Ejecutando transacción:`);
                console.log(`  - Cuenta origen (cliente): cuenta_id=${cuentaOrigenId}, saldo=${saldoCliente}`);
                console.log(`  - Cuenta destino (hotel): cuenta_id=${cuentaDestinoId}`);
                console.log(`  - Monto: ${monto}`);

                // Ejecutar transacción
                return this.crearTransaccion(cuentaOrigenId, cuentaDestinoId, monto);
            }),
            catchError(error => {
                console.error('[BancoService] Error en realizarPago:', error);
                return of({ ok: false, mensaje: `Error al realizar el pago: ${error.message || error}` });
            })
        );
    }
}
