"""
Servicios del dominio - Lógica de negocio
"""
import asyncio
import json
import logging
from typing import Optional, Dict, Any, List
from .entities import Conversation, User, MessageType, ConversationStatus, WebSocketMessage
from .events import (
    ConversationStarted, MessageReceived, AssistantResponseReady,
    FunctionCallDetected, FinalDataGenerated, ConversationEnded
)

logger = logging.getLogger(__name__)


class ConversationService:
    """Servicio de dominio para gestión de conversaciones"""
    
    def __init__(self, openai_client, session_store):
        self.openai_client = openai_client
        self.session_store = session_store
    
    async def start_conversation(self, session_id: str, full_name: Optional[str] = None) -> Conversation:
        """Iniciar nueva conversación"""
        user = User(session_id=session_id, full_name=full_name)
        conversation = Conversation(session_id=session_id, user=user)
        
        await self.session_store.save_conversation(conversation)
        
        logger.info(f"Conversación iniciada: {session_id} para {user.display_name}")
        return conversation
    
    async def get_conversation(self, session_id: str) -> Optional[Conversation]:
        """Obtener conversación existente"""
        return await self.session_store.get_conversation(session_id)
    
    async def send_message(self, session_id: str, message_content: str, timestamp: Optional[str] = None) -> str:
        """Procesar mensaje del usuario"""
        conversation = await self.get_conversation(session_id)
        if not conversation:
            raise ValueError(f"Conversación no encontrada: {session_id}")
        
        # Crear thread si no existe
        if not conversation.thread_id:
            thread_id = await self.openai_client.create_thread()
            conversation.update_thread_id(thread_id)
            await self.session_store.save_conversation(conversation)
        
        # Log del timestamp si está disponible
        if timestamp:
            logger.info(f"Procesando mensaje con timestamp: {timestamp}")
        
        # Enviar mensaje al thread
        await self.openai_client.add_message_to_thread(
            conversation.thread_id, 
            message_content
        )
        
        # Crear run con personalización si aplica
        additional_instructions = None
        if conversation.user.full_name:
            additional_instructions = (
                f"El usuario que está conversando contigo se llama {conversation.user.full_name}. "
                f"Por favor, personaliza tu interacción usando su nombre cuando sea apropiado."
            )
        
        run_id = await self.openai_client.create_run(
            conversation.thread_id,
            additional_instructions=additional_instructions
        )
        
        conversation.update_run_id(run_id)
        await self.session_store.save_conversation(conversation)
        
        return run_id
    
    async def process_function_call(self, session_id: str, function_name: str, 
                                  arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Procesar llamada a función"""
        conversation = await self.get_conversation(session_id)
        if not conversation:
            raise ValueError(f"Conversación no encontrada: {session_id}")
        
        if function_name == "generar_json_final":
            # Marcar conversación como completada
            conversation.mark_as_completed(arguments)
            await self.session_store.save_conversation(conversation)
            
            logger.info(f"Datos finales generados para sesión {session_id}")
            
            return {
                "success": True,
                "message": "Datos finales generados correctamente",
                "data": arguments
            }
        
        # Otras funciones pueden ser procesadas aquí
        return {"result": "Función ejecutada"}
    
    async def end_conversation(self, session_id: str, reason: str = "completed") -> None:
        """Finalizar conversación"""
        conversation = await self.get_conversation(session_id)
        if conversation:
            conversation.status = ConversationStatus.COMPLETED
            await self.session_store.save_conversation(conversation)
            logger.info(f"Conversación finalizada: {session_id}, razón: {reason}")
    
    async def cleanup_conversation(self, session_id: str) -> None:
        """Limpiar conversación"""
        await self.session_store.remove_conversation(session_id)
        logger.info(f"Conversación eliminada: {session_id}")


class MessageService:
    """Servicio para manejo de mensajes"""
    
    # @staticmethod
    # def create_connection_message(session_id: str) -> WebSocketMessage:
    #     """Crear mensaje de conexión"""
    #     return WebSocketMessage(
    #         type=MessageType.CONNECTION,
    #         content="Conectado al asistente AiGO",
    #         data={"session_id": session_id}
    #     )
    
    @staticmethod
    def create_response_message(content: str) -> WebSocketMessage:
        """Crear mensaje de respuesta del asistente"""
        return WebSocketMessage(
            type=MessageType.MESSAGE,
            content=content,
            status="completed"
        )
    
    # @staticmethod
    # def create_status_message(status: str, content: str = "Procesando...") -> WebSocketMessage:
    #     """Crear mensaje de estado"""
    #     return WebSocketMessage(
    #         type=MessageType.STATUS,
    #         content=content,
    #         status=status
    #     )
    
    @staticmethod
    def create_function_call_message(function_name: str) -> WebSocketMessage:
        """Crear mensaje de llamada a función"""
        return WebSocketMessage(
            type=MessageType.FUNCTION_CALL,
            content=f"Ejecutando función: {function_name}",
            data={"function": function_name},
            status="executing"
        )
    
    @staticmethod
    def create_final_data_message(data: Dict[str, Any]) -> WebSocketMessage:
        """Crear mensaje de datos finales"""
        return WebSocketMessage(
            type=MessageType.FINAL_DATA,
            data=data,
            status="completed"
        )
    
    @staticmethod
    def create_farewell_message(final_data: Optional[Dict[str, Any]] = None) -> WebSocketMessage:
        """Crear mensaje de despedida"""
        return WebSocketMessage(
            type=MessageType.FAREWELL,
            content="¡Gracias por usar AiGO! La conversación ha finalizado.",
            data={"final_data": final_data} if final_data else None,
            status="completed"
        )
    
    @staticmethod
    def create_error_message(error: str) -> WebSocketMessage:
        """Crear mensaje de error"""
        return WebSocketMessage(
            type=MessageType.ERROR,
            content=f"Error: {error}",
            status="error"
        )
    
    @staticmethod
    def create_pong_message() -> WebSocketMessage:
        """Crear mensaje pong"""
        return WebSocketMessage(
            type=MessageType.PONG
        )
