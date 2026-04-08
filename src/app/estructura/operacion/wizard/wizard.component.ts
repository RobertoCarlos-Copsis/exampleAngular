import { Component, inject, ChangeDetectorRef, ViewChild } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { ThemeService } from '../../../core/services/theme.service';
import { AsistenteService } from '../../../core/services/asistente.service';

@Component({
  selector: 'app-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.scss']
})
export class WizardComponent {
  
  @ViewChild('stepper') stepper!: MatStepper;
  
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly servicioAsistente = inject(AsistenteService);
  
  constructor(public servicioTema: ThemeService) {}

  /** Índice del paso activo para control bidireccional */
  pasoActivo = 0;

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

  /** Marca el paso como completado y avanza al siguiente usando control centralizado */
  avanzar(indicePaso: number) {
    console.log(`Paso ${indicePaso + 1} completado. Solicitando cambio de paso.`);
    
    // 1. Marcar el paso como completado visualmente
    this.pasosCompletados[indicePaso] = true;
    
    // 2. Notificar al servicio (opcional, para persistencia)
    this.servicioAsistente.actualizarEstado({ pasoActual: indicePaso + 2 });

    // 3. Forzar cambio de índice en el siguiente ciclo para evitar conflictos con OnPush
    setTimeout(() => {
      this.pasoActivo = indicePaso + 1;
      this.cdr.detectChanges();
    }, 50);
  }

  reiniciarTodo() {
    this.pasosCompletados = [false, false, false, false, false, false, false];
    this.pasoActivo = 0;
    this.stepper?.reset();
    this.cdr.detectChanges();
  }

  alCambiarPaso(evento: StepperSelectionEvent) {
    this.pasoActivo = evento.selectedIndex;
  }
}
