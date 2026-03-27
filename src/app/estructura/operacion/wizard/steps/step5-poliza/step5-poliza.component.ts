import { Component, Output, EventEmitter, inject, ChangeDetectionStrategy } from '@angular/core';
import { WizardService } from '../../../../../core/services/wizard.service';

@Component({
  selector: 'app-step5-poliza',
  templateUrl: './step5-poliza.component.html',
  styleUrls: ['./step5-poliza.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Step5PolizaComponent {
  @Output() nextStep = new EventEmitter<void>();

  private readonly wizardService = inject(WizardService);
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
