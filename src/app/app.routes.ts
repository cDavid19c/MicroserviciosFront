import { Routes } from '@angular/router';
import { authGuard, guestGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
    data: { breadcrumb: '' }
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard],
    data: { breadcrumb: 'Iniciar Sesión' }
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [guestGuard],
    data: { breadcrumb: 'Registrarse' }
  },
  {
    path: 'habitaciones',
    children: [
      {
        path: '',
        loadComponent: () => import('./features/habitaciones/habitaciones-list/habitaciones-list.component').then(m => m.HabitacionesListComponent),
        data: { breadcrumb: 'Habitaciones' }
      },
      {
        path: ':id',
        loadComponent: () => import('./features/habitaciones/habitacion-detalle/habitacion-detalle.component').then(m => m.HabitacionDetalleComponent),
        data: { breadcrumb: 'Detalle' }
      }
    ]
  },
  {
    path: 'usuario',
    canActivate: [authGuard],
    children: [
      {
        path: 'perfil',
        loadComponent: () => import('./features/usuario/perfil/perfil.component').then(m => m.PerfilComponent),
        data: { breadcrumb: 'Mi Perfil' }
      },
      {
        path: 'reservas',
        loadComponent: () => import('./features/usuario/mis-reservas/mis-reservas.component').then(m => m.MisReservasComponent),
        data: { breadcrumb: 'Mis Reservas' }
      },
      {
        path: 'pagos',
        loadComponent: () => import('./features/usuario/mis-pagos/mis-pagos.component').then(m => m.MisPagosComponent),
        data: { breadcrumb: 'Mis Pagos' }
      }
    ]
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.adminRoutes),
    data: { breadcrumb: 'Panel de Administración' }
  },
  {
    path: '**',
    redirectTo: ''
  }
];
