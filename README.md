# Frontend Angular - Aureacuen

Frontend Angular 19 para el sistema de reservas del Hotel Andino.

## Estructura del Proyecto

```
frontend-angular/
├── src/
│   ├── app/
│   │   ├── core/                    # Servicios, guards, interceptors, modelos
│   │   │   ├── guards/              # Auth guards
│   │   │   ├── interceptors/        # HTTP interceptors
│   │   │   ├── models/              # Interfaces TypeScript
│   │   │   └── services/            # Servicios API
│   │   ├── features/                # Componentes por funcionalidad
│   │   │   ├── auth/                # Login, Register
│   │   │   ├── habitaciones/        # Lista, Detalle
│   │   │   ├── home/                # Página principal
│   │   │   └── usuario/             # Perfil, Reservas, Pagos
│   │   ├── shared/                  # Componentes reutilizables
│   │   │   └── components/          # Loading, Error, Empty, Navbar, Breadcrumbs
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── environments/                # Configuración por ambiente
│   └── styles.scss                  # Estilos globales
└── proxy.conf.json                  # Proxy para backend Django
```

## Rutas Disponibles

| Ruta | Componente | Protegida |
|------|------------|-----------|
| `/` | Home | No |
| `/login` | Login | Solo invitados |
| `/register` | Register | Solo invitados |
| `/habitaciones` | Lista de habitaciones | No |
| `/habitaciones/:id` | Detalle de habitación | No |
| `/usuario/perfil` | Mi Perfil | Sí |
| `/usuario/reservas` | Mis Reservas | Sí |
| `/usuario/pagos` | Mis Pagos | Sí |

## API Endpoints Consumidos

### API Externa (microservicio Azure)
- `GET /api/gestion/usuarios-internos` - Usuarios
- `POST /api/gestion/usuarios-internos/login` - Login
- `GET /api/gestion/habitaciones` - Habitaciones
- `GET /api/gestion/reservas` - Reservas
- `GET /api/gestion/pago` - Pagos
- `GET /api/gestion/factura` - Facturas
- Y otros endpoints de gestión...

### Backend Django (proxy)
- `POST /usuario/prereserva/` - Crear pre-reserva
- `POST /usuario/confirmar-reserva/` - Confirmar y pagar
- `POST /usuario/cancelar-reserva/` - Cancelar reserva
- `POST /api/generar-factura/` - Generar factura
- `POST /api/generar-pdf-reserva/` - Generar PDF

## Validaciones Implementadas (ReactiveForms)

### Login
- Email: required, formato email válido
- Contraseña: required, sin espacios

### Register
- Nombre/Apellido: required, solo letras y espacios
- Email: required, formato email válido
- Tipo documento: required
- Documento: required, exactamente 10 dígitos
- Contraseña: required, mínimo 6 caracteres, sin espacios

### Reserva (Detalle Habitación)
- Fecha entrada: required
- Fecha salida: required, debe ser > fecha entrada
- Número huéspedes: required, entre 1 y capacidad de la habitación

## Autenticación

- **Almacenamiento**: localStorage para persistencia de sesión
- **Cookies**: Se establecen cookies para compatibilidad con Django backend
- **Interceptor**: Añade `withCredentials: true` para requests al backend Django

## Comandos

```bash
# Instalar dependencias
cd frontend-angular
npm install

# Desarrollo (con proxy al backend Django en :8000)
npm start
# o
ng serve

# Build producción
npm run build
# o
ng build --configuration production
```

## Configuración del Proxy

El archivo `proxy.conf.json` redirige las rutas `/api/*` y `/usuario/*` al backend Django en `http://localhost:8000`.

## Environment Variables

### `environment.ts` (desarrollo)
```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://hotelandinogestionrest.runasp.net/api/gestion',
  bankApiUrl: 'http://mibanca.runasp.net/api'
};
```

## Requisitos

- Node.js 18+
- Angular CLI 19
- Backend Django corriendo en puerto 8000 (para funciones de reserva/pago)
