"""
Eventos del dominio - Para comunicación entre capas
"""
from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, Any, Optional
from .entities import MessageType


@dataclass
class DomainEvent:
    """Evento base del dominio"""
    timestamp: datetime = field(default_factory=datetime.now)


@dataclass
class ConversationStarted:
    """Evento: Nueva conversación iniciada"""
    session_id: str
    user_name: str
    timestamp: datetime = field(default_factory=datetime.now)


@dataclass
class MessageReceived:
    """Evento: Mensaje recibido del usuario"""
    session_id: str
    content: str
    timestamp: datetime = field(default_factory=datetime.now)


@dataclass
class AssistantResponseReady:
    """Evento: Respuesta del asistente lista"""
    session_id: str
    content: str
    timestamp: datetime = field(default_factory=datetime.now)


@dataclass
class FunctionCallDetected:
    """Evento: Llamada a función detectada"""
    session_id: str
    function_name: str
    arguments: Dict[str, Any]
    timestamp: datetime = field(default_factory=datetime.now)


@dataclass
class FinalDataGenerated:
    """Evento: Datos finales generados"""
    session_id: str
    final_data: Dict[str, Any]
    timestamp: datetime = field(default_factory=datetime.now)


@dataclass
class ConversationEnded:
    """Evento: Conversación finalizada"""
    session_id: str
    reason: str = "completed"
    timestamp: datetime = field(default_factory=datetime.now)


@dataclass
class WebSocketMessageEvent:
    """Evento: Mensaje WebSocket a enviar"""
    session_id: str
    message_type: MessageType
    content: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
    status: Optional[str] = None
    timestamp: datetime = field(default_factory=datetime.now)
