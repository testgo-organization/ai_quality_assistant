import { create } from 'zustand';
import { useNotifications } from './useNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/config';
import { Task } from '@/types/Task';

interface TaskStore {
  tasks: Task[];
  addTasks: (tasks: Task[]) => void;
  updateTaskStatus: (taskId: string, status: string) => void;
  clearTasks: () => void;
  // Función para notificar cuando una tarea cambia de estado
  onTaskStatusChange?: (task: Task, previousStatus?: string) => void;
  setOnTaskStatusChange: (callback: (task: Task, previousStatus?: string) => void) => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  onTaskStatusChange: undefined,
  
  addTasks: (tasks) => set((state) => ({ tasks: [...state.tasks, ...tasks] })),
  
  updateTaskStatus: (taskId, newStatus) => {
    const state = get();
    const taskIndex = state.tasks.findIndex(task => task.task_id === taskId);
    
    if (taskIndex !== -1) {
      const currentTask = state.tasks[taskIndex];
      const previousStatus = currentTask.status;
      
      // Solo actualizar si el estado realmente cambió
      if (previousStatus !== newStatus) {
        const updatedTask = { ...currentTask, status: newStatus };
        
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.task_id === taskId ? updatedTask : task
          ),
        }));
        
        // Notificar el cambio de estado si hay un callback registrado
        if (state.onTaskStatusChange) {
          state.onTaskStatusChange(updatedTask, previousStatus);
        }
      }
    }
  },
  
  clearTasks: () => set({ tasks: [] }),
  
  setOnTaskStatusChange: (callback) => set({ onTaskStatusChange: callback }),
}));

export function useTaskStatus() {
  const { showError } = useNotifications();
  const { logout } = useAuth();
  const { tasks, addTasks, updateTaskStatus, clearTasks, setOnTaskStatusChange } = useTaskStore();

  const startPolling = async (token: string | null) => {
    const pendingTasks = tasks.filter(task => 
      !task.status || 
      task.status === 'PENDING' || 
      task.status === 'pending' || 
      task.status === 'PROCESSING' || 
      task.status === 'processing'
    );
    
    if (pendingTasks.length === 0) return;

    for (const task of pendingTasks) {
      try {
        const response = await fetch(`${API_BASE_URL}audio/process/status/${task.task_id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        // Manejar errores de autenticación
        if (response.status === 401) {
          console.warn('Token inválido en polling de tareas, cerrando sesión...');
          await logout();
          clearTasks(); // Limpiar tareas pendientes
          return;
        }

        if (!response.ok) continue;
        
        const data = await response.json();
        console.log(`Polling detectó cambio en tarea ${task.task_id}: ${task.status} -> ${data.status}`); // Debug log
        // El callback de notificación se ejecutará automáticamente en updateTaskStatus
        updateTaskStatus(task.task_id, data.status);
        
      } catch (error) {
        console.error('Error al verificar estado:', error);
      }
    }

    // No limpiar automáticamente el store cuando todas las tareas estén completadas
    // para que los componentes como DashboardDetail puedan acceder a la información
    // const allCompleted = tasks.every(task => task.status && task.status !== 'PENDING');
    // if (allCompleted) {
    //   clearTasks();
    // }
  };

  return {
    tasks,
    addTasks,
    startPolling,
    clearTasks,
    setOnTaskStatusChange,
  };
}