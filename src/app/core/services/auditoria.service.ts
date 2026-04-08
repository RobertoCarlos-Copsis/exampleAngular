import { Injectable, signal, computed } from '@angular/core';

export interface RegistroAuditoria {
  id: string;
  marcaTiempo: string;
  accion: string;
  detalles: any; // Usar 'any' para metadatos de log flexibles
  estado: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class AuditoriaService {
  private readonly señalRegistros = signal<RegistroAuditoria[]>([]);
  readonly registros = computed(() => this.señalRegistros());

  constructor() {
    this.cargarDesdeAlmacenamiento();
  }

  registrar(accion: string, detalles: any = null, estado: 'success' | 'error' | 'info' = 'info'): void {
    const nuevoRegistro: RegistroAuditoria = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      marcaTiempo: new Date().toISOString(),
      accion,
      detalles,
      estado
    };

    this.señalRegistros.update(actual => [nuevoRegistro, ...actual]);
    this.guardarEnAlmacenamiento();
  }

  limpiarRegistros(): void {
    this.señalRegistros.set([]);
    localStorage.removeItem('wizard_audit_logs');
  }

  private cargarDesdeAlmacenamiento(): void {
    const guardado = localStorage.getItem('wizard_audit_logs');
    if (guardado) {
      try {
        this.señalRegistros.set(JSON.parse(guardado));
      } catch (e) {
        console.error('Error al cargar registros de auditoría', e);
      }
    }
  }

  private guardarEnAlmacenamiento(): void {
    // Mantener solo los últimos 50 registros
    const registrosRecortados = this.señalRegistros().slice(0, 50);
    localStorage.setItem('wizard_audit_logs', JSON.stringify(registrosRecortados));
  }
}
