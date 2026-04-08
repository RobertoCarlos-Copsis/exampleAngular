import { Component, Output, EventEmitter, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { AsistenteService } from '../../../../../core/services/asistente.service';

export interface DialogoPaso5 {
  tipo: 'TuPoliza' | 'App' | 'Renovacion';
  titulo: string;
  icono: string;
  subtitulo: string;
}

@Component({
  selector: 'app-step5-poliza',
  templateUrl: './step5-poliza.component.html',
  styleUrls: ['./step5-poliza.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Step5PolizaComponent {
  @Output() siguientePaso = new EventEmitter<void>();

  private readonly servicioAsistente = inject(AsistenteService);
  private readonly cdr = inject(ChangeDetectorRef);

  estado = this.servicioAsistente.estado;
  metodoSeleccionado: string | null = null;

  dialogoActivo: DialogoPaso5 | null = null;
  exitoDialogo = false;
  enviando = false;
  fechaRenovacion = '';

  private readonly CONFIG_DIALOGO: Record<string, DialogoPaso5> = {
    TuPoliza: { tipo: 'TuPoliza', titulo: 'Enviar por TuPoliza', icono: 'mail', subtitulo: 'Envío de la póliza por correo con landing personalizado' },
    App:      { tipo: 'App',      titulo: 'Compartir en App',   icono: 'phone_android', subtitulo: 'El cliente accederá a su póliza desde la app móvil' },
    Renovacion: { tipo: 'Renovacion', titulo: 'Programar Renovación', icono: 'sync', subtitulo: 'Recibe un recordatorio automático antes del vencimiento' }
  };

  alSeleccionarMetodo(metodo: string) {
    this.metodoSeleccionado = metodo;
    this.dialogoActivo = this.CONFIG_DIALOGO[metodo] ?? null;
    this.exitoDialogo = false;
    this.enviando = false;
    this.cdr.markForCheck();
  }

  cerrarDialogo() {
    this.dialogoActivo = null;
    this.exitoDialogo = false;
    this.cdr.markForCheck();
  }

  confirmarDialogo() {
    this.enviando = true;
    this.cdr.markForCheck();

    // Simular envío asíncrono
    setTimeout(() => {
      this.enviando = false;
      this.exitoDialogo = true;
      this.cdr.markForCheck();

      // Cerrar diálogo automáticamente después de 2s al tener éxito
      setTimeout(() => {
        this.cerrarDialogo();
      }, 2000);
    }, 1200);
  }

  alContinuar() {
    this.servicioAsistente.siguientePaso();
    this.siguientePaso.emit();
  }
}
