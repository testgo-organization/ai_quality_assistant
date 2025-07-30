import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";

export interface AudioTask {
  filename: string;
  task_id: string;
  status?: string;
}

interface ProcessingModalProps {
  open: boolean;
  onClose: () => void;
  tasks: AudioTask[];
}

const statusIcon = (status?: string) => {
  if (!status || status.toUpperCase() === "PENDING") {
    return <Loader2 className="h-5 w-5 text-tetgoai-blue animate-spin" />;
  }
  if (status.toUpperCase() === "SUCCESS") {
    return <Check className="h-5 w-5 text-green-500" />;
  }
  if (status.toUpperCase() === "ERROR") {
    return <X className="h-5 w-5 text-red-500" />;
  }
  return null;
};

const statusText = (status?: string) => {
  if (!status || status.toUpperCase() === "PENDING") return "Procesando...";
  if (status.toUpperCase() === "SUCCESS") return "Listo";
  if (status.toUpperCase() === "ERROR") return "Error";
  return status;
};

const ProcessingModal: React.FC<ProcessingModalProps> = ({ open, onClose, tasks }) => {
  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-xl text-center">
        <DialogHeader>
          <DialogTitle>Procesando archivos de audio</DialogTitle>
          <DialogDescription>
            Estamos analizando tus archivos. Este proceso puede tardar unos minutos dependiendo del tamaño y cantidad de archivos.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4 w-full">
          <ul className="w-full max-h-64 overflow-y-auto space-y-2 px-2">
            {tasks.map((task) => (
              <li key={task.task_id} className="flex items-center gap-2 justify-start w-full">
                {statusIcon(task.status)}
                <span className="truncate flex-1 text-left text-sm">{task.filename}</span>
                <span className="text-xs text-gray-500">{statusText(task.status)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-2 mt-2">
          <p className="text-gray-600 dark:text-gray-300 text-xs">
            TestGoAi analiza el contenido de tus audios para extraer motivos de contacto, emociones, predicción de satisfacción y cumplimiento de protocolos.
          </p>
          <Button variant="outline" className="w-full mt-2" onClick={onClose}>
            Cerrar y continuar navegando
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProcessingModal;