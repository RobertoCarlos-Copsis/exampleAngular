import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { WizardService, WizardState } from '../../../../core/services/wizard.service';

@Component({
  selector: 'app-step2-extraccion',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    DatePipe
  ],
  templateUrl: './step2-extraccion.component.html',
  styleUrls: ['./step2-extraccion.component.scss']
})
export class Step2ExtraccionComponent implements OnInit {
  @Output() nextStep = new EventEmitter<void>();

  state!: WizardState;
  loading = true;

  constructor(private wizardService: WizardService) {}

  ngOnInit(): void {
    this.wizardService.state$.subscribe(s => {
      this.state = s;
    });

    // Simulamos un retraso visual estético de extracción
    setTimeout(() => {
      // Cargamos algunos recibos mock si no hay
      if (this.state.receipts.length === 0) {
        this.wizardService.updateState({
          receipts: [
            { id: 1, periodo: 'Semestre 1', prima: 14500.00, isPaid: false },
            { id: 2, periodo: 'Semestre 2', prima: 14500.00, isPaid: false }
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
