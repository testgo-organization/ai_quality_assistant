import { useState, useCallback } from 'react';
import { useNotifications } from './useNotifications';

interface FileUploadOptions {
  maxSize?: number; // tamaño máximo en bytes
  allowedTypes?: string[]; // tipos MIME permitidos
  maxFiles?: number; // número máximo de archivos
}

interface UploadProgress {
  fileName: string;
  progress: number;
}

export function useFileUpload(options: FileUploadOptions = {}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress[]>([]);
  const { showError, showSuccess, showWarning } = useNotifications();

  const validateFile = useCallback((file: File): boolean => {
    // Validar tamaño
    if (options.maxSize && file.size > options.maxSize) {
      showError(
        'Archivo demasiado grande',
        `El archivo ${file.name} excede el tamaño máximo permitido de ${Math.round(options.maxSize / 1024 / 1024)}MB`
      );
      return false;
    }

    // Validar tipo
    if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
      showError(
        'Tipo de archivo no permitido',
        `El archivo ${file.name} no es de un tipo permitido. Tipos permitidos: ${options.allowedTypes.join(', ')}`
      );
      return false;
    }

    return true;
  }, [options.maxSize, options.allowedTypes, showError]);

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    if (options.maxFiles && files.length > options.maxFiles) {
      showWarning(
        'Demasiados archivos',
        `Solo se permite subir ${options.maxFiles} archivo${options.maxFiles === 1 ? '' : 's'}`
      );
      return;
    }

    const validFiles = Array.from(files).filter(validateFile);
    if (validFiles.length === 0) return;

    setUploading(true);
    setProgress(validFiles.map(file => ({ fileName: file.name, progress: 0 })));

    try {
      // Aquí iría la lógica de subida real
      // Este es un ejemplo simulado
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        
        // Simular progreso
        for (let p = 0; p <= 100; p += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setProgress(prev => 
            prev.map((item, index) => 
              index === i ? { ...item, progress: p } : item
            )
          );
        }
      }

      showSuccess('Archivos subidos correctamente');
    } catch (error) {
      showError(
        'Error al subir archivos',
        error instanceof Error ? error.message : 'Ocurrió un error inesperado'
      );
    } finally {
      setUploading(false);
      setProgress([]);
    }
  }, [options.maxFiles, validateFile, showSuccess, showError, showWarning]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      uploadFiles(files);
    }
  }, [uploadFiles]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
  }, []);

  return {
    uploading,
    progress,
    uploadFiles,
    handleDrop,
    handleDragOver,
  };
}
