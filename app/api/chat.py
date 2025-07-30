"""
Endpoints para chat y gestión de sesiones
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.responses import HTMLResponse
from typing import Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="", tags=["chat"])

# Dependencia que se inyectará desde main.py
websocket_manager = None
session_store = None


def get_websocket_manager():
    """Obtener instancia del WebSocket manager"""
    return websocket_manager


def get_session_store():
    """Obtener instancia del session store"""
    return session_store


@router.websocket("/ws/chat/{session_id}")
async def websocket_chat(
    websocket: WebSocket, 
    session_id: str, 
    manager=Depends(get_websocket_manager),
    full_name: Optional[str] = None
):
    """WebSocket endpoint para conversaciones streaming"""
    try:
        await manager.connect(websocket, session_id, full_name)
        
        while True:
            data = await websocket.receive_json()
            await manager.handle_message(session_id, data)
            
    except WebSocketDisconnect:
        logger.info(f"Cliente desconectado: {session_id}")
    except Exception as e:
        logger.error(f"Error en WebSocket: {e}")
    finally:
        await manager.disconnect(session_id)


@router.get("/sessions")
async def get_active_sessions(store=Depends(get_session_store)):
    """Obtener sesiones activas"""
    conversations = await store.list_conversations()
    
    return {
        "active_sessions": len(conversations),
        "sessions": [
            {
                "session_id": conv.session_id,
                "created_at": conv.created_at.isoformat(),
                "thread_id": conv.thread_id,
                "full_name": conv.user.display_name,
                "status": conv.status.value
            }
            for conv in conversations
        ]
    }


@router.delete("/sessions/{session_id}")
async def close_session(session_id: str, store=Depends(get_session_store)):
    """Cerrar una sesión específica"""
    removed = await store.remove_conversation(session_id)
    if removed:
        return {"message": f"Sesión {session_id} cerrada"}
    else:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")


@router.get("/test", response_class=HTMLResponse)
async def test_client():
    """Cliente de prueba para WebSocket"""
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>AiGO Test Client v2.0</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            h1 { color: #333; text-align: center; }
            .connection-panel { background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
            #messages { border: 1px solid #ddd; height: 400px; overflow-y: scroll; padding: 15px; margin: 15px 0; background: white; border-radius: 5px; }
            .message { margin: 8px 0; padding: 8px; border-radius: 4px; }
            .user { background: #e3f2fd; color: #1976d2; border-left: 4px solid #1976d2; }
            .assistant { background: #e8f5e8; color: #2e7d32; border-left: 4px solid #4caf50; }
            .system { background: #fff3e0; color: #f57c00; border-left: 4px solid #ff9800; font-style: italic; }
            .error { background: #ffebee; color: #c62828; border-left: 4px solid #f44336; }
            .final { background: #fff3cd; color: #856404; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; white-space: pre-wrap; }
            .input-group { display: flex; gap: 10px; margin-top: 10px; }
            input[type="text"] { flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
            button { padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
            .btn-primary { background: #007bff; color: white; }
            .btn-primary:hover { background: #0056b3; }
            .btn-secondary { background: #6c757d; color: white; }
            .btn-secondary:hover { background: #545b62; }
            .btn-danger { background: #dc3545; color: white; }
            .btn-danger:hover { background: #c82333; }
            .status { padding: 10px; border-radius: 4px; margin: 10px 0; font-weight: bold; text-align: center; }
            .status.connected { background: #d4edda; color: #155724; }
            .status.disconnected { background: #f8d7da; color: #721c24; }
            .status.error { background: #f8d7da; color: #721c24; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🤖 AiGO Test Client v2.0</h1>
            
            <div class="connection-panel">
                <div style="margin-bottom: 10px;">
                    <label for="nameInput">👤 Tu nombre (opcional):</label>
                    <input type="text" id="nameInput" placeholder="Ej: María García" style="width: 200px; margin: 0 10px;">
                </div>
                <div>
                    <button onclick="connect()" class="btn-primary" id="connectBtn">🔗 Conectar</button>
                    <button onclick="disconnect()" class="btn-danger" id="disconnectBtn" disabled>❌ Desconectar</button>
                </div>
            </div>
            
            <div id="connectionStatus" class="status disconnected">Desconectado</div>
            
            <div id="messages"></div>
            
            <div class="input-group">
                <input type="text" id="messageInput" placeholder="Escribe tu mensaje..." disabled>
                <button onclick="sendMessage()" class="btn-primary" id="sendButton" disabled>📤 Enviar</button>
            </div>
        </div>
        
        <script>
            let ws = null;
            const messages = document.getElementById('messages');
            const connectionStatus = document.getElementById('connectionStatus');
            const messageInput = document.getElementById('messageInput');
            const sendButton = document.getElementById('sendButton');
            const connectBtn = document.getElementById('connectBtn');
            const disconnectBtn = document.getElementById('disconnectBtn');
            const nameInput = document.getElementById('nameInput');
            
            function connect() {
                const fullName = nameInput.value.trim();
                const sessionId = 'test_' + Math.random().toString(36).substr(2, 9);
                
                let wsUrl = `ws://localhost:8010/ws/chat/${sessionId}`;
                if (fullName) {
                    wsUrl += `?full_name=${encodeURIComponent(fullName)}`;
                }
                
                ws = new WebSocket(wsUrl);
                
                ws.onopen = function(event) {
                    addMessage('🟢 Conectado al servidor', 'system');
                    connectionStatus.textContent = `Conectado como: ${fullName || 'Anónimo'}`;
                    connectionStatus.className = 'status connected';
                    
                    messageInput.disabled = false;
                    sendButton.disabled = false;
                    connectBtn.disabled = true;
                    disconnectBtn.disabled = false;
                    nameInput.disabled = true;
                };
                
                ws.onmessage = function(event) {
                    const data = JSON.parse(event.data);
                    
                    switch(data.type) {
                        case 'message':
                            addMessage(`🤖 AiGO: ${data.content}`, 'assistant');
                            break;
                        case 'final_data':
                            addMessage('📋 Datos finales recibidos:', 'system');
                            addMessage(JSON.stringify(data.data, null, 2), 'final');
                            break;
                        case 'farewell':
                            addMessage(`🎉 ${data.content}`, 'system');
                            break;
                        case 'error':
                            addMessage(`❌ Error: ${data.content}`, 'error');
                            break;
                        case 'status':
                            addMessage(`⏳ ${data.content}`, 'system');
                            break;
                        case 'function_call':
                            addMessage(`🔧 Ejecutando función: ${data.data?.function || 'desconocida'}`, 'system');
                            break;
                        case 'connection':
                            addMessage(`✅ ${data.content}`, 'system');
                            break;
                        default:
                            addMessage(`ℹ️ Mensaje: ${JSON.stringify(data)}`, 'system');
                    }
                };
                
                ws.onclose = function(event) {
                    addMessage('🔴 Conexión cerrada', 'system');
                    connectionStatus.textContent = 'Desconectado';
                    connectionStatus.className = 'status disconnected';
                    resetUI();
                };
                
                ws.onerror = function(error) {
                    addMessage('💥 Error de conexión', 'error');
                    connectionStatus.textContent = 'Error de conexión';
                    connectionStatus.className = 'status error';
                    resetUI();
                };
            }
            
            function disconnect() {
                if (ws) {
                    ws.close();
                }
            }
            
            function resetUI() {
                messageInput.disabled = true;
                sendButton.disabled = true;
                connectBtn.disabled = false;
                disconnectBtn.disabled = true;
                nameInput.disabled = false;
            }
            
            function addMessage(text, type) {
                const div = document.createElement('div');
                div.className = `message ${type}`;
                div.textContent = text;
                messages.appendChild(div);
                messages.scrollTop = messages.scrollHeight;
            }
            
            function sendMessage() {
                const message = messageInput.value.trim();
                
                if (message && ws && ws.readyState === WebSocket.OPEN) {
                    addMessage(`👤 Tú: ${message}`, 'user');
                    ws.send(JSON.stringify({
                        type: 'message',
                        content: message,
                        timestamp: new Date().toISOString()
                    }));
                    messageInput.value = '';
                }
            }
            
            // Event listeners
            messageInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' && !sendButton.disabled) {
                    sendMessage();
                }
            });
            
            nameInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' && !connectBtn.disabled) {
                    connect();
                }
            });
            
            // Focus en el input de nombre al cargar
            nameInput.focus();
        </script>
    </body>
    </html>
    """
    return html_content
