import { Component, Output, EventEmitter, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WizardService } from '../../../../../core/services/wizard.service';
import { cleanDigits } from '../../../../../core/utils/formatters';

@Component({
  selector: 'app-step3-completar',
  templateUrl: './step3-completar.component.html',
  styleUrls: ['./step3-completar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Step3CompletarComponent implements OnInit {
  @Output() nextStep = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly wizardService = inject(WizardService);
  
  completarForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.pattern(String.raw`^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$`)]],
    telefono: ['', [Validators.required, Validators.pattern(String.raw`^[0-9]{10}$`)]]
  });

  state = this.wizardService.state;
  comisionPorcentaje = 0;

  ngOnInit(): void {
    const s = this.state();
    const phoneValue = s.client.phone || '';
    this.completarForm.patchValue({
      email: s.client.email || '',
      telefono: cleanDigits(phoneValue).substring(0, 10)
    });
    this.comisionPorcentaje = s.commissionPercentage || 0;
  }

  get totalPrima() {
    return this.state().receipts.reduce((acc, r) => acc + (r.prima || 0), 0);
  }

  get comisionCalculada() {
    return (this.totalPrima * this.comisionPorcentaje) / 100;
  }

  handlePhoneInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const digits = cleanDigits(input.value).substring(0, 10);
    input.value = digits;
    this.completarForm.patchValue({ telefono: digits }, { emitEvent: false });
  }

  updateComision(event: Event) {
    const input = event.target as HTMLInputElement;
    const val = Number(input.value);
    if (val >= 0 && val <= 100) {
      this.comisionPorcentaje = val;
      this.wizardService.updateState({ commissionPercentage: val });
    }
  }

  onSave() {
    if (this.completarForm.valid) {
      this.wizardService.updateState({
        client: {
          ...this.state().client,
          email: this.completarForm.value.email,
          phone: this.completarForm.value.telefono
        },
        commissionPercentage: this.comisionPorcentaje
      });
      this.wizardService.nextStep();
      this.nextStep.emit();
    } else {
      this.completarForm.markAllAsTouched();
    }
  }

  trackByReceiptId(_index: number, receipt: { id: number }): number {
    return receipt.id;
  }
}
