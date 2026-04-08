import { Injectable, signal, computed, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { EstadoAsistente, DatosPolizaExtraidos } from '../models/wizard.model';
import { AuditoriaService } from './auditoria.service';

const estadoInicial: EstadoAsistente = {
  pasoActual: 1,
  poliza: {
    datos: {
      numeroPoliza: '',
      concepto: '',
      aseguradora: '',
      claveAgente: '',
      formaPago: '',
      moneda: 'MXN',
      fechaInicio: '',
      fechaFin: ''
    }
  },
  cliente: {
    nombre: '',
    email: '',
    telefono: '',
    direccion: ''
  },
  recibos: [],
  porcentajeComision: 0,
  notificaciones: {
    cobranza: { activa: true },
    renovacion: { activa: true },
    siniestros: { activa: false },
    comisiones: { activa: true },
    generales: { activa: false }
  },
  bitacora: [],
  estadisticas: {},
  historialExtraccion: []
};

@Injectable({
  providedIn: 'root'
})
export class AsistenteService {
  private readonly servicioAuditoria = inject(AuditoriaService);

  // Señal principal de estado
  readonly estado = signal<EstadoAsistente>(estadoInicial);
  
  // Señales computadas para partes específicas
  readonly pasoActual = computed(() => this.estado().pasoActual);
  readonly recibos = computed(() => this.estado().recibos);

  // Observable para compatibilidad con RxJS
  readonly estado$ = toObservable(this.estado);

  constructor() {
    this.cargarDesdeLocalStorage();
  }

  private cargarDesdeLocalStorage(): void {
    const guardado = localStorage.getItem('wizard_state');
    if (guardado) {
      try {
        const parseado = JSON.parse(guardado);
        // Fusión profunda básica para asegurar que propiedades nuevas (como notificaciones)
        // existan incluso si el localStorage tiene una versión antigua.
        this.estado.set({
          ...estadoInicial,
          ...parseado,
          // Asegurar que sub-objetos críticos también se fusionen si es necesario
          notificaciones: {
            ...estadoInicial.notificaciones,
            ...(parseado.notificaciones || {})
          },
          poliza: {
            ...estadoInicial.poliza,
            ...(parseado.poliza || {})
          }
        });
      } catch (e) {
        console.error('Error al cargar el estado del asistente', e);
      }
    }
  }

  private guardarEnLocalStorage(): void {
    localStorage.setItem('wizard_state', JSON.stringify(this.estado()));
  }

  // Getter síncrono para el valor del estado actual
  get valorEstadoActual(): EstadoAsistente {
    return this.estado();
  }

  actualizarEstado(estadoParcial: Partial<EstadoAsistente>): void {
    this.estado.update(estado => ({
      ...estado,
      ...estadoParcial
    }));
    this.guardarEnLocalStorage();
  }

  siguientePaso(): void {
    const actual = this.estado().pasoActual;
    if (actual < 7) {
      this.actualizarEstado({ pasoActual: actual + 1 });
    }
  }

  pasoAnterior(): void {
    const actual = this.estado().pasoActual;
    if (actual > 1) {
      this.actualizarEstado({ pasoActual: actual - 1 });
    }
  }

  irAlPaso(paso: number): void {
    if (paso >= 1 && paso <= 7) {
      this.actualizarEstado({ pasoActual: paso });
    }
  }

  reiniciarEstado(): void {
    this.estado.set(estadoInicial);
    this.guardarEnLocalStorage();
  }

  agregarExtraccionAlHistorial(datos: DatosPolizaExtraidos): void {
    this.servicioAuditoria.registrar('Extracción de póliza completada', datos, 'success');
    
    this.estado.update(estado => ({
      ...estado,
      historialExtraccion: [
        ...(estado.historialExtraccion || []),
        {
          marcaTiempo: new Date().toISOString(),
          datos: datos
        }
      ]
    }));
    this.guardarEnLocalStorage();
  }
}
