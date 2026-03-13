import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { WizardService, WizardState } from '../../../../../core/services/wizard.service';

@Component({
  selector: 'app-step3-completar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DecimalPipe,
    MatIconModule,
    MatSliderModule
  ],
  templateUrl: './step3-completar.component.html',
  styleUrls: ['./step3-completar.component.scss']
})
export class Step3CompletarComponent implements OnInit {
  @Output() nextStep = new EventEmitter<void>();

  completarForm: FormGroup;
  state = this.wizardService.state;
  
  comisionPorcentaje = 0;

  constructor(private fb: FormBuilder, private wizardService: WizardService) {
    this.completarForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]]
    });
  }

  ngOnInit(): void {
    const s = this.state();
    this.completarForm.patchValue({
      email: s.client.email,
      telefono: s.client.phone
    });
    this.comisionPorcentaje = s.commissionPercentage || 0;
  }

  get totalPrima() {
    return this.state().receipts.reduce((acc, r) => acc + (r.prima || 0), 0);
  }

  get comisionCalculada() {
    return (this.totalPrima * this.comisionPorcentaje) / 100;
  }

  updateComision(event: any) {
    const val = Number(event.target.value);
    this.wizardService.updateState({ commissionPercentage: val });
  }

  onSave() {
    if (this.completarForm.valid) {
      this.wizardService.updateState({
        client: {
          ...this.state().client,
          email: this.completarForm.value.email,
          phone: this.completarForm.value.telefono
        }
      });
      this.wizardService.nextStep();
      this.nextStep.emit();
    } else {
      this.completarForm.markAllAsTouched();
    }
  }
}
