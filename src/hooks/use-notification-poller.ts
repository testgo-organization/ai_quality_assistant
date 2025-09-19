import { useEffect, useRef } from 'react';
import { useNotifications as useGlobalNotifications } from './useNotifications';
import { useAuth } from '@/contexts/AuthContext';

interface LocalNotification {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'error' | 'info';
  timestamp: number;
}

// Store local para notificaciones en memoria
class NotificationStore {
  private notifications: LocalNotification[] = [];
  private listeners: ((notifications: LocalNotification[]) => void)[] = [];

  addNotification(notification: Omit<LocalNotification, 'id' | 'timestamp'>) {
    const newNotification: LocalNotification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    this.notifications.push(newNotification);
    this.notifyListeners();

    // Auto-remover notificaciones después de 10 segundos
    setTimeout(() => {
      this.removeNotification(newNotification.id);
    }, 10000);
  }

  removeNotification(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  getUnreadNotifications(): LocalNotification[] {
    return [...this.notifications];
  }

  clearNotifications() {
    this.notifications = [];
    this.notifyListeners();
  }

  subscribe(listener: (notifications: LocalNotification[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }
}

// Instancia global del store de notificaciones
const notificationStore = new NotificationStore();

// Hook para agregar notificaciones desde cualquier componente
export function useNotifications() {
  const addNotification = (notification: Omit<LocalNotification, 'id' | 'timestamp'>) => {
    notificationStore.addNotification(notification);
  };

  const clearNotifications = () => {
    notificationStore.clearNotifications();
  };

  return {
    addNotification,
    clearNotifications,
  };
}

// Hook actualizado que ya no hace polling al backend
export function useNotificationPoller(checkInterval = 5000) {
  const { showSuccess, showError, showInfo } = useGlobalNotifications();
  const { isAuthenticated } = useAuth();
  const lastNotificationCount = useRef<number>(0);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Solo procesar notificaciones si el usuario está autenticado
    if (!isAuthenticated) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      lastNotificationCount.current = 0;
      return;
    }

    const checkLocalNotifications = () => {
      const notifications = notificationStore.getUnreadNotifications();
      
      // Solo mostrar notificaciones nuevas
      if (notifications.length > lastNotificationCount.current) {
        const newNotifications = notifications.slice(lastNotificationCount.current);
        
        newNotifications.forEach(notification => {
          if (notification.type === 'error') {
            showError(notification.title, notification.description);
          } else if (notification.type === 'success') {
            showSuccess(notification.title, notification.description);
          } else {
            showInfo(notification.title, notification.description);
          }
        });
        
        lastNotificationCount.current = notifications.length;
      }
    };

    // Verificar notificaciones cada cierto intervalo
    pollingRef.current = setInterval(checkLocalNotifications, checkInterval);

    // Verificar inmediatamente
    checkLocalNotifications();

    // Limpiar el intervalo cuando el componente se desmonte o cambie el estado de autenticación
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [showSuccess, showError, showInfo, checkInterval, isAuthenticated]);

  // Función para detener manualmente el polling
  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  // Función para limpiar notificaciones cuando el usuario cierre sesión
  const clearNotifications = () => {
    notificationStore.clearNotifications();
    lastNotificationCount.current = 0;
  };

  return { 
    stopPolling, 
    clearNotifications,
    addNotification: notificationStore.addNotification.bind(notificationStore),
  };
}