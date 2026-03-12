import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

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
  private stateSubject = new BehaviorSubject<WizardState>(initialState);
  state$ = this.stateSubject.asObservable();

  constructor() {}

  get currentState(): WizardState {
    return this.stateSubject.value;
  }

  updateState(partialState: Partial<WizardState>): void {
    this.stateSubject.next({
      ...this.currentState,
      ...partialState
    });
  }

  nextStep(): void {
    if (this.currentState.currentStep < 7) {
      this.updateState({ currentStep: this.currentState.currentStep + 1 });
    }
  }

  prevStep(): void {
    if (this.currentState.currentStep > 1) {
      this.updateState({ currentStep: this.currentState.currentStep - 1 });
    }
  }

  goToStep(step: number): void {
    if (step >= 1 && step <= 7) {
      this.updateState({ currentStep: step });
    }
  }

  resetState(): void {
    this.stateSubject.next(initialState);
  }
}
