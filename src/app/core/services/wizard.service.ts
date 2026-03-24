import { Injectable, signal, computed, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { WizardState, PolicyData, DatosPolizaExtraidos } from '../models/wizard.model';
import { AuditService } from './audit.service';

const initialState: WizardState = {
  currentStep: 1,
  policy: {
    data: {
      policyNumber: '',
      concept: '',
      aseguradora: '',
      agentCode: '',
      formaPago: '',
      moneda: 'MXN',
      startDate: '',
      endDate: ''
    }
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
  statistics: {},
  extractionHistory: []
};

@Injectable({
  providedIn: 'root'
})
export class WizardService {
  private auditService = inject(AuditService);

  // Señal principal de estado (pública para consumo directo, o usar un getter)
  readonly state = signal<WizardState>(initialState);
  
  // Señales computadas para partes específicas
  readonly currentStep = computed(() => this.state().currentStep);
  readonly receipts = computed(() => this.state().receipts);

  // Observable para compatibilidad con código existente (RxJS)
  readonly state$ = toObservable(this.state);

  constructor() {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage(): void {
    const saved = localStorage.getItem('wizard_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.state.set(parsed);
      } catch (e) {
        console.error('Error loading wizard state', e);
      }
    }
  }

  private saveToLocalStorage(): void {
    localStorage.setItem('wizard_state', JSON.stringify(this.state()));
  }

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
    this.saveToLocalStorage();
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
    this.saveToLocalStorage();
  }

  addExtractionToHistory(data: DatosPolizaExtraidos): void {
    this.auditService.log('Extracción de póliza completada', data, 'success');
    
    this.state.update(state => ({
      ...state,
      extractionHistory: [
        ...(state.extractionHistory || []),
        {
          timestamp: new Date().toISOString(),
          data: data
        }
      ]
    }));
    this.saveToLocalStorage();
  }
}
