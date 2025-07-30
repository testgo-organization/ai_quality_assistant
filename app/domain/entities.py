"""
Entidades del dominio - Objetos de negocio centrales
"""
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, Dict, Any
from enum import Enum


class ConversationStatus(Enum):
    """Estados de una conversación"""
    ACTIVE = "active"
    COMPLETED = "completed"
    FAILED = "failed"
    EXPIRED = "expired"


class MessageType(Enum):
    """Tipos de mensajes WebSocket"""
    CONNECTION = "connection"
    MESSAGE = "message"
    STATUS = "status"
    FUNCTION_CALL = "function_call"
    FINAL_DATA = "final_data"
    FAREWELL = "farewell"
    ERROR = "error"
    PING = "ping"
    PONG = "pong"


@dataclass
class User:
    """Entidad Usuario"""
    session_id: str
    full_name: Optional[str] = None
    
    @property
    def display_name(self) -> str:
        return self.full_name or "Anónimo"


@dataclass
class Message:
    """Entidad Mensaje"""
    content: str
    message_type: MessageType = MessageType.MESSAGE
    timestamp: datetime = field(default_factory=datetime.now)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class Conversation:
    """Entidad Conversación - Agregado raíz"""
    session_id: str
    user: User
    thread_id: Optional[str] = None
    run_id: Optional[str] = None
    status: ConversationStatus = ConversationStatus.ACTIVE
    created_at: datetime = field(default_factory=datetime.now)
    final_data: Optional[Dict[str, Any]] = None
    
    @property
    def is_final(self) -> bool:
        return self.status == ConversationStatus.COMPLETED and self.final_data is not None
    
    def mark_as_completed(self, final_data: Dict[str, Any]) -> None:
        """Marcar conversación como completada"""
        self.status = ConversationStatus.COMPLETED
        self.final_data = final_data
    
    def mark_as_failed(self, error: str) -> None:
        """Marcar conversación como fallida"""
        self.status = ConversationStatus.FAILED
        
    def update_thread_id(self, thread_id: str) -> None:
        """Actualizar ID del thread"""
        self.thread_id = thread_id
        
    def update_run_id(self, run_id: str) -> None:
        """Actualizar ID del run"""
        self.run_id = run_id


@dataclass
class WebSocketMessage:
    """Mensaje WebSocket estructurado"""
    type: MessageType
    content: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
    status: Optional[str] = None
    timestamp: datetime = field(default_factory=datetime.now)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convertir a diccionario para envío WebSocket"""
        result = {"type": self.type.value}
        
        if self.content is not None:
            result["content"] = self.content
        if self.data is not None:
            result["data"] = self.data
        if self.status is not None:
            result["status"] = self.status
        
        result["timestamp"] = self.timestamp.isoformat()
        return result
