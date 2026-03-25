import { Component, Output, EventEmitter, computed, inject } from '@angular/core';
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
  styleUrls: ['./step7-estadisticas.component.scss']
})
export class Step7EstadisticasComponent {
  @Output() resetWizard = new EventEmitter<void>();

  private wizardService = inject(WizardService);
  private geminiService = inject(GeminiExtractionService);
  private estadisticasService = inject(EstadisticasService);
  state = this.wizardService.state;

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
      dataLabels: { enabled: false },
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
}
