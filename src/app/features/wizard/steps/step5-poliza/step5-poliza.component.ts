import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-step5-poliza',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './step5-poliza.component.html',
  styleUrls: ['./step5-poliza.component.scss']
})
export class Step5PolizaComponent {
  @Output() nextStep = new EventEmitter<void>();

  constructor(private snackBar: MatSnackBar) { }

  diasRestantes = 365; // Simulación para la UI

  onDeliveryOption(option: string) {
    this.snackBar.open(`Opción seleccionada: ${option}. Enlace generado.`, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  onContinue() {
    this.nextStep.emit();
  }
}
