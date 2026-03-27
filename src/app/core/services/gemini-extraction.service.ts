import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { DatosPolizaExtraidos } from '../models/wizard.model';
import { environment } from '../../../environments/environment';

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

      console.log('[GeminiExtraction] Enviando PDF a API de Gemini...');
      // Token handled by HTTP Interceptor
      const response = await firstValueFrom(
        this.http.post<any>(environment.gemini.baseUrl, formData)
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
  private mapearRespuestaAPI(apiData: any): DatosPolizaExtraidos {
    const datos: DatosPolizaExtraidos = structuredClone(DATOS_VACIOS);

    try {
      // ── Cliente ──
      datos.cliente.nombreCompleto = apiData.cteNombre || '';
      datos.cliente.rfc = apiData.rfc || '';
      datos.cliente.direccion = apiData.cteDireccion || '';
      datos.cliente.codigoPostal = apiData.cp || '';
      datos.cliente.telefono = apiData.telefono || '';
      datos.cliente.email = apiData.email || '';

      // ── Póliza ──
      datos.poliza.numeroPoliza = apiData.poliza || '';
      datos.poliza.tipoPoliza = this.normalizeTipoPoliza(apiData.ramo || '');
      datos.poliza.aseguradora = apiData.aseguradora || '';
      datos.poliza.claveAgente = apiData.cveAgente || '';
      datos.poliza.formaPago = apiData.formaPago || '';
      datos.poliza.moneda = apiData.moneda || 'MXN';

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

      // ── Recibos ──
      if (Array.isArray(apiData.recibos) && apiData.recibos.length > 0) {
        datos.recibos = apiData.recibos.map((r: any, idx: number) => ({
          numero: r.serie || idx + 1,
          fechaInicio: r.vigenciaDe || '',
          fechaFin: r.vigenciaA || '',
          primaNeta: this.parseNumber(r.primaneta || r.primaNeta),
          iva: this.parseNumber(r.iva),
          primaTotal: this.parseNumber(r.primaTotal)
        }));
      }

      console.log('[GeminiExtraction] Mapeo completado:', datos);

    } catch (err) {
      console.error('[GeminiExtraction] Error mapeando respuesta:', err);
    }

    return datos;
  }

  private normalizeTipoPoliza(ramo: string): string {
    if (!ramo) return 'Diversos / Otros';
    const r = ramo.toLowerCase();
    if (r.includes('auto') || r.includes('vehiculo') || r.includes('camion')) {
      return 'Autos';
    }
    if (r.includes('vida') || r.includes('fallecimiento') || r.includes('supervivencia') || r.includes('accidentes')) {
      return 'Vida';
    }
    if (r.includes('salud') || r.includes('enfermedad') || r.includes('gastos medicos') || r.includes('medico') || r.includes('gmm')) {
      return 'Salud';
    }
    return 'Diversos / Otros';
  }

  private parseNumber(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const cleaned = value.replaceAll(/[$,]/g, '');
      const parsed = parseFloat(cleaned);
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
