import { Component, Output, EventEmitter, computed, inject, ChangeDetectionStrategy } from '@angular/core';
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
import { AsistenteService } from '../../../../../core/services/asistente.service';
import { ServicioExtraccionGemini } from '../../../../../core/services/extraccion-gemini.service';
import { EstadisticasService } from '../../../../../core/services/estadisticas.service';

export type OpcionesGrafica = {
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
  @Output() reiniciarAsistente = new EventEmitter<void>();

  private readonly servicioAsistente = inject(AsistenteService);
  private readonly servicioGemini = inject(ServicioExtraccionGemini);
  private readonly estadisticasService = inject(EstadisticasService);
  estado = this.servicioAsistente.estado;


  get totalPrima() {
    return this.estadisticasService.calcularTotalPrima(this.estado().recibos);
  }

  get totalComision() {
    return this.estadisticasService.calcularTotalComision(this.totalPrima, this.estado().porcentajeComision);
  }

  get numRecibos() {
    return this.estadisticasService.calcularNumRecibos(this.estado().recibos);
  }

  get numAlertas() {
    return this.estadisticasService.calcularNumAlertas(this.estado().notificaciones);
  }

  get porcentajeCobranza() {
    return this.estadisticasService.calcularPorcentajeCobranza(this.estado().recibos);
  }

  // Configuración de la Gráfica de Pastel (Distribución)
  public graficaPastel = computed<Partial<OpcionesGrafica>>(() => {
    const datos = this.estadisticasService.generarDatosPastel(this.totalPrima);

    return {
      series: datos.series,
      chart: {
        width: "100%",
        type: "pie",
        fontFamily: 'Inter, sans-serif'
      },
      labels: datos.labels,
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
  public graficaBarras = computed<Partial<OpcionesGrafica>>(() => {
    const datos = this.estadisticasService.generarDatosBarras(this.totalComision);

    return {
      series: datos.series,
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
      xaxis: { categories: datos.categories },
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

  alProbarOtra() {
    this.servicioGemini.reiniciar();
    this.servicioAsistente.reiniciarEstado();
    this.reiniciarAsistente.emit();
  }
}
