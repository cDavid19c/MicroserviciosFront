import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  idRol: number;
  estado: boolean;
}

@Component({
  selector: 'app-usuarios-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <a routerLink="/admin" class="text-muted text-decoration-none"><i class="bi bi-arrow-left me-1"></i> Volver</a>
          <h2 class="fw-bold text-hotel mt-2"><i class="bi bi-people-fill me-2"></i>Gestión de Usuarios</h2>
        </div>
        <button class="btn btn-hotel" (click)="openCreateModal()"><i class="bi bi-plus-lg me-1"></i> Nuevo Usuario</button>
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
          <select class="form-select" [(ngModel)]="filterRol" (change)="filterData()">
            <option value="">Todos los roles</option>
            <option value="1">Usuario</option>
            <option value="2">Admin</option>
          </select>
        </div>
        <div class="col-md-3">
          <select class="form-select" [(ngModel)]="filterStatus" (change)="filterData()">
            <option value="">Todos</option><option value="true">Activo</option><option value="false">Inactivo</option>
          </select>
        </div>
      </div></div></div>
      @if (loading) { <div class="text-center py-5"><div class="spinner-border text-hotel"></div></div> }
      @if (!loading) {
        <div class="card shadow-sm"><div class="table-responsive"><table class="table table-hover mb-0">
          <thead class="table-light"><tr><th>ID</th><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th class="text-end">Acciones</th></tr></thead>
          <tbody>
            @for (u of usuariosPaginados; track u.id) {
              <tr>
                <td class="fw-bold">{{u.id}}</td>
                <td>{{u.nombre}} {{u.apellido}}</td>
                <td>{{u.correo}}</td>
                <td><span class="badge" [class.bg-primary]="u.idRol===2" [class.bg-secondary]="u.idRol!==2">{{getRolNombre(u.idRol)}}</span></td>
                <td><span class="badge" [class.bg-success]="u.estado" [class.bg-danger]="!u.estado">{{u.estado ? 'Activo' : 'Inactivo'}}</span></td>
                <td class="text-end">
                  <button class="btn btn-sm btn-outline-primary me-1" (click)="openEditModal(u)"><i class="bi bi-pencil"></i></button>
                  <button class="btn btn-sm" [class.btn-outline-danger]="u.estado" [class.btn-outline-success]="!u.estado" (click)="toggleEstado(u)">
                    <i class="bi" [class.bi-toggle-on]="u.estado" [class.bi-toggle-off]="!u.estado"></i>
                  </button>
                </td>
              </tr>
            } @empty { <tr><td colspan="6" class="text-center text-muted py-4">No hay usuarios</td></tr> }
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
            <div class="text-muted small mt-1">Página {{page}} de {{totalPages}} ({{filteredData.length}} usuarios)</div>
          </div>
        }
        </div>
      }
    </div>
    @if (showModal) {
      <div class="modal fade show d-block" style="background:rgba(0,0,0,0.5)"><div class="modal-dialog"><div class="modal-content">
        <div class="modal-header bg-hotel text-white"><h5 class="modal-title">{{isEditing?'Editar':'Nuevo'}} Usuario</h5>
          <button type="button" class="btn-close btn-close-white" (click)="closeModal()"></button></div>
        <div class="modal-body"><div class="row g-3">
          <div class="col-md-6"><label class="form-label">Nombre *</label><input type="text" class="form-control" [(ngModel)]="formData.nombre"></div>
          <div class="col-md-6"><label class="form-label">Apellido *</label><input type="text" class="form-control" [(ngModel)]="formData.apellido"></div>
          <div class="col-12"><label class="form-label">Correo *</label><input type="email" class="form-control" [(ngModel)]="formData.correo"></div>
          @if (!isEditing) {
            <div class="col-12"><label class="form-label">Contraseña *</label><input type="password" class="form-control" [(ngModel)]="formData.clave"></div>
          }
          <div class="col-md-6">
            <label class="form-label">Rol *</label>
            <select class="form-select" [(ngModel)]="formData.idRol">
              <option [ngValue]="1">Usuario</option>
              <option [ngValue]="2">Admin</option>
            </select>
          </div>
          <div class="col-12"><div class="form-check"><input type="checkbox" class="form-check-input" [(ngModel)]="formData.estado"><label class="form-check-label">Activo</label></div></div>
        </div></div>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
          <button class="btn btn-hotel" (click)="saveUsuario()" [disabled]="saving">{{isEditing?'Actualizar':'Crear'}}</button>
        </div>
      </div></div></div>
    }
  `,
  styles: [`.text-hotel{color:#2f5d50}.bg-hotel{background:linear-gradient(135deg,#436e62 0%,#2f5d50 100%)}.btn-hotel{background:linear-gradient(135deg,#436e62 0%,#2f5d50 100%);border:none;color:white}`]
})
export class UsuariosAdminComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = environment.usuariosPagosServiceUrl;

  usuarios: Usuario[] = []; filteredData: Usuario[] = [];
  loading = true; saving = false;
  searchTerm = ''; filterStatus = ''; filterRol = ''; page = 1; perPage = 20;
  showModal = false; isEditing = false; selectedItem: Usuario | null = null;
  formData: any = { id: 0, nombre: '', apellido: '', correo: '', clave: '', idRol: 1, estado: true };
  toast = { show: false, message: '', type: 'success' as 'success' | 'error' };

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({ 'Authorization': token ? `Bearer ${token}` : '', 'Content-Type': 'application/json' });
  }

  ngOnInit() { this.loadData(); }

  loadData() {
    this.loading = true;
    this.http.get<Usuario[]>(`${this.apiUrl}/usuarios`, { headers: this.getAuthHeaders() }).subscribe({
      next: data => { this.usuarios = data || []; this.filterData(); this.loading = false; },
      error: () => { this.loading = false; this.showToast('Error al cargar', 'error'); }
    });
  }

  filterData() {
    let result = [...this.usuarios];
    if (this.searchTerm) {
      const t = this.searchTerm.toLowerCase();
      result = result.filter(u => u.nombre?.toLowerCase().includes(t) || u.apellido?.toLowerCase().includes(t) || u.correo?.toLowerCase().includes(t));
    }
    if (this.filterStatus !== '') result = result.filter(u => u.estado === (this.filterStatus === 'true'));
    if (this.filterRol !== '') result = result.filter(u => u.idRol === parseInt(this.filterRol, 10));
    this.filteredData = result;
  }

  get usuariosPaginados() { return this.filteredData.slice((this.page - 1) * this.perPage, this.page * this.perPage); }
  get totalPages() { return Math.ceil(this.filteredData.length / this.perPage); }
  changePage(p: number) { if (p >= 1 && p <= this.totalPages) this.page = p; }
  getPageRange(): number[] { const r: number[] = []; for (let i = Math.max(1, this.page - 2); i <= Math.min(this.totalPages, this.page + 2); i++) r.push(i); return r; }

  // Rol 1 = Usuario, Rol 2 = Admin
  getRolNombre(id: number) { return id === 2 ? 'Admin' : 'Usuario'; }

  openCreateModal() {
    this.isEditing = false;
    this.formData = { id: 0, nombre: '', apellido: '', correo: '', clave: '', idRol: 1, estado: true };
    this.showModal = true;
  }
  openEditModal(u: Usuario) { this.isEditing = true; this.selectedItem = u; this.formData = { ...u, clave: '' }; this.showModal = true; }
  closeModal() { this.showModal = false; }

  saveUsuario() {
    if (!this.formData.nombre || !this.formData.correo) { this.showToast('Nombre y Correo requeridos', 'error'); return; }
    if (!this.isEditing && !this.formData.clave) { this.showToast('Contraseña requerida', 'error'); return; }
    this.saving = true;

    const url = this.isEditing ? `${this.apiUrl}/usuarios/${this.formData.id}` : `${this.apiUrl}/usuarios`;
    const payload = this.isEditing ? { ...this.formData } : this.formData;

    // Si es edición y no hay clave, no enviar el campo
    if (this.isEditing && !payload.clave) delete payload.clave;

    (this.isEditing ? this.http.put(url, payload, { headers: this.getAuthHeaders() }) : this.http.post(url, payload, { headers: this.getAuthHeaders() })).subscribe({
      next: () => { this.showToast(this.isEditing ? 'Actualizado' : 'Creado', 'success'); this.closeModal(); this.loadData(); this.saving = false; },
      error: () => { this.showToast('Error al guardar', 'error'); this.saving = false; }
    });
  }

  toggleEstado(u: Usuario) {
    const updated = { ...u, estado: !u.estado };
    this.http.put(`${this.apiUrl}/usuarios/${u.id}`, updated, { headers: this.getAuthHeaders() }).subscribe({
      next: () => { this.showToast(`Usuario ${updated.estado ? 'activado' : 'desactivado'}`, 'success'); this.loadData(); },
      error: () => this.showToast('Error', 'error')
    });
  }

  showToast(m: string, t: 'success' | 'error') { this.toast = { show: true, message: m, type: t }; setTimeout(() => this.toast.show = false, 3000); }
}
