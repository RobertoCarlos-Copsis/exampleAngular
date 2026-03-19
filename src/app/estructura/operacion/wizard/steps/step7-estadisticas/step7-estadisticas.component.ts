import { Component, Output, EventEmitter, computed, inject } from '@angular/core';
import { CommonModule, DecimalPipe, CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { NgApexchartsModule } from 'ng-apexcharts';
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
  ApexPlotOptions
} from "ng-apexcharts";
import { WizardService } from '../../../../../core/services/wizard.service';
import { GeminiExtractionService } from '../../../../../core/services/gemini-extraction.service';

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
};

@Component({
  selector: 'app-step7-estadisticas',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    CurrencyPipe,
    NgApexchartsModule,
    MatIconModule
  ],
  templateUrl: './step7-estadisticas.component.html',
  styleUrls: ['./step7-estadisticas.component.scss']
})
export class Step7EstadisticasComponent {
  @Output() resetWizard = new EventEmitter<void>();

  private wizardService = inject(WizardService);
  private geminiService = inject(GeminiExtractionService);
  state = this.wizardService.state;

  get totalPrima() {
    return this.state().receipts.reduce((acc: number, r: any) => acc + (r.prima || 0), 0);
  }

  get totalComision() {
    return (this.totalPrima * (this.state().commissionPercentage || 0)) / 100;
  }

  get numRecibos() {
    return this.state().receipts.length;
  }

  get numAlertas() {
    return Object.values(this.state().notifications).filter((n: any) => n.active).length;
  }

  // Configuración de la Gráfica de Pastel (Distribución)
  public pieChart = computed<Partial<ChartOptions>>(() => {
    const total = this.totalPrima || 1000;
    const neta = total * 0.8;
    const impuestos = total * 0.16;
    const derechos = total * 0.04;

    return {
      series: [neta, impuestos, derechos],
      chart: {
        width: "100%",
        type: "pie",
        fontFamily: 'Inter, sans-serif'
      },
      labels: ["Prima Neta", "Impuestos", "Derechos"],
      colors: ['#2563EB', '#9333EA', '#F59E0B'],
      legend: { position: 'bottom' },
      dataLabels: { enabled: true },
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
    const actual = this.totalComision || 500;
    const proyectado = actual * 1.5;

    return {
      series: [{ name: "MXN", data: [actual, proyectado] }],
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
      xaxis: { categories: ["Actual", "Proyectado"] },
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
