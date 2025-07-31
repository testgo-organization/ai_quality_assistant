"""
Servicio AiGO directo - Implementación basada en OpenAI Chat Completions
"""
import logging
from typing import Iterator, Optional, Dict, Any, List
from openai import OpenAI
from ..config import settings

logger = logging.getLogger(__name__)


class ConversationSession:
    """Maneja una sesión de conversación individual"""
    
    def __init__(self, session_id: str, full_name: str):
        self.session_id = session_id
        self.full_name = full_name
        self.messages: List[Dict[str, str]] = []
        self.created_at = None
        
    def add_message(self, role: str, content: str):
        """Agregar mensaje al historial"""
        self.messages.append({"role": role, "content": content})
        
    def get_messages(self) -> List[Dict[str, str]]:
        """Obtener todos los mensajes"""
        return self.messages.copy()


class DirectAiGOService:
    """Servicio directo de AiGO usando OpenAI Chat Completions"""
    
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.sessions: Dict[str, ConversationSession] = {}
        
        # Prompt de configuración en XML
        self.system_prompt = """<configuracionAiGO>
  <rol>Eres un asistente experto en configurar auditorías de llamadas de atención al cliente para un sistema llamado IA Quality.</rol>
  <objetivo>Guiar al usuario paso a paso en la creación de un servicio a auditar, recolectando y validando de forma estructurada los siguientes datos:</objetivo>
  <datosRequeridos>
    <campo nombre="servicio" tipo="string">Nombre del servicio</campo>
    <campo nombre="campaña" tipo="string">Nombre de la campaña</campo>
    <campo nombre="tipo_gestion" tipo="string">Tipo de gestión (entrante, saliente o mixta)</campo>
    <campo nombre="tiempo_espera_aprobado_segundos" tipo="integer">Tiempo de espera aprobado (en segundos)</campo>
    <grupo nombre="atributos_evaluacion">
      <subcampo nombre="errores_graves_cliente">Errores graves cliente</subcampo>
      <subcampo nombre="errores_graves_negocio_empresa">Errores graves negocio (empresa)</subcampo>
      <subcampo nombre="errores_graves_negocio_cliente">Errores graves negocio (cliente)</subcampo>
      <subcampo nombre="errores_no_graves">Errores no graves</subcampo>
    </grupo>
    <grupo nombre="protocolo">
      <subcampo nombre="saludo_inicial">Saludo inicial</subcampo>
      <subcampo nombre="despedida">Despedida</subcampo>
    </grupo>
    <grupo nombre="reglas_evaluacion">
      <subcampo nombre="error_grave_cliente">Nota 0 si incumple algún atributo grave de cliente; 100 si no.</subcampo>
      <subcampo nombre="error_grave_negocio">Nota 0 si incumple algún atributo grave de negocio; 100 si no.</subcampo>
      <subcampo nombre="error_no_grave">Nota 0 si incumple algún error no grave; 100 si no.</subcampo>
    </grupo>
  </datosRequeridos>
  <memoria>
    <definicion>Debes almacenar cada valor que el usuario proporcione hasta finalizar la conversación. Esta memoria debe ser usada al final para generar un JSON completo.</definicion>
  </memoria>
  <restricciones>
    <regla>No respondas preguntas fuera del alcance de la auditoría.</regla>
    <regla>Usa el nombre del usuario frecuentemente en tus respuestas (parámetro: full_name).</regla>
    <regla>Siempre inicia con una presentación como: "Hola, soy AiGO. Estoy aquí para ayudarte..."</regla>
    <regla>No muestres null si tienes un valor. Si algún campo queda en null, notifícalo claramente y pide corrección.</regla>
  </restricciones>
  <finalizacion>
    <accion>Cuando toda la información esté validada, llama a la función generar_json_final</accion>
  </finalizacion>
</configuracionAiGO>"""

        # Definición de la función generar_json_final
        self.function_schema = {
            "name": "generar_json_final",
            "description": "Genera un JSON estructurado con la información recopilada durante la conversación",
            "parameters": {
                "type": "object",
                "properties": {
                    "servicio": {"type": "string"},
                    "campaña": {"type": "string"},
                    "tipo_gestion": {"type": "string"},
                    "tiempo_espera_aprobado_segundos": {"type": "integer"},
                    "errores_graves_cliente": {"type": "array", "items": {"type": "string"}},
                    "errores_graves_negocio": {
                        "type": "object",
                        "properties": {
                            "empresa": {"type": "array", "items": {"type": "string"}},
                            "cliente": {"type": "array", "items": {"type": "string"}}
                        },
                        "required": ["empresa", "cliente"]
                    },
                    "errores_no_graves": {"type": "array", "items": {"type": "string"}},
                    "protocolo": {
                        "type": "object",
                        "properties": {
                            "saludo_inicial": {"type": "string"},
                            "despedida": {"type": "string"}
                        },
                        "required": ["saludo_inicial", "despedida"]
                    },
                    "reglas_evaluacion": {
                        "type": "object",
                        "properties": {
                            "error_grave_cliente": {"type": "string"},
                            "error_grave_negocio": {"type": "string"},
                            "error_no_grave": {"type": "string"}
                        },
                        "required": ["error_grave_cliente", "error_grave_negocio", "error_no_grave"]
                    }
                },
                "required": [
                    "servicio", "campaña", "tipo_gestion", "tiempo_espera_aprobado_segundos",
                    "errores_graves_cliente", "errores_graves_negocio", "errores_no_graves",
                    "protocolo", "reglas_evaluacion"
                ]
            }
        }
        
        # Vector store ID
        self.vector_store_id = settings.VECTOR_STORE_ID
    
    def get_or_create_session(self, session_id: str, full_name: str) -> ConversationSession:
        """Obtiene o crea una nueva sesión de conversación"""
        if session_id not in self.sessions:
            self.sessions[session_id] = ConversationSession(session_id, full_name)
            logger.info(f"Nueva sesión creada: {session_id} para {full_name}")
        return self.sessions[session_id]
    
    def clear_session(self, session_id: str) -> bool:
        """Elimina una sesión de conversación"""
        if session_id in self.sessions:
            del self.sessions[session_id]
            logger.info(f"Sesión eliminada: {session_id}")
            return True
        return False
    
    def get_sessions(self) -> Dict[str, Dict[str, Any]]:
        """Obtiene información de todas las sesiones activas"""
        return {
            session_id: {
                "full_name": session.full_name,
                "message_count": len(session.messages),
                "created_at": session.created_at
            }
            for session_id, session in self.sessions.items()
        }
    
    def stream_chat_response(self, session_id: str, message: str, full_name: str) -> Iterator[str]:
        """
        Genera respuesta streaming usando OpenAI Chat Completions con historial
        
        Args:
            session_id: ID de la sesión
            message: Mensaje del usuario
            full_name: Nombre completo del usuario
            
        Yields:
            str: Fragmentos de la respuesta en streaming
        """
        try:
            # Obtener o crear sesión
            session = self.get_or_create_session(session_id, full_name)
            
            # Agregar mensaje del usuario al historial
            session.add_message("user", f"{full_name}: {message}")
            
            # Construir mensajes con historial
            messages = [{"role": "system", "content": self.system_prompt}]
            messages.extend(session.get_messages())
            
            response_content = ""
            
            with self.client.chat.completions.create(
                model="gpt-4-1106-preview",
                stream=True,
                messages=messages,
                tools=[{"type": "function", "function": self.function_schema}],
                tool_choice="auto",
                temperature=0.7,
                top_p=1.0,
                max_tokens=1000
            ) as response:
                for chunk in response:
                    if chunk.choices[0].delta.content:
                        content_chunk = chunk.choices[0].delta.content
                        response_content += content_chunk
                        yield content_chunk
                        
                    # Manejar llamadas a funciones
                    if chunk.choices[0].delta.tool_calls:
                        for tool_call in chunk.choices[0].delta.tool_calls:
                            if tool_call.function and tool_call.function.name == "generar_json_final":
                                logger.info("Función generar_json_final detectada")
                                yield f"\n\n[FUNCIÓN DETECTADA: {tool_call.function.name}]"
                                if tool_call.function.arguments:
                                    yield f"\n[DATOS: {tool_call.function.arguments}]"
            
            # Agregar respuesta del asistente al historial
            if response_content:
                session.add_message("assistant", response_content)
                        
        except Exception as e:
            logger.error(f"Error en streaming de respuesta: {e}")
            yield f"Error: {str(e)}"
    
    async def process_message(self, session_id: str, message: str, full_name: str) -> Dict[str, Any]:
        """
        Procesa un mensaje y retorna información completa con historial
        
        Args:
            session_id: ID de la sesión
            message: Mensaje del usuario
            full_name: Nombre completo del usuario
            
        Returns:
            Dict con información de la respuesta y posibles llamadas a funciones
        """
        try:
            # Obtener o crear sesión
            session = self.get_or_create_session(session_id, full_name)
            
            # Agregar mensaje del usuario al historial
            session.add_message("user", f"{full_name}: {message}")
            
            # Construir mensajes con historial
            messages = [{"role": "system", "content": self.system_prompt}]
            messages.extend(session.get_messages())
            
            response = self.client.chat.completions.create(
                model="gpt-4-1106-preview",
                messages=messages,
                tools=[{"type": "function", "function": self.function_schema}],
                tool_choice="auto",
                temperature=0.7,
                top_p=1.0,
                max_tokens=1000
            )
            
            choice = response.choices[0]
            result = {
                "content": choice.message.content,
                "finish_reason": choice.finish_reason,
                "tool_calls": None,
                "function_data": None,
                "session_id": session_id,
                "message_count": len(session.messages) + 1
            }
            
            # Agregar respuesta del asistente al historial
            if choice.message.content:
                session.add_message("assistant", choice.message.content)
            
            # Procesar llamadas a funciones
            if choice.message.tool_calls:
                result["tool_calls"] = []
                for tool_call in choice.message.tool_calls:
                    tool_info = {
                        "id": tool_call.id,
                        "function_name": tool_call.function.name,
                        "arguments": tool_call.function.arguments
                    }
                    result["tool_calls"].append(tool_info)
                    
                    # Si es generar_json_final, parsear los datos
                    if tool_call.function.name == "generar_json_final":
                        import json
                        try:
                            result["function_data"] = json.loads(tool_call.function.arguments)
                            logger.info("Datos finales generados correctamente")
                        except json.JSONDecodeError as e:
                            logger.error(f"Error parseando datos finales: {e}")
            
            return result
            
        except Exception as e:
            logger.error(f"Error procesando mensaje: {e}")
            return {
                "content": f"Error: {str(e)}",
                "finish_reason": "error",
                "tool_calls": None,
                "function_data": None,
                "session_id": session_id,
                "message_count": 0
            }
