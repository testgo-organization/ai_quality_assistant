from pydantic import BaseModel
from typing import Any, Dict, Optional
from datetime import datetime


class ChatMessage(BaseModel):
    """Modelo para mensajes de chat"""
    type: str = "message"
    content: str
    timestamp: Optional[datetime] = None


class WebSocketResponse(BaseModel):
    """Modelo para respuestas WebSocket"""
    type: str
    content: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
    status: Optional[str] = None
    timestamp: Optional[datetime] = None


class SessionInfo(BaseModel):
    """Información de sesión"""
    session_id: str
    thread_id: Optional[str] = None
    created_at: datetime
    is_active: bool = True


class FinalData(BaseModel):
    """Datos finales del asistente"""
    data: Dict[str, Any]
    session_id: str
    timestamp: datetime
