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
        self.system_prompt = """
        <configuracionAiGO>
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
                <regla>No comentes nada sobre le procesamiento del JSON  o de genración de JSON final simplemente despídete</regla>
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
                    "errores_graves_cliente": {
                        "type": "array",
                        "items": {"type": "string"},
                    },
                    "errores_graves_negocio": {
                        "type": "object",
                        "properties": {
                            "empresa": {"type": "array", "items": {"type": "string"}},
                            "cliente": {"type": "array", "items": {"type": "string"}},
                        },
                        "required": ["empresa", "cliente"],
                    },
                    "errores_no_graves": {"type": "array", "items": {"type": "string"}},
                    "protocolo": {
                        "type": "object",
                        "properties": {
                            "saludo_inicial": {"type": "string"},
                            "despedida": {"type": "string"},
                        },
                        "required": ["saludo_inicial", "despedida"],
                    },
                    "reglas_evaluacion": {
                        "type": "object",
                        "properties": {
                            "error_grave_cliente": {"type": "string"},
                            "error_grave_negocio": {"type": "string"},
                            "error_no_grave": {"type": "string"},
                        },
                        "required": [
                            "error_grave_cliente",
                            "error_grave_negocio",
                            "error_no_grave",
                        ],
                    },
                },
                "required": [
                    "servicio",
                    "campaña",
                    "tipo_gestion",
                    "tiempo_espera_aprobado_segundos",
                    "errores_graves_cliente",
                    "errores_graves_negocio",
                    "errores_no_graves",
                    "protocolo",
                    "reglas_evaluacion",
                ],
            },
        }

        # Vector store ID
        self.vector_store_id = settings.VECTOR_STORE_ID

    def get_or_create_session(
        self, session_id: str, full_name: str
    ) -> ConversationSession:
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
                "created_at": session.created_at,
            }
            for session_id, session in self.sessions.items()
        }

    def stream_chat_response(
        self, session_id: str, message: str, full_name: str
    ) -> Iterator[tuple[str, Optional[dict]]]:
        """
        Genera respuesta streaming usando OpenAI Chat Completions con historial

        Args:
            session_id: ID de la sesión
            message: Mensaje del usuario
            full_name: Nombre completo del usuario

        Yields:
            tuple: Fragmentos de la respuesta en streaming y datos recopilados (si los hay)
        """
        try:
            # Obtener o crear sesión
            session = self.get_or_create_session(session_id, full_name)

            # Agregar mensaje del usuario al historial
            session.add_message("user", f"{full_name}: {message}")

            # Construir mensajes con historial
            messages = [{"role": "system", "content": self.system_prompt}]
            messages.extend(session.get_messages())

            # PRIMERA PASADA: Verificar si se va a ejecutar una función (sin streaming)
            logger.info(f"Verificando si se ejecutará función en sesión {session_id}")
            try:
                check_response = self.client.chat.completions.create(
                    model="gpt-4-1106-preview",
                    messages=messages,
                    tools=[{"type": "function", "function": self.function_schema}],
                    tool_choice="auto",
                    temperature=0.7,
                    top_p=1.0,
                    max_tokens=1000,
                )

                # Si hay tool_calls, procesarlos correctamente
                if check_response.choices[0].message.tool_calls:
                    for tool_call in check_response.choices[0].message.tool_calls:
                        if tool_call.function.name == "generar_json_final":
                            logger.info(
                                f"🔧 Función detectada - procesando datos completos en sesión {session_id}"
                            )

                            # Mostrar el contenido de la respuesta si existe
                            if check_response.choices[0].message.content:
                                yield check_response.choices[0].message.content, None

                            # Procesar los datos de la función
                            try:
                                import json

                                datos_recopilados = json.loads(
                                    tool_call.function.arguments
                                )

                                logger.info(f"=== JSON COMPLETO FORMATEADO ===")
                                logger.info(
                                    f"{json.dumps(datos_recopilados, indent=2, ensure_ascii=False)}"
                                )
                                logger.info(f"=== FIN DATOS SESIÓN {session_id} ===")

                                # Agregar despedida amigable
                                despedida = f"\n\n¡Perfecto, {full_name}! 🎉 He recopilado toda la información necesaria para configurar tu auditoría de llamadas. Ha sido un placer ayudarte en este proceso. ¡Que tengas un excelente día y mucho éxito con tu sistema de calidad! 😊"
                                yield despedida, datos_recopilados

                                # Agregar respuesta al historial
                                full_response = (
                                    check_response.choices[0].message.content or ""
                                ) + despedida
                                session.add_message("assistant", full_response)

                                return  # Terminar aquí cuando se ejecuta la función

                            except json.JSONDecodeError as e:
                                logger.error(
                                    f"❌ ERROR PARSEANDO JSON en sesión {session_id}: {e}"
                                )
                                logger.error(
                                    f"Argumentos problemáticos: '{tool_call.function.arguments}'"
                                )
                                yield f"\n\n[Error procesando datos de configuración]", None
                                return

            except Exception as e:
                logger.warning(
                    f"Error en verificación de función, continuando con streaming: {e}"
                )

            # SEGUNDA PASADA: Si no hay función, proceder con streaming normal
            logger.info(
                f"No se detectó función, procediendo con streaming normal en sesión {session_id}"
            )
            response_content = ""

            with self.client.chat.completions.create(
                model="gpt-4-1106-preview",
                stream=True,
                messages=messages,
                tools=[{"type": "function", "function": self.function_schema}],
                tool_choice="auto",
                temperature=0.7,
                top_p=1.0,
                max_tokens=1000,
            ) as response:
                for chunk in response:
                    if chunk.choices[0].delta.content:
                        content_chunk = chunk.choices[0].delta.content
                        response_content += content_chunk
                        yield content_chunk, None

            # Agregar respuesta del asistente al historial
            if response_content:
                session.add_message("assistant", response_content)

        except Exception as e:
            logger.error(f"Error en streaming de respuesta: {e}")
            yield f"Error: {str(e)}", None
