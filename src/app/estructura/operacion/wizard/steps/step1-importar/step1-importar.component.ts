import { Component, Output, EventEmitter, ViewChild, ElementRef, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { AsistenteService } from '../../../../../core/services/asistente.service';
import { ServicioExtraccionGemini } from '../../../../../core/services/extraccion-gemini.service';
import { ReciboExtraido, EstadoRecibo } from '../../../../../core/models/wizard.model';

/** Estados posibles de la demo de importación */
type EstadoCarga = 'idle' | 'processing' | 'done';

@Component({
  selector: 'app-step1-importar',
  templateUrl: './step1-importar.component.html',
  styleUrls: ['./step1-importar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Step1ImportarComponent {
  @Output() siguientePaso = new EventEmitter<void>();

  private readonly servicioAsistente = inject(AsistenteService);
  private readonly cdr = inject(ChangeDetectorRef);
  public servicioGemini = inject(ServicioExtraccionGemini);

  get estado(): EstadoCarga {
    if (this.servicioGemini.extrayendo()) return 'processing';
    if (this.servicioGemini.datosExtraidos()) return 'done';
    return 'idle';
  }

  get archivos(): File[] {
    const archivo = this.servicioGemini.archivoSeleccionado();
    return archivo ? [archivo] : [];
  }

  /** Maneja la carga real de archivos desde el input oculto o dropzone */
  async alSeleccionar(evento: { addedFiles: File[] }) {
    const archivo: File = evento.addedFiles[0];
    if (!archivo) return;

    // Verificar si es PDF o Imagen
    const esPdf = archivo.type === 'application/pdf';
    const esImagen = archivo.type.startsWith('image/');

    if (!esPdf && !esImagen) {
      this.servicioGemini.error.set('Solo se aceptan archivos PDF o Imágenes.');
      return;
    }

    try {
      // Usar el servicio de Gemini para extraer datos
      const datos = await this.servicioGemini.extraerTexto(archivo);

      // Actualizar el estado global del asistente con lo extraído
      this.servicioAsistente.actualizarEstado({
        cliente: {
          nombre: datos.cliente.nombreCompleto,
          email: datos.cliente.email,
          telefono: datos.cliente.telefono,
          direccion: datos.cliente.direccion
        },
        poliza: {
          datos: {
            numeroPoliza: datos.poliza.numeroPoliza,
            concepto: datos.poliza.tipoPoliza,
            aseguradora: datos.poliza.aseguradora,
            claveAgente: datos.poliza.claveAgente,
            formaPago: datos.poliza.formaPago,
            moneda: datos.poliza.moneda || 'MXN',
            fechaInicio: datos.vigencia.vigenciaDesde,
            fechaFin: datos.vigencia.vigenciaHasta,
            datosExtraidos: datos // Guardar objeto completo para pasos posteriores
          }
        },
        recibos: datos.recibos.map((r: ReciboExtraido) => ({
          id: r.numero,
          prima: r.primaTotal,
          periodo: `${r.fechaInicio} al ${r.fechaFin}`,
          vencimiento: r.fechaFin,
          estado: EstadoRecibo.Pendiente
        }))
      });

      // Registrar en el historial de extracciones
      this.servicioAsistente.agregarExtraccionAlHistorial(datos);

      // Asegurar que la UI responda de inmediato antes de emitir el avance
      this.cdr.detectChanges();

      // Avanzar automáticamente tras el procesamiento
      setTimeout(() => {
        this.siguientePaso.emit();
      }, 200);

    } catch (error) {
      console.error('Error al procesar el archivo con Gemini', error);
      // El error ya está establecido por el servicio mediante su señal de error
    }
  }

  alCapturarFoto() {
    // Simular flujo de captura (en una app real usaría Capacitor/Cordova o MediaDevices)
    console.warn('Función de cámara disponible en versión móvil.');
    this.dispararSeleccionArchivo();
  }

  alEliminar() {
    this.servicioGemini.reiniciar();
  }

  @ViewChild('fileInput') entradaArchivo!: ElementRef<HTMLInputElement>;

  dispararSeleccionArchivo() {
    this.entradaArchivo.nativeElement.accept = '.pdf,.jpg,.jpeg,.png';
    this.entradaArchivo.nativeElement.click();
  }

  alSeleccionarArchivo(evento: Event) {
    const entrada = evento.target as HTMLInputElement;
    if (entrada.files && entrada.files.length > 0) {
      this.alSeleccionar({ addedFiles: [entrada.files[0]] });
      entrada.value = '';
    }
  }
}
