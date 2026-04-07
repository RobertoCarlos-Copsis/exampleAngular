import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { DatosPolizaExtraidos, ReciboExtraido } from '../models/wizard.model';
import { environment } from '../../../environments/environment';

/** Mapa de IDs de tipo de seguro devueltos por la API → etiqueta legible */
const TIPO_SEGURO_MAP: Record<number, string> = {
  1: 'Autos',
  2: 'Vida',
  3: 'Salud',
  4: 'Diversos / Otros',
  5: 'Vida',
  6: 'Salud',
  7: 'Diversos / Otros',
  8: 'Diversos / Otros'
};

const PROGRESS_START = 10;
const PROGRESS_DATA_APPENDED = 20;
const PROGRESS_JSON_LOADED = 30;
const PROGRESS_COMPLETE = 100;

/** Mapa de IDs de forma de pago devueltos por la API → etiqueta legible */
const FORMA_PAGO_MAP: Record<number, string> = {
  1: 'Anual',
  2: 'Semestral',
  3: 'Trimestral',
  4: 'Bimestral',
  5: 'Mensual'
};

/** Mapa de IDs de moneda devueltos por la API → etiqueta legible */
const MONEDA_MAP: Record<number, string> = {
  0: 'MXN',
  1: 'MXN',
  2: 'USD',
  3: 'UDI'
};

/** Número de recibos por forma de pago */
const RECIBOS_POR_FORMA_PAGO: Record<string, number> = {
  'Anual': 1,
  'Semestral': 2,
  'Trimestral': 4,
  'Bimestral': 6,
  'Mensual': 12
};

export interface GeminiApiResponse {
  tipo?: number;
  poliza?: string;
  ramo?: string;
  aseguradora?: string;
  cveAgente?: string;
  formaPago?: string;
  moneda?: string;
  cteNombre?: string;
  rfc?: string;
  cteDireccion?: string;
  cp?: string;
  telefono?: string;
  email?: string;
  fechaEmision?: string;
  vigenciaDe?: string;
  vigenciaA?: string;
  primaneta?: number | string;
  primaNeta?: number | string;
  derecho?: number | string;
  recargo?: number | string;
  iva?: number | string;
  primaTotal?: number | string;
  comision?: number | string;
  recibos?: GeminiReciboResponse[];
}

export interface GeminiReciboResponse {
  serie?: number;
  vigenciaDe?: string;
  vigenciaA?: string;
  primaneta?: number | string;
  primaNeta?: number | string;
  iva?: number | string;
  primaTotal?: number | string;
}

// Configuration now comes from environments and interceptor
const DATOS_VACIOS: DatosPolizaExtraidos = {
  cliente: { nombreCompleto: '', rfc: '', direccion: '', codigoPostal: '', telefono: '', email: '' },
  poliza: { numeroPoliza: '', tipoPoliza: '', aseguradora: '', claveAgente: '', formaPago: '', moneda: 'MXN' },
  vigencia: { fechaEmision: '', vigenciaDesde: '', vigenciaHasta: '' },
  importe: { primaNeta: 0, derechoPoliza: 0, recargoPago: 0, iva: 0, primaTotal: 0, porcentajeComision: 0 },
  recibos: []
};

@Injectable({ providedIn: 'root' })
export class GeminiExtractionService {

  constructor(private readonly http: HttpClient) { }

  // ── Signals de estado ────────────────────────────────────────────────────
  readonly archivoSeleccionado = signal<File | null>(null);
  readonly datosPoliza = signal<DatosPolizaExtraidos>(structuredClone(DATOS_VACIOS));
  readonly datosExtraidos = signal<DatosPolizaExtraidos | null>(null);
  readonly extrayendo = signal<boolean>(false);
  readonly progreso = signal<number>(0);
  readonly error = signal<string>('');

  /** true cuando hay suficientes datos extraídos */
  readonly isStepComplete = computed(() => {
    const d = this.datosPoliza();
    const tieneCliente = !!d.cliente.nombreCompleto.trim();
    const tienePoliza = !!d.poliza.numeroPoliza.trim();
    const tieneVigencia = !!d.vigencia.vigenciaDesde.trim();
    const tieneImporte = d.importe.primaTotal > 0;
    return [tieneCliente, tienePoliza, tieneVigencia, tieneImporte].filter(Boolean).length >= 2;
  });

  // ── Extracción usando API de Gemini ──────────────────────────────────────
  async extractText(file: File): Promise<DatosPolizaExtraidos> {
    this.extrayendo.set(true);
    this.progreso.set(0);
    this.error.set('');
    this.archivoSeleccionado.set(file);

    try {
      this.progreso.set(10);

      const formData = new FormData();
      formData.append('modelo', environment.gemini.modelo.toString());
      formData.append('files', file);

      this.progreso.set(20);

      // Cargar archivo de formato JSON de referencia
      try {
        const responseFormato = await fetch(environment.gemini.formatoJsonPath);
        if (responseFormato.ok) {
          const blobFormato = await responseFormato.blob();
          const fileFormato = new File([blobFormato], 'formato-json.txt', { type: 'text/plain' });
          formData.append('files', fileFormato);
        } else {
          console.warn('[GeminiExtraction] No se encontró FormatoJson.txt, código:', responseFormato.status);
        }
      } catch (err) {
        console.warn('[GeminiExtraction] Error obteniendo FormatoJson.txt:', err);
      }

      this.progreso.set(30);

      // Token handled by HTTP Interceptor
      const response = await firstValueFrom(
        this.http.post<any>(environment.gemini.baseUrl, formData)
      );

      if (response?.ok && response?.result) {
        const datos = this.mapearRespuestaAPI(response.result);
        this.datosPoliza.set(datos);
        this.datosExtraidos.set(datos);
        this.progreso.set(PROGRESS_COMPLETE);
        return datos;
      } else {
        throw new Error(response?.message || 'Error en la respuesta de la API');
      }

    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error desconocido al procesar el PDF';
      this.error.set(mensaje);
      console.error('[GeminiExtractionService] Error:', err);
      this.progreso.set(0);
      throw err;
    } finally {
      this.extrayendo.set(false);
    }
  }

  // ── Mapear respuesta plana de la API al formato tipado ───────────────────
  private mapearRespuestaAPI(apiData: GeminiApiResponse): DatosPolizaExtraidos {
    const datos: DatosPolizaExtraidos = structuredClone(DATOS_VACIOS);

    try {
      // ── Cliente ──
      datos.cliente.nombreCompleto = apiData.cteNombre || '';
      datos.cliente.rfc = apiData.rfc || '';
      datos.cliente.direccion = apiData.cteDireccion || '';
      datos.cliente.codigoPostal = apiData.cp || '';
      datos.cliente.telefono = apiData.telefono || '';
      datos.cliente.email = apiData.email || '';

      // ── Póliza (con IDs numéricos de la API) ──
      datos.poliza.numeroPoliza = apiData.poliza || '';
      // 'tipo' viene como ID numérico (1=Autos, 3=Salud, 5=Vida, 7=Diversos)
      const tipoId = typeof apiData.tipo === 'number' ? apiData.tipo : Number(apiData.tipo);
      datos.poliza.tipoPoliza = TIPO_SEGURO_MAP[tipoId] ?? this.normalizeTipoPoliza(apiData.ramo || '');
      datos.poliza.aseguradora = apiData.aseguradora || '';
      datos.poliza.claveAgente = apiData.cveAgente || '';
      // formaPago viene como ID numérico (1=Anual, 2=Semestral, 3=Trimestral, 4=Bimestral, 5=Mensual)
      const formaPagoId = typeof apiData.formaPago === 'number' ? apiData.formaPago : Number(apiData.formaPago);
      datos.poliza.formaPago = FORMA_PAGO_MAP[formaPagoId] ?? (apiData.formaPago?.toString() || '');
      // moneda viene como ID numérico (0/1=MXN, 2=USD)
      const monedaId = typeof apiData.moneda === 'number' ? apiData.moneda : Number(apiData.moneda);
      datos.poliza.moneda = MONEDA_MAP[monedaId] ?? 'MXN';

      // ── Vigencia ──
      datos.vigencia.fechaEmision = apiData.fechaEmision || '';
      datos.vigencia.vigenciaDesde = apiData.vigenciaDe || '';
      datos.vigencia.vigenciaHasta = apiData.vigenciaA || '';

      // ── Importes ──
      datos.importe.primaNeta = this.parseNumber(apiData.primaneta || apiData.primaNeta);
      datos.importe.derechoPoliza = this.parseNumber(apiData.derecho);
      datos.importe.recargoPago = this.parseNumber(apiData.recargo);
      datos.importe.iva = this.parseNumber(apiData.iva);

      const primaTotal = this.parseNumber(apiData.primaTotal);
      datos.importe.primaTotal = primaTotal > 0
        ? primaTotal
        : datos.importe.primaNeta + datos.importe.derechoPoliza + datos.importe.recargoPago + datos.importe.iva;

      datos.importe.porcentajeComision = this.parseNumber(apiData.comision);

      if (Array.isArray(apiData.recibos) && apiData.recibos.length > 0) {
        datos.recibos = apiData.recibos.map((r: GeminiReciboResponse, idx: number) => {
          const primaNeta = this.parseNumber(r.primaneta || r.primaNeta);
          const iva = this.parseNumber(r.iva);
          const primaTotal = this.parseNumber(r.primaTotal);

          return {
            numero: r.serie || idx + 1,
            fechaInicio: r.vigenciaDe || '',
            fechaFin: r.vigenciaA || '',
            primaNeta: primaNeta,
            iva: iva,
            primaTotal: primaTotal > 0 ? primaTotal : (primaNeta + iva)
          };
        });
      } else {
        // → Gemini no regresó recibos: generarlos automáticamente
        datos.recibos = this.generarRecibos(
          datos.poliza.formaPago,
          datos.importe.primaTotal,
          datos.importe.iva,
          datos.vigencia.vigenciaDesde,
          datos.vigencia.vigenciaHasta
        );
      }


    } catch (err) {
      console.error('[GeminiExtraction] Error mapeando respuesta:', err);
    }

    return datos;
  }

  /**
   * Fallback para identificar el ramo cuando no viene el campo 'tipo' numérico.
   * Usa palabras clave del campo 'ramo' en texto libre.
   */
  private normalizeTipoPoliza(ramo: string): string {
    if (!ramo) return 'Diversos / Otros';
    const r = ramo.toLowerCase();
    if (r.includes('auto') || r.includes('vehiculo') || r.includes('camion')) return 'Autos';
    if (r.includes('vida') || r.includes('vid') || r.includes('fallecimiento') || r.includes('supervivencia') || r.includes('accidentes')) return 'Vida';
    if (r.includes('salud') || r.includes('enfermedad') || r.includes('gastos medicos') || r.includes('gastos médicos') || r.includes('medico') || r.includes('médico') || r.includes('gmm')) return 'Salud';
    return 'Diversos / Otros';
  }

  /**
   * Genera recibos automáticamente cuando la API no los devuelve.
   * La prima total se divide entre el número de recibos.
   */
  private generarRecibos(
    formaPago: string,
    primaTotal: number,
    iva: number,
    vigenciaDe: string,
    vigenciaA: string
  ): ReciboExtraido[] {
    const numRecibos = RECIBOS_POR_FORMA_PAGO[formaPago] ?? 1;
    const primaXRecibo = primaTotal / numRecibos;
    const ivaXRecibo = iva / numRecibos;

    const fechaInicio = vigenciaDe ? new Date(vigenciaDe) : new Date();
    const fechaFin = vigenciaA ? new Date(vigenciaA) : new Date();
    const rangoMs = fechaFin.getTime() - fechaInicio.getTime();
    const stepMs = rangoMs / numRecibos;

    return Array.from({ length: numRecibos }, (_, i) => {
      const inicio = new Date(fechaInicio.getTime() + stepMs * i);
      const fin = new Date(fechaInicio.getTime() + stepMs * (i + 1));
      return {
        numero: i + 1,
        fechaInicio: inicio.toISOString().split('T')[0],
        fechaFin: fin.toISOString().split('T')[0],
        primaNeta: Math.round((primaXRecibo - ivaXRecibo) * 100) / 100,
        iva: Math.round(ivaXRecibo * 100) / 100,
        primaTotal: Math.round(primaXRecibo * 100) / 100
      };
    });
  }

  private parseNumber(value: number | string | null | undefined): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const cleaned = value.replaceAll(/[$, ]/g, '');
      const parsed = Number.parseFloat(cleaned);
      return Number.isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  reset(): void {
    this.archivoSeleccionado.set(null);
    this.datosPoliza.set(structuredClone(DATOS_VACIOS));
    this.datosExtraidos.set(null);
    this.extrayendo.set(false);
    this.progreso.set(0);
    this.error.set('');
  }
}
