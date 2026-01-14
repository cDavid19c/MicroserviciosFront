import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-brisamar sticky-top">
      <div class="container">
        <a class="navbar-brand brand-brisamar" routerLink="/">
          <span class="brand-icon">🌊</span>
          Brisamar
        </a>

        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#menu"
          aria-controls="menu"
          aria-expanded="false"
          aria-label="Abrir menú">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="menu">
          <ul class="navbar-nav ms-auto align-items-lg-center">
            <!-- Links públicos -->
            <li class="nav-item">
              <a class="nav-link nav-link-wave" routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
                Inicio
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link nav-link-wave" routerLink="/habitaciones" routerLinkActive="active">
                Habitaciones
              </a>
            </li>

            @if (authService.isLoggedIn()) {
              <!-- Links de usuario autenticado -->
              <li class="nav-item">
                <a class="nav-link nav-link-wave" routerLink="/usuario/reservas" routerLinkActive="active">
                  Mis reservas
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link nav-link-wave" routerLink="/usuario/pagos" routerLinkActive="active">
                  Pagos
                </a>
              </li>

              @if (authService.isAdmin()) {
                <!-- Link de admin -->
                <li class="nav-item">
                  <a class="nav-link nav-link-wave" routerLink="/admin" routerLinkActive="active">
                    Panel Admin
                  </a>
                </li>
              }

              <!-- Dropdown de usuario -->
              <li class="nav-item dropdown">
                <a
                  class="nav-link dropdown-toggle user-dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false">
                  <span class="user-avatar">
                    <i class="bi bi-person-circle"></i>
                  </span>
                  {{ user?.nombre || 'Mi Cuenta' }}
                </a>
                <ul class="dropdown-menu dropdown-menu-end dropdown-brisamar">
                  <li class="dropdown-header">
                    <small>Mi Cuenta</small>
                  </li>
                  <li>
                    <a class="dropdown-item" routerLink="/usuario/perfil">
                      <i class="bi bi-person me-2"></i>
                      <span>Mi perfil</span>
                    </a>
                  </li>
                  <li><hr class="dropdown-divider"></li>
                  <li>
                    <a class="dropdown-item text-danger" href="#" (click)="logout($event)">
                      <i class="bi bi-box-arrow-right me-2"></i>
                      <span>Cerrar sesión</span>
                    </a>
                  </li>
                </ul>
              </li>
            } @else {
              <!-- Botón de reservar para usuarios no autenticados -->
              <li class="nav-item ms-lg-3">
                <a class="btn btn-cta-navbar" routerLink="/login">
                  <i class="bi bi-calendar-check me-2"></i>Reservar Ahora
                </a>
              </li>
            }
          </ul>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    /* ==================== NAVBAR BRISAMAR - CARIBBEAN GLASSMORPHISM ==================== */
    .navbar-brisamar {
      background: rgba(14, 77, 100, 0.92);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(79, 189, 186, 0.15);
      box-shadow: 0 4px 30px rgba(10, 53, 69, 0.25);
      padding: 0.5rem 0;
      transition: all 0.3s ease;
    }

    /* ==================== BRAND LOGO ==================== */
    .brand-brisamar {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.75rem;
      font-weight: 700;
      color: #ffffff !important;
      letter-spacing: 1px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
    }

    .brand-icon {
      font-size: 1.5rem;
      animation: float 4s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }

    .brand-brisamar:hover {
      transform: scale(1.03);
      color: #ffffff !important;
    }

    /* ==================== NAV LINKS WITH WAVE ANIMATION ==================== */
    .nav-link-wave {
      color: rgba(255, 255, 255, 0.88) !important;
      font-family: 'Inter', sans-serif;
      font-weight: 500;
      font-size: 0.95rem;
      padding: 1rem 1.25rem !important;
      position: relative;
      transition: color 0.3s ease;
    }

    .nav-link-wave::after {
      content: '';
      position: absolute;
      bottom: 0.5rem;
      left: 1.25rem;
      right: 1.25rem;
      height: 2px;
      background: linear-gradient(90deg, #4FBDBA, #E07A5F, #4FBDBA);
      background-size: 200% 100%;
      transform: scaleX(0);
      transform-origin: center;
      transition: transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      border-radius: 2px;
    }

    .nav-link-wave:hover,
    .nav-link-wave.active {
      color: #ffffff !important;
    }

    .nav-link-wave:hover::after,
    .nav-link-wave.active::after {
      transform: scaleX(1);
      animation: waveUnderline 2.5s ease-in-out infinite;
    }

    @keyframes waveUnderline {
      0%, 100% { background-position: 0% 100%; }
      50% { background-position: 100% 100%; }
    }

    /* ==================== CTA BUTTON ==================== */
    .btn-cta-navbar {
      background: linear-gradient(135deg, #E07A5F 0%, #D4A853 100%);
      color: white !important;
      font-weight: 600;
      font-size: 0.9rem;
      padding: 0.75rem 1.5rem;
      border-radius: 50px;
      border: none;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(224, 122, 95, 0.4);
      position: relative;
      overflow: hidden;
    }

    .btn-cta-navbar::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
      transition: left 0.5s ease;
    }

    .btn-cta-navbar:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(224, 122, 95, 0.5);
      color: white !important;
    }

    .btn-cta-navbar:hover::before {
      left: 100%;
    }

    /* ==================== USER DROPDOWN ==================== */
    .user-dropdown-toggle {
      color: rgba(255, 255, 255, 0.9) !important;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem !important;
      transition: all 0.3s ease;
    }

    .user-avatar {
      font-size: 1.25rem;
      opacity: 0.9;
    }

    .user-dropdown-toggle:hover {
      color: #ffffff !important;
    }

    .dropdown-brisamar {
      border-radius: 12px;
      padding: 0.5rem;
      min-width: 200px;
      background: #ffffff;
      border: 1px solid rgba(14, 77, 100, 0.1);
      box-shadow: 0 15px 50px rgba(14, 77, 100, 0.2);
      animation: dropdownFadeIn 0.25s ease-out;
    }

    @keyframes dropdownFadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .dropdown-brisamar .dropdown-header {
      background: linear-gradient(135deg, rgba(79, 189, 186, 0.08) 0%, rgba(14, 77, 100, 0.05) 100%);
      border-bottom: 1px solid rgba(14, 77, 100, 0.08);
      font-weight: 600;
      color: #0E4D64;
      padding: 0.75rem 1rem;
      border-radius: 8px 8px 0 0;
      margin: -0.5rem -0.5rem 0.5rem;
    }

    .dropdown-brisamar .dropdown-item {
      color: #374151;
      font-weight: 500;
      padding: 0.65rem 1rem;
      border-radius: 8px;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
    }

    .dropdown-brisamar .dropdown-item:hover,
    .dropdown-brisamar .dropdown-item:focus {
      background: linear-gradient(135deg, rgba(79, 189, 186, 0.12) 0%, rgba(14, 77, 100, 0.08) 100%);
      color: #0E4D64;
      transform: translateX(4px);
    }

    .dropdown-brisamar .dropdown-item.text-danger {
      color: #dc3545;
    }

    .dropdown-brisamar .dropdown-item.text-danger:hover {
      background: rgba(220, 53, 69, 0.08);
      color: #dc3545;
    }

    .dropdown-brisamar .dropdown-divider {
      border-color: rgba(14, 77, 100, 0.1);
      margin: 0.5rem 0;
    }

    .dropdown-brisamar .dropdown-item i {
      width: 20px;
      font-size: 1rem;
      color: #4FBDBA;
    }

    .dropdown-brisamar .dropdown-item.text-danger i {
      color: #dc3545;
    }

    /* ==================== NAVBAR TOGGLER ==================== */
    .navbar-toggler {
      border-color: rgba(79, 189, 186, 0.5);
      padding: 0.5rem;
    }

    .navbar-toggler:focus {
      box-shadow: 0 0 0 0.25rem rgba(79, 189, 186, 0.25);
    }

    .navbar-toggler-icon {
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%28255, 255, 255, 0.9%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
    }

    /* ==================== RESPONSIVE ==================== */
    @media (max-width: 991px) {
      .navbar-brisamar {
        padding: 0.75rem 0;
      }

      .brand-brisamar {
        font-size: 1.5rem;
      }

      .navbar-collapse {
        background: rgba(10, 53, 69, 0.98);
        backdrop-filter: blur(15px);
        margin: 0.75rem -0.75rem -0.75rem;
        padding: 1rem;
        border-radius: 0 0 12px 12px;
        border-top: 1px solid rgba(79, 189, 186, 0.15);
      }

      .nav-link-wave {
        padding: 0.875rem 1rem !important;
        border-radius: 8px;
      }

      .nav-link-wave:hover {
        background: rgba(79, 189, 186, 0.1);
      }

      .nav-link-wave::after {
        display: none;
      }

      .btn-cta-navbar {
        width: 100%;
        text-align: center;
        margin-top: 0.75rem;
        padding: 1rem;
      }
    }

    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      .brand-icon {
        animation: none;
      }
      
      .nav-link-wave::after {
        animation: none;
      }
      
      .btn-cta-navbar::before {
        display: none;
      }
    }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  get user() {
    return this.authService.getCurrentUser();
  }

  logout(event: Event): void {
    event.preventDefault();
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
