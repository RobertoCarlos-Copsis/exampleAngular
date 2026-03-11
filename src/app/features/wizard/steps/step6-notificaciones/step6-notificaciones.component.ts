import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-step6-notificaciones',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    FormsModule
  ],
  templateUrl: './step6-notificaciones.component.html',
  styleUrls: ['./step6-notificaciones.component.scss']
})
export class Step6NotificacionesComponent {
  @Output() nextStep = new EventEmitter<void>();

  notificaciones = {
    renovaciones: true,
    siniestros: false,
    comisiones: true,
    generales: true
  };

  onContinue() {
    this.nextStep.emit();
  }
}
