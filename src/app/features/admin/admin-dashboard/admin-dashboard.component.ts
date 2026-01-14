import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface AdminMenuItem {
    icon: string;
    label: string;
    route: string;
    description: string;
}

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="container-fluid py-4">
      <div class="row mb-4">
        <div class="col">
          <h2 class="fw-bold text-hotel">
            <i class="bi bi-gear-fill me-2"></i>
            Panel de Administración
          </h2>
          <p class="text-muted">Bienvenido, {{ currentUser?.nombre }} {{ currentUser?.apellido }}</p>
        </div>
      </div>

      <div class="row g-4">
        @for (item of menuItems; track item.route) {
          <div class="col-md-6 col-lg-4">
            <a [routerLink]="item.route" class="text-decoration-none">
              <div class="card h-100 shadow-sm admin-card">
                <div class="card-body text-center p-4">
                  <i class="bi {{ item.icon }} fs-1 text-hotel mb-3"></i>
                  <h5 class="card-title fw-bold">{{ item.label }}</h5>
                  <p class="card-text text-muted small">{{ item.description }}</p>
                </div>
              </div>
            </a>
          </div>
        }
      </div>
    </div>
  `,
    styles: [`
    .text-hotel {
      color: #2f5d50;
    }
    .admin-card {
      border-radius: 1rem;
      border: 1px solid rgba(47, 93, 80, 0.1);
      transition: all 0.3s ease;
      cursor: pointer;
    }
    .admin-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(47, 93, 80, 0.15) !important;
      border-color: #2f5d50;
    }
    .admin-card:hover .text-hotel {
      color: #1a3d34;
    }
  `]
})
export class AdminDashboardComponent {
    private authService = inject(AuthService);

    currentUser = this.authService.getCurrentUser();

    menuItems: AdminMenuItem[] = [
        {
            icon: 'bi-door-open-fill',
            label: 'Habitaciones',
            route: '/admin/habitaciones',
            description: 'Gestionar habitaciones del hotel'
        },
        {
            icon: 'bi-people-fill',
            label: 'Usuarios',
            route: '/admin/usuarios',
            description: 'Administrar usuarios del sistema'
        },
        {
            icon: 'bi-calendar-check-fill',
            label: 'Reservas',
            route: '/admin/reservas',
            description: 'Ver y gestionar reservas'
        },
        {
            icon: 'bi-building-fill',
            label: 'Hoteles',
            route: '/admin/hoteles',
            description: 'Administrar hoteles'
        },
        {
            icon: 'bi-geo-alt-fill',
            label: 'Ciudades',
            route: '/admin/ciudades',
            description: 'Gestionar ciudades'
        },
        {
            icon: 'bi-star-fill',
            label: 'Amenidades',
            route: '/admin/amenidades',
            description: 'Administrar amenidades'
        },
        {
            icon: 'bi-tags-fill',
            label: 'Tipos de Habitación',
            route: '/admin/tipos-habitacion',
            description: 'Gestionar tipos de habitación'
        }
    ];
}
