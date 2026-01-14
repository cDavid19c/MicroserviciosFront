export interface Reserva {
  IdReserva: number;
  IdUnicoUsuario?: number;
  IdUnicoUsuarioExterno?: number;
  CostoTotalReserva: number;
  FechaRegistroReserva: string;
  FechaInicioReserva: string;
  FechaFinalReserva: string;
  EstadoGeneralReserva: string;
  EstadoReserva: boolean;
}

export interface ReservaDisplay {
  idReserva: number;
  idUsuario?: number;
  idHabitacion?: string;
  idHold?: string;
  habitacion: string;
  hotel: string;
  ciudad: string;
  pais: string;
  fechaInicio: string;
  fechaFin: string;
  huespedes: number;
  estado: string;
  subtotal: number;
  totalDescuentos: number;
  totalImpuestos: number;
  total: number;
  capacidadEscogida?: number;
  capacidadHabitacion?: number;
  imagen: string;
  fechaRegistro?: string;
}

export interface HabxRes {
  IdHabxRes: number;
  IdHabitacion: string;
  IdReserva: number;
  CapacidadReservaHabxRes: number;
  CostoCalculadoHabxRes: number;
  DescuentoHabxRes: number;
  ImpuestosHabxRes: number;
}

export interface Hold {
  IdHold: string;
  IdHabitacion: string;
  IdReserva: number;
  TiempoHold: number;
  FechaInicioHold: string;
  EstadoHold: boolean;
}

export interface PreReservaRequest {
  idHabitacion: string;
  fechaInicio: string;
  fechaFin: string;
  numeroHuespedes: number;
  nombre: string;
  apellido: string;
  correo: string;
  tipoDocumento: string;
  documento: string;
  usuarioId: number;
}

export interface ConfirmarReservaRequest {
  idHabitacion: string;
  idHold: string;
  idUnicoUsuario?: number;
  nombre: string;
  apellido: string;
  correo: string;
  tipoDocumento: string;
  documento: string;
  fechaInicio: string;
  fechaFin: string;
  numeroHuespedes: number;
}

