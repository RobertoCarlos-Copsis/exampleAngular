import { Component } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.scss']
})
export class WizardComponent {
  
  constructor(public themeService: ThemeService) {}

  /** Rastrea qué pasos han sido completados para mostrar el check verde */
  completedSteps: boolean[] = [false, false, false, false, false, false, false];

  stepSummaries: string[] = [
    'Sube tu póliza',
    'Datos extraídos',
    'Configura comisiones',
    'Gestión de pagos',
    'Opciones de entrega',
    'Configura alertas',
    'Resumen de demo'
  ];

  getCurrentStepSummary(index: number): string {
    return this.stepSummaries[index] || '';
  }

  /** Marca el paso como completado y avanza al siguiente */
  advance(stepIndex: number, stepper: MatStepper) {
    this.completedSteps[stepIndex] = true;
    // setTimeout asegura que Angular detecte [completed]=true ANTES de invocar next()
    setTimeout(() => stepper.next(), 0);
  }

  resetAll(stepper: MatStepper) {
    this.completedSteps = [false, false, false, false, false, false, false];
    stepper.reset();
  }

  onStepChange(event: StepperSelectionEvent) { }
}
