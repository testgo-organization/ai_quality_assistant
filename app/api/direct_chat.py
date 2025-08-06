"""
Endpoint directo de chat AiGO - Implementación simple basada en open_ai_main.py
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import logging
from app.db.mongo import mongo_collection

from ..domain.direct_service import DirectAiGOService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/direct", tags=["direct-chat"])

# Instancia del servicio
direct_service = DirectAiGOService()

class MessageInput(BaseModel):
    """Modelo para entrada de mensajes"""

    message: str
    full_name: str
    session_id: Optional[str] = "default"
    user_id: Optional[str] = None  # Nuevo campo para el id de usuario


@router.post("/chat/{session_id}")
async def chat(session_id: str, input: MessageInput):
    """
    Endpoint de chat directo con streaming y mantenimiento de sesión
    Implementación basada en open_ai_main.py
    """
    try:

        def stream_response():
            for chunk in direct_service.stream_chat_response(
                session_id, input.message, input.full_name
            ):
                yield chunk

        return StreamingResponse(stream_response(), media_type="text/plain")

    except Exception as e:
        logger.error(f"Error en chat directo: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat/{session_id}/complete")
async def chat_complete(session_id: str, input: MessageInput):
    """
    Endpoint de chat completo (sin streaming) con mantenimiento de sesión
    Retorna respuesta completa con información de funciones
    """
    try:
        result = await direct_service.process_message(
            session_id, input.message, input.full_name
        )
        # Guardar en MongoDB si existe function_data
        if result.get("function_data"):
            mongo_collection.insert_one({
                "session_id": session_id,
                "user_id": input.user_id,
                "full_name": input.full_name,
                "message": input.message,
                "function_data": result["function_data"]
            })
        return result

    except Exception as e:
        logger.error(f"Error en chat completo: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/chat/{session_id}")
async def clear_session(session_id: str):
    """Limpiar una sesión específica"""
    try:
        if direct_service.clear_session(session_id):
            return {"message": f"Sesión {session_id} eliminada correctamente"}
        else:
            raise HTTPException(status_code=404, detail="Sesión no encontrada")
    except Exception as e:
        logger.error(f"Error eliminando sesión: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sessions")
async def get_sessions():
    """Obtener todas las sesiones activas"""
    try:
        return {"sessions": direct_service.get_sessions()}
    except Exception as e:
        logger.error(f"Error obteniendo sesiones: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/test")
async def test_client():
    """Cliente de prueba para el chat directo"""
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>AiGO Direct Chat Test</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
            h1 { color: #333; text-align: center; }
            .form-group { margin: 15px 0; }
            label { display: block; margin-bottom: 5px; font-weight: bold; }
            input, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
            button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin: 5px; }
            button:hover { background: #0056b3; }
            .btn-danger { background: #dc3545; }
            .btn-danger:hover { background: #c82333; }
            .btn-info { background: #17a2b8; }
            .btn-info:hover { background: #138496; }
            #response { border: 1px solid #ddd; height: 400px; overflow-y: scroll; padding: 15px; margin: 15px 0; background: #f9f9f9; }
            .loading { color: #666; font-style: italic; }
            .session-info { background: #e7f3ff; padding: 10px; border-radius: 5px; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🤖 AiGO Direct Chat Test (Con Historial)</h1>
            <p>Cliente de prueba para chat directo con mantenimiento de conversación</p>
            
            <div class="session-info">
                <strong>Sesión ID:</strong> <span id="currentSession">session_test_123</span>
                <button class="btn-info" onclick="generateNewSession()">Nueva Sesión</button>
                <button class="btn-danger" onclick="clearCurrentSession()">Limpiar Sesión</button>
                <button class="btn-info" onclick="viewSessions()">Ver Sesiones</button>
            </div>
            
            <div class="form-group">
                <label for="fullName">Nombre Completo:</label>
                <input type="text" id="fullName" placeholder="Tu nombre completo" value="Usuario de Prueba">
            </div>
            
            <div class="form-group">
                <label for="message">Mensaje:</label>
                <textarea id="message" rows="3" placeholder="Escribe tu mensaje aquí...">Hola AiGO, necesito configurar una auditoría de llamadas</textarea>
            </div>
            
            <button onclick="sendMessage()">Enviar Mensaje (Streaming)</button>
            <button onclick="sendComplete()">Enviar Completo</button>
            <button onclick="clearResponse()">Limpiar Respuesta</button>
            
            <div id="response"></div>
        </div>

        <script>
            let currentSessionId = 'session_test_123';
            
            function getCurrentSessionId() {
                return currentSessionId;
            }
            
            function generateNewSession() {
                currentSessionId = 'session_' + Date.now();
                document.getElementById('currentSession').textContent = currentSessionId;
                clearResponse();
                addSystemMessage('Nueva sesión creada: ' + currentSessionId);
            }
            
            function addSystemMessage(message) {
                const responseDiv = document.getElementById('response');
                const now = new Date().toLocaleTimeString();
                responseDiv.innerHTML += `<div style="color: #666; font-style: italic; margin: 10px 0; border-left: 3px solid #ccc; padding-left: 10px;">[${now}] ${message}</div>`;
                responseDiv.scrollTop = responseDiv.scrollHeight;
            }
            
            async function clearCurrentSession() {
                const sessionId = getCurrentSessionId();
                try {
                    const response = await fetch(`/direct/chat/${sessionId}`, {
                        method: 'DELETE'
                    });
                    
                    if (response.ok) {
                        const result = await response.json();
                        addSystemMessage(result.message);
                        clearResponse();
                    } else {
                        addSystemMessage('Error eliminando sesión: ' + response.status);
                    }
                } catch (error) {
                    addSystemMessage('Error: ' + error.message);
                }
            }
            
            async function viewSessions() {
                try {
                    const response = await fetch('/direct/sessions');
                    if (response.ok) {
                        const result = await response.json();
                        const sessions = result.sessions;
                        let sessionList = 'Sesiones activas:\n';
                        for (const [id, info] of Object.entries(sessions)) {
                            sessionList += `- ${id}: ${info.full_name} (${info.message_count} mensajes)\n`;
                        }
                        addSystemMessage(sessionList || 'No hay sesiones activas');
                    }
                } catch (error) {
                    addSystemMessage('Error obteniendo sesiones: ' + error.message);
                }
            }

            async function sendMessage() {
                const fullName = document.getElementById('fullName').value;
                const message = document.getElementById('message').value;
                const sessionId = getCurrentSessionId();
                const responseDiv = document.getElementById('response');
                
                if (!fullName || !message) {
                    alert('Por favor completa todos los campos');
                    return;
                }
                
                // Mostrar mensaje del usuario
                const now = new Date().toLocaleTimeString();
                responseDiv.innerHTML += `<div style="margin: 10px 0; padding: 10px; background: #e3f2fd; border-left: 4px solid #1976d2;"><strong>[${now}] ${fullName}:</strong> ${message}</div>`;
                
                try {
                    const response = await fetch(`/direct/chat/${sessionId}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            message: message,
                            full_name: fullName
                        })
                    });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();
                    const assistantTime = new Date().toLocaleTimeString();
                    responseDiv.innerHTML += `<div style="margin: 10px 0; padding: 10px; background: #e8f5e8; border-left: 4px solid #4caf50;"><strong>[${assistantTime}] AiGO:</strong> `;
                    
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        
                        const chunk = decoder.decode(value);
                        responseDiv.innerHTML += chunk;
                        responseDiv.scrollTop = responseDiv.scrollHeight;
                    }
                    
                    responseDiv.innerHTML += '</div>';
                    
                    // Limpiar campo de mensaje
                    document.getElementById('message').value = '';
                    
                } catch (error) {
                    responseDiv.innerHTML += `<div style="color: red; margin: 10px 0;"><strong>Error:</strong> ${error.message}</div>`;
                }
            }
            
            async function sendComplete() {
                const fullName = document.getElementById('fullName').value;
                const message = document.getElementById('message').value;
                const sessionId = getCurrentSessionId();
                const responseDiv = document.getElementById('response');
                
                if (!fullName || !message) {
                    alert('Por favor completa todos los campos');
                    return;
                }
                
                // Mostrar mensaje del usuario
                const now = new Date().toLocaleTimeString();
                responseDiv.innerHTML += `<div style="margin: 10px 0; padding: 10px; background: #e3f2fd; border-left: 4px solid #1976d2;"><strong>[${now}] ${fullName}:</strong> ${message}</div>`;
                
                try {
                    const response = await fetch(`/direct/chat/${sessionId}/complete`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            message: message,
                            full_name: fullName
                        })
                    });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    const result = await response.json();
                    const assistantTime = new Date().toLocaleTimeString();
                    
                    responseDiv.innerHTML += `<div style="margin: 10px 0; padding: 10px; background: #e8f5e8; border-left: 4px solid #4caf50;">`;
                    responseDiv.innerHTML += `<strong>[${assistantTime}] AiGO:</strong><br>`;
                    responseDiv.innerHTML += `${result.content || 'No content'}<br>`;
                    
                    if (result.tool_calls) {
                        responseDiv.innerHTML += `<br><em>🔧 Function calls: ${JSON.stringify(result.tool_calls, null, 2)}</em><br>`;
                    }
                    
                    if (result.function_data) {
                        responseDiv.innerHTML += `<br><em>📊 Generated data: ${JSON.stringify(result.function_data, null, 2)}</em><br>`;
                    }
                    
                    responseDiv.innerHTML += `<small style="color: #666;">Session: ${result.session_id} | Messages: ${result.message_count}</small>`;
                    responseDiv.innerHTML += '</div>';
                    
                    // Limpiar campo de mensaje
                    document.getElementById('message').value = '';
                    
                } catch (error) {
                    responseDiv.innerHTML += `<div style="color: red; margin: 10px 0;"><strong>Error:</strong> ${error.message}</div>`;
                }
            }
            
            function clearResponse() {
                document.getElementById('response').innerHTML = '';
            }
            
            // Inicializar
            document.getElementById('currentSession').textContent = currentSessionId;
        </script>
    </body>
    </html>
    """

    from fastapi.responses import HTMLResponse

    return HTMLResponse(content=html_content)