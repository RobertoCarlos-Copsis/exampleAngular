import { Component, Output, EventEmitter, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WizardService } from '../../../../../core/services/wizard.service';
import { cleanDigits } from '../../../../../core/utils/formatters';

@Component({
  selector: 'app-step3-completar',
  templateUrl: './step3-completar.component.html',
  styleUrls: ['./step3-completar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Step3CompletarComponent implements OnInit {
  @Output() siguientePaso = new EventEmitter<void>();

  private readonly constructorFormulario = inject(FormBuilder);
  private readonly servicioAsistente = inject(WizardService);

  formularioCompletar: FormGroup = this.constructorFormulario.group({
    email: ['', [Validators.required, Validators.pattern(String.raw`^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$`)]],
    telefono: ['', [Validators.required, Validators.pattern(String.raw`^[0-9]{10}$`)]]
  });

  estado = this.servicioAsistente.state;
  comisionPorcentaje = 0;

  ngOnInit(): void {
    const estadoActual = this.estado();
    const valorTelefono = estadoActual.client.phone || '';
    this.formularioCompletar.patchValue({
      email: estadoActual.client.email || '',
      telefono: cleanDigits(valorTelefono).substring(0, 10)
    });
    
    let porcentajeAutomatico = estadoActual.commissionPercentage;
    if (!porcentajeAutomatico || porcentajeAutomatico === 0) {
      const datosExtraidos = estadoActual.policy.data.extractedData;
      const comisionExtraida = datosExtraidos?.importe?.porcentajeComision || 0;
      const primaNeta = datosExtraidos?.importe?.primaNeta || 0;

      if (comisionExtraida > 0 && comisionExtraida <= 100) {
        // La IA extrajo directamente el porcentaje
        porcentajeAutomatico = comisionExtraida;
      } else if (comisionExtraida > 100 && primaNeta > 0) {
        // La IA extrajo el monto monetario de la comisión, calculamos % sobre Prima Neta
        porcentajeAutomatico = Math.round((comisionExtraida / primaNeta) * 100);
      } else {
        // Fallback inteligente basado en el ramo si no hay comisión
        const ramo = estadoActual.policy.data.concept?.toLowerCase() || '';
        if (ramo.includes('vida')) porcentajeAutomatico = 20;
        else if (ramo.includes('salud') || ramo.includes('gastos') || ramo.includes('medico')) porcentajeAutomatico = 15;
        else porcentajeAutomatico = 10; // Por defecto autos y diversos
      }
      
      // Sanitizar por si calculó algo excedido
      if (porcentajeAutomatico > 100) porcentajeAutomatico = 10;
      
      // Actualizamos estado para que aparezca ya prefijado de forma persistente
      this.servicioAsistente.updateState({ commissionPercentage: porcentajeAutomatico });
    }

    this.comisionPorcentaje = porcentajeAutomatico;
  }

  get totalPrima() {
    return this.estado().receipts.reduce((acumulado, recibo) => acumulado + (recibo.prima || 0), 0);
  }

  get comisionCalculada() {
    return (this.totalPrima * this.comisionPorcentaje) / 100;
  }

  manejarEntradaTelefono(evento: Event) {
    const entrada = evento.target as HTMLInputElement;
    const digitos = cleanDigits(entrada.value).substring(0, 10);
    entrada.value = digitos;
    this.formularioCompletar.patchValue({ telefono: digitos }, { emitEvent: false });
  }

  actualizarComision(evento: Event) {
    const entrada = evento.target as HTMLInputElement;
    const valor = Number(entrada.value);
    if (valor >= 0 && valor <= 100) {
      this.comisionPorcentaje = valor;
      this.servicioAsistente.updateState({ commissionPercentage: valor });
    }
  }

  alGuardar() {
    if (this.formularioCompletar.valid) {
      this.servicioAsistente.updateState({
        client: {
          ...this.estado().client,
          email: this.formularioCompletar.value.email,
          phone: this.formularioCompletar.value.telefono
        },
        commissionPercentage: this.comisionPorcentaje
      });
      this.servicioAsistente.nextStep();
      this.siguientePaso.emit();
    } else {
      this.formularioCompletar.markAllAsTouched();
    }
  }

  rastrearPorIdRecibo(_indice: number, recibo: { id: number }): number {
    return recibo.id;
  }
}
