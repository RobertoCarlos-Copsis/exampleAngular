import { Component, Output, EventEmitter, inject } from '@angular/core';
import { WizardService } from '../../../../../core/services/wizard.service';
import { GeminiExtractionService } from '../../../../../core/services/gemini-extraction.service';

@Component({
  selector: 'app-step2-extraccion',
  templateUrl: './step2-extraccion.component.html',
  styleUrls: ['./step2-extraccion.component.scss']
})
export class Step2ExtraccionComponent {
  @Output() nextStep = new EventEmitter<void>();

  private wizardService = inject(WizardService);
  public geminiService = inject(GeminiExtractionService);

  get state() {
    return this.wizardService.state;
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
          status: 'Pendiente',
          vencimiento: r.fechaInicio
        }))
      });
    }

    this.wizardService.nextStep();
    this.nextStep.emit();
  }
}
