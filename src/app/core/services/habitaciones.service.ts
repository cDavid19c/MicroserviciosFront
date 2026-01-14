import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Habitacion, HabitacionCard, TipoHabitacion, Amenidad, ImagenHabitacion } from '../models/habitacion.model';

@Injectable({
  providedIn: 'root'
})
export class HabitacionesService {
  private http = inject(HttpClient);

  // URLs directas a los microservicios
  private catalogosUrl = environment.catalogosServiceUrl;
  private habitacionesGraphqlUrl = environment.habitacionesGraphqlUrl;
  private usuariosPagosUrl = environment.usuariosPagosServiceUrl;
  // ApiGateway base URL (sin /api al final)
  private apiGatewayBaseUrl = environment.apiGatewayUrl.endsWith('/api')
    ? environment.apiGatewayUrl.slice(0, -4)
    : environment.apiGatewayUrl;

  private defaultImage = 'https://imageness3realdecuenca.s3.us-east-2.amazonaws.com/Imagen4.png';

  /**
   * Obtiene todas las habitaciones via GraphQL
   */
  getHabitaciones(): Observable<Habitacion[]> {
    // Solo campos que existen en HabitacionDto
    const query = `
      query {
        habitaciones {
          idHabitacion
          nombreHabitacion
          idHotel
          idCiudad
          idTipoHabitacion
          precioNormalHabitacion
          precioActualHabitacion
          capacidadHabitacion
          estadoHabitacion
          estadoActivoHabitacion
        }
      }
    `;

    return this.http.post<any>(this.habitacionesGraphqlUrl, { query }).pipe(
      map(response => {
        console.log('GraphQL habitaciones response:', response);
        const data = response?.data?.habitaciones || [];
        return data.map((item: any) => this.mapGraphQLToHabitacion(item));
      }),
      catchError(error => {
        console.error('Error fetching habitaciones via GraphQL:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene una habitación por ID via GraphQL
   */
  getHabitacionById(id: string): Observable<Habitacion | null> {
    const query = `
      query($id: String!) {
        habitacionById(id: $id) {
          idHabitacion
          nombreHabitacion
          idHotel
          idCiudad
          idTipoHabitacion
          precioNormalHabitacion
          precioActualHabitacion
          capacidadHabitacion
          estadoHabitacion
          estadoActivoHabitacion
        }
      }
    `;

    return this.http.post<any>(this.habitacionesGraphqlUrl, { query, variables: { id } }).pipe(
      map(response => {
        const data = response?.data?.habitacionById;
        if (!data) return null;
        return this.mapGraphQLToHabitacion(data);
      }),
      catchError(() => of(null))
    );
  }

  /**
   * Mapea respuesta GraphQL al modelo Habitacion
   */
  private mapGraphQLToHabitacion(data: any): Habitacion {
    return {
      IdHabitacion: data.idHabitacion || '',
      NombreHabitacion: data.nombreHabitacion || '',
      IdHotel: data.idHotel || 0,
      IdCiudad: data.idCiudad || 0,
      IdTipoHabitacion: data.idTipoHabitacion || 0,
      PrecioNormalHabitacion: data.precioNormalHabitacion || 0,
      PrecioActualHabitacion: data.precioActualHabitacion || 0,
      CapacidadHabitacion: data.capacidadHabitacion || 1,
      EstadoHabitacion: data.estadoHabitacion ?? true,
      EstadoActivoHabitacion: data.estadoActivoHabitacion ?? true
    };
  }

  /**
   * Obtiene tipos de habitación desde CatalogosService
   */
  getTiposHabitacion(): Observable<TipoHabitacion[]> {
    return this.http.get<any>(`${this.catalogosUrl}/TiposHabitacion`).pipe(
      map(response => {
        const data = response?.value || response || [];
        console.log('TiposHabitacion response:', data);
        return data.map((t: any) => ({
          IdTipoHabitacion: t.idTipoHabitacion,
          NombreHabitacion: t.nombreTipoHabitacion,
          DescripcionTipoHabitacion: t.descripcionTipoHabitacion
        }));
      }),
      catchError(err => {
        console.error('Error loading TiposHabitacion:', err);
        return of([]);
      })
    );
  }

  /**
   * Obtiene amenidades desde CatalogosService
   */
  getAmenidades(): Observable<Amenidad[]> {
    return this.http.get<any>(`${this.catalogosUrl}/Amenidades`).pipe(
      map(response => {
        const data = response?.value || response || [];
        return data.map((a: any) => ({
          IdAmenidad: a.idAmenidad,
          NombreAmenidad: a.nombreAmenidad
        }));
      }),
      catchError(err => {
        console.error('Error loading Amenidades:', err);
        return of([]);
      })
    );
  }

  /**
   * Obtiene relaciones amenidad-habitación via GraphQL
   */
  getAmexHab(): Observable<any[]> {
    const query = `
      query {
        amenidadesPorHabitacion {
          idHabitacion
          idAmenidad
        }
      }
    `;

    return this.http.post<any>(this.habitacionesGraphqlUrl, { query }).pipe(
      map(response => {
        const data = response?.data?.amenidadesPorHabitacion || [];
        // Mapear de camelCase a PascalCase
        return data.map((item: any) => ({
          IdHabitacion: item.idHabitacion,
          IdAmenidad: item.idAmenidad
        }));
      }),
      catchError(() => of([]))
    );
  }

  /**
   * Obtiene imágenes de habitaciones via GraphQL
   */
  getImagenes(): Observable<ImagenHabitacion[]> {
    const query = `
      query {
        imagenesHabitacion {
          idImagen
          idHabitacion
          urlImagen
          estadoImagen
        }
      }
    `;

    return this.http.post<any>(this.habitacionesGraphqlUrl, { query }).pipe(
      map(response => {
        const data = response?.data?.imagenesHabitacion || [];
        return data.map((item: any) => ({
          IdImagen: item.idImagen,
          IdHabitacion: item.idHabitacion,
          UrlImagen: item.urlImagen,
          EstadoImagen: item.estadoImagen
        }));
      }),
      catchError(() => of([]))
    );
  }

  /**
   * Obtiene hoteles desde CatalogosService
   */
  getHoteles(): Observable<any[]> {
    return this.http.get<any>(`${this.catalogosUrl}/Hoteles`).pipe(
      map(response => {
        const data = response?.value || response || [];
        console.log('Hoteles response:', data);
        return data.map((h: any) => ({
          IdHotel: h.idHotel,
          NombreHotel: h.nombreHotel
        }));
      }),
      catchError(err => {
        console.error('Error loading Hoteles:', err);
        return of([]);
      })
    );
  }

  /**
   * Obtiene ciudades desde CatalogosService
   */
  getCiudades(): Observable<any[]> {
    return this.http.get<any>(`${this.catalogosUrl}/Ciudades`).pipe(
      map(response => {
        const data = response?.value || response || [];
        console.log('Ciudades response:', data);
        return data.map((c: any) => ({
          IdCiudad: c.idCiudad,
          NombreCiudad: c.nombreCiudad
        }));
      }),
      catchError(err => {
        console.error('Error loading Ciudades:', err);
        return of([]);
      })
    );
  }

  /**
   * Carga todas las habitaciones con datos enriquecidos (amenidades, hoteles, ciudades, imágenes)
   */
  getHabitacionesEnriquecidas(filtros?: {
    tipoHabitacion?: string;
    capacidad?: number;
    precioMin?: number;
    precioMax?: number;
  }): Observable<HabitacionCard[]> {
    return forkJoin({
      habitaciones: this.getHabitaciones(),
      amenidades: this.getAmenidades(),
      amexhab: this.getAmexHab(),
      tipos: this.getTiposHabitacion(),
      imagenes: this.getImagenes(),
      hoteles: this.getHoteles(),
      ciudades: this.getCiudades()
    }).pipe(
      map(({ habitaciones, amenidades, amexhab, tipos, imagenes, hoteles, ciudades }) => {
        // Crear índices
        const amenidadesIdx: Record<number, string> = {};
        amenidades.forEach(a => amenidadesIdx[a.IdAmenidad] = a.NombreAmenidad);

        const amexhabIdx: Record<string, number[]> = {};
        amexhab.forEach(a => {
          const id = a.IdHabitacion;
          if (!amexhabIdx[id]) amexhabIdx[id] = [];
          amexhabIdx[id].push(a.IdAmenidad);
        });

        const tiposIdx: Record<number, TipoHabitacion> = {};
        tipos.forEach(t => tiposIdx[t.IdTipoHabitacion] = t);

        const imagenesIdx: Record<string, string[]> = {};
        imagenes.forEach(img => {
          if (img.EstadoImagen && img.UrlImagen) {
            const id = img.IdHabitacion;
            if (!imagenesIdx[id]) imagenesIdx[id] = [];
            imagenesIdx[id].push(img.UrlImagen);
          }
        });

        const hotelesIdx: Record<number, string> = {};
        hoteles.forEach(h => hotelesIdx[h.IdHotel] = h.NombreHotel);

        const ciudadesIdx: Record<number, string> = {};
        ciudades.forEach(c => ciudadesIdx[c.IdCiudad] = c.NombreCiudad);

        // Filtrar
        let resultado = habitaciones;

        if (filtros?.tipoHabitacion) {
          resultado = resultado.filter(h => {
            const tipo = tiposIdx[h.IdTipoHabitacion];
            return tipo?.NombreHabitacion?.toLowerCase() === filtros.tipoHabitacion?.toLowerCase();
          });
        }

        if (filtros?.capacidad) {
          resultado = resultado.filter(h => h.CapacidadHabitacion >= filtros.capacidad!);
        }

        if (filtros?.precioMin !== undefined) {
          resultado = resultado.filter(h => h.PrecioActualHabitacion >= filtros.precioMin!);
        }

        if (filtros?.precioMax !== undefined) {
          resultado = resultado.filter(h => h.PrecioActualHabitacion <= filtros.precioMax!);
        }

        // Transformar a HabitacionCard
        return resultado.map(h => {
          const tipo = tiposIdx[h.IdTipoHabitacion];
          const idsAmenidades = amexhabIdx[h.IdHabitacion] || [];
          const nombresAmenidades = idsAmenidades.map(id => amenidadesIdx[id] || 'Amenidad desconocida');
          const imgs = imagenesIdx[h.IdHabitacion] || [];
          const imagenPrincipal = imgs[0] || this.defaultImage;

          return {
            id: h.IdHabitacion,
            nombre: h.NombreHabitacion,
            hotel: hotelesIdx[h.IdHotel] || h.NombreHotel || 'Hotel desconocido',
            ubicacion: ciudadesIdx[h.IdCiudad] || h.NombreCiudad || 'Ciudad desconocida',
            precio: h.PrecioActualHabitacion,
            imagen: imagenPrincipal,
            amenidades: nombresAmenidades,
            capacidad: h.CapacidadHabitacion,
            tipoNombre: tipo?.NombreHabitacion,
            descripcionTipo: tipo?.DescripcionTipoHabitacion
          } as HabitacionCard;
        });
      })
    );
  }

  /**
   * Obtiene el detalle completo de una habitación
   */
  getDetalleHabitacion(id: string): Observable<{
    habitacion: Habitacion | null;
    amenidades: string[];
    imagenes: string[];
  }> {
    return forkJoin({
      habitacion: this.getHabitacionById(id),
      amenidades: this.getAmenidades(),
      amexhab: this.getAmexHab(),
      imagenes: this.getImagenes(),
      tipos: this.getTiposHabitacion(),
      hoteles: this.getHoteles(),
      ciudades: this.getCiudades()
    }).pipe(
      map(({ habitacion, amenidades, amexhab, imagenes, tipos, hoteles, ciudades }) => {
        if (!habitacion) {
          return { habitacion: null, amenidades: [], imagenes: [] };
        }

        // Crear índices para búsqueda rápida
        const amenidadesIdx: Record<number, string> = {};
        amenidades.forEach(a => amenidadesIdx[a.IdAmenidad] = a.NombreAmenidad);

        const tiposIdx: Record<number, string> = {};
        tipos.forEach(t => tiposIdx[t.IdTipoHabitacion] = t.NombreHabitacion);

        const hotelesIdx: Record<number, string> = {};
        hoteles.forEach(h => hotelesIdx[h.IdHotel] = h.NombreHotel);

        const ciudadesIdx: Record<number, string> = {};
        ciudades.forEach(c => ciudadesIdx[c.IdCiudad] = c.NombreCiudad);

        // Enriquecer habitación con nombres
        habitacion.NombreTipoHabitacion = tiposIdx[habitacion.IdTipoHabitacion] || 'Estándar';
        habitacion.NombreHotel = hotelesIdx[habitacion.IdHotel] || 'Hotel';
        habitacion.NombreCiudad = ciudadesIdx[habitacion.IdCiudad] || 'Ciudad';

        // Procesar amenidades
        const idsAmenidades = amexhab
          .filter(a => a.IdHabitacion === id)
          .map(a => a.IdAmenidad);

        const nombresAmenidades = idsAmenidades.map(idAm => amenidadesIdx[idAm]).filter(Boolean);

        // Procesar imágenes
        const imgs = imagenes
          .filter(img => img.IdHabitacion === id && img.EstadoImagen)
          .map(img => img.UrlImagen);

        if (imgs.length === 0) {
          imgs.push(this.defaultImage);
        }

        return {
          habitacion,
          amenidades: nombresAmenidades,
          imagenes: imgs
        };
      })
    );
  }
  /**
   * Obtiene las fechas ocupadas de una habitación.
   * Llama al nuevo endpoint REST del ApiGateway que internamente usa gRPC
   */
  getFechasOcupadas(idHabitacion: string): Observable<string[]> {
    // Usar el endpoint del ApiGateway que llama al gRPC ReservasService
    const url = `${this.apiGatewayBaseUrl}/api/reservas-grpc/fechas-ocupadas/${idHabitacion}`;

    console.log('[getFechasOcupadas] Llamando a:', url);

    return this.http.get<any>(url).pipe(
      map(response => {
        const fechas = response?.FechasOcupadas || response?.fechasOcupadas || [];
        console.log('[getFechasOcupadas] Fechas ocupadas recibidas:', fechas.length);
        return fechas;
      }),
      catchError(err => {
        console.error('[getFechasOcupadas] Error:', err);
        // Fallback: intentar construir las fechas localmente si el gateway falla
        return this.getFechasOcupadasFallback(idHabitacion);
      })
    );
  }

  /**
   * Fallback: Retorna array vacío cuando el servicio gRPC no está disponible.
   * TODO: Implementar llamada REST directa cuando el backend lo soporte
   */
  private getFechasOcupadasFallback(idHabitacion: string): Observable<string[]> {
    console.warn('[getFechasOcupadasFallback] gRPC service unavailable, returning empty dates');
    // Por ahora retornar array vacío hasta que se configure correctamente el gRPC
    // El servicio ReservasService usa gRPC puro y no acepta las llamadas desde el ApiGateway
    return of([]);
  }

  // ==================== BATCH METHODS FOR PERFORMANCE ====================

  /**
   * Obtiene TODAS las reservas de una sola vez (1 llamada API)
   */
  getAllReservas(): Observable<any[]> {
    const url = `${this.apiGatewayBaseUrl}/api/reservas-grpc/reservas`;
    console.log('[getAllReservas] Llamando a:', url);

    return this.http.get<any>(url).pipe(
      map(response => {
        // La respuesta puede venir como array directo o envuelto
        const reservas = response?.reservas || response || [];
        console.log('[getAllReservas] Reservas recibidas:', reservas.length);
        return reservas;
      }),
      catchError(err => {
        console.error('[getAllReservas] Error:', err);
        return of([]);
      })
    );
  }

  /**
   * Obtiene TODAS las relaciones habitación-reserva (1 llamada API)
   */
  getAllHabxRes(): Observable<any[]> {
    const url = `${this.apiGatewayBaseUrl}/api/reservas-grpc/habxres`;
    console.log('[getAllHabxRes] Llamando a:', url);

    return this.http.get<any>(url).pipe(
      map(response => {
        const items = response?.items || response || [];
        console.log('[getAllHabxRes] HabxRes recibidos:', items.length);
        return items;
      }),
      catchError(err => {
        console.error('[getAllHabxRes] Error:', err);
        return of([]);
      })
    );
  }

  /**
   * Obtiene las habitaciones NO disponibles para un rango de fechas 
   * usando SOLO 2 llamadas al API en lugar de N llamadas
   * @returns Set de IDs de habitaciones ocupadas
   */
  getHabitacionesOcupadasEnRango(fechaInicio: string, fechaFin: string): Observable<Set<string>> {
    console.log('[getHabitacionesOcupadasEnRango] Buscando ocupadas entre:', fechaInicio, '-', fechaFin);

    return forkJoin({
      reservas: this.getAllReservas(),
      habxres: this.getAllHabxRes()
    }).pipe(
      map(({ reservas, habxres }) => {
        const ocupadas = new Set<string>();
        const inicioDate = new Date(fechaInicio);
        const finDate = new Date(fechaFin);

        // Crear mapa de reserva -> fechas
        const reservasFechasMap = new Map<number, { inicio: Date; fin: Date; estado: string }>();
        reservas.forEach((r: any) => {
          const idReserva = r.idReserva || r.id_reserva;
          const estadoGeneral = r.estadoGeneral || r.estado_general || '';
          const fechaInicioRes = r.fechaInicio || r.fecha_inicio;
          const fechaFinRes = r.fechaFinal || r.fecha_final;

          // Solo considerar reservas activas (no canceladas)
          if (estadoGeneral !== 'CANCELADO' && fechaInicioRes && fechaFinRes) {
            reservasFechasMap.set(idReserva, {
              inicio: new Date(fechaInicioRes),
              fin: new Date(fechaFinRes),
              estado: estadoGeneral
            });
          }
        });

        // Buscar habitaciones que tienen conflicto
        habxres.forEach((hr: any) => {
          const idReserva = hr.idReserva || hr.id_reserva;
          const idHabitacion = hr.idHabitacion || hr.id_habitacion;
          const estadoHabxRes = hr.estado ?? true;

          if (!estadoHabxRes) return; // Ignorar relaciones inactivas

          const reservaData = reservasFechasMap.get(idReserva);
          if (reservaData) {
            // Verificar si hay overlap de fechas
            const hayConflicto = !(finDate <= reservaData.inicio || inicioDate >= reservaData.fin);
            if (hayConflicto) {
              ocupadas.add(idHabitacion);
            }
          }
        });

        console.log('[getHabitacionesOcupadasEnRango] Habitaciones ocupadas:', ocupadas.size);
        return ocupadas;
      }),
      catchError(err => {
        console.error('[getHabitacionesOcupadasEnRango] Error:', err);
        return of(new Set<string>());
      })
    );
  }
}

