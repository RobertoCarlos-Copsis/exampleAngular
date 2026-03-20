export interface Client {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface PolicyData {
  policyNumber: string;
  concept: string;
  aseguradora: string;
  agentCode: string;
  formaPago: string;
  moneda: string;
  startDate: string;
  endDate: string;
  extractedData?: any; // Raw extraction data from Gemini
}

export interface Receipt {
  id: number;
  prima: number;
  periodo: string;
  vencimiento: string;
  status: 'Pendiente' | 'Pagado' | 'Vencido';
  commission?: number;
}

export interface NotificationConfig {
  active: boolean;
  [key: string]: any;
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

export interface WizardState {
  currentStep: number;
  policy: {
    data: PolicyData;
  };
  client: Client;
  receipts: Receipt[];
  commissionPercentage: number;
  notifications: {
    cobranza: NotificationConfig;
    renovacion: NotificationConfig;
    siniestros: NotificationConfig;
    comisiones: NotificationConfig;
    generales: NotificationConfig;
    [key: string]: NotificationConfig;
  };
  logs: string[];
  statistics: any;
  extractionHistory: {
    timestamp: string;
    data: DatosPolizaExtraidos;
  }[];
}
