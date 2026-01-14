import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError, switchMap, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, LoginRequest, LoginResponse, RegisterRequest } from '../models/user.model';

interface TokenResponse {
  token: string;
  expiresAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);

  // URLs de los servicios
  private usuariosUrl = `${environment.usuariosPagosServiceUrl}/Usuarios`;
  private authUrl = `${environment.apiGatewayUrl}/Auth`;

  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const user = this.getUserFromStorage();
    if (user) {
      this.currentUserSubject.next(user);
    }
  }

  private getUserFromStorage(): User | null {
    if (typeof localStorage === 'undefined') return null;

    const id = localStorage.getItem('usuario_id');
    if (!id) return null;

    return {
      id: parseInt(id, 10),
      correo: localStorage.getItem('usuario_correo') || '',
      nombre: localStorage.getItem('usuario_nombre') || '',
      apellido: localStorage.getItem('usuario_apellido') || '',
      rol: parseInt(localStorage.getItem('usuario_rol') || '1', 10),
      tipoDocumento: localStorage.getItem('usuario_tipo_doc') || '',
      documento: localStorage.getItem('usuario_documento') || '',
      fechaNacimiento: localStorage.getItem('usuario_fecha_nac') || undefined
    };
  }

  /**
   * Flujo de login:
   * 1. Login en UsuariosPagosService para obtener datos del usuario
   * 2. Obtener JWT del API Gateway
   * 3. Guardar usuario y token
   */
  login(correo: string, clave: string): Observable<LoginResponse> {
    const loginPayload = { Correo: correo, Password: clave };

    return this.http.post<any>(`${this.usuariosUrl}/login`, loginPayload).pipe(
      tap(response => {
        console.log('Login response:', response);
        if (response && (response.Id || response.id)) {
          this.saveUserToStorage(response);
          this.currentUserSubject.next(this.getUserFromStorage());
        }
      }),
      // Después del login exitoso, obtener el JWT token
      switchMap(userResponse => {
        return this.getJwtToken(correo, clave).pipe(
          tap(tokenResponse => {
            if (tokenResponse?.token) {
              this.saveToken(tokenResponse.token);
              console.log('JWT Token guardado');
            }
          }),
          // Retornar la respuesta del usuario original
          switchMap(() => of(userResponse))
        );
      }),
      catchError(error => {
        console.error('Error en login:', error);
        return throwError(() => new Error(
          error.status === 401 ? 'Credenciales incorrectas' : 'Error al iniciar sesión'
        ));
      })
    );
  }

  /**
   * Obtiene el JWT token del API Gateway
   */
  private getJwtToken(username: string, password: string): Observable<TokenResponse> {
    const tokenPayload = { Username: username, Password: password };

    return this.http.post<TokenResponse>(`${this.authUrl}/token`, tokenPayload).pipe(
      catchError(error => {
        console.warn('Error obteniendo JWT token:', error);
        // Si falla el token, devolvemos un objeto vacío para no bloquear el login
        return of({ token: '' });
      })
    );
  }

  /**
   * Guarda el JWT token
   */
  private saveToken(token: string): void {
    localStorage.setItem('jwt_token', token);
  }

  /**
   * Obtiene el JWT token guardado
   */
  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  /**
   * Verifica si hay un token válido
   */
  hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Verificar si el token ha expirado (decodificar JWT)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000; // convertir a milisegundos
      return Date.now() < expiry;
    } catch {
      return false;
    }
  }

  /**
   * Registra un nuevo usuario
   */
  register(data: RegisterRequest): Observable<any> {
    return this.http.post(this.usuariosUrl, data).pipe(
      catchError(error => {
        console.error('Error en registro:', error);

        let message = 'Error al crear la cuenta';

        if (error.status === 401) {
          message = 'El registro requiere autenticación. Contacta al administrador.';
        } else if (error.status === 400) {
          message = error.error?.message || 'Datos inválidos. Verifica la información.';
        } else if (error.status === 409 || error.status === 500) {
          // 500 a veces indica duplicados en algunos backends
          message = 'Es posible que el correo o documento ya estén registrados.';
        } else if (error.status === 0) {
          message = 'Error de conexión. Verifica tu internet.';
        }

        return throwError(() => new Error(message));
      })
    );
  }

  private saveUserToStorage(response: any): void {
    // Handle both camelCase and PascalCase responses
    const id = response.Id || response.id;
    const correo = response.Correo || response.correo || '';
    const nombre = response.Nombre || response.nombre || '';
    const apellido = response.Apellido || response.apellido || '';
    const idRol = response.IdRol || response.idRol || 1;
    const tipoDoc = response.TipoDocumento || response.tipoDocumento || '';
    const documento = response.Documento || response.documento || '';
    const fechaNac = response.FechaNacimiento || response.fechaNacimiento || '';

    localStorage.setItem('usuario_id', String(id));
    localStorage.setItem('usuario_correo', correo);
    localStorage.setItem('usuario_nombre', nombre);
    localStorage.setItem('usuario_apellido', apellido);
    localStorage.setItem('usuario_rol', String(idRol));
    localStorage.setItem('usuario_tipo_doc', tipoDoc);
    localStorage.setItem('usuario_documento', documento);
    localStorage.setItem('usuario_fecha_nac', fechaNac);

    // Set cookies for Django backend compatibility
    document.cookie = `usuario_id=${id}; max-age=86400; path=/; SameSite=Lax`;
    document.cookie = `usuario_rol=${idRol}; max-age=86400; path=/; SameSite=Lax`;

    console.log('Usuario guardado - ID:', id, 'Rol:', idRol);
  }

  logout(): void {
    // Limpiar datos de usuario
    localStorage.removeItem('usuario_id');
    localStorage.removeItem('usuario_correo');
    localStorage.removeItem('usuario_nombre');
    localStorage.removeItem('usuario_apellido');
    localStorage.removeItem('usuario_rol');
    localStorage.removeItem('usuario_tipo_doc');
    localStorage.removeItem('usuario_documento');
    localStorage.removeItem('usuario_fecha_nac');

    // Limpiar JWT token
    localStorage.removeItem('jwt_token');

    // Limpiar cookies
    document.cookie = 'usuario_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'usuario_rol=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getUserId(): number | null {
    return this.currentUserSubject.value?.id || null;
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.rol === 2;
  }

  getUsuarioById(id: number): Observable<any> {
    return this.http.get(`${this.usuariosUrl}/${id}`);
  }

  updateUser(userData: any): Observable<any> {
    const id = userData.Id || userData.id;
    return this.http.put(`${this.usuariosUrl}/${id}`, userData);
  }
}
