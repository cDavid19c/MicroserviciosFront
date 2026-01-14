import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingComponent],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss'
})
export class PerfilComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  perfilForm!: FormGroup;
  loading = true;
  saving = false;
  successMessage = '';
  errorMessage = '';

  ngOnInit(): void {
    this.initForm();
    this.loadUserData();
  }

  private initForm(): void {
    this.perfilForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)]],
      apellido: ['', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)]],
      correo: [{ value: '', disabled: true }],
      tipoDocumento: [{ value: '', disabled: true }],
      documento: [{ value: '', disabled: true }]
    });
  }

  private loadUserData(): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.loading = false;
      return;
    }

    this.authService.getUsuarioById(userId).subscribe({
      next: (data) => {
        this.perfilForm.patchValue({
          nombre: data.NombreUsuario || data.Nombre || '',
          apellido: data.ApellidoUsuario || data.Apellido || '',
          correo: data.EmailUsuario || data.Correo || '',
          tipoDocumento: data.TipoDocumentoUsuario || data.TipoDocumento || '',
          documento: data.DocumentoUsuario || data.Documento || ''
        });
        this.loading = false;
      },
      error: () => {
        // Cargar desde localStorage como fallback
        const user = this.authService.getCurrentUser();
        if (user) {
          this.perfilForm.patchValue({
            nombre: user.nombre,
            apellido: user.apellido,
            correo: user.correo,
            tipoDocumento: user.tipoDocumento,
            documento: user.documento
          });
        }
        this.loading = false;
      }
    });
  }

  get f() {
    return this.perfilForm.controls;
  }

  onNameInput(event: Event, field: string): void {
    const input = event.target as HTMLInputElement;
    const cleaned = input.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '');
    if (input.value !== cleaned) {
      this.perfilForm.get(field)?.setValue(cleaned);
    }
  }

  onSubmit(): void {
    if (this.perfilForm.invalid) {
      Object.keys(this.f).forEach(key => {
        this.f[key].markAsTouched();
      });
      return;
    }

    this.saving = true;
    this.successMessage = '';
    this.errorMessage = '';

    const user = this.authService.getCurrentUser();
    if (!user) return;

    const payload = {
      Id: user.id,
      IdRol: user.rol,
      Nombre: this.perfilForm.get('nombre')?.value.trim(),
      Apellido: this.perfilForm.get('apellido')?.value.trim(),
      Correo: user.correo,
      Clave: '', // No cambiar contraseña
      Estado: true,
      TipoDocumento: user.tipoDocumento,
      Documento: user.documento,
      FechaNacimiento: user.fechaNacimiento
    };

    this.authService.updateUser(payload).subscribe({
      next: () => {
        this.saving = false;
        this.successMessage = 'Perfil actualizado correctamente.';

        // Actualizar localStorage
        localStorage.setItem('usuario_nombre', payload.Nombre);
        localStorage.setItem('usuario_apellido', payload.Apellido);
      },
      error: () => {
        this.saving = false;
        this.errorMessage = 'Error al actualizar el perfil.';
      }
    });
  }
}

