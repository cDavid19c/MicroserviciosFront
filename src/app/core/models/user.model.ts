export interface User {
  id: number;
  correo: string;
  nombre: string;
  apellido: string;
  rol: number;
  tipoDocumento: string;
  documento: string;
  fechaNacimiento?: string;
}

export interface LoginRequest {
  Correo: string;
  Clave: string;
}

export interface LoginResponse {
  Id: number;
  Correo: string;
  Nombre: string;
  Apellido: string;
  IdRol: number;
  TipoDocumento: string;
  Documento: string;
  FechaNacimiento?: string;
  Estado: boolean;
}

export interface RegisterRequest {
  Id: number;
  IdRol: number;
  Nombre: string;
  Apellido: string;
  Correo: string;
  Clave: string;
  Estado: boolean;
  TipoDocumento: string;
  Documento: string;
  FechaNacimiento?: string;
}

