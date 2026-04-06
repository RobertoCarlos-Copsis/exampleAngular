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
    telefono: ['', [Validators.required, Validators.pattern(String.raw`^[0-9]{10}$`)]],
    direccion: ['']
  });

  state = this.wizardService.state;
  comisionPorcentaje = 0;

  ngOnInit(): void {
    const s = this.state();
    const phoneValue = s.client.phone || '';
    this.completarForm.patchValue({
      email: s.client.email || '',
      telefono: cleanDigits(phoneValue).substring(0, 10),
      // Fallback para autocompletar la dirección si la IA no la encontró en la carátula
      direccion: s.client.address || ''
    });
    
    let autoPercent = s.commissionPercentage;
    if (!autoPercent || autoPercent === 0) {
      const extracted = s.policy.data.extractedData;
      const comisionExtraida = extracted?.importe?.porcentajeComision || 0;
      const primaNeta = extracted?.importe?.primaNeta || 0;

      if (comisionExtraida > 0 && comisionExtraida <= 100) {
        // La IA extrajo directamente el porcentaje
        autoPercent = comisionExtraida;
      } else if (comisionExtraida > 100 && primaNeta > 0) {
        // La IA extrajo el monto monetario de la comisión, calculamos % sobre Prima Neta
        autoPercent = Math.round((comisionExtraida / primaNeta) * 100);
      } else {
        // Fallback inteligente basado en el ramo si no hay comisión
        const ramo = s.policy.data.concept?.toLowerCase() || '';
        if (ramo.includes('vida')) autoPercent = 20;
        else if (ramo.includes('salud') || ramo.includes('gastos') || ramo.includes('medico')) autoPercent = 15;
        else autoPercent = 10; // Por defecto autos y diversos
      }
      
      // Sanitizar por si calculó algo excedido
      if (autoPercent > 100) autoPercent = 10;
      
      // Actualizamos estado para que aparezca ya prefijado de forma persistente
      this.wizardService.updateState({ commissionPercentage: autoPercent });
    }

    this.comisionPorcentaje = autoPercent;
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
          phone: this.completarForm.value.telefono,
          address: this.completarForm.value.direccion
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
