export const environment = {
  production: false,

  // API Gateway para autenticación JWT
  apiGatewayUrl: 'https://brisamarapigateway.onrender.com/api',

  // URLs directas a los microservicios (CORS habilitado)
  catalogosServiceUrl: 'https://brisamarcatalogosservice.onrender.com/api',
  habitacionesServiceUrl: 'https://brisamarhabitacionesservice.onrender.com',
  reservasServiceUrl: 'https://brisamarreservasservice.onrender.com',
  usuariosPagosServiceUrl: 'https://brisamarpagosservice.onrender.com/api',

  // GraphQL endpoint para habitaciones
  habitacionesGraphqlUrl: 'https://brisamarhabitacionesservice.onrender.com/graphql',

  // API del banco
  bankApiUrl: 'http://mibanca.runasp.net/api',

  // Backend Django Local
  djangoUrl: 'http://localhost:8000'
};
