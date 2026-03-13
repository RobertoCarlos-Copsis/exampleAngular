import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgxDropzoneModule } from 'ngx-dropzone';
import * as pdfjsLib from 'pdfjs-dist';
import { WizardService } from '../../../../../core/services/wizard.service';

// Set the worker source path
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/** Estados posibles de la demo de importación */
type UploadState = 'idle' | 'processing' | 'done';

@Component({
  selector: 'app-step1-importar',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    NgxDropzoneModule
  ],
  templateUrl: './step1-importar.component.html',
  styleUrls: ['./step1-importar.component.scss']
})
export class Step1ImportarComponent {
  @Output() nextStep = new EventEmitter<void>();

  state: UploadState = 'idle';
  files: File[] = [];

  constructor(private wizardService: WizardService) {}

  /** Handles real file upload from the hidden file input or dropzone */
  async onSelect(event: any) {
    const file: File = event.addedFiles[0];
    if (!file) return;
    this.files = [file];
    
    // Check if it's a PDF or Image
    const isPdf = file.type === 'application/pdf';
    const isImage = file.type.startsWith('image/');
    
    if (!isPdf && !isImage) {
      alert('Solo se aceptan archivos PDF o Imágenes');
      return;
    }

    this.state = 'processing';

    try {
      if (isPdf) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += pageText + ' ';
        }
        
        this.processExtractedText(fullText.toLowerCase());
      } else {
        // Simular extracción de imagen
        setTimeout(() => {
          this.processExtractedText('segmento auto modelo 2024 póliza 987654');
        }, 3000);
      }

    } catch (error) {
      console.error('Error al procesar el archivo', error);
      alert('Hubo un error interpretando el documento.');
      this.state = 'idle';
    }
  }

  onCapturePhoto() {
    // Simular apertura de cámara y procesado
    this.state = 'processing';
    setTimeout(() => {
      this.processExtractedText('foto de póliza vida capturada modelo 2024');
    }, 4000);
  }

  private processExtractedText(rawString: string) {
    const extractedData = {
      name: rawString.includes('nombre') ? 'Juan Pérez (Extraído de PDF)' : 'Juan Pérez García',
      email: 'juan.perez@example.com',
      phone: '5512345678',
      address: 'Lomas de Chapultepec, CDMX',
      policyNumber: 'POL-' + Math.floor(100000 + Math.random() * 900000),
      concept: rawString.includes('auto') ? 'Seguro de Auto' : 'Seguro de Vida',
      agentCode: 'AG-7788',
      startDate: '01/01/2024',
      endDate: '01/01/2025'
    };

    this.wizardService.updateState({
      client: {
        name: extractedData.name,
        email: extractedData.email,
        phone: extractedData.phone,
        address: extractedData.address
      },
      policy: {
        data: extractedData
      }
    });

    this.state = 'done';
    setTimeout(() => {
      this.nextStep.emit();
    }, 1000);
  }

  onRemove(event: any) {
    this.state = 'idle';
  }

  triggerFileInput() {
    // Keep for Capture Photo or fallback, but primarily use dropzone
  }
}
