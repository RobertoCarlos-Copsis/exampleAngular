import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-step4-recibos',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    DecimalPipe
  ],
  templateUrl: './step4-recibos.component.html',
  styleUrls: ['./step4-recibos.component.scss']
})
export class Step4RecibosComponent {
  @Output() nextStep = new EventEmitter<void>();

  reciboActual = {
    id: '1/2',
    monto: 24238.19,
    vencimiento: '15 Feb 2025',
    estado: 'PENDIENTE'
  };

  constructor(private snackBar: MatSnackBar) { }

  onActionClick(action: string) {
    this.snackBar.open(`${action} configurado/enviado exitosamente.`, 'Cerrar', {
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
