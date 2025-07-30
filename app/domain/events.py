"""
Eventos del dominio - Para comunicación entre capas
"""
from dataclasses import dataclass
from datetime import datetime
from typing import Dict, Any
from .entities import MessageType


@dataclass
class DomainEvent:
    """Evento base del dominio"""
    timestamp: datetime = datetime.now()


@dataclass
class ConversationStarted(DomainEvent):
    """Evento: Nueva conversación iniciada"""
    session_id: str
    user_name: str


@dataclass
class MessageReceived(DomainEvent):
    """Evento: Mensaje recibido del usuario"""
    session_id: str
    content: str


@dataclass
class AssistantResponseReady(DomainEvent):
    """Evento: Respuesta del asistente lista"""
    session_id: str
    content: str


@dataclass
class FunctionCallDetected(DomainEvent):
    """Evento: Llamada a función detectada"""
    session_id: str
    function_name: str
    arguments: Dict[str, Any]


@dataclass
class FinalDataGenerated(DomainEvent):
    """Evento: Datos finales generados"""
    session_id: str
    final_data: Dict[str, Any]


@dataclass
class ConversationEnded(DomainEvent):
    """Evento: Conversación finalizada"""
    session_id: str
    reason: str = "completed"


@dataclass
class WebSocketMessageEvent(DomainEvent):
    """Evento: Mensaje WebSocket a enviar"""
    session_id: str
    message_type: MessageType
    content: str = None
    data: Dict[str, Any] = None
    status: str = None
