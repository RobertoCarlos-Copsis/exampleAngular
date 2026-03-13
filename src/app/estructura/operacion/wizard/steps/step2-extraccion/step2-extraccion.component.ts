import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { WizardService, WizardState } from '../../../../../core/services/wizard.service';

@Component({
  selector: 'app-step2-extraccion',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    DatePipe,
    MatIconModule
  ],
  templateUrl: './step2-extraccion.component.html',
  styleUrls: ['./step2-extraccion.component.scss']
})
export class Step2ExtraccionComponent implements OnInit {
  @Output() nextStep = new EventEmitter<void>();

  state = this.wizardService.state;
  loading = true;

  constructor(private wizardService: WizardService) {}

  ngOnInit(): void {
    // La señal del servicio se actualiza automáticamente.
    // Solo simulamos el retraso visual.
    setTimeout(() => {
      if (this.state().receipts.length === 0) {
        this.wizardService.updateState({
          receipts: [
            { id: 1, periodo: 'Mensual 1', prima: 1250.00, estado: 'Pendiente', vencimiento: '15/05/2024' },
            { id: 2, periodo: 'Mensual 2', prima: 1250.00, estado: 'Pendiente', vencimiento: '15/06/2024' }
          ]
        });
      }
      this.loading = false;
    }, 1500);
  }

  onConfirm() {
    this.wizardService.nextStep();
    this.nextStep.emit();
  }
}
