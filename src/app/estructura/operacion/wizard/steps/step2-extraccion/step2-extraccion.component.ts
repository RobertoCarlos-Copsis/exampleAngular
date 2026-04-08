import { Component, Output, EventEmitter, inject, ChangeDetectionStrategy } from '@angular/core';
import { AsistenteService } from '../../../../../core/services/asistente.service';
import { ServicioExtraccionGemini } from '../../../../../core/services/extraccion-gemini.service';
import { EstadoRecibo } from '../../../../../core/models/wizard.model';

@Component({
  selector: 'app-step2-extraccion',
  templateUrl: './step2-extraccion.component.html',
  styleUrls: ['./step2-extraccion.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Step2ExtraccionComponent {
  @Output() siguientePaso = new EventEmitter<void>();

  private readonly servicioAsistente = inject(AsistenteService);
  public servicioGemini = inject(ServicioExtraccionGemini);

  get estado() {
    return this.servicioAsistente.estado;
  }

  /** Verdadero cuando la página fue recargada y el estado fue restaurado de localStorage */
  get esSesionRestaurada(): boolean {
    const tieneHistorial = (this.servicioAsistente.estado().historialExtraccion || []).length > 0;
    const noTieneArchivoActivo = !this.servicioGemini.archivoSeleccionado();
    return tieneHistorial && noTieneArchivoActivo;
  }

  alConfirmar() {
    // Sincronizar recibos extraídos al estado global si aún no están
    const datosExtraidos = this.servicioGemini.datosExtraidos();
    if (datosExtraidos && datosExtraidos.recibos.length > 0) {
      this.servicioAsistente.actualizarEstado({
        recibos: datosExtraidos.recibos.map(r => ({
          id: r.numero,
          periodo: `Recibo ${r.numero}`,
          prima: r.primaTotal,
          estado: EstadoRecibo.Pendiente,
          vencimiento: r.fechaInicio
        }))
      });
    }

    this.servicioAsistente.siguientePaso();
    this.siguientePaso.emit();
  }
}
