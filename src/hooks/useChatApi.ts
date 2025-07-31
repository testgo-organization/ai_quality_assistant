import { useState, useCallback, useEffect, useRef } from 'react';

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface MessageInput {
  message: string;
  full_name: string;
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
  const [isConnected, setIsConnected] = useState(true); // HTTP siempre está "conectado"
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Usar refs para callbacks para evitar re-renders
  const onMessageRef = useRef(options.onMessage);
  const onErrorRef = useRef(options.onError);
  const onConnectionChangeRef = useRef(options.onConnectionChange);

  // Actualizar refs cuando cambien las opciones
  useEffect(() => {
    onMessageRef.current = options.onMessage;
    onErrorRef.current = options.onError;
    onConnectionChangeRef.current = options.onConnectionChange;
  }, [options.onMessage, options.onError, options.onConnectionChange]);

  const fullName = options.fullName || 'Usuario';
  const sessionId = options.sessionId || 'default';
  
  // URL del endpoint HTTP
  const chatUrl = `http://localhost:8010/direct/chat/${sessionId}`;

  // Función para enviar mensaje usando fetch con streaming
  const sendMessage = useCallback(async (message: string): Promise<void> => {
    if (!message.trim()) {
      console.warn('Intento de enviar mensaje vacío');
      return;
    }

    console.log('Enviando mensaje:', message);
    setIsLoading(true);

    // Cancelar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Crear nuevo AbortController
    abortControllerRef.current = new AbortController();

    try {
      const requestBody: MessageInput = {
        message: message.trim(),
        full_name: fullName
      };

      console.log('Payload a enviar:', requestBody);

      const response = await fetch(chatUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No se recibió respuesta del servidor');
      }

      // Leer el stream de respuesta
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedMessage = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          accumulatedMessage += chunk;
          
          // Enviar cada chunk al callback
          onMessageRef.current?.(chunk);
        }

        console.log('Mensaje completo recibido:', accumulatedMessage);
        setIsLoading(false);

      } catch (streamError) {
        console.error('Error leyendo stream:', streamError);
        setIsLoading(false);
        throw streamError;
      } finally {
        reader.releaseLock();
      }

    } catch (error) {
      console.error('Error enviando mensaje:', error);
      setIsLoading(false);
      
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request cancelado');
        return;
      }
      
      onErrorRef.current?.(error as Error);
      throw error;
    }
  }, [chatUrl, fullName]);

  const disconnect = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  }, []);

  // Simular conexión inmediata para HTTP
  useEffect(() => {
    console.log('Chat HTTP API inicializado');
    setIsConnected(true);
    onConnectionChangeRef.current?.(true);

    // Cleanup al desmontar
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    sendMessage,
    isLoading,
    isConnected,
    connect: () => { /* No necesario para HTTP */ },
    disconnect
  };
};

export default useChatApi;
