import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm!: FormGroup;
  loading = false;
  errorMessage = '';
  showPassword = false;
  returnUrl = '/';

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      clave: ['', [Validators.required, Validators.minLength(1)]]
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  get f() {
    return this.loginForm.controls;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  // Evitar espacios en email y contraseña
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === ' ') {
      event.preventDefault();
    }
  }

  onPaste(event: ClipboardEvent, field: string): void {
    event.preventDefault();
    const text = event.clipboardData?.getData('text') || '';
    const cleanText = text.replace(/\s/g, '');
    this.loginForm.get(field)?.setValue(cleanText);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      Object.keys(this.f).forEach(key => {
        this.f[key].markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { correo, clave } = this.loginForm.value;

    this.authService.login(correo.trim(), clave).subscribe({
      next: () => {
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.message || 'Error al iniciar sesión';
      }
    });
  }
}

