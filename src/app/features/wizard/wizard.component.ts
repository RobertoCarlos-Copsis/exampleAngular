import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { Step1ImportarComponent } from './steps/step1-importar/step1-importar.component';
import { Step2ExtraccionComponent } from './steps/step2-extraccion/step2-extraccion.component';
import { Step3CompletarComponent } from './steps/step3-completar/step3-completar.component';
import { Step4RecibosComponent } from './steps/step4-recibos/step4-recibos.component';
import { Step5PolizaComponent } from './steps/step5-poliza/step5-poliza.component';
import { Step6NotificacionesComponent } from './steps/step6-notificaciones/step6-notificaciones.component';
import { Step7EstadisticasComponent } from './steps/step7-estadisticas/step7-estadisticas.component';

@Component({
  selector: 'app-wizard',
  standalone: true,
  imports: [
    CommonModule,
    MatStepperModule,
    MatIconModule,
    MatButtonModule,
    Step1ImportarComponent,
    Step2ExtraccionComponent,
    Step3CompletarComponent,
    Step4RecibosComponent,
    Step5PolizaComponent,
    Step6NotificacionesComponent,
    Step7EstadisticasComponent
  ],
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.scss']
})
export class WizardComponent {

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
  advance(stepIndex: number, stepper: any) {
    this.completedSteps[stepIndex] = true;
    // setTimeout asegura que Angular detecte [completed]=true ANTES de invocar next()
    setTimeout(() => stepper.next(), 0);
  }

  resetAll(stepper: any) {
    this.completedSteps = [false, false, false, false, false, false, false];
    stepper.reset();
  }

  onStepChange(event: any) { }
}
