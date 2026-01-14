import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';

/**
 * Interceptor que agrega el token JWT a las peticiones HTTP
 */
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
    // URLs públicas que no requieren autenticación
    const publicUrls = [
        '/api/Auth/token',    // Obtener token
        '/api/Usuarios/login', // Login
        '/graphql'            // GraphQL de habitaciones es público
    ];

    // Verificar si la URL es pública
    const isPublicUrl = publicUrls.some(url => req.url.includes(url));

    if (isPublicUrl) {
        return next(req);
    }

    // Obtener token del localStorage
    const token = localStorage.getItem('jwt_token');

    if (token) {
        // Clonar la petición y agregar el header Authorization
        const authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
        return next(authReq);
    }

    return next(req);
};
