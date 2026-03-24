import { Injectable, signal, computed } from '@angular/core';

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  details: any;
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

  log(action: string, details: any, status: 'success' | 'error' | 'info' = 'info'): void {
    const newLog: AuditLog = {
      id: crypto.randomUUID ? crypto.randomUUID() : new Date().getTime().toString(),
      timestamp: new Date().toISOString(),
      action,
      details,
      status
    };

    this.logsSignal.update(current => [newLog, ...current]);
    this.saveToStorage();
    
    // Console output for development
    if (status === 'error') {
      console.error(`[Audit] ${action}:`, details);
    } else {
      console.log(`[Audit] ${action}:`, details);
    }
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
