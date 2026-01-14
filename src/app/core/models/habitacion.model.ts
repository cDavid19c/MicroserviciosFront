export interface Habitacion {
  IdHabitacion: string;
  IdTipoHabitacion: number;
  IdCiudad: number;
  IdHotel: number;
  NombreHabitacion: string;
  NombreHotel?: string;
  NombreCiudad?: string;
  NombrePais?: string;
  NombreTipoHabitacion?: string;
  PrecioNormalHabitacion?: number;
  PrecioActualHabitacion: number;
  CapacidadHabitacion: number;
  EstadoHabitacion: string;
  EstadoActivoHabitacion?: boolean;
  FechaRegistroHabitacion?: string;
  imagenes?: string;
}

export interface HabitacionCard {
  id: string;
  nombre: string;
  hotel: string;
  ubicacion: string;
  precio: number;
  imagen: string;
  amenidades: string[];
  capacidad: number;
  tipoNombre?: string;
  descripcionTipo?: string;
}

export interface TipoHabitacion {
  IdTipoHabitacion: number;
  NombreHabitacion: string;
  DescripcionTipoHabitacion?: string;
}

export interface Amenidad {
  IdAmenidad: number;
  NombreAmenidad: string;
}

export interface ImagenHabitacion {
  IdImagen: number;
  IdHabitacion: string;
  UrlImagen: string;
  EstadoImagen: boolean;
}

