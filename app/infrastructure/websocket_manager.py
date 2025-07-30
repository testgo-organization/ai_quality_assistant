"""
Gestor de WebSockets - Manejo de conexiones WebSocket
"""
import asyncio
import json
import logging
from typing import Dict, Optional
from fastapi import WebSocket
from ..domain.entities import WebSocketMessage, MessageType
from ..domain.services import ConversationService, MessageService

logger = logging.getLogger(__name__)


class WebSocketManager:
    """Gestor de conexiones WebSocket"""
    
    def __init__(self, conversation_service: ConversationService, 
                 openai_client, message_service: MessageService):
        self.conversation_service = conversation_service
        self.openai_client = openai_client
        self.message_service = message_service
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, session_id: str, 
                     full_name: Optional[str] = None) -> None:
        """Conectar nuevo cliente WebSocket"""
        await websocket.accept()
        self.active_connections[session_id] = websocket
        
        # Iniciar conversación
        conversation = await self.conversation_service.start_conversation(
            session_id, full_name
        )
        
        # Enviar mensaje de conexión
        connection_msg = self.message_service.create_connection_message(session_id)
        await self.send_message(session_id, connection_msg)
        
        logger.info(f"Cliente conectado: {session_id}")
    
    async def disconnect(self, session_id: str) -> None:
        """Desconectar cliente"""
        if session_id in self.active_connections:
            del self.active_connections[session_id]
        
        await self.conversation_service.cleanup_conversation(session_id)
        logger.info(f"Cliente desconectado: {session_id}")
    
    async def send_message(self, session_id: str, message: WebSocketMessage) -> None:
        """Enviar mensaje a cliente específico"""
        websocket = self.active_connections.get(session_id)
        if websocket:
            try:
                await websocket.send_json(message.to_dict())
                logger.debug(f"Mensaje enviado a {session_id}: {message.type.value}")
            except Exception as e:
                logger.error(f"Error enviando mensaje a {session_id}: {e}")
                await self.disconnect(session_id)
    
    async def handle_message(self, session_id: str, data: Dict) -> None:
        """Manejar mensaje recibido del cliente"""
        try:
            message_type = data.get("type", "message")
            
            if message_type == "message":
                await self._handle_user_message(session_id, data.get("content", ""))
            elif message_type == "ping":
                pong_msg = self.message_service.create_pong_message()
                await self.send_message(session_id, pong_msg)
            else:
                logger.warning(f"Tipo de mensaje no reconocido: {message_type}")
                
        except Exception as e:
            logger.error(f"Error manejando mensaje de {session_id}: {e}")
            error_msg = self.message_service.create_error_message(str(e))
            await self.send_message(session_id, error_msg)
    
    async def _handle_user_message(self, session_id: str, content: str) -> None:
        """Manejar mensaje del usuario"""
        if not content.strip():
            error_msg = self.message_service.create_error_message("Mensaje vacío")
            await self.send_message(session_id, error_msg)
            return
        
        try:
            # Enviar mensaje al asistente
            run_id = await self.conversation_service.send_message(session_id, content)
            
            # Procesar respuesta en streaming
            await self._stream_response(session_id, run_id)
            
        except Exception as e:
            logger.error(f"Error procesando mensaje de {session_id}: {e}")
            error_msg = self.message_service.create_error_message(str(e))
            await self.send_message(session_id, error_msg)
    
    async def _stream_response(self, session_id: str, run_id: str) -> None:
        """Procesar respuesta del asistente en streaming"""
        conversation = await self.conversation_service.get_conversation(session_id)
        if not conversation or not conversation.thread_id:
            return
        
        try:
            while True:
                # Obtener estado del run
                run_status = await self.openai_client.get_run_status(
                    conversation.thread_id, run_id
                )
                
                status = run_status["status"]
                
                if status == "completed":
                    # Obtener respuesta final
                    response = await self.openai_client.get_latest_message(
                        conversation.thread_id
                    )
                    if response:
                        msg = self.message_service.create_response_message(response)
                        await self.send_message(session_id, msg)
                    break
                
                elif status == "requires_action":
                    await self._handle_function_calls(
                        session_id, conversation.thread_id, run_id, 
                        run_status["required_action"]
                    )
                
                elif status in ["failed", "cancelled", "expired"]:
                    error_msg = self.message_service.create_error_message(
                        f"Run falló: {status}"
                    )
                    await self.send_message(session_id, error_msg)
                    break
                
                elif status in ["in_progress", "queued"]:
                    status_msg = self.message_service.create_status_message(status)
                    await self.send_message(session_id, status_msg)
                
                await asyncio.sleep(1)
                
        except Exception as e:
            logger.error(f"Error en streaming para {session_id}: {e}")
            error_msg = self.message_service.create_error_message(f"Error interno: {str(e)}")
            await self.send_message(session_id, error_msg)
    
    async def _handle_function_calls(self, session_id: str, thread_id: str, 
                                   run_id: str, required_action) -> None:
        """Manejar llamadas a funciones"""
        if not required_action or not required_action.submit_tool_outputs:
            return
        
        for tool_call in required_action.submit_tool_outputs.tool_calls:
            function_name = tool_call.function.name
            
            # Notificar ejecución de función
            func_msg = self.message_service.create_function_call_message(function_name)
            await self.send_message(session_id, func_msg)
            
            if function_name == "generar_json_final":
                try:
                    arguments = json.loads(tool_call.function.arguments)
                    
                    # Procesar función final
                    await self.conversation_service.process_function_call(
                        session_id, function_name, arguments
                    )
                    
                    # Enviar datos finales
                    final_msg = self.message_service.create_final_data_message(arguments)
                    await self.send_message(session_id, final_msg)
                    
                except Exception as e:
                    logger.error(f"Error procesando generar_json_final: {e}")
        
        # Enviar outputs de funciones
        tool_outputs = await self.openai_client.process_function_calls(required_action)
        if tool_outputs:
            await self.openai_client.submit_tool_outputs(thread_id, run_id, tool_outputs)
        
        # Verificar si la conversación debe finalizar
        conversation = await self.conversation_service.get_conversation(session_id)
        if conversation and conversation.is_final:
            farewell_msg = self.message_service.create_farewell_message(
                conversation.final_data
            )
            await self.send_message(session_id, farewell_msg)
            await self.disconnect(session_id)
