import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-step7-estadisticas',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    DecimalPipe
  ],
  templateUrl: './step7-estadisticas.component.html',
  styleUrls: ['./step7-estadisticas.component.scss']
})
export class Step7EstadisticasComponent {
  @Output() resetWizard = new EventEmitter<void>();

  // Datos simulados para las estadisticas
  estadisticas = {
    primaTotal: 45392.42,
    comisionGenerada: 4539.24,
    porcentajeComision: 10
  };

  onProbarOtra() {
    this.resetWizard.emit();
  }
}
