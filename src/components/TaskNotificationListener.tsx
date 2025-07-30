import { useEffect, useCallback } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useTaskStatus } from '@/hooks/use-task-status';

interface Task {
  task_id: string;
  filename: string;
  status?: string;
}

/**
 * Componente que escucha cambios en el estado de las tareas
 * y muestra notificaciones automáticamente en toda la aplicación
 */
export function TaskNotificationListener() {
  const { showSuccess, showError, showInfo } = useNotifications();
  const { setOnTaskStatusChange } = useTaskStatus();

  // Estabilizar la función callback para evitar re-renders infinitos
  const handleTaskStatusChange = useCallback((task: Task, previousStatus?: string) => {
    // Solo mostrar notificación si la tarea cambió de PENDING a otro estado
    if (previousStatus === 'PENDING' || !previousStatus) {
      const isSuccess = task.status === 'SUCCESS';
      const isError = task.status === 'ERROR' || task.status === 'FAILED';
      
      if (isSuccess) {
        showSuccess(
          "✅ Procesamiento completado",
          `El archivo "${task.filename}" se procesó correctamente`
        );
      } else if (isError) {
        showError(
          "❌ Error en el procesamiento",
          `Error al procesar el archivo "${task.filename}"`
        );
      } else if (task.status === 'PROCESSING') {
        showInfo(
          "⏳ Procesando archivo",
          `Procesando "${task.filename}"...`
        );
      }
    }
  }, [showSuccess, showError, showInfo]);

  useEffect(() => {
    // Registrar el callback en el store
    setOnTaskStatusChange(handleTaskStatusChange);

    // Cleanup: remover el callback cuando el componente se desmonte
    return () => {
      setOnTaskStatusChange(() => {});
    };
  }, [handleTaskStatusChange, setOnTaskStatusChange]);

  // Este componente no renderiza nada, solo escucha
  return null;
}
