import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { WizardService, WizardState } from '../../../../core/services/wizard.service';

@Component({
  selector: 'app-step4-recibos',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe
  ],
  templateUrl: './step4-recibos.component.html',
  styleUrls: ['./step4-recibos.component.scss']
})
export class Step4RecibosComponent implements OnInit {
  @Output() nextStep = new EventEmitter<void>();

  state!: WizardState;

  constructor(private wizardService: WizardService) { }

  ngOnInit(): void {
    this.wizardService.state$.subscribe(s => this.state = s);
  }

  togglePaidStatus(index: number) {
    const updatedReceipts = [...this.state.receipts];
    updatedReceipts[index] = {
      ...updatedReceipts[index],
      isPaid: !updatedReceipts[index].isPaid
    };
    this.wizardService.updateState({ receipts: updatedReceipts });
  }

  onActionClick(action: string) {
    // This could optionally open a beautiful Bootstrap modal instead of just snackbar.
    alert(`${action} configurado/enviado exitosamente.`);
  }

  onContinue() {
    this.wizardService.nextStep();
    this.nextStep.emit();
  }
}
