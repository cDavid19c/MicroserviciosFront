import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PagosService } from '../../../core/services/pagos.service';
import { AuthService } from '../../../core/services/auth.service';
import { ReservasService } from '../../../core/services/reservas.service';
import { PagoDisplay } from '../../../core/models/pago.model';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ErrorComponent } from '../../../shared/components/error/error.component';
import { EmptyComponent } from '../../../shared/components/empty/empty.component';

@Component({
  selector: 'app-mis-pagos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoadingComponent,
    ErrorComponent,
    EmptyComponent
  ],
  templateUrl: './mis-pagos.component.html',
  styleUrl: './mis-pagos.component.scss'
})
export class MisPagosComponent implements OnInit {
  private pagosService = inject(PagosService);
  private authService = inject(AuthService);
  private reservasService = inject(ReservasService);

  pagos: PagoDisplay[] = [];
  loading = true;
  error = false;

  // Modal factura
  showFacturaModal = false;
  facturaLoading = false;
  pagoSeleccionado: PagoDisplay | null = null;

  // Datos para la factura
  facturaNombre = '';
  facturaApellido = '';
  facturaCorreo = '';
  facturaDocumento = '';
  facturaError = '';
  facturaSuccess = '';

  ngOnInit(): void {
    this.loadPagos();
  }

  loadPagos(): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.loading = false;
      this.error = true;
      return;
    }

    this.loading = true;
    this.error = false;

    this.pagosService.getMisPagos(userId).subscribe({
      next: (data: PagoDisplay[]) => {
        this.pagos = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = true;
      }
    });
  }

  abrirModalFactura(pago: PagoDisplay): void {
    this.pagoSeleccionado = pago;
    this.showFacturaModal = true;
    this.facturaError = '';
    this.facturaSuccess = '';

    // Pre-llenar con datos del usuario
    const user = this.authService.getCurrentUser();
    if (user) {
      this.facturaNombre = user.nombre;
      this.facturaApellido = user.apellido;
      this.facturaCorreo = user.correo;
      this.facturaDocumento = user.documento;
    }
  }

  cerrarModalFactura(): void {
    this.showFacturaModal = false;
    this.pagoSeleccionado = null;
  }

  generarFactura(): void {
    if (!this.pagoSeleccionado || !this.pagoSeleccionado.idReserva) {
      this.facturaError = 'No se puede generar la factura: ID de reserva no disponible';
      return;
    }

    if (!this.facturaCorreo || !this.facturaDocumento) {
      this.facturaError = 'El correo y documento son obligatorios';
      return;
    }

    this.facturaLoading = true;
    this.facturaError = '';
    this.facturaSuccess = '';

    this.pagosService.generarFactura({
      idReserva: this.pagoSeleccionado.idReserva,
      nombre: this.facturaNombre,
      apellido: this.facturaApellido,
      correo: this.facturaCorreo,
      documento: this.facturaDocumento
    }).subscribe({
      next: (response) => {
        this.facturaLoading = false;
        const pdfUrl = response.url_pdf || response.UrlPdf || response.urlPdf || '';
        this.facturaSuccess = 'Factura generada correctamente.';

        // Guardar estado localmente en la reserva para persistir el cambio
        if (this.pagoSeleccionado?.idReserva) {
          this.reservasService.setFacturaGenerada(this.pagoSeleccionado.idReserva, pdfUrl);
        }

        if (pdfUrl) {
          window.open(pdfUrl, '_blank');
        }

        // Recargar pagos para actualizar estado (que ahora leerá del localStorage también)
        setTimeout(() => {
          this.cerrarModalFactura();
          this.loadPagos();
        }, 2000);
      },
      error: (err) => {
        this.facturaLoading = false;
        this.facturaError = err.message || 'Error al generar la factura';
      }
    });
  }

  verPdf(pago: PagoDisplay): void {
    if (pago.pdfUrl) {
      window.open(pago.pdfUrl, '_blank');
    }
  }
}
