
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { 
  Upload as UploadIcon, 
  File, 
  X, 
  Check, 
  AlertCircle, 
  FileAudio 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { API_BASE_URL } from "@/config";
import ProcessingModal from "@/components/ProcessingModal";

const POLLING_INTERVAL = 2000; // 2 segundos

interface AudioTask {
  filename: string;
  task_id: string;
  status?: string;
}

const Upload = () => {
  const { toast } = useToast();
  const { isAuthenticated, getToken, openAuthModal } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processingTasks, setProcessingTasks] = useState<AudioTask[]>([]);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => 
      file.type.includes('text') || file.type.includes('audio') || 
      file.name.endsWith('.txt') || file.name.endsWith('.csv')
    );
    
    if (validFiles.length !== newFiles.length) {
      toast({
        title: "Archivo(s) no válido(s)",
        description: "Solo se permiten archivos de texto o audio",
        variant: "destructive"
      });
    }
    
    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadAttempt = () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    uploadFiles();
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      toast({
        title: "No hay archivos",
        description: "Por favor selecciona al menos un archivo para procesar",
        variant: "destructive"
      });
      return;
    }
    setProcessing(true);
    setShowProcessingModal(true);
    const token = getToken();
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch(`${API_BASE_URL}audio/process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al enviar los archivos para procesamiento.');
      }

      const data = await response.json();
      if (!data.tasks || !Array.isArray(data.tasks)) {
        throw new Error('Respuesta del servidor inválida.');
      }

      setProcessingTasks(data.tasks);
      startPolling(data.tasks, token);
    } catch (error) {
      setProcessing(false);
      setShowProcessingModal(false);
      toast({
        title: "Error en el procesamiento",
        description: "No se pudieron procesar los archivos. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };

  const startPolling = (tasks: AudioTask[], token: string | null) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      let allCompleted = true;
      const updatedTasks = [...tasks];

      for (let i = 0; i < updatedTasks.length; i++) {
        const task = updatedTasks[i];
        if (task.status && task.status !== 'PENDING') continue;

        try {
          const response = await fetch(`${API_BASE_URL}audio/process/status/${task.task_id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) throw new Error('Error al consultar el estado del procesamiento.');
          
          const data = await response.json();
          updatedTasks[i] = { ...task, status: data.status };
          
          if (data.status === 'PENDING') {
            allCompleted = false;
          }
        } catch (err) {
          // Si hay error en una tarea, seguimos con las demás
          allCompleted = false;
        }
      }

      setProcessingTasks(updatedTasks);

      if (allCompleted) {
        clearInterval(pollingRef.current!);
        setProcessing(false);
        setProcessingTasks([]);
        setShowProcessingModal(false);
        setFiles([]);

        // Contar éxitos y fallos
        const successCount = updatedTasks.filter(t => t.status === 'SUCCESS').length;
        const failCount = updatedTasks.filter(t => t.status === 'ERROR').length;

        if (failCount === 0) {
          toast({
            title: "Procesamiento completado",
            description: `${successCount} archivo(s) procesados correctamente.`,
            variant: "default"
          });
        } else if (successCount === 0) {
          toast({
            title: "Procesamiento fallido",
            description: "Hubo problemas al procesar los archivos.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Procesamiento parcialmente completado",
            description: `${successCount} archivo(s) procesados correctamente. ${failCount} archivo(s) fallaron.`,
            variant: "default"
          });
        }
      }
    }, POLLING_INTERVAL);
  };

  // Limpiar polling al desmontar
  React.useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // Mostrar el modal automáticamente si hay tareas pendientes
  React.useEffect(() => {
    const hasPending = processingTasks.some(task => !task.status || task.status.toUpperCase() === 'PENDING');
    if (hasPending) {
      setShowProcessingModal(true);
    } else if (processingTasks.length > 0) {
      setShowProcessingModal(false);
    }
  }, [processingTasks]);

  const getFileIcon = (file: File) => {
    if (file.type.includes('audio')) return <FileAudio size={20} />;
    return <File size={20} />;
  };
  
  return (
    <>
      <ProcessingModal 
        open={showProcessingModal} 
        onClose={() => setShowProcessingModal(false)} 
        tasks={processingTasks}
      />
      <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-slate-900/50">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-2xl font-bold">Cargar Archivos</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Sube archivos de texto o audio para analizar interacciones con clientes
            </p>
          </div>
          
          <div 
            className={`glass-card p-8 border-2 border-dashed ${isDragging ? 'border-tetgoai-blue bg-tetgoai-blue/5' : 'border-gray-300 dark:border-gray-700'} rounded-lg flex flex-col items-center justify-center gap-4 transition-all cursor-pointer`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <div className="h-16 w-16 rounded-full bg-tetgoai-blue/10 flex items-center justify-center animate-pulse-slow">
              <UploadIcon className="h-8 w-8 text-tetgoai-blue" />
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-medium mb-1">
                {isDragging ? 'Suelta los archivos aquí' : 'Arrastra y suelta archivos aquí'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                o <span className="text-tetgoai-blue">haz clic para seleccionar</span>
              </p>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Formatos soportados: .txt, .csv, archivos de audio
            </p>
            
            <input
              id="file-upload"
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
              accept=".txt,.csv,audio/*"
            />
          </div>
          
          {files.length > 0 && (
            <div className="glass-card rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <h3 className="font-medium">Archivos seleccionados ({files.length})</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setFiles([])}
                  disabled={processing}
                >
                  Limpiar todos
                </Button>
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {files.map((file, index) => (
                  <div 
                    key={`${file.name}-${index}`}
                    className="p-4 border-b border-gray-200 dark:border-gray-800 last:border-0 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        {getFileIcon(file)}
                      </div>
                      <div>
                        <p className="text-sm font-medium truncate max-w-xs">{file.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {!processing && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(index);
                          }}
                          className="text-gray-500 hover:text-red-500 dark:hover:text-red-400"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50">
                <Button 
                  onClick={handleUploadAttempt} 
                  className="w-full bg-gradient-to-r from-tetgoai-blue to-tetgoai-purple hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  disabled={processing || processingTasks.length > 0}
                >
                  {(processing || processingTasks.length > 0) ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      Procesar archivos
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
          
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                <AlertCircle size={16} className="text-tetgoai-blue" />
              </div>
              <h3 className="font-medium">Instrucciones</h3>
            </div>
            
            <div className="space-y-3 text-sm">
              <p>
                <span className="font-medium">1.</span> Selecciona o arrastra tus archivos de texto (.txt, .csv) o audio.
              </p>
              <p>
                <span className="font-medium">2.</span> El sistema analizará automáticamente el contenido para extraer:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-gray-600 dark:text-gray-400">
                <li>Motivos de contacto</li>
                <li>Sentimientos y emociones</li>
                <li>Predicción de satisfacción (CSAT, NPS)</li>
                <li>Cumplimiento de protocolos</li>
              </ul>
              <p>
                <span className="font-medium">3.</span> Una vez completado el procesamiento, podrás visualizar los resultados en el Dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Upload;
