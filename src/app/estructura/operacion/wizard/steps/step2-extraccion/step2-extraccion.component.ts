import { Component, Output, EventEmitter, inject, ChangeDetectionStrategy } from '@angular/core';
import { WizardService } from '../../../../../core/services/wizard.service';
import { GeminiExtractionService } from '../../../../../core/services/gemini-extraction.service';
import { EstadoRecibo } from '../../../../../core/models/wizard.model';

@Component({
  selector: 'app-step2-extraccion',
  templateUrl: './step2-extraccion.component.html',
  styleUrls: ['./step2-extraccion.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Step2ExtraccionComponent {
  @Output() nextStep = new EventEmitter<void>();

  private readonly wizardService = inject(WizardService);
  public geminiService = inject(GeminiExtractionService);

  get state() {
    return this.wizardService.state;
  }

  /** True when page was reloaded and state was restored from localStorage */
  get isRestoredSession(): boolean {
    const hasHistory = (this.wizardService.state().extractionHistory || []).length > 0;
    const hasNoActiveFile = !this.geminiService.archivoSeleccionado();
    return hasHistory && hasNoActiveFile;
  }

  onConfirm() {
    // Sincronizar recibos extraídos al estado global si aún no están
    const datosExtraidos = this.geminiService.datosExtraidos();
    if (datosExtraidos && datosExtraidos.recibos.length > 0) {
      this.wizardService.updateState({
        receipts: datosExtraidos.recibos.map(r => ({
          id: r.numero,
          periodo: `Recibo ${r.numero}`,
          prima: r.primaTotal,
          status: EstadoRecibo.Pendiente,
          vencimiento: r.fechaInicio
        }))
      });
    }

    this.wizardService.nextStep();
    this.nextStep.emit();
  }
}
