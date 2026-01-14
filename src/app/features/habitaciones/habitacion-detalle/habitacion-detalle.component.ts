import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { HabitacionesService } from '../../../core/services/habitaciones.service';
import { ReservasService, LocalReserva } from '../../../core/services/reservas.service';
import { AuthService } from '../../../core/services/auth.service';
import { Habitacion } from '../../../core/models/habitacion.model';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ErrorComponent } from '../../../shared/components/error/error.component';

interface PreReservaModal {
  idHold: string;
  idReserva?: number;
  fechaInicio: string;
  fechaFin: string;
  numeroHuespedes: number;
  tiempoRestante: number;
  precioEstimado?: number;
}

@Component({
  selector: 'app-habitacion-detalle',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    LoadingComponent,
    ErrorComponent
  ],
  templateUrl: './habitacion-detalle.component.html',
  styleUrl: './habitacion-detalle.component.scss'
})
export class HabitacionDetalleComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private habitacionesService = inject(HabitacionesService);
  private reservasService = inject(ReservasService);
  private authService = inject(AuthService);

  habitacion: Habitacion | null = null;
  amenidades: string[] = [];
  imagenes: string[] = [];
  imagenActual = 0;

  loading = true;
  error = false;
  submitting = false;
  errorMessage = '';

  reservaForm!: FormGroup;

  // Restricciones de fechas
  today = new Date().toISOString().split('T')[0];
  minFechaFin = this.today;
  fechasOcupadasBackend: string[] = [];

  // Modal de confirmación
  showConfirmModal = false;
  preReservaData: PreReservaModal | null = null;
  timerInterval: any = null;
  confirmando = false;
  cancelando = false;
  modalError = '';

  // Litepicker instance
  private picker: any = null;

  // Fechas recibidas desde el listado
  fechasDesdeListado: { inicio: string, fin: string } | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/habitaciones']);
      return;
    }

    // Leer fechas de queryParams si vienen desde el listado
    const queryParams = this.route.snapshot.queryParams;
    if (queryParams['fechaInicio'] && queryParams['fechaFin']) {
      this.fechasDesdeListado = {
        inicio: queryParams['fechaInicio'],
        fin: queryParams['fechaFin']
      };
    }

    this.initForm();
    this.loadHabitacion(id);
    this.loadFechasOcupadas(id);
  }

  ngOnDestroy(): void {
    this.clearTimer();
    // Limpiar Litepicker
    if (this.picker) {
      this.picker.destroy();
      this.picker = null;
    }
  }

  private clearTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private initForm(): void {
    this.reservaForm = this.fb.group({
      fechaInicio: [this.today, [Validators.required]],
      fechaFin: ['', [Validators.required]],
      numeroHuespedes: [1, [Validators.required, Validators.min(1)]]
    }, {
      validators: [this.fechasValidator]
    });

    // Actualizar minFechaFin cuando cambie fechaInicio
    this.reservaForm.get('fechaInicio')?.valueChanges.subscribe(value => {
      if (value) {
        const nextDay = new Date(value);
        nextDay.setDate(nextDay.getDate() + 1);
        this.minFechaFin = nextDay.toISOString().split('T')[0];

        const fechaFin = this.reservaForm.get('fechaFin')?.value;
        if (fechaFin && fechaFin < this.minFechaFin) {
          this.reservaForm.get('fechaFin')?.setValue('');
        }
      } else {
        this.minFechaFin = this.today;
      }
    });
  }

  // Validador personalizado: fecha fin > fecha inicio
  fechasValidator(group: AbstractControl): ValidationErrors | null {
    const fechaInicio = group.get('fechaInicio')?.value;
    const fechaFin = group.get('fechaFin')?.value;

    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);

      if (fin <= inicio) {
        return { fechasInvalidas: true };
      }
    }
    return null;
  }

  private loadHabitacion(id: string): void {
    this.loading = true;
    this.error = false;

    this.habitacionesService.getDetalleHabitacion(id).subscribe({
      next: ({ habitacion, amenidades, imagenes }) => {
        if (!habitacion) {
          this.error = true;
          this.loading = false;
          return;
        }

        this.habitacion = habitacion;
        this.amenidades = amenidades;
        this.imagenes = imagenes;
        this.loading = false;

        // Actualizar validación de huéspedes con capacidad real
        this.reservaForm.get('numeroHuespedes')?.setValidators([
          Validators.required,
          Validators.min(1),
          Validators.max(habitacion.CapacidadHabitacion)
        ]);
        this.reservaForm.get('numeroHuespedes')?.updateValueAndValidity();
      },
      error: () => {
        this.loading = false;
        this.error = true;
      }
    });
  }

  private loadFechasOcupadas(id: string): void {
    this.habitacionesService.getFechasOcupadas(id).subscribe({
      next: (fechas) => {
        console.log('Fechas ocupadas backend:', fechas);
        this.fechasOcupadasBackend = fechas;
        // Esperar a que la vista esté lista antes de inicializar Litepicker
        this.tryInitLitepicker(0);
      },
      error: (err) => {
        console.error('Error cargando fechas ocupadas:', err);
        // Inicializar Litepicker sin fechas bloqueadas si falla
        this.tryInitLitepicker(0);
      }
    });
  }

  /**
   * Intenta inicializar Litepicker con reintentos
   */
  private tryInitLitepicker(attempt: number): void {
    const maxAttempts = 10;
    const delay = 200; // 200ms entre intentos

    if (attempt >= maxAttempts) {
      console.warn('No se pudo inicializar Litepicker después de', maxAttempts, 'intentos');
      return;
    }

    setTimeout(() => {
      const element = document.getElementById('rango-fechas');
      if (element && !this.loading) {
        console.log('Inicializando Litepicker en intento', attempt + 1);
        this.initLitepicker();
      } else {
        console.log('Reintentando inicializar Litepicker... intento', attempt + 1);
        this.tryInitLitepicker(attempt + 1);
      }
    }, delay);
  }

  /**
   * Inicializa Litepicker con las fechas ocupadas bloqueadas (igual que Django)
   */
  private initLitepicker(): void {
    const element = document.getElementById('rango-fechas');
    if (!element) {
      console.warn('Elemento rango-fechas no encontrado');
      return;
    }

    // Destruir picker existente si hay uno
    if (this.picker) {
      this.picker.destroy();
    }

    // Convertir fechas ocupadas a objetos Date (igual que en Django)
    const fechasBloqueadas = this.fechasOcupadasBackend.map(fecha => {
      const [year, month, day] = fecha.split('-');
      const fechaDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      fechaDate.setHours(0, 0, 0, 0);
      return fechaDate;
    });

    console.log('Inicializando Litepicker con', fechasBloqueadas.length, 'fechas bloqueadas');

    // Acceder a Litepicker global (cargado via CDN)
    const Litepicker = (window as any).Litepicker;
    if (!Litepicker) {
      console.error('Litepicker no está disponible. Asegúrate de que el CDN se cargó correctamente.');
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
      lockDays: fechasBloqueadas,
      disallowLockDaysInRange: true, // Bloquear selección de rangos que incluyan días bloqueados
      setup: (picker: any) => {
        picker.on('selected', (date1: any, date2: any) => {
          if (date1 && date2) {
            // Convertir a formato YYYY-MM-DD para el formulario
            const fechaInicio = this.formatDateForForm(date1);
            const fechaFin = this.formatDateForForm(date2);

            // Verificar conflictos con fechas ocupadas
            const conflicto = this.checkDateRangeConflict(fechaInicio, fechaFin);
            if (conflicto) {
              this.errorMessage = `Las fechas seleccionadas incluyen días ocupados (${conflicto}). Por favor, selecciona otras fechas.`;
              picker.clearSelection();
              element.setAttribute('value', '');
              return;
            }

            // Actualizar el formulario reactivo
            this.reservaForm.patchValue({
              fechaInicio: fechaInicio,
              fechaFin: fechaFin
            });
            this.reservaForm.get('fechaInicio')?.markAsTouched();
            this.reservaForm.get('fechaFin')?.markAsTouched();
            this.errorMessage = '';

            console.log('Fechas seleccionadas:', fechaInicio, '-', fechaFin);
          }
        });

        // Pre-seleccionar fechas si vienen desde el listado (con fix de timezone)
        if (this.fechasDesdeListado) {
          setTimeout(() => {
            const [y1, m1, d1] = this.fechasDesdeListado!.inicio.split('-').map(Number);
            const [y2, m2, d2] = this.fechasDesdeListado!.fin.split('-').map(Number);
            picker.setDateRange(new Date(y1, m1 - 1, d1), new Date(y2, m2 - 1, d2));
            // Las fechas se actualizarán automáticamente via el evento 'selected'
          }, 100);
        }
      }
    });
  }

  /**
   * Convierte fecha de Litepicker a formato YYYY-MM-DD
   */
  private formatDateForForm(date: any): string {
    const d = date.dateInstance || date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Verifica si el rango de fechas tiene conflicto con fechas ocupadas
   */
  private checkDateRangeConflict(inicio: string, fin: string): string | null {
    const startDate = new Date(inicio + 'T00:00:00');
    const endDate = new Date(fin + 'T00:00:00');

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      if (this.fechasOcupadasBackend.includes(dateStr)) {
        return dateStr;
      }
    }
    return null;
  }

  get f() {
    return this.reservaForm.controls;
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  cambiarImagen(direccion: number): void {
    this.imagenActual = (this.imagenActual + direccion + this.imagenes.length) % this.imagenes.length;
  }

  seleccionarImagen(index: number): void {
    this.imagenActual = index;
  }

  // ==================== MODAL METHODS ====================

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  private startTimer(): void {
    this.timerInterval = setInterval(() => {
      if (this.preReservaData) {
        this.preReservaData.tiempoRestante--;

        if (this.preReservaData.tiempoRestante <= 0) {
          this.clearTimer();
          this.closeModal();
          this.errorMessage = 'El tiempo de la pre-reserva ha expirado. Intente nuevamente.';
        }
      }
    }, 1000);
  }

  closeModal(): void {
    this.showConfirmModal = false;
    this.preReservaData = null;
    this.modalError = '';
    this.clearTimer();
  }

  calcularDias(fechaInicio: string, fechaFin: string): number {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diff = fin.getTime() - inicio.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  formatDate(fecha: string): string {
    const date = new Date(fecha + 'T00:00:00');
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  // ==================== FORM SUBMISSION ====================

  /**
   * Genera un array de fechas ISO entre inicio y fin
   */
  private getDatesInRange(startStr: string, endStr: string): string[] {
    const dates = [];
    let current = new Date(startStr);
    // Ajustar a medianoche local UTC para evitar problemas de offset
    current = new Date(current.valueOf() + current.getTimezoneOffset() * 60000);

    // Necesitamos asegurarnos que manejamos yyyy-mm-dd exactos
    // Mejor trabajar con strings directos si es posible
    // Reimplementación simple basada en strings:

    let d = new Date(startStr + 'T00:00:00'); // Forzar inicio de día local
    const e = new Date(endStr + 'T00:00:00');

    while (d <= e) {
      dates.push(d.toISOString().split('T')[0]);
      d.setDate(d.getDate() + 1);
    }
    return dates;
  }

  /**
   * Verifica conflictos con reservas locales y backend
   */
  private checkAvailabilityConflicts(inicio: string, fin: string): string | null {
    if (!this.habitacion) return null;

    const rangeDates = this.getDatesInRange(inicio, fin);

    // 1. Validar contra Backend (Fechas Ocupadas)
    for (const date of rangeDates) {
      if (this.fechasOcupadasBackend.includes(date)) {
        return `La fecha ${date} no está disponible (Ocupada en el hotel).`;
      }
    }

    // 2. Validar contra LocalStorage (Mis reservas pendientes/confirmadas)
    const inicioDate = new Date(inicio);
    const finDate = new Date(fin);

    const locales = this.reservasService.getLocalReservas().filter(r =>
      r.idHabitacion === String(this.habitacion!.IdHabitacion) &&
      (r.estado === 'CONFIRMADA' || r.estado === 'PENDIENTE')
    );

    for (const res of locales) {
      if (!res.fechaInicio || !res.fechaFin) continue;

      const rStart = new Date(res.fechaInicio);
      const rEnd = new Date(res.fechaFin);

      // Simple range overlap check
      if (inicioDate < rEnd && finDate > rStart) {
        return 'Ya tienes una reserva pendiente o confirmada para estas fechas.';
      }
    }

    return null;
  }

  onSubmit(): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: this.router.url }
      });
      return;
    }

    if (this.reservaForm.invalid) {
      Object.keys(this.f).forEach(key => {
        this.f[key].markAsTouched();
      });
      return;
    }

    const val = this.reservaForm.value;

    // Validaciones de disponibilidad
    const conflictError = this.checkAvailabilityConflicts(val.fechaInicio, val.fechaFin);
    if (conflictError) {
      this.errorMessage = conflictError;
      return;
    }

    const user = this.authService.getCurrentUser();
    if (!user || !this.habitacion) return;

    this.submitting = true;
    this.errorMessage = '';

    const formValue = this.reservaForm.value;

    // Crear pre-reserva usando el servicio
    this.reservasService.crearPreReserva({
      idHabitacion: this.habitacion.IdHabitacion,
      fechaInicio: formValue.fechaInicio,
      fechaFin: formValue.fechaFin,
      numeroHuespedes: formValue.numeroHuespedes,
      nombre: user.nombre,
      apellido: user.apellido,
      correo: user.correo,
      tipoDocumento: user.tipoDocumento,
      documento: user.documento,
      usuarioId: user.id
    }).subscribe({
      next: (response) => {
        this.submitting = false;

        const idHold = response.idHold || response.IdHold || '';
        const tiempoHold = response.tiempoHold || response.TiempoHold || 180;
        const dias = this.calcularDias(formValue.fechaInicio, formValue.fechaFin);
        const precioEstimado = dias * (this.habitacion?.PrecioActualHabitacion || 0);

        // Guardar en localStorage
        const localReserva: LocalReserva = {
          id: `${Date.now()}`,
          idHold: idHold,
          idHabitacion: this.habitacion!.IdHabitacion,
          nombreHabitacion: this.habitacion!.NombreHabitacion,
          nombreHotel: this.habitacion!.NombreHotel,
          nombreCiudad: this.habitacion!.NombreCiudad,
          fechaInicio: formValue.fechaInicio,
          fechaFin: formValue.fechaFin,
          numeroHuespedes: formValue.numeroHuespedes,
          precioTotal: precioEstimado,
          estado: 'PENDIENTE',
          fechaCreacion: new Date().toISOString(),
          fechaExpiracion: new Date(Date.now() + tiempoHold * 1000).toISOString(),
          usuarioId: user.id,
          imagen: this.imagenes[0]
        };
        this.reservasService.saveLocalReserva(localReserva);

        // Mostrar modal de confirmación
        this.preReservaData = {
          idHold: idHold,
          fechaInicio: formValue.fechaInicio,
          fechaFin: formValue.fechaFin,
          numeroHuespedes: formValue.numeroHuespedes,
          tiempoRestante: tiempoHold,
          precioEstimado: precioEstimado
        };
        this.showConfirmModal = true;
        this.startTimer();
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err.message || 'Error al crear la pre-reserva. Las fechas pueden estar ocupadas.';
      }
    });
  }

  /**
   * Confirma la creación de la pre-reserva (HOLD) y redirige a Mis Reservas
   */
  confirmarReserva(): void {
    if (!this.preReservaData || !this.habitacion) return;

    this.closeModal();
    // Redirección limpia SIN query params
    this.router.navigate(['/usuario/reservas']);
  }

  /**
   * Cancela la pre-reserva desde el modal
   */
  cancelarPreReserva(): void {
    if (!this.preReservaData) return;

    this.cancelando = true;
    this.modalError = '';

    this.reservasService.cancelarReserva(this.preReservaData.idHold).subscribe({
      next: () => {
        this.cancelando = false;
        this.closeModal();
        this.errorMessage = '';
      },
      error: (err) => {
        this.cancelando = false;
        this.closeModal();
      }
    });
  }
}
