import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-step2-extraccion',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    DecimalPipe,
    DatePipe
  ],
  templateUrl: './step2-extraccion.component.html',
  styleUrls: ['./step2-extraccion.component.scss']
})
export class Step2ExtraccionComponent {
  @Output() nextStep = new EventEmitter<void>();

  // Mock data basándonos en el prototipo de figma
  extractedData = {
    cliente: {
      nombre: 'Juan Pérez García',
      rfc: 'PEGJ800101XYZ',
      direccion: 'Av. Paseo de la Reforma 222, CDMX'
    },
    poliza: {
      numero: 'POL-9023841',
      ramo: 'Seguro de Auto Residente',
      aseguradora: 'GNP Seguros'
    },
    vigencia: {
      inicio: new Date(2025, 1, 15), // 15 Feb 2025
      fin: new Date(2026, 1, 15)
    },
    recibos: [
      { id: '1/2', fecha: '15 Feb 2025 - 15 Ago 2025', monto: 24238.19 },
      { id: '2/2', fecha: '15 Ago 2025 - 15 Feb 2026', monto: 21154.23 }
    ]
  };

  onConfirm() {
    this.nextStep.emit();
  }
}
