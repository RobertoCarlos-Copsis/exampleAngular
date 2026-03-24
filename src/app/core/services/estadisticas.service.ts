import { Injectable, computed } from '@angular/core';
import { WizardState, Receipt } from '../models/wizard.model';

export interface KpiCard {
  titulo: string;
  valor: string | number;
  icono: string;
  color: string;
  tendencia: 'up' | 'down' | 'stable';
  porcentajeCambio?: number;
}

export interface ChartData {
  series: number[] | any[];
  labels?: string[];
  categories?: string[];
}

@Injectable({ providedIn: 'root' })
export class EstadisticasService {

  // Cálculos financieros basados en el estado del Wizard
  calcularTotalPrima(receipts: Receipt[]): number {
    return receipts.reduce((acc: number, r: Receipt) => acc + (r.prima || 0), 0);
  }

  calcularTotalComision(totalPrima: number, commissionPercentage: number): number {
    return (totalPrima * (commissionPercentage || 0)) / 100;
  }

  calcularNumRecibos(receipts: Receipt[]): number {
    return receipts.length;
  }

  calcularNumAlertas(notifications: any): number {
    if (!notifications) return 0;
    return Object.values(notifications).filter((n: any) => n.active).length;
  }

  generarKPIs(state: WizardState): KpiCard[] {
    const totalPrima = this.calcularTotalPrima(state.receipts);
    const totalComision = this.calcularTotalComision(totalPrima, state.commissionPercentage);
    const numAlertas = this.calcularNumAlertas(state.notifications);

    return [
      {
        titulo: 'Prima Total',
        valor: `$${totalPrima.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
        icono: 'payments',
        color: '#2196F3',
        tendencia: 'up',
        porcentajeCambio: 8
      },
      {
        titulo: 'Comisiones',
        valor: `$${totalComision.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
        icono: 'account_balance_wallet',
        color: '#FF9800',
        tendencia: 'stable'
      },
      {
        titulo: 'Recibos Procesados',
        valor: state.receipts.length,
        icono: 'receipt_long',
        color: '#4CAF50',
        tendencia: 'up'
      },
      {
        titulo: 'Alertas Activas',
        valor: numAlertas,
        icono: 'notifications_active',
        color: '#9C27B0',
        tendencia: numAlertas > 0 ? 'up' : 'stable'
      }
    ];
  }

  generarDatosPastel(totalPrima: number): ChartData {
    const total = totalPrima || 1000;
    const neta = total * 0.8;
    const impuestos = total * 0.16;
    const derechos = total * 0.04;

    return {
      series: [neta, impuestos, derechos],
      labels: ["Prima Neta", "Impuestos", "Derechos"]
    };
  }

  generarDatosBarras(totalComision: number): ChartData {
    const actual = totalComision || 500;
    const proyectado = actual * 1.5;

    return {
      series: [{ name: "MXN", data: [actual, proyectado] }],
      categories: ["Actual", "Proyectado"]
    };
  }
}
