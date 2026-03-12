import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import * as pdfjsLib from 'pdfjs-dist';
import { WizardService } from '../../../../core/services/wizard.service';

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
    MatIconModule
  ],
  templateUrl: './step1-importar.component.html',
  styleUrls: ['./step1-importar.component.scss']
})
export class Step1ImportarComponent {
  @Output() nextStep = new EventEmitter<void>();

  state: UploadState = 'idle';

  constructor(private wizardService: WizardService) {}

  /** Handles real file upload from the hidden file input */
  async onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;
    
    // Check if it's a PDF
    if (file.type !== 'application/pdf') {
      alert('Solo se aceptan archivos PDF');
      return;
    }

    this.state = 'processing';

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + ' ';
      }
      
      // Basic extraction matching regex / simulated finding from raw text.
      // E.g., looking for common policy keywords.
      const rawString = fullText.toLowerCase();
      const extractedData = {
        name: rawString.includes('nombre') ? 'Juan Pérez (Auto-Extraído)' : 'Juan Pérez (Default)',
        email: rawString.includes('correo') ? 'juan@example.com (Auto)' : '',
        phone: rawString.includes('telefono') ? '5512345678' : '',
        address: 'Av. Autogenerada 123',
        policyNumber: 'POL-' + Math.floor(Math.random() * 10000),
        concept: rawString.includes('auto') ? 'Seguro de Auto' : 'Seguro de Vida',
        agentCode: rawString.includes('agente') ? 'AG-999' : 'AG-123',
        startDate: new Date().toLocaleDateString('es-MX'),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('es-MX')
      };

      // Save raw text and extracted data to WizardService state
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
      }, 800);

    } catch (error) {
      console.error('Error al parsear el PDF', error);
      alert('Hubo un error interpretando el documento PDF.');
      this.state = 'idle';
    }
  }

  triggerFileInput() {
    document.getElementById('fileUploadInput')?.click();
  }
}
