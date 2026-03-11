import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-step3-completar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSliderModule,
    MatButtonModule,
    MatIconModule,
    DecimalPipe
  ],
  templateUrl: './step3-completar.component.html',
  styleUrls: ['./step3-completar.component.scss']
})
export class Step3CompletarComponent {
  @Output() nextStep = new EventEmitter<void>();

  completarForm: FormGroup;

  // Simulamos datos de comisiones basados en el total de primas
  primaTotal = 45392.42;
  comisionPorcentaje = 10;

  get comisionCalculada() {
    return (this.primaTotal * this.comisionPorcentaje) / 100;
  }

  constructor(private fb: FormBuilder) {
    this.completarForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]]
    });
  }

  updateComision(value: number) {
    this.comisionPorcentaje = value;
  }

  formatLabel(value: number): string {
    return `${value}%`;
  }

  onSave() {
    if (this.completarForm.valid) {
      this.nextStep.emit();
    } else {
      this.completarForm.markAllAsTouched();
    }
  }
}
