export enum EstadoRecibo {
  Pendiente = 'Pendiente',
  Pagado = 'Pagado',
  Vencido = 'Vencido'
}

export enum CanalNotificacion {
  Email = 'Email',
  SMS = 'SMS',
  WhatsApp = 'WhatsApp'
}

export interface Cliente {
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
}

export interface DatosPoliza {
  numeroPoliza: string;
  concepto: string;
  aseguradora: string;
  claveAgente: string;
  formaPago: string;
  moneda: string;
  fechaInicio: string;
  fechaFin: string;
  datosExtraidos?: DatosPolizaExtraidos; // Raw extraction data from Gemini
}

export interface Recibo {
  id: number;
  prima: number;
  periodo: string;
  vencimiento: string;
  estado: EstadoRecibo;
  comision?: number;
}

export interface ConfiguracionNotificacion {
  activa: boolean;
}

export interface ReciboExtraido {
  numero: number;
  fechaInicio: string;
  fechaFin: string;
  primaNeta: number;
  iva: number;
  primaTotal: number;
}

export interface DatosPolizaExtraidos {
  cliente: {
    nombreCompleto: string;
    rfc: string;
    direccion: string;
    codigoPostal: string;
    telefono: string;
    email: string;
  };
  poliza: {
    numeroPoliza: string;
    tipoPoliza: string;
    aseguradora: string;
    claveAgente: string;
    formaPago: string;
    moneda: string;
  };
  vigencia: {
    fechaEmision: string;
    vigenciaDesde: string;
    vigenciaHasta: string;
  };
  importe: {
    primaNeta: number;
    derechoPoliza: number;
    recargoPago: number;
    iva: number;
    primaTotal: number;
    porcentajeComision: number;
  };
  recibos: ReciboExtraido[];
}

export interface EstadoAsistente {
  pasoActual: number;
  poliza: {
    datos: DatosPoliza;
  };
  cliente: Cliente;
  recibos: Recibo[];
  porcentajeComision: number;
  notificaciones: {
    cobranza: ConfiguracionNotificacion;
    renovacion: ConfiguracionNotificacion;
    siniestros: ConfiguracionNotificacion;
    comisiones: ConfiguracionNotificacion;
    generales: ConfiguracionNotificacion;
    [key: string]: ConfiguracionNotificacion;
  };
  bitacora: string[];
  estadisticas?: any;
  historialExtraccion: {
    marcaTiempo: string;
    datos: DatosPolizaExtraidos;
  }[];
}
