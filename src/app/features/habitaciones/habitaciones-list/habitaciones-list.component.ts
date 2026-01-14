import { Component, inject, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HabitacionesService } from '../../../core/services/habitaciones.service';
import { HabitacionCard, TipoHabitacion } from '../../../core/models/habitacion.model';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ErrorComponent } from '../../../shared/components/error/error.component';
import { EmptyComponent } from '../../../shared/components/empty/empty.component';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-habitaciones-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    LoadingComponent,
    ErrorComponent,
    EmptyComponent
  ],
  templateUrl: './habitaciones-list.component.html',
  styleUrl: './habitaciones-list.component.scss'
})
export class HabitacionesListComponent implements OnInit, OnDestroy, AfterViewInit {
  private habitacionesService = inject(HabitacionesService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  habitaciones: HabitacionCard[] = [];
  habitacionesFiltradas: HabitacionCard[] = [];
  tiposHabitacion: TipoHabitacion[] = [];

  // Mapa de fechas ocupadas por habitación (se carga solo cuando se busca con fechas)
  fechasOcupadasPorHabitacion: Map<string, string[]> = new Map();

  loading = true;
  loadingFechas = false;
  error = false;

  filterForm!: FormGroup;

  // Paginación
  page = 1;
  perPage = 10;

  // Litepicker instance
  private picker: any = null;

  // Fechas seleccionadas
  fechaInicioSeleccionada: string = '';
  fechaFinSeleccionada: string = '';

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      tipoHabitacion: [''],
      fechaInicio: [''],
      fechaFin: [''],
      capacidad: [''],
      precioMin: [''],
      precioMax: ['']
    });

    // Leer fechas de queryParams si vienen
    this.route.queryParams.subscribe(params => {
      if (params['fechaInicio'] && params['fechaFin']) {
        this.fechaInicioSeleccionada = params['fechaInicio'];
        this.fechaFinSeleccionada = params['fechaFin'];
        this.filterForm.patchValue({
          fechaInicio: params['fechaInicio'],
          fechaFin: params['fechaFin']
        });
      }
    });

    this.loadData();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initLitepicker(), 500);
  }

  ngOnDestroy(): void {
    if (this.picker) {
      this.picker.destroy();
      this.picker = null;
    }
  }

  private initLitepicker(): void {
    const element = document.getElementById('filtro-fechas');
    if (!element) {
      setTimeout(() => this.initLitepicker(), 200);
      return;
    }

    if (this.picker) {
      this.picker.destroy();
    }

    const Litepicker = (window as any).Litepicker;
    if (!Litepicker) {
      console.error('Litepicker no está disponible');
      return;
    }

    this.picker = new Litepicker({
      element: element,
      singleMode: false,
      numberOfMonths: 2,
      numberOfColumns: 2,
      minDate: new Date(),
      autoApply: true,
      lang: 'es-ES',
      format: 'DD/MM/YYYY',
      tooltipText: { one: 'noche', other: 'noches' },
      setup: (picker: any) => {
        picker.on('selected', (date1: any, date2: any) => {
          if (date1 && date2) {
            const fechaInicio = this.formatDateForForm(date1);
            const fechaFin = this.formatDateForForm(date2);

            this.fechaInicioSeleccionada = fechaInicio;
            this.fechaFinSeleccionada = fechaFin;

            this.filterForm.patchValue({
              fechaInicio: fechaInicio,
              fechaFin: fechaFin
            });

            console.log('Fechas filtro seleccionadas:', fechaInicio, '-', fechaFin);
          }
        });

        // Pre-seleccionar si hay fechas guardadas (con fix de timezone)
        if (this.fechaInicioSeleccionada && this.fechaFinSeleccionada) {
          setTimeout(() => {
            const [y1, m1, d1] = this.fechaInicioSeleccionada.split('-').map(Number);
            const [y2, m2, d2] = this.fechaFinSeleccionada.split('-').map(Number);
            picker.setDateRange(new Date(y1, m1 - 1, d1), new Date(y2, m2 - 1, d2));
          }, 100);
        }
      }
    });
  }

  private formatDateForForm(date: any): string {
    const d = date.dateInstance || date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  loadData(): void {
    this.loading = true;
    this.error = false;

    this.habitacionesService.getTiposHabitacion().subscribe(tipos => {
      this.tiposHabitacion = tipos;
    });

    this.habitacionesService.getHabitacionesEnriquecidas().subscribe({
      next: (data) => {
        this.habitaciones = data;
        this.habitacionesFiltradas = data;
        this.loading = false;
        // NO cargar fechas aquí - se hará solo cuando el usuario busque con fechas
      },
      error: () => {
        this.loading = false;
        this.error = true;
      }
    });
  }

  aplicarFiltros(): void {
    const { fechaInicio, fechaFin } = this.filterForm.value;

    // Aplicar primero filtros básicos
    this.aplicarFiltrosBasicos();

    // Si hay fechas seleccionadas, filtrar por disponibilidad (solo 2 llamadas API)
    if (fechaInicio && fechaFin) {
      this.loadingFechas = true;

      this.habitacionesService.getHabitacionesOcupadasEnRango(fechaInicio, fechaFin)
        .subscribe(ocupadas => {
          // Filtrar las habitaciones que NO están ocupadas
          this.habitacionesFiltradas = this.habitacionesFiltradas.filter(h => !ocupadas.has(h.id));
          this.loadingFechas = false;
          console.log('[Filtro rápido] Habitaciones disponibles:', this.habitacionesFiltradas.length);
        });
    }
  }

  // Método legacy (conservado por compatibilidad - ya no se usa)
  private loadFechasOcupadasYFiltrar(): void {
    const { fechaInicio, fechaFin } = this.filterForm.value;

    this.aplicarFiltrosBasicos();

    const habitacionesAConsultar = this.habitacionesFiltradas;
    if (habitacionesAConsultar.length === 0) return;

    this.loadingFechas = true;

    const requests = habitacionesAConsultar.map(h =>
      this.habitacionesService.getFechasOcupadas(h.id).pipe(
        catchError(() => of([]))
      )
    );

    forkJoin(requests).subscribe(results => {
      results.forEach((fechas, index) => {
        this.fechasOcupadasPorHabitacion.set(habitacionesAConsultar[index].id, fechas);
      });

      this.habitacionesFiltradas = habitacionesAConsultar.filter(h => {
        const fechasOcupadas = this.fechasOcupadasPorHabitacion.get(h.id) || [];
        return !this.hasDateConflict(fechaInicio, fechaFin, fechasOcupadas);
      });

      this.loadingFechas = false;
    });
  }

  private aplicarFiltrosBasicos(): void {
    const { tipoHabitacion, capacidad, precioMin, precioMax } = this.filterForm.value;

    this.habitacionesFiltradas = this.habitaciones.filter(h => {
      let cumple = true;

      if (tipoHabitacion && h.tipoNombre?.toLowerCase() !== tipoHabitacion.toLowerCase()) {
        cumple = false;
      }

      if (capacidad && h.capacidad < parseInt(capacidad, 10)) {
        cumple = false;
      }

      if (precioMin && h.precio < parseFloat(precioMin)) {
        cumple = false;
      }

      if (precioMax && h.precio > parseFloat(precioMax)) {
        cumple = false;
      }

      return cumple;
    });

    this.page = 1;
  }

  private hasDateConflict(inicio: string, fin: string, fechasOcupadas: string[]): boolean {
    const [y1, m1, d1] = inicio.split('-').map(Number);
    const [y2, m2, d2] = fin.split('-').map(Number);
    const startDate = new Date(y1, m1 - 1, d1);
    const endDate = new Date(y2, m2 - 1, d2);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      if (fechasOcupadas.includes(dateStr)) {
        return true;
      }
    }
    return false;
  }

  limpiarFiltros(): void {
    this.filterForm.reset();
    this.fechaInicioSeleccionada = '';
    this.fechaFinSeleccionada = '';

    if (this.picker) {
      this.picker.clearSelection();
    }

    this.habitacionesFiltradas = this.habitaciones;
    this.page = 1;
  }

  verDetalle(habitacionId: string): void {
    const queryParams: any = {};

    if (this.fechaInicioSeleccionada && this.fechaFinSeleccionada) {
      queryParams.fechaInicio = this.fechaInicioSeleccionada;
      queryParams.fechaFin = this.fechaFinSeleccionada;
    }

    this.router.navigate(['/habitaciones', habitacionId], { queryParams });
  }

  get habitacionesPaginadas(): HabitacionCard[] {
    const start = (this.page - 1) * this.perPage;
    return this.habitacionesFiltradas.slice(start, start + this.perPage);
  }

  get totalPages(): number {
    return Math.ceil(this.habitacionesFiltradas.length / this.perPage);
  }

  cambiarPagina(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.page = newPage;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getPaginationRange(): number[] {
    const range: number[] = [];
    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2);

    let start = Math.max(1, this.page - half);
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    return range;
  }
}
