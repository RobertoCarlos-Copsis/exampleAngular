export interface FileUploadResult {
    fileName: string;
    fileSize: number;
    mimeType: string;
    uploadDate: string; // ISO string format
    originalFile: File;
}

export interface ValidationError {
    hasError: boolean;
    message: string;
}
