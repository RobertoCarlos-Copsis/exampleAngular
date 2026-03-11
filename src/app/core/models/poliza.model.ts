export interface FileUploadResult {
    fileName: string;
    fileSize: number;
    mimeType: string;
    uploadDate: string; // Formateada con moment.js
    originalFile: File;
}

export interface ValidationError {
    hasError: boolean;
    message: string;
}
