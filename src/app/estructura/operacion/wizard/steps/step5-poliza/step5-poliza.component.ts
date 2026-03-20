import { Component, Output, EventEmitter, inject } from '@angular/core';
import { WizardService } from '../../../../../core/services/wizard.service';

@Component({
  selector: 'app-step5-poliza',
  templateUrl: './step5-poliza.component.html',
  styleUrls: ['./step5-poliza.component.scss']
})
export class Step5PolizaComponent {
  @Output() nextStep = new EventEmitter<void>();

  private wizardService = inject(WizardService);
  state = this.wizardService.state;
  selectedMethod: string | null = null;

  onMethodSelect(method: string) {
    this.selectedMethod = method;
  }

  onContinue() {
    this.wizardService.nextStep();
    this.nextStep.emit();
  }
}
