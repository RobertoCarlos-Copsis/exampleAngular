import { Component, Output, EventEmitter, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
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
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    DecimalPipe,
    NgApexchartsModule
  ],
  templateUrl: './step7-estadisticas.component.html',
  styleUrls: ['./step7-estadisticas.component.scss']
})
export class Step7EstadisticasComponent {
  @Output() resetWizard = new EventEmitter<void>();

  state = this.wizardService.state;

  constructor(private wizardService: WizardService) {}

  get totalPrima() {
    return this.state().receipts.reduce((acc: number, r: any) => acc + (r.prima || 0), 0);
  }

  get totalComision() {
    return (this.totalPrima * this.state().commissionPercentage) / 100;
  }

  get numRecibos() {
    return this.state().receipts.length;
  }

  get numAlertas() {
    return Object.values(this.state().notifications).filter((n: any) => n.active).length;
  }

  // Configuración de la Gráfica de Pastel (Distribución)
  public pieChart = computed<Partial<ChartOptions>>(() => {
    const total = this.totalPrima;
    const neta = total * 0.8;
    const impuestos = total * 0.16;
    const derechos = total * 0.04;

    return {
      series: [neta, impuestos, derechos],
      chart: {
        width: "100%",
        type: "pie"
      },
      labels: ["Prima Neta", "Impuestos", "Derechos"],
      colors: ['#2563EB', '#9333EA', '#F59E0B'],
      legend: {
        position: 'bottom'
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: "bottom"
            }
          }
        }
      ]
    };
  });

  // Configuración de la Gráfica de Barras (Comisiones vs Proyectado)
  public barChart = computed<Partial<ChartOptions>>(() => {
    const actual = this.totalComision;
    const proyectado = actual * 1.4;

    return {
      series: [
        {
          name: "Comisiones (MXN)",
          data: [actual, proyectado]
        }
      ],
      chart: {
        type: "bar",
        height: 350,
        toolbar: {
          show: false
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%",
          borderRadius: 8
        }
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories: ["Actual", "Proyectado"]
      },
      yaxis: {
        title: {
          text: "MXN"
        }
      },
      colors: ['#16A34A', '#D1FAE5'],
      fill: {
        opacity: 1
      }
    };
  });

  onProbarOtra() {
    this.resetWizard.emit();
  }
}
