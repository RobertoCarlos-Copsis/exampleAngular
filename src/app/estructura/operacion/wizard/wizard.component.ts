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
  
  constructor(public servicioTema: ThemeService) {}

  /** Rastrea qué pasos han sido completados para mostrar el check verde */
  pasosCompletados: boolean[] = [false, false, false, false, false, false, false];

  resumenesPasos: string[] = [
    'Sube tu póliza',
    'Datos extraídos',
    'Configura comisiones',
    'Gestión de pagos',
    'Opciones de entrega',
    'Configura alertas',
    'Resumen de demo'
  ];

  obtenerResumenPasoActual(indice: number): string {
    return this.resumenesPasos[indice] || '';
  }

  /** Marca el paso como completado y avanza al siguiente */
  avanzar(indicePaso: number, stepper: MatStepper) {
    this.pasosCompletados[indicePaso] = true;
    // setTimeout asegura que Angular detecte [completed]=true ANTES de invocar next()
    setTimeout(() => stepper.next(), 0);
  }

  reiniciarTodo(stepper: MatStepper) {
    this.pasosCompletados = [false, false, false, false, false, false, false];
    stepper.reset();
  }

  alCambiarPaso(evento: StepperSelectionEvent) { }
}
