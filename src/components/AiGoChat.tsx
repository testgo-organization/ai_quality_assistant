import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Send, Bot, User, Sparkles, X, MessageCircle, Zap } from 'lucide-react';
import { useChatApi } from '@/hooks/useChatApi';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface AiGoChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AiGoChat: React.FC<AiGoChatProps> = ({ open, onOpenChange }) => {
  const { completeAiQualityOnboarding, user, getToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  // Configurar el hook de chat HTTP con callbacks estables
  const sessionUuidRef = useRef<string>(uuidv4());
  const currentResponseIdRef = useRef<string | null>(null);

  const handleMessage = useCallback((messageChunk: string) => {
    console.log('Chunk recibido:', messageChunk);
    
    setMessages(prev => {
      // Si es el primer chunk de una nueva respuesta, crear un nuevo mensaje
      if (!currentResponseIdRef.current) {
        currentResponseIdRef.current = Date.now().toString();
        const newBotMessage: Message = {
          id: currentResponseIdRef.current,
          content: messageChunk,
          isUser: false,
          timestamp: new Date()
        };
        return [...prev, newBotMessage];
      } else {
        // Si es un chunk adicional, agregar al último mensaje del bot
        return prev.map(msg => 
          msg.id === currentResponseIdRef.current && !msg.isUser
            ? { ...msg, content: msg.content + messageChunk }
            : msg
        );
      }
    });
  }, []);

  const handleError = useCallback((error: Error) => {
    console.error('Error en chat AiGO:', error);
    const errorMessage: Message = {
      id: Date.now().toString(),
      content: 'Lo siento, hubo un problema de conexión.',
      isUser: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, errorMessage]);
  }, []);

  const handleConnectionChange = useCallback((connected: boolean) => {
    console.log(`Chat HTTP ${connected ? 'inicializado' : 'desconectado'}`);
    
    // Enviar saludo inicial automáticamente cuando se inicialice
    if (connected && !hasInitialized.current) {
      hasInitialized.current = true;
      console.log('Chat HTTP inicializado, enviando mensaje inicial...');
      
      setTimeout(() => {
        if (sendChatMessageRef.current) {
          // Resetear el ID de respuesta para el mensaje inicial
          currentResponseIdRef.current = null;
          // Enviar un mensaje simple de saludo para activar la bienvenida del servidor
          sendChatMessageRef.current('Hola').catch((error) => {
            console.error('Error enviando mensaje inicial:', error);
          });
        }
      }, 500);
    }
  }, []);

  const { sendMessage: sendChatMessage, isLoading: isChatLoading, isConnected } = useChatApi({
    sessionId: sessionUuidRef.current,
    token: getToken(), // Llama a la función para obtener el token actual
    onMessage: handleMessage,
    onError: handleError,
    onConnectionChange: handleConnectionChange
  });

  // Mantener referencia al sendMessage para evitar dependencias circulares
  const sendChatMessageRef = useRef(sendChatMessage);
  sendChatMessageRef.current = sendChatMessage;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isChatLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputMessage;
    setInputMessage('');

    // Resetear el ID de respuesta para la nueva respuesta
    currentResponseIdRef.current = null;

    try {
      // Con HTTP streaming, el mensaje se envía y la respuesta llegará por chunks
      await sendChatMessage(messageToSend);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, inténtalo de nuevo.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleCompleteOnboarding = () => {
    completeAiQualityOnboarding();
    onOpenChange(false);
  };

  const quickActions = [
    "¿Cómo funciona AI Quality?",
    "Configura mi cuenta",
    "Ver funcionalidades principales",
    "Necesito ayuda con el dashboard"
  ];

  const handleQuickAction = async (action: string) => {
    setInputMessage('');
    
    // Resetear el ID de respuesta para la nueva respuesta
    currentResponseIdRef.current = null;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: action,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      await sendChatMessage(action);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, inténtalo de nuevo.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl h-[85vh] p-0 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 border-0 shadow-2xl"
        style={{ maxHeight: '85vh', display: 'flex', flexDirection: 'column' }} // Asegura layout flex
      >
        <div className="flex flex-col h-full" style={{ height: '85vh' }}>
          {/* Header con animación de gradiente */}
          <DialogHeader className="px-6 py-4 bg-gradient-to-r from-primary via-blue-600 to-secondary text-white border-b relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-blue-600/90 to-secondary/90 animate-pulse"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg">
                    <Bot className="w-7 h-7 text-white animate-bounce" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white">
                    <div className="w-full h-full bg-green-400 rounded-full animate-ping"></div>
                  </div>
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                    <Zap className="w-6 h-6 text-yellow-300" />
                    AiGO Assistant
                  </DialogTitle>
                  <p className="text-white/90 text-sm flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    Tu guía inteligente de AI Quality
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  <Sparkles className="w-3 h-3 mr-1 animate-spin" />
                  Onboarding Activo
                </Badge>
                <Badge 
                  variant="secondary" 
                  className={`${isConnected ? 'bg-green-500/20 border-green-400/30' : 'bg-red-500/20 border-red-400/30'} text-white backdrop-blur-sm`}
                >
                  <div className={`w-2 h-2 rounded-full mr-1 ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                  {isConnected ? 'Conectado' : 'Desconectado'}
                </Badge>
              </div>
            </div>
          </DialogHeader>

          {/* Messages Area con mejor scroll */}
          <div className="flex-1 min-h-0"> {/* min-h-0 para que ScrollArea crezca correctamente */}
            <ScrollArea className="h-full w-full px-6 py-4 bg-gradient-to-b from-transparent to-blue-50/30">
              <div className="space-y-4">
                {/* Mensaje de inicialización cuando no hay mensajes */}
                {messages.length === 0 && isConnected && (
                  <div className="flex gap-3 justify-start animate-in slide-in-from-bottom-2">
                    <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center shadow-lg">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-white border border-gray-100 shadow-md rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <span className="text-sm text-gray-500">AiGO se está inicializando...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'} 
                      animate-in slide-in-from-bottom-2 duration-300`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {!message.isUser && (
                      <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center shadow-lg">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-md transition-all hover:shadow-lg ${
                        message.isUser
                          ? 'bg-gradient-to-r from-primary to-secondary text-white ml-auto transform hover:scale-105'
                          : 'bg-white border border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-2 ${
                        message.isUser ? 'text-white/70' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>

                    {message.isUser && (
                      <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-md">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                    )}
                  </div>
                ))}
                
                {isChatLoading && (
                  <div className="flex gap-3 justify-start animate-in slide-in-from-bottom-2">
                    <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center shadow-lg">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-white border border-gray-100 shadow-md rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <span className="text-sm text-gray-500">AiGO está escribiendo...</span>
                        <div className="flex gap-1">
                          <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
                          <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>
          </div>

          {/* Quick Actions - Solo mostrar después del primer mensaje del servidor */}
          {messages.length === 1 && !isChatLoading && !messages[0]?.isUser && (
            <div className="px-6 py-2 border-t border-gray-100 bg-white/50 backdrop-blur-sm">
              <p className="text-sm text-gray-600 mb-2">Acciones rápidas:</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction(action)}
                    className="text-xs hover:bg-primary hover:text-white transition-all transform hover:scale-105"
                  >
                    {action}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area mejorada */}
          <div className="border-t bg-white/80 backdrop-blur-sm px-6 py-4">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu mensaje aquí..."
                  disabled={isChatLoading}
                  className="min-h-[48px] resize-none border-2 border-gray-200 focus:border-primary transition-all rounded-xl bg-white/90 backdrop-blur-sm shadow-sm"
                />
              </div>
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isChatLoading}
                className="h-[48px] px-6 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all transform hover:scale-105 disabled:transform-none rounded-xl shadow-lg"
              >
                {isChatLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
            
            {/* Action Buttons mejorados */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                ¿Ya tienes todo lo que necesitas?
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="text-sm border-gray-200"
                >
                  Continuar más tarde
                </Button>
                <Button
                  onClick={handleCompleteOnboarding}
                  className="text-sm bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg transform hover:scale-105 transition-all"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Completar Onboarding
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AiGoChat;
