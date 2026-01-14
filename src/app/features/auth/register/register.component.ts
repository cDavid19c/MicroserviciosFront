import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest } from '../../../core/models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm!: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)]],
      apellido: ['', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)]],
      correo: ['', [Validators.required, Validators.email]],
      tipoDocumento: ['', [Validators.required]],
      documento: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      clave: ['', [Validators.required, Validators.minLength(6), this.noWhitespaceValidator]]
    });
  }

  get f() {
    return this.registerForm.controls;
  }

  // Validador personalizado: sin espacios en blanco
  noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
    if (control.value && control.value.includes(' ')) {
      return { noWhitespace: true };
    }
    return null;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  // Solo permite letras y espacios para nombre/apellido (sin espacios al inicio ni al final)
  onNameInput(event: Event, field: string): void {
    const input = event.target as HTMLInputElement;
    // Eliminar caracteres no permitidos
    let cleaned = input.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '');
    // Eliminar espacios al inicio
    cleaned = cleaned.replace(/^\s+/, '');
    // Eliminar espacios dobles o más consecutivos
    cleaned = cleaned.replace(/\s{2,}/g, ' ');
    // Eliminar espacios al final si el usuario no está escribiendo más
    if (cleaned.endsWith('  ')) {
      cleaned = cleaned.trimEnd() + ' ';
    }
    if (input.value !== cleaned) {
      this.registerForm.get(field)?.setValue(cleaned);
    }
  }

  // Evento blur para hacer trim final
  onNameBlur(field: string): void {
    const value = this.registerForm.get(field)?.value;
    if (value && value !== value.trim()) {
      this.registerForm.get(field)?.setValue(value.trim());
    }
  }

  // No permite espacios en correo electrónico
  onEmailInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const cleaned = input.value.replace(/\s/g, '');
    if (input.value !== cleaned) {
      this.registerForm.get('correo')?.setValue(cleaned);
    }
  }

  // Solo permite números para documento
  onDocumentoInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const cleaned = input.value.replace(/\D/g, '').slice(0, 10);
    if (input.value !== cleaned) {
      this.registerForm.get('documento')?.setValue(cleaned);
    }
  }

  // Evitar espacios en contraseña
  onPasswordKeyPress(event: KeyboardEvent): void {
    if (event.key === ' ') {
      event.preventDefault();
    }
  }

  onPasswordInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const cleaned = input.value.replace(/\s/g, '');
    if (input.value !== cleaned) {
      this.registerForm.get('clave')?.setValue(cleaned);
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      Object.keys(this.f).forEach(key => {
        this.f[key].markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.registerForm.value;

    const payload: RegisterRequest = {
      Id: 0,
      IdRol: 1, // Usuario normal
      Nombre: formValue.nombre.trim(),
      Apellido: formValue.apellido.trim(),
      Correo: formValue.correo.trim(),
      Clave: formValue.clave,
      Estado: true,
      TipoDocumento: formValue.tipoDocumento,
      Documento: formValue.documento,
      FechaNacimiento: undefined
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Cuenta creada correctamente. Ahora puedes iniciar sesión.';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.message || 'Error al crear la cuenta';
      }
    });
  }
}

