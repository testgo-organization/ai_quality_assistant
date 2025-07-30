import { useEffect, useRef } from 'react';
import { useTaskStatus } from './use-task-status';
import { useAuth } from '@/contexts/AuthContext';

const POLLING_INTERVAL = 3000; // 3 segundos

/**
 * Hook que inicia automáticamente el polling cuando hay tareas pendientes
 * Se debe usar en componentes de nivel superior (como App.tsx)
 */
export function useTaskPolling() {
  const { tasks, startPolling } = useTaskStatus();
  const { getToken } = useAuth();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Verificar si hay tareas pendientes
    const pendingTasks = tasks.filter(task => !task.status || task.status === 'PENDING' || task.status === 'PROCESSING');
    
    if (pendingTasks.length > 0) {
      // Si hay tareas pendientes y no hay polling activo, iniciarlo
      if (!pollingIntervalRef.current) {
        console.log(`Iniciando polling para ${pendingTasks.length} tarea(s) pendiente(s)`);
        
        const poll = async () => {
          const token = getToken();
          if (token) {
            await startPolling(token);
          }
        };
        
        // Ejecutar inmediatamente
        poll();
        
        // Configurar intervalo
        pollingIntervalRef.current = setInterval(poll, POLLING_INTERVAL);
      }
    } else {
      // Si no hay tareas pendientes, detener el polling
      if (pollingIntervalRef.current) {
        console.log('Deteniendo polling - no hay tareas pendientes');
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }

    // Cleanup cuando el componente se desmonte
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [tasks, getToken, startPolling]);

  // Función para detener manualmente el polling
  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  return { stopPolling };
}
