import { Component, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule, DecimalPipe, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { WizardService } from '../../../../../core/services/wizard.service';

@Component({
  selector: 'app-step3-completar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DecimalPipe,
    CurrencyPipe,
    MatIconModule
  ],
  templateUrl: './step3-completar.component.html',
  styleUrls: ['./step3-completar.component.scss']
})
export class Step3CompletarComponent implements OnInit {
  @Output() nextStep = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private wizardService = inject(WizardService);
  
  completarForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]]
  });

  state = this.wizardService.state;
  comisionPorcentaje = 0;

  ngOnInit(): void {
    const s = this.state();
    this.completarForm.patchValue({
      email: s.client.email || '',
      telefono: s.client.phone || ''
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
    const value = input.value.replace(/\D/g, '').slice(0, 10);
    this.completarForm.patchValue({ telefono: value }, { emitEvent: false });
  }

  updateComision(event: any) {
    const val = Number(event.target.value);
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
}
