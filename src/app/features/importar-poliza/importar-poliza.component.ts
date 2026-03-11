import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import moment from 'moment';
import { FileUploadResult, ValidationError } from './importar-poliza.model';

@Component({
    selector: 'app-importar-poliza',
    standalone: true,
    imports: [
        CommonModule,
        MatStepperModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule,
        DecimalPipe
    ],
    templateUrl: './importar-poliza.component.html',
    styleUrls: ['./importar-poliza.component.scss']
})
export class ImportarPolizaComponent {
    // Referencia al input real de archivo que se oculta para customizar diseño
    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

    isDragging = false;
    uploadedFile: FileUploadResult | null = null;

    // Archivos permitidos de acuerdo a las especificaciones
    readonly allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    readonly maxSizeMB = 10;

    constructor(private snackBar: MatSnackBar) { }

    // Manejadores de Drag and Drop
    onDragOver(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.isDragging = true;
    }

    onDragLeave(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.isDragging = false;
    }

    onDrop(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.isDragging = false;

        const files = event.dataTransfer?.files;
        if (files && files.length > 0) {
            this.handleFile(files[0]);
        }
    }

    // Manejador del Input Tradicional
    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.handleFile(input.files[0]);
        }
    }

    // Disparadores de acción
    triggerFileInput() {
        this.fileInput.nativeElement.accept = '.pdf, .jpg, .jpeg, .png';
        this.fileInput.nativeElement.click();
    }

    triggerCamera() {
        // Usamos el API de HTML5 para sugerir la cámara del dispositivo móvil
        this.fileInput.nativeElement.accept = 'image/*;capture=camera';
        this.fileInput.nativeElement.click();
    }

    // Lógica principal de manejo y validación del archivo
    private handleFile(file: File) {
        const validation = this.validateFile(file);
        if (validation.hasError) {
            this.showError(validation.message);
            // Reseteamos el input para permitir reintento con el mismo archivo fallido
            this.fileInput.nativeElement.value = '';
            return;
        }

        // Usamos Moment.js como se requirió para formatear la fecha
        this.uploadedFile = {
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
            uploadDate: moment().format('DD/MM/YYYY HH:mm:ss'),
            originalFile: file
        };

        this.showSuccess(`Archivo cargado con éxito: ${file.name}`);
    }

    private validateFile(file: File): ValidationError {
        // 1. Validar Tipo de Archivo
        if (!this.allowedTypes.includes(file.type)) {
            return {
                hasError: true,
                message: 'Formato no permitido. Solo se aceptan PDF, JPG o PNG.'
            };
        }

        // 2. Validar Tamaño del Archivo
        const sizeInMB = file.size / (1024 * 1024);
        if (sizeInMB > this.maxSizeMB) {
            return {
                hasError: true,
                message: `El archivo supera el tamaño máximo de ${this.maxSizeMB}MB.`
            };
        }

        return { hasError: false, message: '' };
    }

    private showError(message: string) {
        this.snackBar.open(message, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar'], // Posibilidad de extender en un estilo global
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
        });
    }

    private showSuccess(message: string) {
        this.snackBar.open(message, 'OK', {
            duration: 3000,
            panelClass: ['success-snackbar'],
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
        });
    }

    removeFile() {
        this.uploadedFile = null;
        this.fileInput.nativeElement.value = '';
    }
}
