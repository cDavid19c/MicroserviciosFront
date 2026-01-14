import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const apiInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  // Agregar withCredentials para requests al backend Django (cookies de sesión)
  let modifiedReq = req;

  // Si la URL es relativa (empieza con /), es para el backend Django
  if (req.url.startsWith('/')) {
    modifiedReq = req.clone({
      withCredentials: true
    });
  }

  // Si la URL es al API externo, no necesita credentials
  // pero podríamos agregar headers si fuera necesario

  return next(modifiedReq);
};

