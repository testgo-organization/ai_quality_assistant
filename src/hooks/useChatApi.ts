import { useState, useCallback, useEffect, useRef } from 'react';

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface UseChatApiOptions {
  sessionId?: string;
  fullName?: string;
  onMessage?: (message: string) => void;
  onError?: (error: Error) => void;
  onConnectionChange?: (connected: boolean) => void;
}

export const useChatApi = (options: UseChatApiOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const websocketRef = useRef<WebSocket | null>(null);
  const messageQueueRef = useRef<string[]>([]);

  const sessionId = options.sessionId || 'session_123';
  const fullName = options.fullName || 'Usuario';
  
  // Crear URL del WebSocket
  const wsUrl = `ws://localhost:8010/ws/chat/${sessionId}?full_name=${encodeURIComponent(fullName)}`;

  const connectWebSocket = useCallback(() => {
    try {
      // Cerrar conexión existente si existe
      if (websocketRef.current) {
        websocketRef.current.close();
      }

      websocketRef.current = new WebSocket(wsUrl);

      websocketRef.current.onopen = () => {
        console.log('WebSocket conectado a AiGO');
        setIsConnected(true);
        options.onConnectionChange?.(true);
        
        // Enviar mensajes en cola si los hay
        while (messageQueueRef.current.length > 0) {
          const message = messageQueueRef.current.shift();
          if (message && websocketRef.current?.readyState === WebSocket.OPEN) {
            websocketRef.current.send(JSON.stringify({
              message: message,
              timestamp: new Date().toISOString()
            }));
          }
        }
      };

      websocketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // El mensaje viene directamente del servidor
          options.onMessage?.(data.message || data.response || event.data);
          setIsLoading(false);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          options.onMessage?.(event.data); // Usar el mensaje como texto plano si no es JSON
          setIsLoading(false);
        }
      };

      websocketRef.current.onclose = () => {
        console.log('WebSocket desconectado de AiGO');
        setIsConnected(false);
        setIsLoading(false);
        options.onConnectionChange?.(false);
      };

      websocketRef.current.onerror = (error) => {
        console.error('Error en WebSocket:', error);
        setIsLoading(false);
        const wsError = new Error('Error de conexión con el servidor de chat');
        options.onError?.(wsError);
      };

    } catch (error) {
      console.error('Error al conectar WebSocket:', error);
      setIsLoading(false);
      options.onError?.(error as Error);
    }
  }, [wsUrl, options]);

  const sendMessage = useCallback(async (message: string): Promise<void> => {
    if (!message.trim()) return;

    setIsLoading(true);

    try {
      if (websocketRef.current?.readyState === WebSocket.OPEN) {
        // Enviar mensaje inmediatamente si la conexión está abierta
        websocketRef.current.send(JSON.stringify({
          message: message,
          timestamp: new Date().toISOString()
        }));
      } else {
        // Agregar a cola si no está conectado
        messageQueueRef.current.push(message);
        
        // Intentar reconectar si no está conectado
        if (!isConnected) {
          connectWebSocket();
        }
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      setIsLoading(false);
      throw new Error('Error al enviar mensaje. Por favor, inténtalo de nuevo.');
    }
  }, [isConnected, connectWebSocket]);

  const disconnect = useCallback(() => {
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }
    setIsConnected(false);
    setIsLoading(false);
  }, []);

  // Conectar automáticamente al montar el componente
  useEffect(() => {
    connectWebSocket();

    // Cleanup al desmontar
    return () => {
      disconnect();
    };
  }, [connectWebSocket, disconnect]);

  return {
    sendMessage,
    isLoading,
    isConnected,
    connect: connectWebSocket,
    disconnect
  };
};

export default useChatApi;
