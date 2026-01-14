import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Ciudad {
  idCiudad: number;
  nombreCiudad: string;
  idPais: number;
  estadoCiudad: boolean;
}

interface Pais {
  idPais: number;
  nombrePais: string;
}

@Component({
  selector: 'app-ciudades-admin',
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
            <i class="bi bi-geo-alt-fill me-2"></i>
            Gestión de Ciudades
          </h2>
        </div>
        <button class="btn btn-hotel" (click)="openCreateModal()">
          <i class="bi bi-plus-lg me-1"></i> Nueva Ciudad
        </button>
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
            <div class="col-md-4">
              <input type="text" class="form-control" placeholder="Buscar por nombre..." 
                [(ngModel)]="searchTerm" (input)="filterData()">
            </div>
            <div class="col-md-3">
              <select class="form-select" [(ngModel)]="filterStatus" (change)="filterData()">
                <option value="">Todos los estados</option>
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading -->
      @if (loading) {
        <div class="text-center py-5">
          <div class="spinner-border text-hotel" role="status"></div>
          <p class="mt-2 text-muted">Cargando ciudades...</p>
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
                  <th>Nombre</th>
                  <th>País</th>
                  <th>Estado</th>
                  <th class="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (ciudad of ciudadesPaginadas; track ciudad.idCiudad) {
                  <tr>
                    <td class="fw-bold">{{ ciudad.idCiudad }}</td>
                    <td>{{ ciudad.nombreCiudad }}</td>
                    <td>{{ getPaisNombre(ciudad.idPais) }}</td>
                    <td>
                      <span class="badge" [class.bg-success]="ciudad.estadoCiudad" 
                            [class.bg-danger]="!ciudad.estadoCiudad">
                        {{ ciudad.estadoCiudad ? 'Activo' : 'Inactivo' }}
                      </span>
                    </td>
                    <td class="text-end">
                      <button class="btn btn-sm btn-outline-primary me-1" (click)="openEditModal(ciudad)">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger" (click)="openDeleteModal(ciudad)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="text-center text-muted py-4">No se encontraron ciudades</td>
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

    <!-- Modal Crear/Editar -->
    @if (showModal) {
      <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header bg-hotel text-white">
              <h5 class="modal-title">
                {{ isEditing ? 'Editar' : 'Nueva' }} Ciudad
              </h5>
              <button type="button" class="btn-close btn-close-white" (click)="closeModal()"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Nombre *</label>
                <input type="text" class="form-control" [(ngModel)]="formData.nombreCiudad" placeholder="Nombre de la ciudad">
              </div>
              <div class="mb-3">
                <label class="form-label">País *</label>
                <select class="form-select" [(ngModel)]="formData.idPais">
                  <option [ngValue]="0">Seleccione...</option>
                  @for (pais of paises; track pais.idPais) {
                    <option [ngValue]="pais.idPais">{{ pais.nombrePais }}</option>
                  }
                </select>
              </div>
              <div class="form-check">
                <input type="checkbox" class="form-check-input" id="estadoCiudad" [(ngModel)]="formData.estadoCiudad">
                <label class="form-check-label" for="estadoCiudad">Ciudad Activa</label>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
              <button type="button" class="btn btn-hotel" (click)="saveCiudad()" [disabled]="saving">
                @if (saving) { <span class="spinner-border spinner-border-sm me-1"></span> }
                {{ isEditing ? 'Actualizar' : 'Crear' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Modal Eliminar -->
    @if (showDeleteModal) {
      <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header bg-danger text-white">
              <h5 class="modal-title"><i class="bi bi-trash me-2"></i>Eliminar Ciudad</h5>
              <button type="button" class="btn-close btn-close-white" (click)="showDeleteModal = false"></button>
            </div>
            <div class="modal-body">
              <p>¿Eliminar la ciudad <strong>{{ selectedItem?.nombreCiudad }}</strong>?</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="showDeleteModal = false">Cancelar</button>
              <button type="button" class="btn btn-danger" (click)="deleteItem()" [disabled]="saving">
                @if (saving) { <span class="spinner-border spinner-border-sm me-1"></span> }
                Eliminar
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
export class CiudadesAdminComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = environment.catalogosServiceUrl;

  ciudades: Ciudad[] = [];
  filteredData: Ciudad[] = [];
  paises: Pais[] = [];
  loading = true;
  saving = false;

  searchTerm = '';
  filterStatus = '';
  page = 1;
  perPage = 20;

  showModal = false;
  showDeleteModal = false;
  isEditing = false;
  selectedItem: Ciudad | null = null;

  formData = { idCiudad: 0, nombreCiudad: '', idPais: 0, estadoCiudad: true };
  toast = { show: false, message: '', type: 'success' as 'success' | 'error' };

  ngOnInit(): void {
    this.loadData();
    this.loadPaises();
  }

  loadData(): void {
    this.loading = true;
    this.http.get<Ciudad[]>(`${this.apiUrl}/ciudades`).subscribe({
      next: (data) => {
        this.ciudades = Array.isArray(data) ? data : [];
        this.filterData();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.showToast('Error al cargar ciudades', 'error');
      }
    });
  }

  loadPaises(): void {
    this.http.get<Pais[]>(`${this.apiUrl}/paises`).subscribe({
      next: (data) => { this.paises = Array.isArray(data) ? data : []; }
    });
  }

  filterData(): void {
    let result = [...this.ciudades];
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(c => c.nombreCiudad?.toLowerCase().includes(term));
    }
    if (this.filterStatus !== '') {
      const isActive = this.filterStatus === 'true';
      result = result.filter(c => c.estadoCiudad === isActive);
    }
    this.filteredData = result;
    this.page = 1;
  }

  get ciudadesPaginadas(): Ciudad[] {
    const start = (this.page - 1) * this.perPage;
    return this.filteredData.slice(start, start + this.perPage);
  }

  get totalPages(): number { return Math.ceil(this.filteredData.length / this.perPage); }

  changePage(p: number): void { if (p >= 1 && p <= this.totalPages) this.page = p; }

  getPaginationRange(): number[] {
    const range: number[] = [];
    const max = 5, half = Math.floor(max / 2);
    let start = Math.max(1, this.page - half);
    let end = Math.min(this.totalPages, start + max - 1);
    if (end - start < max - 1) start = Math.max(1, end - max + 1);
    for (let i = start; i <= end; i++) range.push(i);
    return range;
  }

  getPaisNombre(id: number): string {
    return this.paises.find(p => p.idPais === id)?.nombrePais || `País ${id}`;
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.formData = { idCiudad: 0, nombreCiudad: '', idPais: 0, estadoCiudad: true };
    this.showModal = true;
  }

  openEditModal(item: Ciudad): void {
    this.isEditing = true;
    this.selectedItem = item;
    this.formData = { ...item };
    this.showModal = true;
  }

  openDeleteModal(item: Ciudad): void {
    this.selectedItem = item;
    this.showDeleteModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedItem = null;
  }

  saveCiudad(): void {
    if (!this.formData.nombreCiudad || !this.formData.idPais) {
      this.showToast('Nombre y País son obligatorios', 'error');
      return;
    }
    this.saving = true;
    const url = this.isEditing ? `${this.apiUrl}/ciudades/${this.formData.idCiudad}` : `${this.apiUrl}/ciudades`;
    const method = this.isEditing ? this.http.put(url, this.formData) : this.http.post(url, this.formData);

    method.subscribe({
      next: () => {
        this.showToast(this.isEditing ? 'Ciudad actualizada' : 'Ciudad creada', 'success');
        this.closeModal();
        this.loadData();
        this.saving = false;
      },
      error: () => {
        this.showToast('Error al guardar', 'error');
        this.saving = false;
      }
    });
  }

  deleteItem(): void {
    if (!this.selectedItem) return;
    this.saving = true;
    this.http.delete(`${this.apiUrl}/ciudades/${this.selectedItem.idCiudad}`).subscribe({
      next: () => {
        this.showToast('Ciudad eliminada', 'success');
        this.showDeleteModal = false;
        this.loadData();
        this.saving = false;
      },
      error: () => {
        this.showToast('Error al eliminar', 'error');
        this.saving = false;
      }
    });
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { show: true, message, type };
    setTimeout(() => this.toast.show = false, 4000);
  }
}
