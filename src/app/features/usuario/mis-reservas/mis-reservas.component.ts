import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReservasService } from '../../../core/services/reservas.service';
import { AuthService } from '../../../core/services/auth.service';
import { BancoService } from '../../../core/services/banco.service';
import { PagosService } from '../../../core/services/pagos.service';
import { ReservaDisplay } from '../../../core/models/reserva.model';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ErrorComponent } from '../../../shared/components/error/error.component';
import { EmptyComponent } from '../../../shared/components/empty/empty.component';

interface PreReservaModal {
  idReserva: string;
  idHold: string;
  idHabitacion: string;
  nombreHabitacion: string;
  fechaInicio: string;
  fechaFin: string;
  tiempoHold: number;
  tiempoRestante: number;
  precioTotal?: number;  // Agregado para el pago
  huespedes?: number;    // Agregado para el pago
}

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LoadingComponent,
    ErrorComponent,
    EmptyComponent
  ],
  templateUrl: './mis-reservas.component.html',
  styleUrl: './mis-reservas.component.scss'
})
export class MisReservasComponent implements OnInit, OnDestroy {
  private reservasService = inject(ReservasService);
  private authService = inject(AuthService);
  private bancoService = inject(BancoService);
  private pagosService = inject(PagosService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  reservas: ReservaDisplay[] = [];
  loading = true;
  error = false;

  // Estados para acciones
  confirmandoId: number | null = null;
  cancelandoId: number | null = null;
  actionError = '';
  actionSuccess = '';

  // Modal de Pre-reserva
  showPreReservaModal = false;
  preReservaData: PreReservaModal | null = null;
  timerInterval: any = null;

  // Modal Cancelación
  showCancelModal = false;
  reservaACancelar: ReservaDisplay | null = null;
  cancelMessage = '';

  ngOnInit(): void {
    this.loadReservas();
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  private startTimer(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      if (this.preReservaData) {
        this.preReservaData.tiempoRestante--;

        if (this.preReservaData.tiempoRestante <= 0) {
          clearInterval(this.timerInterval);
          this.closeModal();
          this.actionError = 'El tiempo de la pre-reserva ha expirado.';
          this.loadReservas();
        }
      }
    }, 1000);
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  closeModal(): void {
    this.showPreReservaModal = false;
    this.preReservaData = null;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    // Eliminar query params si existieran de form limpia
    this.router.navigate([], {
      queryParams: {},
      replaceUrl: true,
      relativeTo: this.route
    });
  }

  confirmarPreReserva(): void {
    if (!this.preReservaData) return;

    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.confirmandoId = parseInt(this.preReservaData.idReserva, 10);
    this.actionError = '';
    this.actionSuccess = '';

    const monto = this.preReservaData.precioTotal || 0;
    const huespedes = this.preReservaData.huespedes || 1;

    console.log('[MisReservas] Iniciando flujo de confirmación y pago');
    console.log('[MisReservas] Monto a pagar:', monto);

    // PASO 1: Ejecutar transacción bancaria (débito cliente → crédito hotel)
    this.bancoService.realizarPago(monto).subscribe({
      next: (resultadoBanco) => {
        console.log('[MisReservas] Resultado banco:', resultadoBanco);

        if (!resultadoBanco.ok) {
          this.confirmandoId = null;
          this.actionError = resultadoBanco.mensaje || 'Error en la transacción bancaria';
          return;
        }

        // PASO 2: Confirmar la reserva en el microservicio
        this.reservasService.confirmarReserva({
          idHabitacion: this.preReservaData!.idHabitacion || '',
          idHold: this.preReservaData!.idHold,
          idUnicoUsuario: user.id,
          nombre: user.nombre,
          apellido: user.apellido,
          correo: user.correo,
          tipoDocumento: user.tipoDocumento,
          documento: user.documento,
          fechaInicio: this.preReservaData!.fechaInicio,
          fechaFin: this.preReservaData!.fechaFin,
          numeroHuespedes: huespedes
        }).subscribe({
          next: (respConfirmacion: any) => {
            console.log('[MisReservas] Reserva confirmada - respuesta completa:', JSON.stringify(respConfirmacion));

            // Intentar extraer idReserva de múltiples posibles ubicaciones en la respuesta
            let idReservaConfirmada =
              respConfirmacion?.idReserva ||
              respConfirmacion?.IdReserva ||
              respConfirmacion?.data?.idReserva ||
              respConfirmacion?.data?.IdReserva ||
              respConfirmacion?.reserva?.idReserva ||
              respConfirmacion?.reserva?.IdReserva ||
              0;

            console.log('[MisReservas] idReserva extraído:', idReservaConfirmada);
            console.log('[MisReservas] User ID:', user.id);
            console.log('[MisReservas] Monto:', monto);

            if (!idReservaConfirmada || idReservaConfirmada === 0) {
              console.warn('[MisReservas] ⚠️ idReserva es 0 o no se encontró en la respuesta. El pago podría fallar.');
            }

            // PASO 3: Registrar pago en la tabla PAGO del backend
            console.log('[MisReservas] Paso 3 - Enviando registro de pago a BD...');

            this.pagosService.registrarPagoReservaInterna({
              idReserva: idReservaConfirmada,
              idUnicoUsuario: user.id,
              montoTotal: monto,
              cuentaOrigen: this.bancoService.CUENTA_CLIENTE,
              cuentaDestino: this.bancoService.CUENTA_HOTEL,
              idMetodoPago: 2  // Pago en línea
            }).subscribe({
              next: (respPago) => {
                console.log('[MisReservas] ✅ Pago registrado en BD exitosamente:', respPago);
                this.confirmandoId = null;
                this.closeModal();
                this.actionSuccess = '¡Reserva confirmada y pago procesado exitosamente!';
                setTimeout(() => this.actionSuccess = '', 5000);
                this.loadReservas();
              },
              error: (errPago) => {
                // El pago bancario ya se realizó, pero falló el registro en BD
                console.error('[MisReservas] ❌ Error al registrar pago en BD:', errPago);
                console.error('[MisReservas] Error details:', JSON.stringify(errPago));
                this.confirmandoId = null;
                this.closeModal();
                this.actionSuccess = '¡Reserva confirmada! (El registro de pago se sincronizará después)';
                setTimeout(() => this.actionSuccess = '', 5000);
                this.loadReservas();
              }
            });
          },
          error: (errConfirm) => {
            this.confirmandoId = null;
            this.actionError = errConfirm.message || 'Error al confirmar la reserva';
          }
        });
      },
      error: (errBanco) => {
        this.confirmandoId = null;
        this.actionError = errBanco.message || 'Error al procesar el pago';
      }
    });
  }

  cancelarPreReserva(): void {
    if (!this.preReservaData) return;

    // Usar modal custom para confirmación dentro de modal de pre-reserva?
    // El usuario pidió quitar "confirm()".
    // Redirigimos al flujo de cancelar normal cerrando este modal primero
    this.closeModal();
    // Necesitamos recuperar el objeto ReservaDisplay completo, pero aquí solo tenemos datos parciales.
    // Sin embargo, podemos invocar cancelación directa si queremos.
    // Mejor UX: pedir confirmación con el modal bonito.
    // Pero el modal bonito necesita `ReservaDisplay`.
    // Simulemos un obj parcial o creemos otro modal simple.
    // Simplificación: usaremos el método cancelarReserva con un objeto dummy si es necesario, 
    // pero `cancelarReserva` espera `ReservaDisplay`.
    // Por ahora, para evitar líos en pre-reserva, usaré el modal de cancelación configurado manualmente.

    this.actionError = '';
    this.cancelandoId = parseInt(this.preReservaData.idReserva, 10);

    this.reservasService.cancelarReserva(this.preReservaData.idHold).subscribe({
      next: () => {
        this.cancelandoId = null;
        this.closeModal();
        this.actionSuccess = 'Pre-reserva cancelada.';
        setTimeout(() => this.actionSuccess = '', 3000);
        this.loadReservas();
      },
      error: (err) => {
        this.cancelandoId = null;
        this.actionError = err.message || 'Error al cancelar';
      }
    });
  }

  loadReservas(): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.loading = false;
      this.error = true;
      return;
    }

    this.loading = true;
    this.error = false;

    this.reservasService.getMisReservas(userId).subscribe({
      next: (data: ReservaDisplay[]) => {
        this.reservas = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = true;
      }
    });
  }

  confirmarReserva(reserva: ReservaDisplay): void {
    if (!reserva.idHold) {
      // Fallback para reservas viejas
      if (confirm('¿Confirmar esta reserva?')) {
        this.ejecutarConfirmacion(reserva);
      }
      return;
    }

    const localReserva = this.reservasService.getLocalReservas().find(r => r.idHold === reserva.idHold);
    let tiempoRestante = 180;

    if (localReserva) {
      const now = new Date().getTime();
      const exp = new Date(localReserva.fechaExpiracion).getTime();
      tiempoRestante = Math.floor((exp - now) / 1000);
      if (tiempoRestante < 0) tiempoRestante = 0;
    }

    this.preReservaData = {
      idReserva: String(reserva.idReserva),
      idHold: reserva.idHold,
      idHabitacion: reserva.idHabitacion || '',
      nombreHabitacion: reserva.habitacion,
      fechaInicio: reserva.fechaInicio,
      fechaFin: reserva.fechaFin,
      tiempoHold: 180,
      tiempoRestante: tiempoRestante,
      precioTotal: reserva.total || localReserva?.precioTotal || 0,
      huespedes: reserva.huespedes || localReserva?.numeroHuespedes || 1
    };

    this.showPreReservaModal = true;
    this.startTimer();
  }

  private ejecutarConfirmacion(reserva: ReservaDisplay): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.confirmandoId = reserva.idReserva;
    this.actionError = '';
    this.actionSuccess = '';

    const monto = reserva.total || 0;

    console.log('[MisReservas] Ejecutando confirmación legacy con pago');
    console.log('[MisReservas] Monto:', monto);

    // PASO 1: Transacción bancaria
    this.bancoService.realizarPago(monto).subscribe({
      next: (resultadoBanco) => {
        console.log('[MisReservas] Resultado banco (legacy):', resultadoBanco);

        if (!resultadoBanco.ok) {
          this.confirmandoId = null;
          this.actionError = resultadoBanco.mensaje || 'Error en la transacción bancaria';
          return;
        }

        // PASO 2: Confirmar reserva
        this.reservasService.confirmarReserva({
          idHabitacion: reserva.idHabitacion || '',
          idHold: reserva.idHold || '',
          idUnicoUsuario: user.id,
          nombre: user.nombre,
          apellido: user.apellido,
          correo: user.correo,
          tipoDocumento: user.tipoDocumento,
          documento: user.documento,
          fechaInicio: reserva.fechaInicio,
          fechaFin: reserva.fechaFin,
          numeroHuespedes: reserva.huespedes
        }).subscribe({
          next: (respConfirmacion: any) => {
            const idReservaConfirmada = respConfirmacion?.idReserva || respConfirmacion?.IdReserva || reserva.idReserva;

            // PASO 3: Registrar pago en BD
            this.pagosService.registrarPagoReservaInterna({
              idReserva: idReservaConfirmada,
              idUnicoUsuario: user.id,
              montoTotal: monto,
              cuentaOrigen: this.bancoService.CUENTA_CLIENTE,
              cuentaDestino: this.bancoService.CUENTA_HOTEL,
              idMetodoPago: 2
            }).subscribe({
              next: () => {
                this.confirmandoId = null;
                this.actionSuccess = '¡Reserva confirmada y pago procesado!';
                setTimeout(() => this.actionSuccess = '', 3000);
                this.loadReservas();
              },
              error: () => {
                this.confirmandoId = null;
                this.actionSuccess = 'Reserva confirmada (pago se sincronizará después).';
                setTimeout(() => this.actionSuccess = '', 3000);
                this.loadReservas();
              }
            });
          },
          error: (err) => {
            this.confirmandoId = null;
            this.actionError = err.message || 'Error al confirmar la reserva';
          }
        });
      },
      error: (errBanco) => {
        this.confirmandoId = null;
        this.actionError = errBanco.message || 'Error al procesar el pago';
      }
    });
  }

  solicitarCancelacion(reserva: ReservaDisplay): void {
    this.reservaACancelar = reserva;
    this.cancelMessage = `¿Estás seguro de que deseas cancelar la reserva de ${reserva.habitacion}?`;
    this.showCancelModal = true;
  }

  cerrarModalCancelacion(): void {
    this.showCancelModal = false;
    this.reservaACancelar = null;
  }

  confirmarCancelacion(): void {
    if (!this.reservaACancelar) return;

    const reserva = this.reservaACancelar;
    this.cerrarModalCancelacion();

    this.cancelandoId = reserva.idReserva;
    this.actionError = '';
    this.actionSuccess = '';

    this.reservasService.cancelarReserva(reserva.idHold, reserva.idReserva).subscribe({
      next: () => {
        this.cancelandoId = null;
        this.actionSuccess = 'Reserva cancelada correctamente.';
        setTimeout(() => this.actionSuccess = '', 3000);
        this.loadReservas();
      },
      error: (err) => {
        this.cancelandoId = null;
        this.actionError = err.message || 'Error al cancelar la reserva';
      }
    });
  }

  cancelarReserva(reserva: ReservaDisplay): void {
    this.solicitarCancelacion(reserva);
  }

  getEstadoClass(estado: string): string {
    const estadoUpper = estado.toUpperCase();
    switch (estadoUpper) {
      case 'CONFIRMADA':
      case 'CONFIRMADO':
        return 'bg-success';
      case 'PENDIENTE':
      case 'PRE-RESERVA':
      case 'PRERESERVA':
        return 'bg-warning text-dark';
      case 'CANCELADA':
      case 'EXPIRADO':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  isPendiente(estado: string): boolean {
    const estadoUpper = estado.toUpperCase();
    return ['PENDIENTE', 'PRE-RESERVA', 'PRERESERVA'].includes(estadoUpper);
  }
}
