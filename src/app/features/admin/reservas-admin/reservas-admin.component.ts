import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Reserva {
  IdReserva: number;
  IdUnicoUsuario: number;
  FechaInicioReserva: string;
  FechaFinalReserva: string;
  CostoTotalReserva: number;
  EstadoGeneralReserva: string;
  EstadoReserva: boolean;
  FechaRegistroReserva: string;
}

@Component({
  selector: 'app-reservas-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <a routerLink="/admin" class="text-muted text-decoration-none">
            <i class="bi bi-arrow-left me-1"></i> Volver
          </a>
          <h2 class="fw-bold text-hotel mt-2">
            <i class="bi bi-calendar-check-fill me-2"></i>
            Gestión de Reservas
          </h2>
        </div>
        <div class="d-flex gap-2">
          <span class="badge bg-primary p-2">Total: {{ filteredData.length }}</span>
          <span class="badge bg-success p-2">Confirmadas: {{ countByEstado('CONFIRMADO') }}</span>
          <span class="badge bg-warning text-dark p-2">Pre-reservas: {{ countByEstado('PRE-RESERVA') }}</span>
        </div>
      </div>

      <!-- Toast -->
      @if (toast.show) {
        <div class="position-fixed top-0 end-0 p-3" style="z-index: 1100">
          <div class="toast show" [class.bg-success]="toast.type === 'success'" 
               [class.bg-danger]="toast.type === 'error'" [class.text-white]="true">
            <div class="toast-header" [class.bg-success]="toast.type === 'success'" 
                 [class.bg-danger]="toast.type === 'error'" [class.text-white]="true">
              <strong class="me-auto">{{ toast.type === 'success' ? 'Éxito' : 'Error' }}</strong>
              <button type="button" class="btn-close btn-close-white" (click)="toast.show = false"></button>
            </div>
            <div class="toast-body">{{ toast.message }}</div>
          </div>
        </div>
      }

      <!-- Filtros -->
      <div class="card shadow-sm mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-3">
              <input type="text" class="form-control" placeholder="Buscar por ID..." 
                [(ngModel)]="searchTerm" (input)="filterData()">
            </div>
            <div class="col-md-3">
              <select class="form-select" [(ngModel)]="filterEstado" (change)="filterData()">
                <option value="">Todos los estados</option>
                <option value="PRE-RESERVA">Pre-reserva</option>
                <option value="CONFIRMADO">Confirmado</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>
            <div class="col-md-3">
              <input type="date" class="form-control" [(ngModel)]="filterFechaInicio" (change)="filterData()" 
                     placeholder="Desde">
            </div>
            <div class="col-md-3">
              <input type="date" class="form-control" [(ngModel)]="filterFechaFin" (change)="filterData()" 
                     placeholder="Hasta">
            </div>
          </div>
        </div>
      </div>

      <!-- Loading -->
      @if (loading) {
        <div class="text-center py-5">
          <div class="spinner-border text-hotel" role="status"></div>
          <p class="mt-2 text-muted">Cargando reservas...</p>
        </div>
      }

      <!-- Tabla -->
      @if (!loading) {
        <div class="card shadow-sm">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>ID</th>
                  <th>Usuario</th>
                  <th>Fecha Inicio</th>
                  <th>Fecha Fin</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Creada</th>
                  <th class="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (reserva of reservasPaginadas; track reserva.IdReserva) {
                  <tr>
                    <td class="fw-bold">{{ reserva.IdReserva }}</td>
                    <td>Usuario #{{ reserva.IdUnicoUsuario }}</td>
                    <td>{{ formatDate(reserva.FechaInicioReserva) }}</td>
                    <td>{{ formatDate(reserva.FechaFinalReserva) }}</td>
                    <td>\${{ reserva.CostoTotalReserva | number:'1.2-2' }}</td>
                    <td>
                      <span class="badge" 
                            [class.bg-warning]="reserva.EstadoGeneralReserva === 'PRE-RESERVA'"
                            [class.bg-success]="reserva.EstadoGeneralReserva === 'CONFIRMADO'"
                            [class.bg-danger]="reserva.EstadoGeneralReserva === 'CANCELADO'"
                            [class.text-dark]="reserva.EstadoGeneralReserva === 'PRE-RESERVA'">
                        {{ reserva.EstadoGeneralReserva }}
                      </span>
                    </td>
                    <td>{{ formatDate(reserva.FechaRegistroReserva) }}</td>
                    <td class="text-end">
                      <button class="btn btn-sm btn-outline-primary me-1" (click)="openDetailModal(reserva)">
                        <i class="bi bi-eye"></i>
                      </button>
                      @if (reserva.EstadoGeneralReserva !== 'CANCELADO') {
                        <button class="btn btn-sm btn-outline-danger" (click)="openCancelModal(reserva)">
                          <i class="bi bi-x-circle"></i>
                        </button>
                      }
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="8" class="text-center text-muted py-4">No se encontraron reservas</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          @if (totalPages > 1) {
            <div class="card-footer bg-white">
              <nav>
                <ul class="pagination pagination-sm justify-content-center mb-0">
                  <li class="page-item" [class.disabled]="page === 1">
                    <button class="page-link" (click)="changePage(page - 1)">Anterior</button>
                  </li>
                  @for (p of getPaginationRange(); track p) {
                    <li class="page-item" [class.active]="page === p">
                      <button class="page-link" (click)="changePage(p)">{{ p }}</button>
                    </li>
                  }
                  <li class="page-item" [class.disabled]="page === totalPages">
                    <button class="page-link" (click)="changePage(page + 1)">Siguiente</button>
                  </li>
                </ul>
              </nav>
            </div>
          }
        </div>
      }
    </div>

    <!-- Modal Detalle -->
    @if (showDetailModal) {
      <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header bg-hotel text-white">
              <h5 class="modal-title"><i class="bi bi-info-circle me-2"></i>Detalle de Reserva #{{ selectedItem?.IdReserva }}</h5>
              <button type="button" class="btn-close btn-close-white" (click)="showDetailModal = false"></button>
            </div>
            <div class="modal-body">
              <div class="row">
                <div class="col-md-6">
                  <p><strong>Usuario:</strong> #{{ selectedItem?.IdUnicoUsuario }}</p>
                  <p><strong>Estado:</strong> 
                    <span class="badge" 
                          [class.bg-warning]="selectedItem?.EstadoGeneralReserva === 'PRE-RESERVA'"
                          [class.bg-success]="selectedItem?.EstadoGeneralReserva === 'CONFIRMADO'"
                          [class.bg-danger]="selectedItem?.EstadoGeneralReserva === 'CANCELADO'">
                      {{ selectedItem?.EstadoGeneralReserva }}
                    </span>
                  </p>
                  <p><strong>Total:</strong> \${{ selectedItem?.CostoTotalReserva | number:'1.2-2' }}</p>
                </div>
                <div class="col-md-6">
                  <p><strong>Check-in:</strong> {{ formatDate(selectedItem?.FechaInicioReserva || '') }}</p>
                  <p><strong>Check-out:</strong> {{ formatDate(selectedItem?.FechaFinalReserva || '') }}</p>
                  <p><strong>Creada:</strong> {{ formatDate(selectedItem?.FechaRegistroReserva || '') }}</p>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="showDetailModal = false">Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Modal Cancelar -->
    @if (showCancelModal) {
      <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header bg-danger text-white">
              <h5 class="modal-title"><i class="bi bi-x-circle me-2"></i>Cancelar Reserva</h5>
              <button type="button" class="btn-close btn-close-white" (click)="showCancelModal = false"></button>
            </div>
            <div class="modal-body">
              <p>¿Está seguro de cancelar la reserva <strong>#{{ selectedItem?.IdReserva }}</strong>?</p>
              <p class="text-muted small">Esta acción cambiará el estado a CANCELADO.</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="showCancelModal = false">No, Volver</button>
              <button type="button" class="btn btn-danger" (click)="cancelarReserva()" [disabled]="saving">
                @if (saving) { <span class="spinner-border spinner-border-sm me-1"></span> }
                Sí, Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .text-hotel { color: #2f5d50; }
    .bg-hotel { background: linear-gradient(135deg, #436e62 0%, #2f5d50 100%); }
    .btn-hotel { background: linear-gradient(135deg, #436e62 0%, #2f5d50 100%); border: none; color: white; }
    .btn-hotel:hover { background: linear-gradient(135deg, #2f5d50 0%, #1a3d34 100%); color: white; }
  `]
})
export class ReservasAdminComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = environment.apiGatewayUrl.replace('/api', '');

  reservas: Reserva[] = [];
  filteredData: Reserva[] = [];
  loading = true;
  saving = false;

  searchTerm = '';
  filterEstado = '';
  filterFechaInicio = '';
  filterFechaFin = '';
  page = 1;
  perPage = 20;

  showDetailModal = false;
  showCancelModal = false;
  selectedItem: Reserva | null = null;

  toast = { show: false, message: '', type: 'success' as 'success' | 'error' };

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.loading = true;
    this.http.get<any>(`${this.apiUrl}/api/reservas-grpc/reservas`).subscribe({
      next: (response) => {
        const data = response?.reservas || response || [];
        this.reservas = Array.isArray(data) ? data.map((r: any) => ({
          IdReserva: r.idReserva || r.id_reserva,
          IdUnicoUsuario: r.idUsuario || r.id_usuario || 0,
          FechaInicioReserva: r.fechaInicio || r.fecha_inicio,
          FechaFinalReserva: r.fechaFinal || r.fecha_final,
          CostoTotalReserva: r.costoTotal || r.costo_total || 0,
          EstadoGeneralReserva: r.estadoGeneral || r.estado_general || 'DESCONOCIDO',
          EstadoReserva: r.estado ?? true,
          FechaRegistroReserva: r.fechaRegistro || r.fecha_registro
        })) : [];
        this.filterData();
        this.loading = false;
      },
      error: () => { this.loading = false; this.showToast('Error al cargar reservas', 'error'); }
    });
  }

  filterData(): void {
    let result = [...this.reservas];
    if (this.searchTerm) {
      result = result.filter(r => r.IdReserva.toString().includes(this.searchTerm));
    }
    if (this.filterEstado) {
      result = result.filter(r => r.EstadoGeneralReserva === this.filterEstado);
    }
    if (this.filterFechaInicio) {
      const inicio = new Date(this.filterFechaInicio);
      result = result.filter(r => new Date(r.FechaInicioReserva) >= inicio);
    }
    if (this.filterFechaFin) {
      const fin = new Date(this.filterFechaFin);
      result = result.filter(r => new Date(r.FechaFinalReserva) <= fin);
    }
    // Ordenar por fecha de registro descendente
    result.sort((a, b) => new Date(b.FechaRegistroReserva).getTime() - new Date(a.FechaRegistroReserva).getTime());
    this.filteredData = result;
    this.page = 1;
  }

  countByEstado(estado: string): number {
    return this.reservas.filter(r => r.EstadoGeneralReserva === estado).length;
  }

  get reservasPaginadas(): Reserva[] {
    const start = (this.page - 1) * this.perPage;
    return this.filteredData.slice(start, start + this.perPage);
  }

  get totalPages(): number { return Math.ceil(this.filteredData.length / this.perPage); }
  changePage(p: number): void { if (p >= 1 && p <= this.totalPages) this.page = p; }

  getPaginationRange(): number[] {
    const range: number[] = [], max = 5, half = Math.floor(max / 2);
    let start = Math.max(1, this.page - half), end = Math.min(this.totalPages, start + max - 1);
    if (end - start < max - 1) start = Math.max(1, end - max + 1);
    for (let i = start; i <= end; i++) range.push(i);
    return range;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  openDetailModal(reserva: Reserva): void {
    this.selectedItem = reserva;
    this.showDetailModal = true;
  }

  openCancelModal(reserva: Reserva): void {
    this.selectedItem = reserva;
    this.showCancelModal = true;
  }

  cancelarReserva(): void {
    if (!this.selectedItem) return;
    this.saving = true;

    // Usar el endpoint de actualización para cambiar estado a CANCELADO
    this.http.post(`${this.apiUrl}/api/reservas-grpc/reservas/${this.selectedItem.IdReserva}/cancelar`, {}).subscribe({
      next: () => {
        this.showToast('Reserva cancelada', 'success');
        this.showCancelModal = false;
        this.loadData();
        this.saving = false;
      },
      error: () => {
        // Fallback: intentar con PUT
        this.http.put(`${this.apiUrl}/api/reservas-grpc/reservas/${this.selectedItem!.IdReserva}`, {
          estadoGeneral: 'CANCELADO',
          estado: false
        }).subscribe({
          next: () => {
            this.showToast('Reserva cancelada', 'success');
            this.showCancelModal = false;
            this.loadData();
            this.saving = false;
          },
          error: () => { this.showToast('Error al cancelar', 'error'); this.saving = false; }
        });
      }
    });
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { show: true, message, type };
    setTimeout(() => this.toast.show = false, 4000);
  }
}
