import { Component, Output, EventEmitter, computed, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import {
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart,
  ApexFill,
  ApexDataLabels,
  ApexLegend,
  ApexAxisChartSeries,
  ApexXAxis,
  ApexYAxis,
  ApexPlotOptions,
  ApexTooltip
} from "ng-apexcharts";
import { WizardService } from '../../../../../core/services/wizard.service';
import { GeminiExtractionService } from '../../../../../core/services/gemini-extraction.service';
import { EstadisticasService } from '../../../../../core/services/estadisticas.service';

export type ChartOptions = {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
  fill: ApexFill;
  legend: ApexLegend;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  colors: string[];
  tooltip: ApexTooltip;
};

@Component({
  selector: 'app-step7-estadisticas',
  templateUrl: './step7-estadisticas.component.html',
  styleUrls: ['./step7-estadisticas.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Step7EstadisticasComponent {
  @Output() resetWizard = new EventEmitter<void>();

  private readonly wizardService = inject(WizardService);
  private readonly geminiService = inject(GeminiExtractionService);
  private readonly estadisticasService = inject(EstadisticasService);
  state = this.wizardService.state;
  downloading = signal<boolean>(false);

  get totalPrima() {
    return this.estadisticasService.calcularTotalPrima(this.state().receipts);
  }

  get totalComision() {
    return this.estadisticasService.calcularTotalComision(this.totalPrima, this.state().commissionPercentage);
  }

  get numRecibos() {
    return this.estadisticasService.calcularNumRecibos(this.state().receipts);
  }

  get numAlertas() {
    return this.estadisticasService.calcularNumAlertas(this.state().notifications);
  }

  get porcentajeCobranza() {
    return this.estadisticasService.calcularPorcentajeCobranza(this.state().receipts);
  }

  // Configuración de la Gráfica de Pastel (Distribución)
  public pieChart = computed<Partial<ChartOptions>>(() => {
    const data = this.estadisticasService.generarDatosPastel(this.totalPrima);

    return {
      series: data.series,
      chart: {
        width: "100%",
        type: "pie",
        fontFamily: 'Inter, sans-serif'
      },
      labels: data.labels,
      colors: ['#2563EB', '#9333EA', '#F59E0B'],
      legend: { position: 'bottom' },
      dataLabels: { 
        enabled: true,
        formatter: function (val: number) {
          return Math.round(val) + "%";
        }
      },
      tooltip: {
        y: {
          formatter: function(val: number) {
            return "$" + Math.round(val).toLocaleString('es-MX');
          }
        }
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: { width: 200 },
            legend: { position: "bottom" }
          }
        }
      ]
    };
  });

  // Configuración de la Gráfica de Barras (Comisiones)
  public barChart = computed<Partial<ChartOptions>>(() => {
    const data = this.estadisticasService.generarDatosBarras(this.totalComision);

    return {
      series: data.series,
      chart: {
        type: "bar",
        height: 300,
        toolbar: { show: false },
        fontFamily: 'Inter, sans-serif'
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "45%",
          borderRadius: 6
        }
      },
      dataLabels: {
        enabled: true,
        formatter: function (val: number) {
          return "$" + Math.round(val).toLocaleString('es-MX');
        }
      },
      xaxis: { categories: data.categories },
      yaxis: {
        labels: {
          formatter: function (val: number) {
            return "$" + Math.round(val).toLocaleString('es-MX');
          }
        }
      },
      tooltip: {
        y: {
          formatter: function (val: number) {
            return "$" + Math.round(val).toLocaleString('es-MX');
          }
        }
      },
      colors: ['#16A34A', '#D1FAE5'],
      fill: { opacity: 1 }
    };
  });

  onProbarOtra() {
    this.geminiService.reset();
    this.wizardService.resetState();
    this.resetWizard.emit();
  }

  descargarReporte() {
    this.downloading.set(true);
    
    // Simular generación de PDF y descargar un TXT con el resumen
    setTimeout(() => {
      this.downloading.set(false);
      
      const policy = this.state().policy.data;
      const client = this.state().client;
      const receipts = this.state().receipts;
      
      const content = `
        RESUMEN DE PÓLIZA - qCRM 2.0
        ============================
        Póliza: ${policy.policyNumber}
        Aseguradora: ${policy.aseguradora}
        Cliente: ${client.name}
        Email: ${client.email}
        Dirección: ${client.address}
        
        RESUMEN FINANCIERO
        ==================
        Prima Total: ${this.totalPrima.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
        Comisión (${this.state().commissionPercentage}%): ${this.totalComision.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
        Recibos Totales: ${receipts.length}
        % de Cobranza: ${this.porcentajeCobranza}%
        
        DETALLE DE RECIBOS
        ==================
        ${receipts.map((r, i) => `Recibo ${i + 1}: ${r.status} - ${r.prima.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}`).join('\n        ')}
      `.trim();

      const blob = new Blob([content], { type: 'text/plain' });
      const url = globalThis.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Reporte_Poliza_${policy.policyNumber || 'QCRM'}.txt`;
      a.click();
      globalThis.URL.revokeObjectURL(url);
    }, 2000);
  }

  verData(item: any) {
    const dataFormatted = JSON.stringify(item.data, null, 2);
    // En un entorno real usaríamos un modal premium, aquí usamos un alert con formato para prototipado rápido
    alert(`DETALLE DE EXTRACCIÓN IA:\n\n${dataFormatted}`);
  }
}
