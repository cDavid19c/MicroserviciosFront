import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';

interface Amenidad {
  idAmenidad: number;
  nombreAmenidad: string;
  estadoAmenidad: boolean;
}

@Component({
  selector: 'app-amenidades-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <a routerLink="/admin" class="text-muted text-decoration-none"><i class="bi bi-arrow-left me-1"></i> Volver</a>
          <h2 class="fw-bold text-hotel mt-2"><i class="bi bi-star-fill me-2"></i>Gestión de Amenidades</h2>
        </div>
        <button class="btn btn-hotel" (click)="openCreateModal()"><i class="bi bi-plus-lg me-1"></i> Nueva Amenidad</button>
      </div>
      @if (toast.show) {
        <div class="position-fixed top-0 end-0 p-3" style="z-index:1100">
          <div class="toast show text-white" [class.bg-success]="toast.type==='success'" [class.bg-danger]="toast.type==='error'">
            <div class="toast-body">{{toast.message}}</div>
          </div>
        </div>
      }
      <div class="card shadow-sm mb-4"><div class="card-body"><div class="row g-3">
        <div class="col-md-4"><input type="text" class="form-control" placeholder="Buscar..." [(ngModel)]="searchTerm" (input)="filterData()"></div>
        <div class="col-md-3">
          <select class="form-select" [(ngModel)]="filterStatus" (change)="filterData()">
            <option value="">Todos</option><option value="true">Activo</option><option value="false">Inactivo</option>
          </select>
        </div>
      </div></div></div>
      @if (loading) { <div class="text-center py-5"><div class="spinner-border text-hotel"></div></div> }
      @if (!loading) {
        <div class="card shadow-sm"><div class="table-responsive"><table class="table table-hover mb-0">
          <thead class="table-light"><tr><th>ID</th><th>Nombre</th><th>Estado</th><th class="text-end">Acciones</th></tr></thead>
          <tbody>
            @for (item of itemsPaginados; track item.idAmenidad) {
              <tr>
                <td class="fw-bold">{{item.idAmenidad}}</td>
                <td>{{item.nombreAmenidad}}</td>
                <td><span class="badge" [class.bg-success]="item.estadoAmenidad" [class.bg-danger]="!item.estadoAmenidad">{{item.estadoAmenidad ? 'Activo' : 'Inactivo'}}</span></td>
                <td class="text-end">
                  <button class="btn btn-sm btn-outline-primary me-1" (click)="openEditModal(item)"><i class="bi bi-pencil"></i></button>
                  <button class="btn btn-sm btn-outline-danger" (click)="openDeleteModal(item)"><i class="bi bi-trash"></i></button>
                </td>
              </tr>
            } @empty { <tr><td colspan="4" class="text-center text-muted py-4">No hay datos</td></tr> }
          </tbody>
        </table></div>
        @if (totalPages > 1) {
          <div class="card-footer bg-white text-center">
            <nav><ul class="pagination pagination-sm justify-content-center mb-0">
              <li class="page-item" [class.disabled]="page===1"><button class="page-link" (click)="changePage(page-1)">Ant</button></li>
              @for (p of getPageRange(); track p) {
                <li class="page-item" [class.active]="page===p"><button class="page-link" (click)="changePage(p)">{{p}}</button></li>
              }
              <li class="page-item" [class.disabled]="page===totalPages"><button class="page-link" (click)="changePage(page+1)">Sig</button></li>
            </ul></nav>
          </div>
        }
        </div>
      }
    </div>
    @if (showModal) {
      <div class="modal fade show d-block" style="background:rgba(0,0,0,0.5)"><div class="modal-dialog"><div class="modal-content">
        <div class="modal-header bg-hotel text-white"><h5 class="modal-title">{{isEditing?'Editar':'Nueva'}} Amenidad</h5>
          <button type="button" class="btn-close btn-close-white" (click)="closeModal()"></button></div>
        <div class="modal-body">
          <div class="mb-3"><label class="form-label">Nombre *</label><input type="text" class="form-control" [(ngModel)]="formData.nombreAmenidad"></div>
          <div class="form-check"><input type="checkbox" class="form-check-input" [(ngModel)]="formData.estadoAmenidad"><label class="form-check-label">Activo</label></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
          <button class="btn btn-hotel" (click)="saveItem()" [disabled]="saving">{{isEditing?'Actualizar':'Crear'}}</button>
        </div>
      </div></div></div>
    }
    @if (showDeleteModal) {
      <div class="modal fade show d-block" style="background:rgba(0,0,0,0.5)"><div class="modal-dialog"><div class="modal-content">
        <div class="modal-header bg-danger text-white"><h5 class="modal-title">Eliminar Amenidad</h5></div>
        <div class="modal-body"><p>¿Eliminar <strong>{{selectedItem?.nombreAmenidad}}</strong>?</p></div>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="showDeleteModal=false">Cancelar</button>
          <button class="btn btn-danger" (click)="deleteItem()">Eliminar</button>
        </div>
      </div></div></div>
    }
  `,
  styles: [`.text-hotel{color:#2f5d50}.bg-hotel{background:linear-gradient(135deg,#436e62 0%,#2f5d50 100%)}.btn-hotel{background:linear-gradient(135deg,#436e62 0%,#2f5d50 100%);border:none;color:white}`]
})
export class AmenidadesAdminComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = environment.catalogosServiceUrl;

  items: Amenidad[] = []; filteredData: Amenidad[] = [];
  loading = true; saving = false;
  searchTerm = ''; filterStatus = ''; page = 1; perPage = 20;
  showModal = false; showDeleteModal = false; isEditing = false; selectedItem: Amenidad | null = null;
  formData = { idAmenidad: 0, nombreAmenidad: '', estadoAmenidad: true };
  toast = { show: false, message: '', type: 'success' as 'success' | 'error' };

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    console.log('[Amenidades] Token JWT:', token ? `Presente (${token.substring(0, 50)}...)` : 'AUSENTE');
    console.log('[Amenidades] URL:', this.apiUrl);
    return new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' });
  }

  ngOnInit() { this.loadData(); }

  loadData() {
    this.loading = true;
    this.http.get<Amenidad[]>(`${this.apiUrl}/amenidades`).subscribe({
      next: d => { this.items = d || []; this.filterData(); this.loading = false; },
      error: () => { this.loading = false; this.showToast('Error', 'error'); }
    });
  }

  filterData() {
    let result = [...this.items];
    if (this.searchTerm) result = result.filter(i => i.nombreAmenidad?.toLowerCase().includes(this.searchTerm.toLowerCase()));
    if (this.filterStatus !== '') result = result.filter(i => i.estadoAmenidad === (this.filterStatus === 'true'));
    this.filteredData = result;
  }

  get itemsPaginados() { return this.filteredData.slice((this.page - 1) * this.perPage, this.page * this.perPage); }
  get totalPages() { return Math.ceil(this.filteredData.length / this.perPage); }
  changePage(p: number) { if (p >= 1 && p <= this.totalPages) this.page = p; }
  getPageRange(): number[] { const r: number[] = []; for (let i = Math.max(1, this.page - 2); i <= Math.min(this.totalPages, this.page + 2); i++) r.push(i); return r; }

  openCreateModal() { this.isEditing = false; this.formData = { idAmenidad: 0, nombreAmenidad: '', estadoAmenidad: true }; this.showModal = true; }
  openEditModal(i: Amenidad) { this.isEditing = true; this.selectedItem = i; this.formData = { ...i }; this.showModal = true; }
  openDeleteModal(i: Amenidad) { this.selectedItem = i; this.showDeleteModal = true; }
  closeModal() { this.showModal = false; }

  saveItem() {
    if (!this.formData.nombreAmenidad) { this.showToast('Nombre requerido', 'error'); return; }
    this.saving = true;
    const url = this.isEditing ? `${this.apiUrl}/amenidades/${this.formData.idAmenidad}` : `${this.apiUrl}/amenidades`;
    // IMPORTANTE: Auth headers requeridos para POST/PUT
    (this.isEditing ? this.http.put(url, this.formData, { headers: this.getAuthHeaders() }) : this.http.post(url, this.formData, { headers: this.getAuthHeaders() })).subscribe({
      next: () => { this.showToast('Guardado', 'success'); this.closeModal(); this.loadData(); this.saving = false; },
      error: (err) => { console.error('Error:', err); this.showToast('Error al guardar (requiere autenticación)', 'error'); this.saving = false; }
    });
  }

  deleteItem() {
    if (!this.selectedItem) return;
    // IMPORTANTE: Auth headers requeridos para DELETE
    this.http.delete(`${this.apiUrl}/amenidades/${this.selectedItem.idAmenidad}`, { headers: this.getAuthHeaders() }).subscribe({
      next: () => { this.showToast('Eliminado', 'success'); this.showDeleteModal = false; this.loadData(); },
      error: () => this.showToast('Error (requiere autenticación)', 'error')
    });
  }

  showToast(m: string, t: 'success' | 'error') { this.toast = { show: true, message: m, type: t }; setTimeout(() => this.toast.show = false, 3000); }
}
