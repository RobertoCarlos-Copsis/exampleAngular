import { Component, Output, EventEmitter, inject, ChangeDetectionStrategy } from '@angular/core';
import { WizardService } from '../../../../../core/services/wizard.service';
import { Receipt, EstadoRecibo } from '../../../../../core/models/wizard.model';

@Component({
  selector: 'app-step4-recibos',
  templateUrl: './step4-recibos.component.html',
  styleUrls: ['./step4-recibos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Step4RecibosComponent {
  @Output() nextStep = new EventEmitter<void>();

  private readonly wizardService = inject(WizardService);
  state = this.wizardService.state;

  showBitacora = false;
  activeIndex = 0;
  actionSuccess: { type: string, message: string } | null = null;
  activeDialog: { type: string, title: string, subtitle: string, icon: string } | null = null;
  actionText = '';
  isSending = false;

  bitacoraItems = [
    { fecha: 'Hoy, 10:24 AM', evento: 'Recibo detectado por IA', icon: 'auto_awesome', color: 'blue' },
    { fecha: 'Ayer, 03:15 PM', evento: 'Póliza digitalizada correctamente', icon: 'description', color: 'green' }
  ];


  get reciboActual(): Receipt {
    return this.state().receipts[this.activeIndex] || { id: 0, status: EstadoRecibo.Pendiente, vencimiento: '15/04/2025', prima: 0, periodo: '' };
  }

  selectReceipt(index: number) {
    this.activeIndex = index;
    // Reiniciar bitácora simulada para cada recibo si fuera necesario
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
    this.isSending = false;
  }

  onActionClick(action: string) {
    if (action === 'Bitácora') {
      this.openBitacora();
      return;
    }

    const client = this.state().client;
    const policy = this.state().policy.data;
    const amount = this.reciboActual.prima;
    const formattedAmount = amount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
    const dueDate = this.reciboActual.vencimiento || 'pronto';

    const iconMap: Record<string, string> = {
      'Email': 'mail',
      'SMS': 'smartphone',
      'WhatsApp': 'chat'
    };

    this.activeDialog = {
      type: action,
      title: `Enviar ${action}`,
      subtitle: `Comunicación para Recibo ${this.activeIndex + 1}`,
      icon: iconMap[action] || 'info'
    };

    if (action === 'Email') {
      this.actionText = `Estimado ${client.name},\n\nLe informamos que su recibo por ${formattedAmount} de la póliza ${policy.policyNumber} vence el ${dueDate}. Puede realizar su pago de forma segura en el siguiente enlace:\n\nhttps://quattrocrm.mx/pago\n\nQuedamos a sus órdenes.`;
    } else if (action === 'SMS') {
      this.actionText = `Q-Seguros: Hola ${client.name}, tu recibo de ${formattedAmount} vence el ${dueDate}. Paga aquí: https://q-seg.mx/p`;
    } else if (action === 'WhatsApp') {
      this.actionText = `Hola *${client.name}*! 👋\n\nTe saludo de Q-Seguros. Te comparto tu link de pago para el recibo de ${formattedAmount} con vencimiento al ${dueDate}:\n\n🔗 https://wa.link/pago-seguros\n\nQuedo a tus órdenes.`;
    }
  }

  confirmAction() {
    if (!this.activeDialog) return;

    this.isSending = true;

    // Simular retraso de red
    setTimeout(() => {
      this.isSending = false;
      this.actionSuccess = {
        type: this.activeDialog!.type,
        message: `¡${this.activeDialog!.type} enviado exitosamente a ${this.activeDialog!.type === 'Email' ? this.state().client.email : this.state().client.phone}!`
      };

      const colorMap: Record<string, string> = {
        'Email': 'blue',
        'SMS': 'pink',
        'WhatsApp': 'green'
      };

      // Agregar a la bitácora
      this.bitacoraItems.unshift({
        fecha: 'Hace un momento',
        evento: `${this.activeDialog!.type} enviado: ${this.activeDialog!.type === 'Email' ? 'Recordatorio de pago' : 'Link de cobro'}`,
        icon: this.activeDialog!.icon,
        color: colorMap[this.activeDialog!.type] || 'gray'
      });

      setTimeout(() => {
        this.closeDialog();
      }, 2000);
    }, 1500);
  }

  togglePaid(index: number) {
    const receipts = [...this.state().receipts];
    const r = { ...receipts[index] };
    r.status = r.status === EstadoRecibo.Pagado ? EstadoRecibo.Pendiente : EstadoRecibo.Pagado;
    receipts[index] = r;
    this.wizardService.updateState({ receipts });

    // Agregar a la bitácora
    this.bitacoraItems.unshift({
      fecha: 'Hace un momento',
      evento: `Estado cambiado a: ${r.status}`,
      icon: r.status === EstadoRecibo.Pagado ? 'check_circle' : 'pending',
      color: r.status === EstadoRecibo.Pagado ? 'green' : 'yellow'
    });
  }

  onContinue() {
    this.wizardService.nextStep();
    this.nextStep.emit();
  }

  get totalPrimas() {
    return (this.state().receipts || []).reduce((acc: number, r: any) => acc + (r.prima || 0), 0);
  }

  get comisionEstimada() {
    const pct = this.state().commissionPercentage || 0;
    return (this.totalPrimas * pct) / 100;
  }

  get isFormValid(): boolean {
    if (!this.activeDialog) return true;

    // Validar mensaje no vacío
    if (!this.actionText || this.actionText.trim().length === 0) return false;

    // Validar según tipo
    if (this.activeDialog.type === 'Email') {
      const email = this.state().client.email;
      return !!email && email.includes('@');
    } else {
      const phone = this.state().client.phone;
      return !!phone && phone.trim().length >= 8;
    }
  }
}
