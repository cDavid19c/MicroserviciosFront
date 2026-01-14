import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- ========================= -->
    <!-- HERO SECTION - ASYMMETRIC LAYOUT -->
    <!-- ========================= -->
    <section class="hero-brisamar">
      <div class="hero-background"></div>
      <div class="container">
        <div class="hero-grid">
          <!-- Left: Image Stack -->
          <div class="hero-images">
            <div class="image-stack">
              <div class="stack-item stack-main">
                <img src="https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&q=80" alt="Suite Brisamar">
              </div>
              <div class="stack-item stack-overlay">
                <img src="https://images.unsplash.com/photo-1540541338287-41700207dee6?w=400&q=80" alt="Playa Caribe">
              </div>
              <div class="stack-item stack-badge">
                <span class="badge-number">15+</span>
                <span class="badge-text">Años de Excelencia</span>
              </div>
            </div>
          </div>
          
          <!-- Right: Content -->
          <div class="hero-content">
            <div class="content-inner">
              <div class="hero-overline">
                <span class="overline-icon">🌊</span>
                <span class="overline-text">Hotel Boutique Caribeño</span>
              </div>
              
              <h1 class="hero-title">
                <span class="title-small">Bienvenido a</span>
                <span class="title-large">Brisamar</span>
              </h1>
              
              <div class="hero-tagline">
                <div class="tagline-line"></div>
                <p>Donde el Caribe Abraza la Elegancia</p>
              </div>
              
              <p class="hero-description">
                Descubre la magia del Caribe desde nuestro refugio frente al mar. 
                La brisa marina, la luz tropical y la hospitalidad boricua 
                crean momentos inolvidables en San Juan, Puerto Rico.
              </p>

              <!-- Stats Row -->
              <div class="hero-stats-row">
                <div class="stat-block">
                  <i class="bi bi-star-fill"></i>
                  <div class="stat-info">
                    <span class="stat-value">4.9</span>
                    <span class="stat-label">Rating</span>
                  </div>
                </div>
                <div class="stat-block">
                  <i class="bi bi-people-fill"></i>
                  <div class="stat-info">
                    <span class="stat-value">500+</span>
                    <span class="stat-label">Huéspedes</span>
                  </div>
                </div>
                <div class="stat-block">
                  <i class="bi bi-clock-fill"></i>
                  <div class="stat-info">
                    <span class="stat-value">24/7</span>
                    <span class="stat-label">Servicio</span>
                  </div>
                </div>
              </div>

              <div class="hero-actions">
                <a routerLink="/habitaciones" class="btn-primary-hero">
                  Reservar Ahora
                  <i class="bi bi-arrow-right ms-2"></i>
                </a>
                @if (!isLoggedIn) {
                  <a routerLink="/register" class="btn-secondary-hero">
                    <i class="bi bi-person-plus me-2"></i>
                    Registrarse
                  </a>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Scroll Indicator -->
      <div class="scroll-indicator">
        <span>Explorar</span>
        <i class="bi bi-chevron-down"></i>
      </div>
    </section>

    <!-- ========================= -->
    <!-- GUARANTEES - FLOATING PILLS -->
    <!-- ========================= -->
    <section class="guarantees-section">
      <div class="container">
        <div class="guarantees-wrapper">
          <div class="guarantee-pill">
            <div class="pill-icon"><i class="bi bi-shield-check"></i></div>
            <span>Reserva 100% Segura</span>
          </div>
          <div class="guarantee-pill">
            <div class="pill-icon"><i class="bi bi-tag"></i></div>
            <span>Mejor Precio Garantizado</span>
          </div>
          <div class="guarantee-pill">
            <div class="pill-icon"><i class="bi bi-headset"></i></div>
            <span>Soporte 24/7</span>
          </div>
          <div class="guarantee-pill">
            <div class="pill-icon"><i class="bi bi-x-circle"></i></div>
            <span>Cancelación Flexible</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ========================= -->
    <!-- ABOUT - MOSAIC LAYOUT -->
    <!-- ========================= -->
    <section class="about-section">
      <div class="container">
        <div class="about-mosaic">
          <!-- Text Column -->
          <div class="mosaic-content">
            <div class="section-header-left">
              <span class="section-label">Nuestra Historia</span>
              <h2 class="section-heading">
                La Experiencia
                <span class="heading-accent">Brisamar</span>
              </h2>
            </div>
            
            <div class="content-block">
              <p class="lead-text">
                En el corazón de <strong>San Juan, Puerto Rico</strong>, 
                Brisamar combina la elegancia colonial del Viejo San Juan con 
                la calidez de la hospitalidad caribeña auténtica.
              </p>
              <p>
                A pasos del océano Atlántico y las mejores atracciones de la isla, 
                vive una experiencia única donde la tradición boricua se encuentra 
                con el lujo contemporáneo.
              </p>
            </div>

            <div class="features-list">
              <div class="feature-row">
                <div class="feature-icon-box">
                  <i class="bi bi-geo-alt-fill"></i>
                </div>
                <div class="feature-content">
                  <h5>Ubicación Privilegiada</h5>
                  <p>Frente al mar Caribe en el Viejo San Juan</p>
                </div>
              </div>
              <div class="feature-row">
                <div class="feature-icon-box">
                  <i class="bi bi-building"></i>
                </div>
                <div class="feature-content">
                  <h5>Arquitectura Colonial</h5>
                  <p>Histórico edificio español restaurado</p>
                </div>
              </div>
              <div class="feature-row">
                <div class="feature-icon-box">
                  <i class="bi bi-heart-fill"></i>
                </div>
                <div class="feature-content">
                  <h5>Hospitalidad Boricua</h5>
                  <p>Servicio cálido y personalizado</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Image Mosaic -->
          <div class="mosaic-images">
            <div class="mosaic-grid">
              <div class="mosaic-item mosaic-tall">
                <img src="https://images.unsplash.com/photo-1579687196544-08ae57ab5c53?w=500&q=80" alt="Viejo San Juan">
              </div>
              <div class="mosaic-item mosaic-square">
                <img src="https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400&q=80" alt="Interior Hotel">
              </div>
              <div class="mosaic-item mosaic-wide">
                <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80" alt="Terraza">
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ========================= -->
    <!-- SERVICES - HORIZONTAL ALTERNATING -->
    <!-- ========================= -->
    <section class="services-section">
      <div class="container">
        <div class="section-header-center">
          <span class="section-label">Comodidades</span>
          <h2 class="section-heading">Servicios <span class="heading-accent">Premium</span></h2>
          <p class="section-desc">Todo para una estadía inolvidable</p>
        </div>

        <div class="services-grid">
          <div class="service-card-horizontal">
            <div class="service-icon-large">
              <i class="bi bi-wifi"></i>
            </div>
            <div class="service-body">
              <h4>WiFi Premium</h4>
              <p>Conexión de fibra óptica en todas las áreas del hotel y terrazas</p>
            </div>
            <div class="service-number">01</div>
          </div>

          <div class="service-card-horizontal reverse">
            <div class="service-icon-large">
              <i class="bi bi-cup-hot-fill"></i>
            </div>
            <div class="service-body">
              <h4>Desayuno Caribeño</h4>
              <p>Sabores tropicales con café de Puerto Rico y frutas frescas locales</p>
            </div>
            <div class="service-number">02</div>
          </div>

          <div class="service-card-horizontal">
            <div class="service-icon-large">
              <i class="bi bi-water"></i>
            </div>
            <div class="service-body">
              <h4>Tours Exclusivos</h4>
              <p>El Yunque, Bahía Bioluminiscente y las mejores playas paradisíacas</p>
            </div>
            <div class="service-number">03</div>
          </div>

          <div class="service-card-horizontal reverse">
            <div class="service-icon-large">
              <i class="bi bi-shield-check"></i>
            </div>
            <div class="service-body">
              <h4>Concierge 24/7</h4>
              <p>Atención personalizada para hacer cada momento de tu estadía perfecto</p>
            </div>
            <div class="service-number">04</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ========================= -->
    <!-- EXPLORE - MASONRY GRID -->
    <!-- ========================= -->
    <section class="explore-section">
      <div class="container">
        <div class="explore-header">
          <div class="header-left">
            <span class="section-label">Descubre</span>
            <h2 class="section-heading">Explora <span class="heading-accent">San Juan</span></h2>
          </div>
          <p class="header-desc">La Isla del Encanto te espera con infinitas maravillas</p>
        </div>

        <div class="explore-masonry">
          <div class="explore-item explore-large">
            <div class="explore-card-new">
              <img src="https://images.unsplash.com/photo-1579687196544-08ae57ab5c53?w=600&q=80" alt="Viejo San Juan">
              <div class="explore-overlay-new">
                <div class="explore-icon-badge">
                  <i class="bi bi-building"></i>
                </div>
                <h4>Viejo San Juan</h4>
                <p>Calles adoquinadas y arquitectura colonial española del siglo XVI</p>
              </div>
            </div>
          </div>

          <div class="explore-item explore-small">
            <div class="explore-card-new">
              <img src="https://images.unsplash.com/photo-1548786811-dd6e453ccca7?w=500&q=80" alt="El Morro">
              <div class="explore-overlay-new">
                <div class="explore-icon-badge">
                  <i class="bi bi-flag-fill"></i>
                </div>
                <h4>El Morro</h4>
                <p>Fortaleza histórica con vistas al océano</p>
              </div>
            </div>
          </div>

          <div class="explore-item explore-small">
            <div class="explore-card-new">
              <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&q=80" alt="Playa Condado">
              <div class="explore-overlay-new">
                <div class="explore-icon-badge">
                  <i class="bi bi-umbrella-fill"></i>
                </div>
                <h4>Playa Condado</h4>
                <p>Arena dorada y aguas turquesas</p>
              </div>
            </div>
          </div>

          <div class="explore-item explore-medium">
            <div class="explore-card-new">
              <img src="https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=600&q=80" alt="Bahía Bioluminiscente">
              <div class="explore-overlay-new">
                <div class="explore-icon-badge">
                  <i class="bi bi-stars"></i>
                </div>
                <h4>Bahía Bioluminiscente</h4>
                <p>Maravilla natural con aguas que brillan de noche</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ========================= -->
    <!-- TESTIMONIALS - FEATURED CENTER -->
    <!-- ========================= -->
    <section class="testimonials-section">
      <div class="container">
        <div class="testimonials-layout">
          <!-- Left Column -->
          <div class="testimonial-side">
            <div class="testimonial-card-compact">
              <div class="stars-row">
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
              </div>
              <p>"Una experiencia mágica. El encanto caribeño único que buscábamos."</p>
              <div class="author-compact">
                <div class="author-avatar-sm">CR</div>
                <div>
                  <strong>Carmen Rivera</strong>
                  <span>Miami, FL</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Center - Featured -->
          <div class="testimonial-center">
            <div class="section-header-center light">
              <span class="section-label">Testimonios</span>
              <h2 class="section-heading text-white">Lo Que Dicen <span class="heading-accent-light">Nuestros Huéspedes</span></h2>
            </div>
            
            <div class="testimonial-card-featured">
              <div class="quote-icon">
                <i class="bi bi-quote"></i>
              </div>
              <p class="quote-text">
                "Ubicación perfecta para explorar el Viejo San Juan. 
                El personal fue increíblemente amable y nos organizó 
                el tour a El Yunque. Una experiencia que volveremos a repetir."
              </p>
              <div class="author-featured">
                <div class="author-avatar-lg">JM</div>
                <div class="author-details">
                  <strong>José Martínez</strong>
                  <span>Nueva York, NY</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="testimonial-side">
            <div class="testimonial-card-compact">
              <div class="stars-row">
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
              </div>
              <p>"Las vistas al mar son impresionantes. El mejor hotel boutique de San Juan."</p>
              <div class="author-compact">
                <div class="author-avatar-sm">AG</div>
                <div>
                  <strong>Ana García</strong>
                  <span>Santo Domingo, RD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ========================= -->
    <!-- CTA - DIAGONAL SPLIT -->
    <!-- ========================= -->
    <section class="cta-section">
      <div class="cta-background">
        <div class="cta-image-side">
          <img src="https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80" alt="Caribbean Beach">
        </div>
        <div class="cta-content-side">
          <div class="cta-inner">
            <span class="cta-label">¿Listo para la aventura?</span>
            <h2 class="cta-title">Descubre el<br><span>Caribe</span></h2>
            <p class="cta-text">Reserva ahora y vive la experiencia Brisamar en San Juan, Puerto Rico</p>
            <a routerLink="/habitaciones" class="btn-cta-new">
              <span>Hacer Reservación</span>
              <i class="bi bi-arrow-right"></i>
            </a>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    /* ==================== VARIABLES ==================== */
    :host {
      --ocean-deep: #0E4D64;
      --ocean-dark: #0A3545;
      --turquoise: #4FBDBA;
      --turquoise-light: #7DD3D1;
      --coral-soft: #E07A5F;
      --sand-light: #F3ECDC;
      --gold-caribbean: #D4A853;
      --white-warm: #FAFAF8;
    }

    /* ==================== HERO - GRID LAYOUT ==================== */
    .hero-brisamar {
      min-height: 100vh;
      position: relative;
      display: flex;
      align-items: center;
      overflow: hidden;
    }

    .hero-background {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, var(--ocean-dark) 0%, var(--ocean-deep) 60%, var(--turquoise) 100%);
      
      &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80') center/cover;
        opacity: 0.12;
      }
    }

    .hero-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
      position: relative;
      z-index: 1;
      padding: 4rem 0;
    }

    /* Hero Images Stack */
    .hero-images {
      position: relative;
    }

    .image-stack {
      position: relative;
      height: 550px;
    }

    .stack-item {
      position: absolute;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 25px 60px rgba(0,0,0,0.3);
    }

    .stack-main {
      top: 0;
      left: 0;
      width: 85%;
      height: 400px;
      z-index: 1;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .stack-overlay {
      bottom: 0;
      right: 0;
      width: 60%;
      height: 250px;
      z-index: 2;
      border: 4px solid white;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .stack-badge {
      top: 50%;
      right: -20px;
      transform: translateY(-50%);
      z-index: 3;
      background: linear-gradient(135deg, var(--coral-soft) 0%, var(--gold-caribbean) 100%);
      padding: 1.5rem;
      text-align: center;
      box-shadow: 0 15px 40px rgba(224, 122, 95, 0.4);
    }

    .badge-number {
      display: block;
      font-size: 2.5rem;
      font-weight: 700;
      color: white;
      font-family: 'Playfair Display', serif;
      line-height: 1;
    }

    .badge-text {
      font-size: 0.75rem;
      color: rgba(255,255,255,0.9);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    /* Hero Content */
    .hero-content {
      padding-left: 2rem;
    }

    .content-inner {
      max-width: 520px;
    }

    .hero-overline {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      background: rgba(79, 189, 186, 0.2);
      padding: 0.5rem 1.25rem;
      border-radius: 50px;
      margin-bottom: 1.5rem;
      border: 1px solid rgba(79, 189, 186, 0.3);
    }

    .overline-icon {
      font-size: 1.25rem;
    }

    .overline-text {
      color: var(--turquoise-light);
      font-size: 0.85rem;
      font-weight: 500;
      letter-spacing: 1px;
    }

    .hero-title {
      margin-bottom: 1.5rem;
    }

    .title-small {
      display: block;
      font-size: 1.5rem;
      color: rgba(255,255,255,0.8);
      font-weight: 400;
      margin-bottom: 0.25rem;
    }

    .title-large {
      display: block;
      font-size: 5rem;
      font-family: 'Playfair Display', serif;
      font-weight: 700;
      background: linear-gradient(135deg, #fff 0%, var(--turquoise-light) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1;
    }

    .hero-tagline {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .tagline-line {
      width: 60px;
      height: 3px;
      background: linear-gradient(90deg, var(--coral-soft), var(--gold-caribbean));
      border-radius: 2px;
    }

    .hero-tagline p {
      color: var(--turquoise);
      font-size: 1.25rem;
      font-weight: 500;
      margin: 0;
    }

    .hero-description {
      color: rgba(255,255,255,0.75);
      font-size: 1.05rem;
      line-height: 1.7;
      margin-bottom: 2rem;
    }

    /* Stats Row */
    .hero-stats-row {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 2.5rem;
    }

    .stat-block {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: rgba(255,255,255,0.08);
      padding: 0.75rem 1.25rem;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.1);
    }

    .stat-block i {
      font-size: 1.5rem;
      color: var(--turquoise);
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 1.25rem;
      font-weight: 700;
      color: white;
    }

    .stat-label {
      font-size: 0.75rem;
      color: rgba(255,255,255,0.6);
    }

    /* Hero Actions */
    .hero-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .btn-primary-hero {
      display: inline-flex;
      align-items: center;
      padding: 1rem 2rem;
      background: linear-gradient(135deg, var(--coral-soft) 0%, var(--gold-caribbean) 100%);
      color: white;
      font-weight: 600;
      font-size: 1rem;
      border-radius: 12px;
      text-decoration: none;
      transition: all 0.3s ease;
      box-shadow: 0 8px 25px rgba(224, 122, 95, 0.4);
    }

    .btn-primary-hero:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 35px rgba(224, 122, 95, 0.5);
      color: white;
    }

    .btn-secondary-hero {
      display: inline-flex;
      align-items: center;
      padding: 1rem 2rem;
      background: transparent;
      color: white;
      font-weight: 600;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 12px;
      text-decoration: none;
      transition: all 0.3s ease;
    }

    .btn-secondary-hero:hover {
      background: rgba(255,255,255,0.1);
      border-color: rgba(255,255,255,0.5);
      color: white;
    }

    /* Scroll Indicator */
    .scroll-indicator {
      position: absolute;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      color: rgba(255,255,255,0.6);
      font-size: 0.8rem;
      animation: bounce 2s infinite;
    }

    @keyframes bounce {
      0%, 100% { transform: translateX(-50%) translateY(0); }
      50% { transform: translateX(-50%) translateY(10px); }
    }

    /* ==================== GUARANTEES - PILLS ==================== */
    .guarantees-section {
      padding: 1.5rem 0;
      background: var(--white-warm);
      position: relative;
      margin-top: -2rem;
      z-index: 10;
    }

    .guarantees-wrapper {
      display: flex;
      justify-content: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .guarantee-pill {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: white;
      padding: 0.75rem 1.5rem;
      border-radius: 50px;
      box-shadow: 0 4px 20px rgba(14, 77, 100, 0.1);
      transition: all 0.3s ease;
    }

    .guarantee-pill:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 30px rgba(14, 77, 100, 0.15);
    }

    .pill-icon {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, var(--ocean-deep) 0%, var(--turquoise) 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1rem;
    }

    .guarantee-pill span {
      color: var(--ocean-dark);
      font-weight: 500;
      font-size: 0.9rem;
    }

    /* ==================== SECTION HEADERS ==================== */
    .section-label {
      display: inline-block;
      color: var(--turquoise);
      font-size: 0.85rem;
      font-weight: 600;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-bottom: 0.5rem;
    }

    .section-heading {
      font-family: 'Playfair Display', serif;
      font-size: 2.75rem;
      font-weight: 700;
      color: var(--ocean-dark);
      margin-bottom: 1rem;
    }

    .heading-accent {
      color: var(--turquoise);
    }

    .heading-accent-light {
      color: var(--turquoise-light);
    }

    .section-desc {
      color: #6b7c79;
      font-size: 1.1rem;
    }

    .section-header-center {
      text-align: center;
      margin-bottom: 3rem;
    }

    .section-header-center.light .section-label {
      color: var(--turquoise-light);
    }

    .section-header-left {
      margin-bottom: 1.5rem;
    }

    /* ==================== ABOUT - MOSAIC ==================== */
    .about-section {
      padding: 100px 0;
      background: var(--sand-light);
    }

    .about-mosaic {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
    }

    .content-block {
      margin-bottom: 2rem;
    }

    .lead-text {
      font-size: 1.15rem;
      color: var(--ocean-dark);
      margin-bottom: 1rem;
    }

    .features-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .feature-row {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
      padding: 1rem;
      background: white;
      border-radius: 12px;
      transition: all 0.3s ease;
      border: 1px solid rgba(14, 77, 100, 0.08);
    }

    .feature-row:hover {
      transform: translateX(8px);
      box-shadow: 0 8px 25px rgba(14, 77, 100, 0.1);
    }

    .feature-icon-box {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, var(--ocean-deep) 0%, var(--turquoise) 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .feature-icon-box i {
      color: white;
      font-size: 1.25rem;
    }

    .feature-content h5 {
      font-size: 1rem;
      font-weight: 600;
      color: var(--ocean-dark);
      margin-bottom: 0.25rem;
    }

    .feature-content p {
      font-size: 0.85rem;
      color: #6b7c79;
      margin: 0;
    }

    /* Mosaic Images */
    .mosaic-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
      gap: 1rem;
      height: 500px;
    }

    .mosaic-item {
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(14, 77, 100, 0.15);
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s ease;
      }

      &:hover img {
        transform: scale(1.08);
      }
    }

    .mosaic-tall {
      grid-row: span 2;
    }

    .mosaic-square {
      grid-column: 2;
      grid-row: 1;
    }

    .mosaic-wide {
      grid-column: 2;
      grid-row: 2;
    }

    /* ==================== SERVICES - HORIZONTAL ==================== */
    .services-section {
      padding: 100px 0;
      background: white;
    }

    .services-grid {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      max-width: 900px;
      margin: 0 auto;
    }

    .service-card-horizontal {
      display: flex;
      align-items: center;
      gap: 2rem;
      padding: 2rem;
      background: var(--sand-light);
      border-radius: 20px;
      transition: all 0.4s ease;
      position: relative;
      overflow: hidden;
    }

    .service-card-horizontal:hover {
      transform: translateX(10px);
      box-shadow: 0 15px 40px rgba(14, 77, 100, 0.12);
    }

    .service-card-horizontal.reverse {
      flex-direction: row-reverse;
    }

    .service-card-horizontal.reverse:hover {
      transform: translateX(-10px);
    }

    .service-icon-large {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, var(--ocean-deep) 0%, var(--turquoise) 100%);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.3s ease;
    }

    .service-icon-large i {
      font-size: 2rem;
      color: white;
    }

    .service-card-horizontal:hover .service-icon-large {
      background: linear-gradient(135deg, var(--coral-soft) 0%, var(--gold-caribbean) 100%);
      transform: rotate(10deg) scale(1.05);
    }

    .service-body {
      flex: 1;
    }

    .service-body h4 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--ocean-dark);
      margin-bottom: 0.5rem;
    }

    .service-body p {
      color: #6b7c79;
      margin: 0;
      font-size: 0.95rem;
    }

    .service-number {
      position: absolute;
      right: 2rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 4rem;
      font-weight: 700;
      font-family: 'Playfair Display', serif;
      color: rgba(14, 77, 100, 0.06);
    }

    .service-card-horizontal.reverse .service-number {
      right: auto;
      left: 2rem;
    }

    /* ==================== EXPLORE - MASONRY ==================== */
    .explore-section {
      padding: 100px 0;
      background: var(--white-warm);
    }

    .explore-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 3rem;
    }

    .header-desc {
      color: #6b7c79;
      max-width: 300px;
      text-align: right;
    }

    .explore-masonry {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: 250px 250px;
      gap: 1.5rem;
    }

    .explore-item {
      border-radius: 20px;
      overflow: hidden;
    }

    .explore-large {
      grid-row: span 2;
    }

    .explore-medium {
      grid-column: span 2;
    }

    .explore-card-new {
      position: relative;
      height: 100%;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.6s ease;
      }
    }

    .explore-card-new:hover img {
      transform: scale(1.1);
    }

    .explore-overlay-new {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(10, 53, 69, 0.9) 0%, transparent 60%);
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 1.5rem;
      color: white;
    }

    .explore-icon-badge {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, var(--turquoise) 0%, var(--turquoise-light) 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
      font-size: 1.25rem;
    }

    .explore-overlay-new h4 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .explore-overlay-new p {
      font-size: 0.85rem;
      opacity: 0.85;
      margin: 0;
    }

    /* ==================== TESTIMONIALS - CENTER FEATURED ==================== */
    .testimonials-section {
      padding: 100px 0;
      background: linear-gradient(135deg, var(--ocean-dark) 0%, var(--ocean-deep) 100%);
    }

    .testimonials-layout {
      display: grid;
      grid-template-columns: 1fr 2fr 1fr;
      gap: 2rem;
      align-items: center;
    }

    .testimonial-side {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .testimonial-card-compact {
      background: rgba(255,255,255,0.08);
      backdrop-filter: blur(10px);
      padding: 1.5rem;
      border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.1);
    }

    .stars-row {
      display: flex;
      gap: 0.25rem;
      margin-bottom: 1rem;
      
      i {
        color: var(--gold-caribbean);
        font-size: 0.85rem;
      }
    }

    .testimonial-card-compact p {
      color: rgba(255,255,255,0.85);
      font-size: 0.9rem;
      font-style: italic;
      margin-bottom: 1rem;
      line-height: 1.6;
    }

    .author-compact {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .author-avatar-sm {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, var(--turquoise) 0%, var(--turquoise-light) 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--ocean-dark);
      font-weight: 600;
      font-size: 0.8rem;
    }

    .author-compact strong {
      display: block;
      color: white;
      font-size: 0.85rem;
    }

    .author-compact span {
      color: rgba(255,255,255,0.6);
      font-size: 0.75rem;
    }

    /* Featured Card */
    .testimonial-center {
      text-align: center;
    }

    .testimonial-card-featured {
      background: white;
      padding: 2.5rem;
      border-radius: 24px;
      margin-top: 2rem;
      box-shadow: 0 25px 60px rgba(0,0,0,0.2);
    }

    .quote-icon {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, var(--coral-soft) 0%, var(--gold-caribbean) 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      
      i {
        font-size: 1.75rem;
        color: white;
      }
    }

    .quote-text {
      font-size: 1.15rem;
      color: var(--ocean-dark);
      line-height: 1.8;
      font-style: italic;
      margin-bottom: 1.5rem;
    }

    .author-featured {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
    }

    .author-avatar-lg {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, var(--ocean-deep) 0%, var(--turquoise) 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 1.1rem;
    }

    .author-details strong {
      display: block;
      color: var(--ocean-dark);
      font-size: 1rem;
    }

    .author-details span {
      color: #6b7c79;
      font-size: 0.85rem;
    }

    /* ==================== CTA - DIAGONAL ==================== */
    .cta-section {
      position: relative;
      overflow: hidden;
    }

    .cta-background {
      display: grid;
      grid-template-columns: 1fr 1fr;
      min-height: 400px;
    }

    .cta-image-side {
      position: relative;
      overflow: hidden;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      &::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(90deg, transparent 0%, var(--sand-light) 100%);
      }
    }

    .cta-content-side {
      background: var(--sand-light);
      display: flex;
      align-items: center;
      padding: 3rem;
    }

    .cta-inner {
      max-width: 450px;
    }

    .cta-label {
      display: inline-block;
      color: var(--coral-soft);
      font-size: 0.9rem;
      font-weight: 600;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 0.75rem;
    }

    .cta-title {
      font-family: 'Playfair Display', serif;
      font-size: 3rem;
      font-weight: 700;
      color: var(--ocean-dark);
      line-height: 1.1;
      margin-bottom: 1rem;
      
      span {
        color: var(--turquoise);
      }
    }

    .cta-text {
      color: #6b7c79;
      font-size: 1.05rem;
      margin-bottom: 2rem;
    }

    .btn-cta-new {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1.25rem 2rem;
      background: linear-gradient(135deg, var(--ocean-deep) 0%, var(--turquoise) 100%);
      color: white;
      font-weight: 600;
      font-size: 1rem;
      border-radius: 12px;
      text-decoration: none;
      transition: all 0.3s ease;
      box-shadow: 0 8px 25px rgba(14, 77, 100, 0.35);
    }

    .btn-cta-new:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 35px rgba(14, 77, 100, 0.45);
      color: white;
    }

    /* ==================== RESPONSIVE ==================== */
    @media (max-width: 1200px) {
      .hero-grid {
        gap: 2rem;
      }
      
      .title-large {
        font-size: 4rem;
      }

      .testimonials-layout {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .testimonial-side {
        flex-direction: row;
        justify-content: center;
      }
    }

    @media (max-width: 991px) {
      .hero-grid {
        grid-template-columns: 1fr;
        text-align: center;
      }

      .hero-images {
        order: 2;
        display: none;
      }

      .hero-content {
        padding: 0;
      }

      .content-inner {
        max-width: 100%;
      }

      .hero-overline, .hero-actions {
        justify-content: center;
      }

      .hero-stats-row {
        justify-content: center;
      }

      .about-mosaic {
        grid-template-columns: 1fr;
      }

      .mosaic-images {
        order: -1;
      }

      .mosaic-grid {
        height: 400px;
      }

      .explore-masonry {
        grid-template-columns: 1fr 1fr;
        grid-template-rows: auto;
      }

      .explore-large {
        grid-column: span 2;
        grid-row: span 1;
        height: 300px;
      }

      .explore-medium {
        grid-column: span 2;
        height: 250px;
      }

      .explore-small {
        height: 200px;
      }

      .cta-background {
        grid-template-columns: 1fr;
      }

      .cta-image-side {
        height: 200px;
        
        &::after {
          background: linear-gradient(180deg, transparent 0%, var(--sand-light) 100%);
        }
      }

      .cta-content-side {
        text-align: center;
        justify-content: center;
      }

      .service-card-horizontal,
      .service-card-horizontal.reverse {
        flex-direction: column;
        text-align: center;
      }

      .service-number {
        display: none;
      }
    }

    @media (max-width: 767px) {
      .title-large {
        font-size: 3rem;
      }

      .section-heading {
        font-size: 2rem;
      }

      .hero-stats-row {
        flex-wrap: wrap;
      }

      .stat-block {
        flex: 1;
        min-width: 100px;
      }

      .guarantees-wrapper {
        flex-direction: column;
        align-items: center;
      }

      .explore-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .header-desc {
        text-align: left;
      }

      .explore-masonry {
        grid-template-columns: 1fr;
      }

      .explore-large, .explore-medium, .explore-small {
        grid-column: span 1;
        height: 250px;
      }

      .testimonial-side {
        flex-direction: column;
      }

      .cta-title {
        font-size: 2.25rem;
      }
    }

    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      .scroll-indicator,
      .stack-overlay,
      .btn-primary-hero:hover,
      .btn-cta-new:hover,
      .feature-row:hover,
      .service-card-horizontal:hover,
      .guarantee-pill:hover {
        animation: none;
        transform: none;
      }
    }
  `]
})
export class HomeComponent {
  private authService = inject(AuthService);

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}
