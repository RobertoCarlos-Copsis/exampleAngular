import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

// ── Configuración API (basado en importador-qcrm) ──────────────────────────
const GEMINI_API_CONFIG = {
  baseUrl: 'https://apiuat.quattrocrm.mx/operaciones/gemini',
  formatoJsonPath: '/utils/docs/FormatoJson.pdf',
  token: 'eyJhbGciOiJIUzI1NiJ9.eyJhdXRob3JpdGllcyI6IntcInR5cGVcIjpcInRva2VuXCJ9Iiwib3JpZ2luIjoidW5rbm93biIsImF1ZCI6Inxjb3BzaXNBdXRvc3xhdXRvc3wiLCJzcWxJbnN0YW5jZUlkIjoidWF0LTg0Iiwic3FsSW5zdGFuY2VOYW1lIjoicXVhdHRyby11YXQtODQiLCJkYm4iOiJxdWF0dHJvMDAwMzEiLCJzb2Npb0VuYyI6InRSOHo3SVJzUllrYjlOejJlT2t1dVE9PSIsInBlcnNvbmFFbmMiOiI5NGMzcWFCVGxPQmJkVVdQQmt4RW1nPT0iLCJzdWIiOiJxMzFAcXVhdHRyb2NybS5teCIsImlhdCI6MTc3MzQxMDk2NiwiZXhwIjoxNzczNDU0MTY2fQ.oWr68kyT6cAAs9XnBTdq6Gh18tpn-Rk5WlgJ7E4ERIY',
  modelo: 0
};

// ── Interfaces ────────────────────────────────────────────────────────────
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

export interface ReciboExtraido {
  numero: number;
  fechaInicio: string;
  fechaFin: string;
  primaNeta: number;
  iva: number;
  primaTotal: number;
}

const DATOS_VACIOS: DatosPolizaExtraidos = {
  cliente: { nombreCompleto: '', rfc: '', direccion: '', codigoPostal: '', telefono: '', email: '' },
  poliza: { numeroPoliza: '', tipoPoliza: '', aseguradora: '', claveAgente: '', formaPago: '', moneda: 'MXN' },
  vigencia: { fechaEmision: '', vigenciaDesde: '', vigenciaHasta: '' },
  importe: { primaNeta: 0, derechoPoliza: 0, recargoPago: 0, iva: 0, primaTotal: 0, porcentajeComision: 0 },
  recibos: []
};

@Injectable({ providedIn: 'root' })
export class GeminiExtractionService {

  constructor(private readonly http: HttpClient) {}

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
      formData.append('modelo', GEMINI_API_CONFIG.modelo.toString());
      formData.append('files', file);

      this.progreso.set(20);

      // Cargar archivo de formato JSON de referencia
      try {
        const responseFormato = await fetch(GEMINI_API_CONFIG.formatoJsonPath);
        if (responseFormato.ok) {
          const blobFormato = await responseFormato.blob();
          const fileFormato = new File([blobFormato], 'formato-json.pdf', { type: blobFormato.type });
          formData.append('files', fileFormato);
        }
      } catch {
        console.warn('[GeminiExtraction] No se encontró FormatoJson.pdf, continuando sin él');
      }

      this.progreso.set(30);

      // ── MODO SIMULADO (Solicitado por el usuario para no consumir tokens) ──
      console.log('[GeminiExtraction] Simulando extracción (Modo Ahorro de Tokens)...');
      
      // Simulamos latencia de red e IA
      await new Promise(resolve => setTimeout(resolve, 1500));
      this.progreso.set(60);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const datosMock = this.generarDatosMock(file.name);
      
      this.progreso.set(90);
      await new Promise(resolve => setTimeout(resolve, 500));

      this.datosPoliza.set(datosMock);
      this.datosExtraidos.set(datosMock);
      this.progreso.set(100);
      
      console.log('[GeminiExtraction] Extracción simulada completada.');
      return datosMock;

      /* 
      // ── LÓGICA ORIGINAL DE API (Comentada para futura activación) ──
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${GEMINI_API_CONFIG.token}`
      });

      this.progreso.set(40);
      const response = await firstValueFrom(
        this.http.post<any>(GEMINI_API_CONFIG.baseUrl, formData, { headers })
      );

      if (response?.ok && response?.result) {
        const datos = this.mapearRespuestaAPI(response.result);
        this.datosPoliza.set(datos);
        this.datosExtraidos.set(datos);
        this.progreso.set(100);
        return datos;
      } else {
        throw new Error(response?.message || 'Error en la respuesta de la API');
      }
      */

    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error desconocido al procesar el PDF';
      this.error.set(mensaje);
      console.error('[GeminiExtractionService] Error:', err);

      // Si falla la API, usar datos simulados para demo
      const datosMock = this.generarDatosMock(file.name);
      this.datosPoliza.set(datosMock);
      this.datosExtraidos.set(datosMock);
      this.progreso.set(100);
      return datosMock;

    } finally {
      this.extrayendo.set(false);
    }
  }

  // ── Mapear respuesta plana de la API al formato tipado ───────────────────
  private mapearRespuestaAPI(apiData: any): DatosPolizaExtraidos {
    const datos: DatosPolizaExtraidos = structuredClone(DATOS_VACIOS);

    try {
      datos.cliente.nombreCompleto = apiData.conducto || apiData.conductoc || apiData.contratante || apiData.conductor || '';
      datos.cliente.rfc = apiData.rfs || apiData.rfc || '';
      datos.cliente.direccion = apiData.cteDireccion || apiData.direccion || apiData.direccionc || '';
      datos.cliente.codigoPostal = apiData.cp || apiData.codigoPostal || '';
      datos.cliente.telefono = apiData.telefono || apiData.tel || '';
      datos.cliente.email = apiData.email || apiData.correo || '';

      datos.poliza.numeroPoliza = apiData.poliza || apiData.numeroPoliza || apiData.noPoliza || '';
      datos.poliza.tipoPoliza = apiData.ramo || apiData.tipo || apiData.tipoPoliza || '';
      datos.poliza.aseguradora = apiData.aseguradora || apiData.compania || apiData.cia || '';
      datos.poliza.claveAgente = apiData.cveAgente || apiData.cveagente || apiData.claveAgente || '';
      datos.poliza.formaPago = apiData.formaPago || apiData.cvp || apiData.periodicidad || '';
      datos.poliza.moneda = apiData.moneda || 'MXN';

      datos.vigencia.fechaEmision = apiData.fechaemision || apiData.fechaEmision || '';
      datos.vigencia.vigenciaDesde = apiData.vigenciaDe || apiData.vigenciaIni || apiData.vigenciaDesde || '';
      datos.vigencia.vigenciaHasta = apiData.vigenciaA || apiData.vigenciaHasta || apiData.vigenciaFin || '';

      datos.importe.primaNeta = this.parseNumber(apiData.primaNeta || apiData.primaneta || 0);
      datos.importe.derechoPoliza = this.parseNumber(apiData.derecho || apiData.derechoPoliza || 0);
      datos.importe.recargoPago = this.parseNumber(apiData.recargo || apiData.recargoPago || 0);
      datos.importe.iva = this.parseNumber(apiData.iva || 0);
      const primaTotal = this.parseNumber(apiData.primaTotal || 0);
      datos.importe.primaTotal = primaTotal > 0
        ? primaTotal
        : datos.importe.primaNeta + datos.importe.derechoPoliza + datos.importe.recargoPago + datos.importe.iva;
      datos.importe.porcentajeComision = this.parseNumber(apiData.comision || apiData.porcentajeComision || 10);

      if (apiData.recibos && Array.isArray(apiData.recibos)) {
        datos.recibos = apiData.recibos.map((r: any, idx: number) => ({
          numero: r.serie || r.numero || idx + 1,
          fechaInicio: r.vigenciaDe || r.fechaInicio || r.vigenciaIni || '',
          fechaFin: r.vigenciaA || r.fechaFin || r.vigenciaHasta || '',
          primaNeta: this.parseNumber(r.primaNeta || r.primaneta || 0),
          iva: this.parseNumber(r.iva || 0),
          primaTotal: this.parseNumber(r.primaTotal || r.total || 0)
        }));
      }
    } catch (err) {
      console.error('[GeminiExtraction] Error mapeando respuesta:', err);
    }

    return datos;
  }

  /** Datos simulados cuando la API falla (modo demo) */
  private generarDatosMock(nombreArchivo: string): DatosPolizaExtraidos {
    const esAuto = nombreArchivo.toLowerCase().includes('auto');
    return {
      cliente: {
        nombreCompleto: 'JOSE JOSE TORRES DE LA CRUZ',
        rfc: 'TOCJ850315ABC',
        direccion: 'AV. DEL PRADO NO. 300',
        codigoPostal: '06600',
        telefono: '5512345678',
        email: 'jose.torres@email.com'
      },
      poliza: {
        numeroPoliza: 'FW998873',
        tipoPoliza: esAuto ? 'SEGURO DE AUTOMÓVIL' : 'SEGURO DE VIDA',
        aseguradora: 'Qualitas',
        claveAgente: '665534',
        formaPago: 'SEMESTRAL',
        moneda: 'MXN'
      },
      vigencia: {
        fechaEmision: '15 Feb 2025',
        vigenciaDesde: '15 Feb 2025',
        vigenciaHasta: '15 Feb 2026'
      },
      importe: {
        primaNeta: 40853,
        derechoPoliza: 2000,
        recargoPago: 1200,
        iva: 3893,
        primaTotal: 45392.42,
        porcentajeComision: 10
      },
      recibos: [
        { numero: 1, fechaInicio: '15 Feb 2025', fechaFin: '15 Ago 2025', primaNeta: 22238, iva: 2000.19, primaTotal: 24238.19 },
        { numero: 2, fechaInicio: '15 Ago 2025', fechaFin: '15 Feb 2026', primaNeta: 19154, iva: 1999.23, primaTotal: 21154.23 }
      ]
    };
  }

  private parseNumber(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const cleaned = value.replace(/[$,]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
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
