import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/auth.guard';

export const adminRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
        canActivate: [adminGuard]
    },
    {
        path: 'habitaciones',
        loadComponent: () => import('./habitaciones-admin/habitaciones-admin.component').then(m => m.HabitacionesAdminComponent),
        canActivate: [adminGuard]
    },
    {
        path: 'usuarios',
        loadComponent: () => import('./usuarios-admin/usuarios-admin.component').then(m => m.UsuariosAdminComponent),
        canActivate: [adminGuard]
    },
    {
        path: 'reservas',
        loadComponent: () => import('./reservas-admin/reservas-admin.component').then(m => m.ReservasAdminComponent),
        canActivate: [adminGuard]
    },
    {
        path: 'hoteles',
        loadComponent: () => import('./hoteles-admin/hoteles-admin.component').then(m => m.HotelesAdminComponent),
        canActivate: [adminGuard]
    },
    {
        path: 'ciudades',
        loadComponent: () => import('./ciudades-admin/ciudades-admin.component').then(m => m.CiudadesAdminComponent),
        canActivate: [adminGuard]
    },
    {
        path: 'amenidades',
        loadComponent: () => import('./amenidades-admin/amenidades-admin.component').then(m => m.AmenidadesAdminComponent),
        canActivate: [adminGuard]
    },
    {
        path: 'tipos-habitacion',
        loadComponent: () => import('./tipos-habitacion-admin/tipos-habitacion-admin.component').then(m => m.TiposHabitacionAdminComponent),
        canActivate: [adminGuard]
    }
];
