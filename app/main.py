from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
import uvicorn
import asyncio
import json
import logging
from typing import Dict, Any, Optional
from openai import AsyncOpenAI
import os
from datetime import datetime
from .config import settings

# Configurar logging
logging.basicConfig(level=getattr(logging, settings.LOG_LEVEL))
logger = logging.getLogger(__name__)

# Validar configuración
settings.validate()

app = FastAPI(
    title="AiGO Streaming API",
    description="API para conversaciones streaming con el asistente AiGO de OpenAI",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cliente OpenAI
client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

# ID del asistente AiGO
ASSISTANT_ID = settings.ASSISTANT_ID

# Almacenar conversaciones activas
active_conversations: Dict[str, Dict[str, Any]] = {}


class ConversationManager:
    """Maneja las conversaciones con el asistente AiGO"""
    
    def __init__(self, thread_id: Optional[str] = None, full_name: Optional[str] = None):
        self.thread_id = thread_id
        self.run_id = None
        self.is_final = False
        self.final_data = None
        self.full_name = full_name
    
    async def create_thread(self) -> str:
        """Crear un nuevo thread de conversación"""
        thread = await client.beta.threads.create()
        self.thread_id = thread.id
        return self.thread_id
    
    async def send_message(self, message: str) -> str:
        """Enviar mensaje al asistente y crear run"""
        if not self.thread_id:
            await self.create_thread()
        
        # Agregar mensaje al thread
        await client.beta.threads.messages.create(
            thread_id=self.thread_id,
            role="user",
            content=message
        )
        
        # Preparar instrucciones adicionales si tenemos el nombre
        additional_instructions = None
        if self.full_name:
            additional_instructions = f"El usuario que está conversando contigo se llama {self.full_name}. Por favor, personaliza tu interacción usando su nombre cuando sea apropiado."
        
        # Crear run
        run_params = {
            "thread_id": self.thread_id,
            "assistant_id": ASSISTANT_ID
        }
        
        if additional_instructions:
            run_params["additional_instructions"] = additional_instructions
            
        run = await client.beta.threads.runs.create(**run_params)
        
        self.run_id = run.id
        return run.id
    
    async def stream_response(self, websocket: WebSocket):
        """Stream de respuesta del asistente"""
        if not self.run_id:
            raise ValueError("No hay run activo")
        
        try:
            while True:
                # Verificar estado del run
                run = await client.beta.threads.runs.retrieve(
                    thread_id=self.thread_id,
                    run_id=self.run_id
                )
                
                if run.status == "completed":
                    # Obtener mensajes del thread
                    messages = await client.beta.threads.messages.list(
                        thread_id=self.thread_id,
                        order="desc",
                        limit=1
                    )
                    
                    if messages.data:
                        message_content = messages.data[0].content[0].text.value
                        await websocket.send_json({
                            "type": "message",
                            "content": message_content,
                            "status": "completed"
                        })
                    break
                
                elif run.status == "requires_action":
                    # Manejar llamadas a funciones
                    await self._handle_function_calls(run, websocket)
                    
                elif run.status in ["failed", "cancelled", "expired"]:
                    await websocket.send_json({
                        "type": "error",
                        "content": f"Run falló: {run.status}",
                        "status": run.status
                    })
                    break
                
                elif run.status in ["in_progress", "queued"]:
                    # Enviar estado de progreso
                    await websocket.send_json({
                        "type": "status",
                        "content": "Procesando...",
                        "status": run.status
                    })
                
                # Esperar antes de la siguiente verificación
                await asyncio.sleep(1)
                
        except Exception as e:
            logger.error(f"Error en streaming: {e}")
            await websocket.send_json({
                "type": "error",
                "content": f"Error interno: {str(e)}",
                "status": "error"
            })
    
    async def _handle_function_calls(self, run, websocket: WebSocket):
        """Manejar llamadas a funciones del asistente"""
        tool_outputs = []
        
        for tool_call in run.required_action.submit_tool_outputs.tool_calls:
            function_name = tool_call.function.name
            
            # Verificar si es la función final
            if function_name == "generar_json_final":
                await websocket.send_json({
                    "type": "function_call",
                    "function": function_name,
                    "status": "executing"
                })
                
                # Procesar la función final
                try:
                    arguments = json.loads(tool_call.function.arguments)
                    self.final_data = arguments
                    self.is_final = True
                    
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
                    
                    # Notificar al cliente sobre los datos finales
                    await websocket.send_json({
                        "type": "final_data",
                        "data": arguments,
                        "status": "completed"
                    })
                    
                except Exception as e:
                    logger.error(f"Error procesando generar_json_final: {e}")
                    tool_outputs.append({
                        "tool_call_id": tool_call.id,
                        "output": json.dumps({"error": str(e)})
                    })
            
            else:
                # Manejar otras funciones si las hay
                await websocket.send_json({
                    "type": "function_call",
                    "function": function_name,
                    "status": "executing"
                })
                
                # Por ahora, respuesta genérica
                tool_outputs.append({
                    "tool_call_id": tool_call.id,
                    "output": json.dumps({"result": "Función ejecutada"})
                })
        
        # Enviar outputs de las funciones
        if tool_outputs:
            await client.beta.threads.runs.submit_tool_outputs(
                thread_id=self.thread_id,
                run_id=self.run_id,
                tool_outputs=tool_outputs
            )


@app.get("/")
async def root():
    """Endpoint de salud"""
    return {"message": "AiGO Streaming API", "status": "active"}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "assistant_id": ASSISTANT_ID,
        "debug_mode": settings.DEBUG
    }


@app.websocket("/ws/chat/{session_id}")
async def websocket_chat(websocket: WebSocket, session_id: str, full_name: Optional[str] = None):
    """WebSocket endpoint para conversaciones streaming"""
    await websocket.accept()
    
    # Crear o recuperar conversación
    if session_id not in active_conversations:
        conversation = ConversationManager(full_name=full_name)
        active_conversations[session_id] = {
            "manager": conversation,
            "created_at": datetime.now(),
            "websocket": websocket,
            "full_name": full_name
        }
    else:
        conversation = active_conversations[session_id]["manager"]
    
    try:
        await websocket.send_json({
            "type": "connection",
            "message": "Conectado al asistente AiGO",
            "session_id": session_id
        })
        
        while True:
            # Recibir mensaje del cliente
            data = await websocket.receive_json()
            message_type = data.get("type", "message")
            
            if message_type == "message":
                user_message = data.get("content", "")
                
                if not user_message.strip():
                    await websocket.send_json({
                        "type": "error",
                        "content": "Mensaje vacío"
                    })
                    continue
                
                # Enviar mensaje al asistente
                try:
                    await conversation.send_message(user_message)
                    
                    # Stream de respuesta
                    await conversation.stream_response(websocket)
                    
                    # Si es la conversación final, enviar mensaje de despedida
                    if conversation.is_final:
                        await websocket.send_json({
                            "type": "farewell",
                            "content": "¡Gracias por usar AiGO! La conversación ha finalizado.",
                            "final_data": conversation.final_data,
                            "status": "completed"
                        })
                        break
                    
                except Exception as e:
                    logger.error(f"Error procesando mensaje: {e}")
                    await websocket.send_json({
                        "type": "error",
                        "content": f"Error procesando mensaje: {str(e)}"
                    })
            
            elif message_type == "ping":
                await websocket.send_json({
                    "type": "pong",
                    "timestamp": datetime.now().isoformat()
                })
    
    except WebSocketDisconnect:
        logger.info(f"Cliente desconectado: {session_id}")
    except Exception as e:
        logger.error(f"Error en WebSocket: {e}")
    finally:
        # Limpiar conversación
        if session_id in active_conversations:
            del active_conversations[session_id]


@app.get("/sessions")
async def get_active_sessions():
    """Obtener sesiones activas"""
    return {
        "active_sessions": len(active_conversations),
        "sessions": [
            {
                "session_id": sid,
                "created_at": conv["created_at"].isoformat(),
                "thread_id": conv["manager"].thread_id,
                "full_name": conv.get("full_name", "Anonymous")
            }
            for sid, conv in active_conversations.items()
        ]
    }


@app.delete("/sessions/{session_id}")
async def close_session(session_id: str):
    """Cerrar una sesión específica"""
    if session_id in active_conversations:
        del active_conversations[session_id]
        return {"message": f"Sesión {session_id} cerrada"}
    else:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")


# Cliente de prueba HTML simple
@app.get("/test", response_class=HTMLResponse)
async def test_client():
    """Cliente de prueba para WebSocket"""
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>AiGO Test Client</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            #messages { border: 1px solid #ccc; height: 400px; overflow-y: scroll; padding: 10px; margin: 10px 0; }
            .message { margin: 5px 0; }
            .user { color: blue; }
            .assistant { color: green; }
            .system { color: gray; font-style: italic; }
            .error { color: red; }
            .final { background-color: #fff3cd; padding: 10px; border-radius: 5px; }
        </style>
    </head>
    <body>
        <h1>AiGO Test Client</h1>
        <div>
            <label for="nameInput">Tu nombre (opcional):</label>
            <input type="text" id="nameInput" placeholder="Ej: Juan Pérez" style="width: 200px; margin-bottom: 10px;">
            <button onclick="connect()">Conectar</button>
            <button onclick="disconnect()">Desconectar</button>
        </div>
        <div id="connectionStatus" style="margin: 10px 0; font-weight: bold;"></div>
        <div id="messages"></div>
        <input type="text" id="messageInput" placeholder="Escribe tu mensaje..." style="width: 70%;" disabled>
        <button onclick="sendMessage()" id="sendButton" disabled>Enviar</button>
        
        <script>
            let ws = null;
            const messages = document.getElementById('messages');
            const connectionStatus = document.getElementById('connectionStatus');
            const messageInput = document.getElementById('messageInput');
            const sendButton = document.getElementById('sendButton');
            
            function connect() {
                const fullName = document.getElementById('nameInput').value.trim();
                const sessionId = 'test_' + Math.random().toString(36).substr(2, 9);
                
                let wsUrl = `ws://localhost:8000/ws/chat/${sessionId}`;
                if (fullName) {
                    wsUrl += `?full_name=${encodeURIComponent(fullName)}`;
                }
                
                ws = new WebSocket(wsUrl);
                
                ws.onopen = function(event) {
                    addMessage('Conectado al servidor', 'system');
                    connectionStatus.textContent = `Conectado como: ${fullName || 'Anónimo'}`;
                    connectionStatus.style.color = 'green';
                    messageInput.disabled = false;
                    sendButton.disabled = false;
                    document.getElementById('nameInput').disabled = true;
                };
                
                ws.onmessage = function(event) {
                    const data = JSON.parse(event.data);
                    
                    if (data.type === 'message') {
                        addMessage(`AiGO: ${data.content}`, 'assistant');
                    } else if (data.type === 'final_data') {
                        addMessage('📋 Datos finales recibidos:', 'system');
                        addMessage(JSON.stringify(data.data, null, 2), 'final');
                    } else if (data.type === 'farewell') {
                        addMessage(`🎉 ${data.content}`, 'system');
                    } else if (data.type === 'error') {
                        addMessage(`❌ Error: ${data.content}`, 'error');
                    } else if (data.type === 'status') {
                        addMessage(`⏳ ${data.content}`, 'system');
                    } else if (data.type === 'function_call') {
                        addMessage(`🔧 Ejecutando función: ${data.function}`, 'system');
                    } else if (data.type === 'connection') {
                        addMessage(`✅ ${data.message}`, 'system');
                    }
                };
                
                ws.onclose = function(event) {
                    addMessage('Conexión cerrada', 'system');
                    connectionStatus.textContent = 'Desconectado';
                    connectionStatus.style.color = 'red';
                    messageInput.disabled = true;
                    sendButton.disabled = true;
                    document.getElementById('nameInput').disabled = false;
                };
                
                ws.onerror = function(error) {
                    addMessage('Error de conexión', 'error');
                    connectionStatus.textContent = 'Error de conexión';
                    connectionStatus.style.color = 'red';
                };
            }
            
            function addMessage(text, type) {
                const div = document.createElement('div');
                div.className = `message ${type}`;
                div.textContent = text;
                messages.appendChild(div);
                messages.scrollTop = messages.scrollHeight;
            }
            
            function sendMessage() {
                const input = document.getElementById('messageInput');
                const message = input.value.trim();
                
                if (message && ws && ws.readyState === WebSocket.OPEN) {
                    addMessage(`Tú: ${message}`, 'user');
                    ws.send(JSON.stringify({
                        type: 'message',
                        content: message
                    }));
                    input.value = '';
                }
            }
            
            function disconnect() {
                if (ws) {
                    ws.close();
                }
            }
            
            // Enviar mensaje con Enter
            document.getElementById('messageInput').addEventListener('keypress', function(e) {
                if (e.key === 'Enter' && !sendButton.disabled) {
                    sendMessage();
                }
            });
            
            // Conectar al presionar Enter en el campo de nombre
            document.getElementById('nameInput').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    connect();
                }
            });
        </script>
    </body>
    </html>
    """
    return html_content


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )
