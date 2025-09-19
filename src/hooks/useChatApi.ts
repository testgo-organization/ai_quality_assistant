import { useState, useCallback, useEffect, useRef } from 'react';
import { AIGO_API_BASE_URL } from '@/config'; // Importa la URL base de AiGO

interface MessageInput {
  message: string;
}

interface UseChatApiOptions {
  sessionId?: string;
  token?: string; // Nuevo campo para el token de sesión
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

  const sessionId = options.sessionId || 'default';
  const token = options.token;
  
  // URL del endpoint HTTP
  const chatUrl = `${AIGO_API_BASE_URL}direct/chat/${sessionId}`;

  // Función para enviar mensaje usando fetch con streaming
  const sendMessage = useCallback(async (message: string): Promise<void> => {
    if (!message.trim()) {
      console.warn('Intento de enviar mensaje vacío');
      return;
    }
    setIsLoading(true);

    // Cancelar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Crear nuevo AbortController
    abortControllerRef.current = new AbortController();

    try {
      const requestBody: MessageInput = {
        message: message.trim()
      };
      const response = await fetch(chatUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}) // Agrega el token si existe
        },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        // Intenta extraer el mensaje de error del cuerpo de la respuesta
        let errorDetail = `Error HTTP: ${response.status} - ${response.statusText}`;
        try {
          const errorJson = await response.json();
          if (errorJson && errorJson.detail) {
            errorDetail = errorJson.detail;
          }
        } catch (jsonError) {
          // Si no se puede parsear el JSON, usa el mensaje por defecto
          errorDetail = 'Lo siento, hubo un error al procesar tu mensaje. Por favor, inténtalo de nuevo.';
        }
        const errorObj = new Error(errorDetail);
        onErrorRef.current?.(errorObj);
        setIsLoading(false);
        return;
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
        console.log('Error al procesar el stream:', streamError);
        setIsLoading(false);
        throw streamError;
      } finally {
        reader.releaseLock();
      }

    } catch (error) {
      setIsLoading(false);
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request cancelado');
        return;
      }
      // Solo manejar el error si no fue ya manejado arriba
      onErrorRef.current?.(error as Error);
      // No lanzar el error, solo manejarlo aquí
    }
  }, [chatUrl, token]);

  const disconnect = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  }, []);

  // Simular conexión inmediata para HTTP
  useEffect(() => {
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
