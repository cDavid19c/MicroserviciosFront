import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';

interface Habitacion {
  idHabitacion: string;
  nombreHabitacion: string;
  idTipoHabitacion: number;
  idCiudad: number;
  idHotel: number;
  precioNormalHabitacion: number;
  precioActualHabitacion: number;
  capacidadHabitacion: number;
  estadoHabitacion: boolean;
}

interface TipoHabitacion { idTipoHabitacion: number; nombreTipoHabitacion: string; }
interface Hotel { idHotel: number; nombreHotel: string; }
interface Ciudad { idCiudad: number; nombreCiudad: string; }

@Component({
  selector: 'app-habitaciones-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <a routerLink="/admin" class="text-muted text-decoration-none"><i class="bi bi-arrow-left me-1"></i> Volver</a>
          <h2 class="fw-bold text-hotel mt-2"><i class="bi bi-door-open-fill me-2"></i>Gestión de Habitaciones</h2>
        </div>
        <button class="btn btn-hotel" (click)="openCreateModal()"><i class="bi bi-plus-lg me-1"></i> Nueva Habitación</button>
      </div>
      <div class="card shadow-sm mb-4"><div class="card-body"><div class="row g-3">
        <div class="col-md-4"><input type="text" class="form-control" placeholder="Buscar..." [(ngModel)]="searchTerm" (input)="filterData()"></div>
        <div class="col-md-3">
          <select class="form-select" [(ngModel)]="filterStatus" (change)="filterData()">
            <option value="">Todos</option><option value="true">Activo</option><option value="false">Inactivo</option>
          </select>
        </div>
      </div></div></div>
      @if (toast.show) {
        <div class="position-fixed top-0 end-0 p-3" style="z-index:1100">
          <div class="toast show text-white" [class.bg-success]="toast.type==='success'" [class.bg-danger]="toast.type==='error'">
            <div class="toast-body">{{toast.message}}</div>
          </div>
        </div>
      }
      @if (loading) { <div class="text-center py-5"><div class="spinner-border text-hotel"></div></div> }
      @if (!loading) {
        <div class="card shadow-sm"><div class="table-responsive"><table class="table table-hover mb-0">
          <thead class="table-light"><tr><th>ID</th><th>Nombre</th><th>Tipo</th><th>Capacidad</th><th>Precio</th><th>Estado</th><th class="text-end">Acciones</th></tr></thead>
          <tbody>
            @for (h of habitacionesPaginadas; track h.idHabitacion) {
              <tr>
                <td class="fw-bold">{{h.idHabitacion}}</td>
                <td>{{h.nombreHabitacion}}</td>
                <td>{{getTipoNombre(h.idTipoHabitacion)}}</td>
                <td>{{h.capacidadHabitacion}} pers.</td>
                <td>\${{h.precioActualHabitacion | number:'1.2-2'}}</td>
                <td><span class="badge" [class.bg-success]="h.estadoHabitacion" [class.bg-danger]="!h.estadoHabitacion">{{h.estadoHabitacion ? 'Activo' : 'Inactivo'}}</span></td>
                <td class="text-end">
                  <button class="btn btn-sm btn-outline-primary me-1" (click)="openEditModal(h)"><i class="bi bi-pencil"></i></button>
                  <button class="btn btn-sm btn-outline-danger" (click)="openDeleteModal(h)"><i class="bi bi-trash"></i></button>
                </td>
              </tr>
            } @empty { <tr><td colspan="7" class="text-center text-muted py-4">No hay datos</td></tr> }
          </tbody>
        </table></div>
        @if (totalPages > 1) {
          <div class="card-footer bg-white">
            <nav><ul class="pagination pagination-sm justify-content-center mb-0">
              <li class="page-item" [class.disabled]="page===1"><button class="page-link" (click)="changePage(page-1)">« Anterior</button></li>
              @for (p of getPageRange(); track p) {
                <li class="page-item" [class.active]="page===p"><button class="page-link" (click)="changePage(p)">{{p}}</button></li>
              }
              <li class="page-item" [class.disabled]="page===totalPages"><button class="page-link" (click)="changePage(page+1)">Siguiente »</button></li>
            </ul></nav>
            <div class="text-center text-muted small mt-1">Página {{page}} de {{totalPages}} ({{filteredData.length}} registros)</div>
          </div>
        }
        </div>
      }
    </div>
    @if (showModal) {
      <div class="modal fade show d-block" style="background:rgba(0,0,0,0.5)"><div class="modal-dialog modal-lg"><div class="modal-content">
        <div class="modal-header bg-hotel text-white"><h5 class="modal-title">{{isEditing?'Editar':'Nueva'}} Habitación</h5>
          <button type="button" class="btn-close btn-close-white" (click)="closeModal()"></button></div>
        <div class="modal-body"><div class="row g-3">
          <div class="col-md-6"><label class="form-label">ID *</label><input type="text" class="form-control" [(ngModel)]="formData.idHabitacion" [readonly]="true"></div>
          <div class="col-md-6"><label class="form-label">Nombre *</label><input type="text" class="form-control" [(ngModel)]="formData.nombreHabitacion"></div>
          <div class="col-md-4"><label class="form-label">Tipo *</label>
            <select class="form-select" [(ngModel)]="formData.idTipoHabitacion">
              <option [ngValue]="0">Seleccione...</option>
              @for (t of tiposHabitacion; track t.idTipoHabitacion) { <option [ngValue]="t.idTipoHabitacion">{{t.nombreTipoHabitacion}}</option> }
            </select>
          </div>
          <div class="col-md-4"><label class="form-label">Hotel *</label>
            <select class="form-select" [(ngModel)]="formData.idHotel">
              <option [ngValue]="0">Seleccione...</option>
              @for (h of hoteles; track h.idHotel) { <option [ngValue]="h.idHotel">{{h.nombreHotel}}</option> }
            </select>
          </div>
          <div class="col-md-4"><label class="form-label">Ciudad *</label>
            <select class="form-select" [(ngModel)]="formData.idCiudad">
              <option [ngValue]="0">Seleccione...</option>
              @for (c of ciudades; track c.idCiudad) { <option [ngValue]="c.idCiudad">{{c.nombreCiudad}}</option> }
            </select>
          </div>
          <div class="col-md-4"><label class="form-label">Capacidad</label><input type="number" class="form-control" [(ngModel)]="formData.capacidadHabitacion" min="1" (keydown)="blockInvalidKeys($event, false)"></div>
          <div class="col-md-4"><label class="form-label">Precio Normal</label><input type="number" class="form-control" [(ngModel)]="formData.precioNormalHabitacion" step="0.01" (keydown)="blockInvalidKeys($event, true)"></div>
          <div class="col-md-4"><label class="form-label">Precio Actual</label><input type="number" class="form-control" [(ngModel)]="formData.precioActualHabitacion" step="0.01" (keydown)="blockInvalidKeys($event, true)"></div>
          <div class="col-12"><div class="form-check"><input type="checkbox" class="form-check-input" id="estadoHab" [(ngModel)]="formData.estadoHabitacion"><label class="form-check-label" for="estadoHab">Habitación Activa</label></div></div>
        </div></div>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
          <button class="btn btn-hotel" (click)="saveHabitacion()" [disabled]="saving">{{isEditing?'Actualizar':'Crear'}}</button>
        </div>
      </div></div></div>
    }
    @if (showDeleteModal) {
      <div class="modal fade show d-block" style="background:rgba(0,0,0,0.5)"><div class="modal-dialog"><div class="modal-content">
        <div class="modal-header bg-danger text-white"><h5 class="modal-title">Desactivar Habitación</h5></div>
        <div class="modal-body"><p>¿Desactivar <strong>{{selectedItem?.idHabitacion}}</strong>?</p></div>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="showDeleteModal=false">Cancelar</button>
          <button class="btn btn-danger" (click)="deleteHabitacion()">Desactivar</button>
        </div>
      </div></div></div>
    }
  `,
  styles: [`.text-hotel{color:#2f5d50}.bg-hotel{background:linear-gradient(135deg,#436e62 0%,#2f5d50 100%)}.btn-hotel{background:linear-gradient(135deg,#436e62 0%,#2f5d50 100%);border:none;color:white}`]
})
export class HabitacionesAdminComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private graphqlUrl = environment.habitacionesGraphqlUrl;
  private catalogosUrl = environment.catalogosServiceUrl;

  habitaciones: Habitacion[] = []; filteredData: Habitacion[] = [];
  tiposHabitacion: TipoHabitacion[] = []; hoteles: Hotel[] = []; ciudades: Ciudad[] = [];
  loading = true; saving = false;
  searchTerm = ''; filterStatus = ''; page = 1; perPage = 20;
  showModal = false; showDeleteModal = false; isEditing = false; selectedItem: Habitacion | null = null;
  formData = { idHabitacion: '', nombreHabitacion: '', idTipoHabitacion: 0, idCiudad: 0, idHotel: 0, capacidadHabitacion: 2, precioNormalHabitacion: 0, precioActualHabitacion: 0, estadoHabitacion: true };
  toast = { show: false, message: '', type: 'success' as 'success' | 'error' };

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    console.log('[Habitaciones] Token JWT:', token ? 'Presente (' + token.substring(0, 20) + '...)' : 'AUSENTE');
    return new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' });
  }

  ngOnInit() { this.loadData(); this.loadDropdowns(); }

  loadData() {
    this.loading = true;
    const query = `query { habitaciones { idHabitacion nombreHabitacion idHotel idCiudad idTipoHabitacion precioNormalHabitacion precioActualHabitacion capacidadHabitacion estadoHabitacion } }`;
    this.http.post<any>(this.graphqlUrl, { query }).subscribe({
      next: res => { this.habitaciones = res?.data?.habitaciones || []; this.filterData(); this.loading = false; },
      error: () => { this.loading = false; this.showToast('Error al cargar', 'error'); }
    });
  }

  loadDropdowns() {
    this.http.get<TipoHabitacion[]>(`${this.catalogosUrl}/TiposHabitacion`).subscribe({ next: d => this.tiposHabitacion = d || [] });
    this.http.get<Hotel[]>(`${this.catalogosUrl}/hoteles`).subscribe({ next: d => this.hoteles = d || [] });
    this.http.get<Ciudad[]>(`${this.catalogosUrl}/ciudades`).subscribe({ next: d => this.ciudades = d || [] });
  }

  filterData() {
    let result = [...this.habitaciones];
    if (this.searchTerm) { const t = this.searchTerm.toLowerCase(); result = result.filter(h => h.idHabitacion?.toLowerCase().includes(t) || h.nombreHabitacion?.toLowerCase().includes(t)); }
    if (this.filterStatus !== '') result = result.filter(h => h.estadoHabitacion === (this.filterStatus === 'true'));
    this.filteredData = result;
    this.page = 1; // Reset to first page on filter
  }

  get habitacionesPaginadas() { return this.filteredData.slice((this.page - 1) * this.perPage, this.page * this.perPage); }
  get totalPages() { return Math.ceil(this.filteredData.length / this.perPage); }

  changePage(p: number) { if (p >= 1 && p <= this.totalPages) this.page = p; }

  // Paginación: mostrar máximo 5 páginas
  getPageRange(): number[] {
    const range: number[] = [];
    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, this.page - half);
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) range.push(i);
    return range;
  }

  getTipoNombre(id: number) { return this.tiposHabitacion.find(t => t.idTipoHabitacion === id)?.nombreTipoHabitacion || `Tipo ${id}`; }

  openCreateModal() {
    this.isEditing = false;
    this.formData = { idHabitacion: '', nombreHabitacion: '', idTipoHabitacion: 0, idCiudad: 0, idHotel: 0, capacidadHabitacion: 2, precioNormalHabitacion: 0, precioActualHabitacion: 0, estadoHabitacion: true };
    this.generateNextId();
    this.showModal = true;
  }

  openEditModal(h: Habitacion) {
    this.isEditing = true; this.selectedItem = h;
    this.formData = { idHabitacion: h.idHabitacion, nombreHabitacion: h.nombreHabitacion, idTipoHabitacion: h.idTipoHabitacion, idCiudad: h.idCiudad, idHotel: h.idHotel, capacidadHabitacion: h.capacidadHabitacion, precioNormalHabitacion: h.precioNormalHabitacion, precioActualHabitacion: h.precioActualHabitacion, estadoHabitacion: h.estadoHabitacion };
    this.showModal = true;
  }

  openDeleteModal(h: Habitacion) { this.selectedItem = h; this.showDeleteModal = true; }
  closeModal() { this.showModal = false; }

  generateNextId() {
    let maxNum = 0, prefix = 'HAJO';
    this.habitaciones.forEach(h => { if (h.idHabitacion?.length >= 5) { const num = parseInt(h.idHabitacion.substring(4), 10); if (!isNaN(num) && num > maxNum) { maxNum = num; prefix = h.idHabitacion.substring(0, 4); } } });
    this.formData.idHabitacion = prefix + (maxNum + 1).toString().padStart(6, '0');
  }

  saveHabitacion() {
    if (!this.formData.idHabitacion || !this.formData.nombreHabitacion) { this.showToast('ID y Nombre requeridos', 'error'); return; }
    if (!this.formData.idTipoHabitacion || !this.formData.idHotel || !this.formData.idCiudad) { this.showToast('Tipo, Hotel y Ciudad requeridos', 'error'); return; }
    this.saving = true;

    const mutation = this.isEditing ? `
      mutation { updateHabitacion(id: "${this.formData.idHabitacion}", input: {
        idHabitacion: "${this.formData.idHabitacion}", idHotel: ${this.formData.idHotel}, idTipoHabitacion: ${this.formData.idTipoHabitacion}, idCiudad: ${this.formData.idCiudad},
        nombreHabitacion: "${this.formData.nombreHabitacion}", capacidadHabitacion: ${this.formData.capacidadHabitacion || 2},
        precioNormalHabitacion: ${this.formData.precioNormalHabitacion || 0}, precioActualHabitacion: ${this.formData.precioActualHabitacion || 0},
        estadoHabitacion: ${this.formData.estadoHabitacion}
      }) { idHabitacion estadoHabitacion } }
    ` : `
      mutation { createHabitacion(input: {
        idHabitacion: "${this.formData.idHabitacion}", idHotel: ${this.formData.idHotel}, idTipoHabitacion: ${this.formData.idTipoHabitacion}, idCiudad: ${this.formData.idCiudad},
        nombreHabitacion: "${this.formData.nombreHabitacion}", capacidadHabitacion: ${this.formData.capacidadHabitacion || 2},
        precioNormalHabitacion: ${this.formData.precioNormalHabitacion || 0}, precioActualHabitacion: ${this.formData.precioActualHabitacion || 0},
        estadoHabitacion: ${this.formData.estadoHabitacion}
      }) { idHabitacion estadoHabitacion } }
    `;

    this.http.post<any>(this.graphqlUrl, { query: mutation }, { headers: this.getAuthHeaders() }).subscribe({
      next: res => {
        if (res.errors) { this.showToast(res.errors[0]?.message || 'Error', 'error'); }
        else { this.showToast(this.isEditing ? 'Actualizado' : 'Creado', 'success'); this.closeModal(); this.loadData(); }
        this.saving = false;
      },
      error: (err) => { console.error('Error:', err); this.showToast('Error de conexión', 'error'); this.saving = false; }
    });
  }

  deleteHabitacion() {
    if (!this.selectedItem) return;
    this.saving = true;
    const mutation = `mutation { updateHabitacion(id: "${this.selectedItem.idHabitacion}", input: {
      idHabitacion: "${this.selectedItem.idHabitacion}", idHotel: ${this.selectedItem.idHotel}, idTipoHabitacion: ${this.selectedItem.idTipoHabitacion}, idCiudad: ${this.selectedItem.idCiudad},
      nombreHabitacion: "${this.selectedItem.nombreHabitacion}", capacidadHabitacion: ${this.selectedItem.capacidadHabitacion},
      precioNormalHabitacion: ${this.selectedItem.precioNormalHabitacion}, precioActualHabitacion: ${this.selectedItem.precioActualHabitacion},
      estadoHabitacion: false
    }) { idHabitacion estadoHabitacion } }`;

    this.http.post<any>(this.graphqlUrl, { query: mutation }, { headers: this.getAuthHeaders() }).subscribe({
      next: res => {
        if (res.errors) { this.showToast(res.errors[0]?.message || 'Error', 'error'); }
        else { this.showToast('Desactivado', 'success'); this.showDeleteModal = false; this.loadData(); }
        this.saving = false;
      },
      error: () => { this.showToast('Error', 'error'); this.saving = false; }
    });
  }

  showToast(m: string, t: 'success' | 'error') { this.toast = { show: true, message: m, type: t }; setTimeout(() => this.toast.show = false, 3000); }

  // Block invalid keys in number inputs: 'e', 'E', '+', '-' and optionally '.'
  blockInvalidKeys(event: KeyboardEvent, allowDecimal: boolean): void {
    const blockedKeys = ['e', 'E', '+', '-'];
    if (!allowDecimal) blockedKeys.push('.');
    if (blockedKeys.includes(event.key)) event.preventDefault();
  }
}
