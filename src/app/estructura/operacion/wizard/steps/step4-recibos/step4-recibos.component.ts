import { Component, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule, DecimalPipe, CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { WizardService } from '../../../../../core/services/wizard.service';

@Component({
  selector: 'app-step4-recibos',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    CurrencyPipe,
    MatIconModule
  ],
  templateUrl: './step4-recibos.component.html',
  styleUrls: ['./step4-recibos.component.scss']
})
export class Step4RecibosComponent implements OnInit {
  @Output() nextStep = new EventEmitter<void>();

  private wizardService = inject(WizardService);
  state = this.wizardService.state;
  
  showBitacora = false;
  activeIndex = 0;
  actionSuccess: { type: string, message: string } | null = null;
  activeDialog: { type: string, title: string, subtitle: string, icon: any } | null = null;

  ngOnInit(): void {
  }

  get reciboActual() {
    return this.state().receipts[this.activeIndex] || { id: 0, estado: 'Pendiente', vencimiento: '-', prima: 0 };
  }

  selectReceipt(index: number) {
    this.activeIndex = index;
  }

  openBitacora() {
    this.showBitacora = true;
  }

  closeBitacora() {
    this.showBitacora = false;
  }

  closeDialog() {
    this.activeDialog = null;
    this.actionSuccess = null;
  }

  onActionClick(action: string) {
    if (action === 'Bitácora') {
      this.openBitacora();
      return;
    }

    this.activeDialog = {
      type: action,
      title: `Enviar ${action}`,
      subtitle: `Comunicación para Recibo ${this.activeIndex + 1}`,
      icon: null
    };
  }

  confirmAction() {
    if (!this.activeDialog) return;
    
    this.actionSuccess = { type: this.activeDialog.type, message: `¡${this.activeDialog.type} enviado exitosamente!` };
    
    setTimeout(() => {
      this.closeDialog();
    }, 1500);
  }

  togglePaid(index: number) {
    const receipts = [...this.state().receipts];
    const r = receipts[index];
    r.estado = r.estado === 'Pagado' ? 'Pendiente' : 'Pagado';
    this.wizardService.updateState({ receipts });
  }

  onContinue() {
    this.wizardService.nextStep();
    this.nextStep.emit();
  }

  get totalPrimas() {
    return this.state().receipts.reduce((acc, r) => acc + (r.prima || 0), 0);
  }

  get comisionEstimada() {
    const pct = this.state().commissionPercentage || 0;
    return (this.totalPrimas * pct) / 100;
  }
}
