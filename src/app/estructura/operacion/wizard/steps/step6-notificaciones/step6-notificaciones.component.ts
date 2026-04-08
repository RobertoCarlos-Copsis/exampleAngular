import { Component, Output, EventEmitter, inject, ChangeDetectionStrategy } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { AsistenteService } from '../../../../../core/services/asistente.service';

@Component({
  selector: 'app-step6-notificaciones',
  templateUrl: './step6-notificaciones.component.html',
  styleUrls: ['./step6-notificaciones.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Step6NotificacionesComponent {
  @Output() siguientePaso = new EventEmitter<void>();

  private readonly servicioAsistente = inject(AsistenteService);
  estado = this.servicioAsistente.estado;

  alternarNotificacion(clave: string, evento: MatSlideToggleChange) {
    const activado = evento.checked;
    const notificacionesActuales = { ...this.estado().notificaciones };
    notificacionesActuales[clave] = { ...notificacionesActuales[clave], activa: activado };
    this.servicioAsistente.actualizarEstado({ notificaciones: notificacionesActuales });
  }

  alContinuar() {
    this.servicioAsistente.siguientePaso();
    this.siguientePaso.emit();
  }
}
