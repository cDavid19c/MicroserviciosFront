export interface Pago {
  IdPago: number;
  IdReserva: number;
  IdUnicoUsuario?: number;
  IdUnicoUsuarioExterno?: number;
  IdFactura?: number;
  IdMetodoPago: number;
  MontoTotalPago: number;
  FechaEmisionPago: string;
  EstadoPago: boolean;
  CuentaOrigenPago: string;
  CuentaDestinoPago: string;
}

export interface PagoDisplay {
  id: number;
  idReserva?: number;
  facturaId?: number;
  monto: number;
  fecha: string;
  estado: string;
  cuentaOrigen?: string;
  cuentaDestino?: string;
  metodo?: number;
  factura?: Factura;
  pdfEstado?: boolean;
  pdfUrl?: string;
}

export interface Factura {
  IdFactura: number;
  IdReserva: number;
  SubtotalFactura: number;
  ImpuestoTotalFactura: number;
  DescuentoTotalFactura: number;
  EmailUsuario?: string;
  EmailUsuarioExterno?: string;
  FechaEmisionFactura: string;
  EstadoFactura: boolean;
}

export interface GenerarFacturaRequest {
  idReserva: number;
  nombre?: string;
  apellido?: string;
  correo?: string;
  tipoDocumento?: string;
  documento?: string;
}

