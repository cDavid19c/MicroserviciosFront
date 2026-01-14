import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, Subscription } from 'rxjs';

interface Breadcrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    @if (breadcrumbs.length > 0) {
      <nav aria-label="breadcrumb" class="breadcrumb-container">
        <div class="container">
          <ol class="breadcrumb mb-0 py-2">
            <li class="breadcrumb-item">
              <a routerLink="/">
                <i class="bi bi-house-door"></i>
              </a>
            </li>
            @for (breadcrumb of breadcrumbs; track breadcrumb.url; let isLast = $last) {
              <li class="breadcrumb-item" [class.active]="isLast">
                @if (isLast) {
                  {{ breadcrumb.label }}
                } @else {
                  <a [routerLink]="breadcrumb.url">{{ breadcrumb.label }}</a>
                }
              </li>
            }
          </ol>
        </div>
      </nav>
    }
  `,
  styles: [`
    .breadcrumb-container {
      background-color: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
    }

    .breadcrumb {
      font-size: 0.875rem;
    }

    .breadcrumb-item a {
      color: #6B5842;
      text-decoration: none;
    }

    .breadcrumb-item a:hover {
      text-decoration: underline;
    }

    .breadcrumb-item.active {
      color: #6c757d;
    }
  `]
})
export class BreadcrumbsComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private subscription?: Subscription;

  breadcrumbs: Breadcrumb[] = [];

  ngOnInit(): void {
    this.breadcrumbs = this.buildBreadcrumbs(this.activatedRoute.root);

    this.subscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.breadcrumbs = this.buildBreadcrumbs(this.activatedRoute.root);
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private buildBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: Breadcrumb[] = []): Breadcrumb[] {
    const children = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL = child.snapshot.url.map(segment => segment.path).join('/');

      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      const label = child.snapshot.data['breadcrumb'];
      if (label) {
        breadcrumbs.push({ label, url });
      }

      return this.buildBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }
}

