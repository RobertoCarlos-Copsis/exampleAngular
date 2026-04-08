import { Injectable } from '@angular/core';
import { EstadoAsistente, Recibo } from '../models/wizard.model';

export const ESTADISTICAS_CONSTANTES = {
  TASA_NETA: 0.8,
  TASA_IVA: 0.16,
  TASA_DERECHOS: 0.04,
  PROYECCION_CRECIMIENTO: 1.5
};

export interface TarjetaKpi {
  titulo: string;
  valor: string | number;
  icono: string;
  color: string;
  tendencia: 'up' | 'down' | 'stable';
  porcentajeCambio?: number;
}

export interface DatosGrafica {
  series: number[] | { name: string; data: number[] }[];
  labels?: string[];
  categories?: string[];
}

@Injectable({ providedIn: 'root' })
export class EstadisticasService {

  // Cálculos financieros basados en el estado del Asistente
  calcularTotalPrima(recibos: Recibo[]): number {
    return recibos.reduce((acumulado: number, r: Recibo) => acumulado + (r.prima || 0), 0);
  }

  calcularTotalComision(totalPrima: number, porcentajeComision: number): number {
    return (totalPrima * (porcentajeComision || 0)) / 100;
  }

  calcularNumRecibos(recibos: Recibo[]): number {
    return recibos.length;
  }

  calcularNumAlertas(notificaciones: EstadoAsistente['notificaciones']): number {
    if (!notificaciones) return 0;
    return Object.values(notificaciones).filter((n: any) => typeof n === 'object' && n?.activa).length;
  }

  // Cálculo de cobranza real basado en recibos pagados
  calcularPorcentajeCobranza(recibos: Recibo[]): number {
    if (!recibos || recibos.length === 0) return 0;
    const pagados = recibos.filter(r => r.estado === 'Pagado').length;
    return Math.round((pagados / recibos.length) * 100);
  }

  generarKPIs(estado: EstadoAsistente): TarjetaKpi[] {
    const totalPrima = this.calcularTotalPrima(estado.recibos);
    const totalComision = this.calcularTotalComision(totalPrima, estado.porcentajeComision);
    const numAlertas = this.calcularNumAlertas(estado.notificaciones);

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
        valor: estado.recibos.length,
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

  generarDatosPastel(totalPrima: number): DatosGrafica {
    const total = Math.round(totalPrima || 1000);
    const neta = Math.round(total * ESTADISTICAS_CONSTANTES.TASA_NETA);
    const impuestos = Math.round(total * ESTADISTICAS_CONSTANTES.TASA_IVA);
    const derechos = Math.round(total * ESTADISTICAS_CONSTANTES.TASA_DERECHOS);

    return {
      series: [neta, impuestos, derechos],
      labels: ["Prima Neta", "Impuestos", "Derechos"]
    };
  }

  generarDatosBarras(totalComision: number): DatosGrafica {
    const actual = Math.round(totalComision || 500);
    const proyectado = Math.round(actual * ESTADISTICAS_CONSTANTES.PROYECCION_CRECIMIENTO);

    return {
      series: [{ name: "MXN", data: [actual, proyectado] }],
      categories: ["Actual", "Proyectado"]
    };
  }
}
