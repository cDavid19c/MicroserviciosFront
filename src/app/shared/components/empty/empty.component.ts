import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-container text-center py-5">
      <i [class]="'bi ' + icon + ' fs-1 text-muted'"></i>
      <h5 class="mt-3 text-muted">{{ title }}</h5>
      <p class="text-muted small">{{ message }}</p>
    </div>
  `,
  styles: [`
    .empty-container {
      padding: 3rem;
      opacity: 0.8;
    }
  `]
})
export class EmptyComponent {
  @Input() icon = 'bi-inbox';
  @Input() title = 'No hay datos';
  @Input() message = 'No se encontraron elementos para mostrar.';
}

