import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { WizardService, WizardState } from '../../../../../core/services/wizard.service';

import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-step4-recibos',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    MatIconModule
  ],
  templateUrl: './step4-recibos.component.html',
  styleUrls: ['./step4-recibos.component.scss']
})
export class Step4RecibosComponent implements OnInit {
  @Output() nextStep = new EventEmitter<void>();

  state = this.wizardService.state;
  activeIndex = 0;

  constructor(private wizardService: WizardService) { }

  ngOnInit(): void {
    // La señal del servicio maneja el estado.
  }

  get reciboActual() {
    return this.state().receipts[this.activeIndex] || { id: 0, estado: 'Pendiente', vencimiento: '-', prima: 0 };
  }

  selectReceipt(index: number) {
    this.activeIndex = index;
  }

  togglePaidStatus(index: number) {
    const currentReceipts = this.state().receipts;
    const updatedReceipts = [...currentReceipts];
    updatedReceipts[index] = {
      ...updatedReceipts[index],
      estado: updatedReceipts[index].estado === 'Pagado' ? 'Pendiente' : 'Pagado'
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
