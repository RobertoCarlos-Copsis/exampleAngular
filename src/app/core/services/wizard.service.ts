import { Injectable, signal, computed } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

export interface WizardState {
  currentStep: number;
  policy: {
    data: any;
  };
  client: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  receipts: any[];
  commissionPercentage: number;
  notifications: {
    cobranza: { active: boolean };
    renovacion: { active: boolean };
    siniestros: { active: boolean };
    comisiones: { active: boolean };
    generales: { active: boolean };
    [key: string]: { active: boolean };
  };
  logs: string[];
  statistics: any;
}

const initialState: WizardState = {
  currentStep: 1,
  policy: {
    data: {}
  },
  client: {
    name: '',
    email: '',
    phone: '',
    address: ''
  },
  receipts: [],
  commissionPercentage: 0,
  notifications: {
    cobranza: { active: true },
    renovacion: { active: true },
    siniestros: { active: false },
    comisiones: { active: true },
    generales: { active: false }
  },
  logs: [],
  statistics: {}
};

@Injectable({
  providedIn: 'root'
})
export class WizardService {
  // Señal principal de estado (pública para consumo directo, o usar un getter)
  readonly state = signal<WizardState>(initialState);
  
  // Señales computadas para partes específicas
  readonly currentStep = computed(() => this.state().currentStep);
  readonly receipts = computed(() => this.state().receipts);

  // Observable para compatibilidad con código existente (RxJS)
  readonly state$ = toObservable(this.state);

  constructor() {}

  // Getter síncrono para el valor del estado actual
  get currentStateValue(): WizardState {
    return this.state();
  }

  // Update compatible con el patrón anterior pero usando señales
  updateState(partialState: Partial<WizardState>): void {
    this.state.update(state => ({
      ...state,
      ...partialState
    }));
  }

  nextStep(): void {
    const current = this.state().currentStep;
    if (current < 7) {
      this.updateState({ currentStep: current + 1 });
    }
  }

  prevStep(): void {
    const current = this.state().currentStep;
    if (current > 1) {
      this.updateState({ currentStep: current - 1 });
    }
  }

  goToStep(step: number): void {
    if (step >= 1 && step <= 7) {
      this.updateState({ currentStep: step });
    }
  }

  resetState(): void {
    this.state.set(initialState);
  }
}
