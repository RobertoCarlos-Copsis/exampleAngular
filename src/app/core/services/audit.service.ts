import { Injectable, signal, computed } from '@angular/core';

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  details: any; // Using 'any' for flexible log metadata to avoid complex type casting in audit calls
  status: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private readonly logsSignal = signal<AuditLog[]>([]);
  readonly logs = computed(() => this.logsSignal());

  constructor() {
    this.loadFromStorage();
  }

  log(action: string, details: any = null, status: 'success' | 'error' | 'info' = 'info'): void {
    const newLog: AuditLog = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      timestamp: new Date().toISOString(),
      action,
      details,
      status
    };

    this.logsSignal.update(current => [newLog, ...current]);
    this.saveToStorage();
  }

  clearLogs(): void {
    this.logsSignal.set([]);
    localStorage.removeItem('wizard_audit_logs');
  }

  private loadFromStorage(): void {
    const saved = localStorage.getItem('wizard_audit_logs');
    if (saved) {
      try {
        this.logsSignal.set(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading audit logs', e);
      }
    }
  }

  private saveToStorage(): void {
    // Keep only the last 50 logs to prevent taking up too much storage
    const trimmedLogs = this.logsSignal().slice(0, 50);
    localStorage.setItem('wizard_audit_logs', JSON.stringify(trimmedLogs));
  }
}
