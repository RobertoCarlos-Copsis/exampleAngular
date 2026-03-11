import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/** Estados posibles de la demo de importación */
type UploadState = 'idle' | 'processing' | 'done';

@Component({
  selector: 'app-step1-importar',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './step1-importar.component.html',
  styleUrls: ['./step1-importar.component.scss']
})
export class Step1ImportarComponent {
  @Output() nextStep = new EventEmitter<void>();

  state: UploadState = 'idle';

  /** Simula el proceso de subida + análisis IA, tal como el prototipo Figma */
  simulateUpload() {
    if (this.state !== 'idle') return;

    // Paso 1: Mostrar estado de procesamiento
    this.state = 'processing';

    // Paso 2: Después de ~2.5s mostramos "listo" y luego avanzamos al stepper
    setTimeout(() => {
      this.state = 'done';
      setTimeout(() => {
        this.nextStep.emit();
      }, 800);
    }, 2500);
  }
}
