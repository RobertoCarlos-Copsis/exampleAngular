import { Component, Output, EventEmitter, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { WizardService } from '../../../../../core/services/wizard.service';
import { GeminiExtractionService } from '../../../../../core/services/gemini-extraction.service';

/** Estados posibles de la demo de importación */
type UploadState = 'idle' | 'processing' | 'done';

@Component({
  selector: 'app-step1-importar',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './step1-importar.component.html',
  styleUrls: ['./step1-importar.component.scss']
})
export class Step1ImportarComponent {
  @Output() nextStep = new EventEmitter<void>();

  private wizardService = inject(WizardService);
  public geminiService = inject(GeminiExtractionService);

  get state(): UploadState {
    if (this.geminiService.extrayendo()) return 'processing';
    if (this.geminiService.datosExtraidos()) return 'done';
    return 'idle';
  }

  get files(): File[] {
    const file = this.geminiService.archivoSeleccionado();
    return file ? [file] : [];
  }

  /** Handles real file upload from the hidden file input or dropzone */
  async onSelect(event: any) {
    const file: File = event.addedFiles[0];
    if (!file) return;
    
    // Check if it's a PDF or Image
    const isPdf = file.type === 'application/pdf';
    const isImage = file.type.startsWith('image/');
    
    if (!isPdf && !isImage) {
      alert('Solo se aceptan archivos PDF o Imágenes');
      return;
    }

    try {
      // Usar el servicio de Gemini para extraer datos
      const datos = await this.geminiService.extractText(file);
      
      // Actualizar el estado global del wizard con lo extraído
      this.wizardService.updateState({
        client: {
          name: datos.cliente.nombreCompleto,
          email: datos.cliente.email,
          phone: datos.cliente.telefono,
          address: datos.cliente.direccion
        },
        policy: {
          data: {
            policyNumber: datos.poliza.numeroPoliza,
            concept: datos.poliza.tipoPoliza,
            agentCode: datos.poliza.claveAgente,
            startDate: datos.vigencia.vigenciaDesde,
            endDate: datos.vigencia.vigenciaHasta,
            extractedData: datos // Guardar objeto completo para pasos posteriores
          }
        }
      });

      // Avanzar automáticamente después de un breve delay para mostrar el estado "done"
      setTimeout(() => {
        this.nextStep.emit();
      }, 1500);

    } catch (error) {
      console.error('Error al procesar el archivo con Gemini', error);
      alert('Hubo un error interpretando el documento con IA.');
    }
  }

  onCapturePhoto() {
    // Simular flujo de captura (en una app real usaría Capacitor/Cordova o MediaDevices)
    // Para la demo, lanzamos un archivo mock o simplemente disparamos el servicio con un delay
    alert('Función de cámara disponible en versión móvil. Simulando carga...');
    // Se podría disparar triggerFileInput() como fallback
    this.triggerFileInput();
  }

  onRemove(event: any) {
    this.geminiService.reset();
  }

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  triggerFileInput() {
    this.fileInput.nativeElement.accept = '.pdf,.jpg,.jpeg,.png';
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.onSelect({ addedFiles: [input.files[0]] });
      input.value = '';
    }
  }
}
