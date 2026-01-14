import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="error-container text-center py-5">
      <i class="bi bi-exclamation-triangle-fill text-danger fs-1"></i>
      <h4 class="mt-3 text-danger">{{ title }}</h4>
      <p class="text-muted">{{ message }}</p>
      <button
        *ngIf="showRetry"
        class="btn btn-outline-primary mt-2"
        (click)="onRetry.emit()">
        <i class="bi bi-arrow-clockwise me-1"></i>
        Reintentar
      </button>
    </div>
  `,
  styles: [`
    .error-container {
      padding: 3rem;
    }
  `]
})
export class ErrorComponent {
  @Input() title = 'Error';
  @Input() message = 'Ha ocurrido un error. Por favor, intenta nuevamente.';
  @Input() showRetry = true;
  @Output() onRetry = new EventEmitter<void>();
}

