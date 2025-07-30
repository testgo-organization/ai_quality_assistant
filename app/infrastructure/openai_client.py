"""
Cliente OpenAI - Abstracción de la infraestructura
"""
import json
import logging
from typing import Optional, Dict, Any, List
from openai import AsyncOpenAI
from ..config import settings

logger = logging.getLogger(__name__)


class OpenAIClient:
    """Cliente para interactuar con OpenAI Assistant"""
    
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.assistant_id = settings.ASSISTANT_ID
    
    async def create_thread(self) -> str:
        """Crear nuevo thread de conversación"""
        try:
            thread = await self.client.beta.threads.create()
            logger.debug(f"Thread creado: {thread.id}")
            return thread.id
        except Exception as e:
            logger.error(f"Error creando thread: {e}")
            raise
    
    async def add_message_to_thread(self, thread_id: str, content: str) -> None:
        """Agregar mensaje al thread"""
        try:
            await self.client.beta.threads.messages.create(
                thread_id=thread_id,
                role="user",
                content=content
            )
            logger.debug(f"Mensaje agregado al thread {thread_id}")
        except Exception as e:
            logger.error(f"Error agregando mensaje al thread {thread_id}: {e}")
            raise
    
    async def create_run(self, thread_id: str, 
                        additional_instructions: Optional[str] = None) -> str:
        """Crear run del asistente"""
        try:
            run_params = {
                "thread_id": thread_id,
                "assistant_id": self.assistant_id
            }
            
            if additional_instructions:
                run_params["additional_instructions"] = additional_instructions
            
            run = await self.client.beta.threads.runs.create(**run_params)
            logger.debug(f"Run creado: {run.id} para thread {thread_id}")
            return run.id
        except Exception as e:
            logger.error(f"Error creando run para thread {thread_id}: {e}")
            raise
    
    async def get_run_status(self, thread_id: str, run_id: str) -> Dict[str, Any]:
        """Obtener estado del run"""
        try:
            run = await self.client.beta.threads.runs.retrieve(
                thread_id=thread_id,
                run_id=run_id
            )
            return {
                "status": run.status,
                "required_action": run.required_action
            }
        except Exception as e:
            logger.error(f"Error obteniendo estado del run {run_id}: {e}")
            raise
    
    async def get_latest_message(self, thread_id: str) -> Optional[str]:
        """Obtener último mensaje del thread"""
        try:
            messages = await self.client.beta.threads.messages.list(
                thread_id=thread_id,
                order="desc",
                limit=1
            )
            
            if messages.data:
                return messages.data[0].content[0].text.value
            return None
        except Exception as e:
            logger.error(f"Error obteniendo último mensaje del thread {thread_id}: {e}")
            raise
    
    async def submit_tool_outputs(self, thread_id: str, run_id: str, 
                                 tool_outputs: List[Dict[str, Any]]) -> None:
        """Enviar outputs de herramientas"""
        try:
            await self.client.beta.threads.runs.submit_tool_outputs(
                thread_id=thread_id,
                run_id=run_id,
                tool_outputs=tool_outputs
            )
            logger.debug(f"Tool outputs enviados para run {run_id}")
        except Exception as e:
            logger.error(f"Error enviando tool outputs para run {run_id}: {e}")
            raise
    
    async def process_function_calls(self, required_action) -> List[Dict[str, Any]]:
        """Procesar llamadas a funciones y generar outputs"""
        tool_outputs = []
        
        if not required_action or not required_action.submit_tool_outputs:
            return tool_outputs
        
        for tool_call in required_action.submit_tool_outputs.tool_calls:
            function_name = tool_call.function.name
            
            try:
                if function_name == "generar_json_final":
                    arguments = json.loads(tool_call.function.arguments)
                    
                    # Simular respuesta de la función
                    function_result = {
                        "success": True,
                        "message": "Datos finales generados correctamente",
                        "data": arguments
                    }
                    
                    tool_outputs.append({
                        "tool_call_id": tool_call.id,
                        "output": json.dumps(function_result)
                    })
                    
                else:
                    # Respuesta genérica para otras funciones
                    tool_outputs.append({
                        "tool_call_id": tool_call.id,
                        "output": json.dumps({"result": "Función ejecutada"})
                    })
                    
            except Exception as e:
                logger.error(f"Error procesando función {function_name}: {e}")
                tool_outputs.append({
                    "tool_call_id": tool_call.id,
                    "output": json.dumps({"error": str(e)})
                })
        
        return tool_outputs
