import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { BreadcrumbsComponent } from './shared/components/breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, NavbarComponent, BreadcrumbsComponent],
  template: `
    <app-navbar></app-navbar>
    <app-breadcrumbs></app-breadcrumbs>
    <main>
      <router-outlet></router-outlet>
    </main>
    <footer class="footer-brisamar">
      <!-- Wave Decoration -->
      <div class="footer-wave">
        <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path d="M0,50 C150,100 350,0 500,50 C650,100 800,0 1000,50 C1200,100 1350,0 1440,50 L1440,100 L0,100 Z" fill="currentColor"/>
        </svg>
      </div>
      
      <div class="footer-top">
        <div class="container">
          <div class="row gy-4">
            <!-- Brand Column -->
            <div class="col-lg-4 col-md-6">
              <div class="footer-brand">
                <h4 class="footer-logo">
                  <span class="brand-icon">🌊</span>
                  Brisamar
                </h4>
                <p class="footer-tagline">Hospitalidad Caribeña Auténtica</p>
                <p class="footer-description">
                  Donde la brisa marina, la luz tropical y la calidez boricua 
                  crean momentos inolvidables frente al mar Caribe.
                </p>
                <div class="social-links">
                  <a href="#" class="social-link" aria-label="Facebook">
                    <i class="bi bi-facebook"></i>
                  </a>
                  <a href="#" class="social-link" aria-label="Instagram">
                    <i class="bi bi-instagram"></i>
                  </a>
                  <a href="#" class="social-link" aria-label="Twitter">
                    <i class="bi bi-twitter-x"></i>
                  </a>
                  <a href="#" class="social-link" aria-label="TripAdvisor">
                    <i class="bi bi-airplane"></i>
                  </a>
                </div>
              </div>
            </div>
            
            <!-- Quick Links -->
            <div class="col-lg-2 col-md-3 col-6">
              <h5 class="footer-title">Explora</h5>
              <ul class="footer-links">
                <li><a routerLink="/">Inicio</a></li>
                <li><a routerLink="/habitaciones">Habitaciones</a></li>
                <li><a routerLink="/login">Reservar</a></li>
              </ul>
            </div>
            
            <!-- Services -->
            <div class="col-lg-2 col-md-3 col-6">
              <h5 class="footer-title">Servicios</h5>
              <ul class="footer-links">
                <li><a href="#">WiFi Premium</a></li>
                <li><a href="#">Desayuno Caribeño</a></li>
                <li><a href="#">Tours Exclusivos</a></li>
                <li><a href="#">Concierge 24/7</a></li>
              </ul>
            </div>
            
            <!-- Contact -->
            <div class="col-lg-4 col-md-6">
              <h5 class="footer-title">Contáctanos</h5>
              <ul class="footer-contact">
                <li>
                  <i class="bi bi-geo-alt-fill"></i>
                  <span>Calle Fortaleza 123, Viejo San Juan, PR 00901</span>
                </li>
                <li>
                  <i class="bi bi-telephone-fill"></i>
                  <a href="tel:+17875551234">+1 (787) 555-1234</a>
                </li>
                <li>
                  <i class="bi bi-envelope-fill"></i>
                  <a href="mailto:reservas@brisamar.com">reservas&#64;brisamar.com</a>
                </li>
                <li>
                  <i class="bi bi-pin-map-fill"></i>
                  <a href="https://maps.google.com" target="_blank" rel="noopener">Ver en Google Maps</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <div class="container">
          <div class="row align-items-center">
            <div class="col-md-6">
              <p class="copyright">© 2026 Brisamar. Todos los derechos reservados.</p>
            </div>
            <div class="col-md-6 text-md-end">
              <p class="made-with">
                <span class="palm-icon">🌴</span>
                Hecho con hospitalidad caribeña en San Juan, Puerto Rico
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    main {
      flex: 1;
    }

    /* ==================== FOOTER BRISAMAR - CARIBBEAN PREMIUM ==================== */
    .footer-brisamar {
      background: linear-gradient(175deg, #0A3545 0%, #0E4D64 50%, #0A3545 100%);
      color: #ffffff;
      font-size: 0.9rem;
      position: relative;
      overflow: hidden;
    }

    /* Decorative pattern overlay */
    .footer-brisamar::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: 
        radial-gradient(circle at 20% 80%, rgba(79, 189, 186, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(224, 122, 95, 0.06) 0%, transparent 50%);
      pointer-events: none;
    }

    /* Wave decoration at top */
    .footer-wave {
      color: var(--bg-primary, #FAFAF8);
      line-height: 0;
      margin-bottom: -1px;
    }

    .footer-wave svg {
      width: 100%;
      height: 60px;
    }

    .footer-top {
      padding: 60px 0 40px;
      position: relative;
      z-index: 1;
    }

    /* ==================== BRAND SECTION ==================== */
    .footer-brand {
      max-width: 320px;
    }

    .footer-logo {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.75rem;
      font-weight: 700;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .brand-icon {
      font-size: 1.5rem;
    }

    .footer-tagline {
      color: #4FBDBA;
      font-weight: 600;
      font-size: 0.95rem;
      margin-bottom: 1rem;
      letter-spacing: 0.5px;
    }

    .footer-description {
      color: rgba(255, 255, 255, 0.75);
      line-height: 1.7;
      margin-bottom: 1.5rem;
    }

    /* ==================== SOCIAL LINKS ==================== */
    .social-links {
      display: flex;
      gap: 0.75rem;
    }

    .social-link {
      width: 42px;
      height: 42px;
      background: rgba(79, 189, 186, 0.15);
      border: 1px solid rgba(79, 189, 186, 0.25);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #4FBDBA;
      font-size: 1.1rem;
      transition: all 0.3s ease;
      text-decoration: none;
    }

    .social-link:hover {
      background: #4FBDBA;
      color: #0A3545;
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(79, 189, 186, 0.35);
    }

    /* ==================== FOOTER TITLES ==================== */
    .footer-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.1rem;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 1.25rem;
      position: relative;
      padding-bottom: 0.75rem;
    }

    .footer-title::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 35px;
      height: 2px;
      background: linear-gradient(90deg, #4FBDBA, #E07A5F);
      border-radius: 2px;
    }

    /* ==================== FOOTER LINKS ==================== */
    .footer-links {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .footer-links li {
      margin-bottom: 0.75rem;
    }

    .footer-links a {
      color: rgba(255, 255, 255, 0.75);
      text-decoration: none;
      transition: all 0.3s ease;
      display: inline-block;
      position: relative;
    }

    .footer-links a::before {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 0;
      height: 1px;
      background: #4FBDBA;
      transition: width 0.3s ease;
    }

    .footer-links a:hover {
      color: #4FBDBA;
      transform: translateX(5px);
    }

    .footer-links a:hover::before {
      width: 100%;
    }

    /* ==================== CONTACT LIST ==================== */
    .footer-contact {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .footer-contact li {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      margin-bottom: 1rem;
      color: rgba(255, 255, 255, 0.8);
    }

    .footer-contact li i {
      color: #4FBDBA;
      font-size: 1rem;
      margin-top: 0.15rem;
      flex-shrink: 0;
    }

    .footer-contact a {
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      transition: color 0.3s ease;
    }

    .footer-contact a:hover {
      color: #4FBDBA;
    }

    /* ==================== FOOTER BOTTOM ==================== */
    .footer-bottom {
      background: rgba(0, 0, 0, 0.25);
      padding: 1.25rem 0;
      border-top: 1px solid rgba(79, 189, 186, 0.15);
      position: relative;
      z-index: 1;
    }

    .copyright {
      margin: 0;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.85rem;
    }

    .made-with {
      margin: 0;
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.5rem;
    }

    .palm-icon {
      font-size: 1.1rem;
    }

    /* ==================== RESPONSIVE ==================== */
    @media (max-width: 991px) {
      .footer-top {
        padding: 50px 0 30px;
      }

      .footer-brand {
        margin-bottom: 1rem;
      }
    }

    @media (max-width: 767px) {
      .footer-wave svg {
        height: 40px;
      }

      .footer-logo {
        font-size: 1.5rem;
      }

      .made-with {
        justify-content: flex-start;
        margin-top: 0.5rem;
      }

      .footer-title::after {
        width: 25px;
      }
    }

    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      .social-link:hover {
        transform: none;
      }
      
      .footer-links a:hover {
        transform: none;
      }
    }
  `]
})
export class AppComponent {
  title = 'Brisamar';
}
