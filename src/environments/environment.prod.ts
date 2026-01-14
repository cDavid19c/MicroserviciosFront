export const environment = {
  production: true,

  apiGatewayUrl: 'https://brismarapigateway.onrender.com/api',
  // URLs directas a los microservicios en Render
  catalogosServiceUrl: 'https://brisamarcatalogosservice.onrender.com/api',
  habitacionesServiceUrl: 'https://brisamarhabitacionesservice.onrender.com',
  reservasServiceUrl: 'https://brisamarreservasservice.onrender.com',
  usuariosPagosServiceUrl: 'https://brisamarpagosservice.onrender.com/api',

  // GraphQL endpoint para habitaciones
  habitacionesGraphqlUrl: 'https://brisamarhabitacionesservice.onrender.com/graphql',

  // API del banco (mantenida)
  bankApiUrl: 'http://mibanca.runasp.net/api'
};
