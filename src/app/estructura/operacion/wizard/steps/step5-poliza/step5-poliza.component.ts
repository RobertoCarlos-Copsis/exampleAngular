import { Component, Output, EventEmitter, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { WizardService } from '../../../../../core/services/wizard.service';

export interface Step5Dialog {
  type: 'TuPoliza' | 'App' | 'Renovacion';
  title: string;
  icon: string;
  subtitle: string;
}

@Component({
  selector: 'app-step5-poliza',
  templateUrl: './step5-poliza.component.html',
  styleUrls: ['./step5-poliza.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Step5PolizaComponent {
  @Output() nextStep = new EventEmitter<void>();

  private readonly wizardService = inject(WizardService);
  private readonly cdr = inject(ChangeDetectorRef);

  state = this.wizardService.state;
  selectedMethod: string | null = null;

  activeDialog: Step5Dialog | null = null;
  dialogSuccess = false;
  isSending = false;
  renovacionFecha = '';

  private readonly DIALOG_CONFIG: Record<string, Step5Dialog> = {
    TuPoliza: { type: 'TuPoliza', title: 'Enviar por TuPoliza', icon: 'mail', subtitle: 'Envío de la póliza por correo con landing personalizado' },
    App:      { type: 'App',      title: 'Compartir en App',   icon: 'phone_android', subtitle: 'El cliente accederá a su póliza desde la app móvil' },
    Renovacion: { type: 'Renovacion', title: 'Programar Renovación', icon: 'sync', subtitle: 'Recibe un recordatorio automático antes del vencimiento' }
  };

  onMethodSelect(method: string) {
    this.selectedMethod = method;
    this.activeDialog = this.DIALOG_CONFIG[method] ?? null;
    this.dialogSuccess = false;
    this.isSending = false;
    this.cdr.markForCheck();
  }

  closeDialog() {
    this.activeDialog = null;
    this.dialogSuccess = false;
    this.cdr.markForCheck();
  }

  confirmDialog() {
    this.isSending = true;
    this.cdr.markForCheck();

    // Simulate async send (replace with real API call if needed)
    setTimeout(() => {
      this.isSending = false;
      this.dialogSuccess = true;
      this.cdr.markForCheck();

      // Auto-close dialog after 2s on success
      setTimeout(() => {
        this.closeDialog();
      }, 2000);
    }, 1200);
  }

  onContinue() {
    this.wizardService.nextStep();
    this.nextStep.emit();
  }
}
