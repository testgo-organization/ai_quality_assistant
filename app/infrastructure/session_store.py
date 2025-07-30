"""
Almacenamiento de sesiones - En memoria con posibilidad de extensión
"""
import logging
from typing import Dict, Optional, List
from datetime import datetime
from ..domain.entities import Conversation

logger = logging.getLogger(__name__)


class SessionStore:
    """Almacén de sesiones en memoria"""
    
    def __init__(self):
        self._conversations: Dict[str, Conversation] = {}
    
    async def save_conversation(self, conversation: Conversation) -> None:
        """Guardar conversación"""
        self._conversations[conversation.session_id] = conversation
        logger.debug(f"Conversación guardada: {conversation.session_id}")
    
    async def get_conversation(self, session_id: str) -> Optional[Conversation]:
        """Obtener conversación por ID"""
        conversation = self._conversations.get(session_id)
        if conversation:
            logger.debug(f"Conversación obtenida: {session_id}")
        return conversation
    
    async def remove_conversation(self, session_id: str) -> bool:
        """Eliminar conversación"""
        if session_id in self._conversations:
            del self._conversations[session_id]
            logger.debug(f"Conversación eliminada: {session_id}")
            return True
        return False
    
    async def list_conversations(self) -> List[Conversation]:
        """Listar todas las conversaciones"""
        return list(self._conversations.values())
    
    async def get_active_count(self) -> int:
        """Obtener número de conversaciones activas"""
        return len(self._conversations)
    
    async def cleanup_expired_conversations(self, max_age_hours: int = 24) -> int:
        """Limpiar conversaciones expiradas"""
        now = datetime.now()
        expired_sessions = []
        
        for session_id, conversation in self._conversations.items():
            age_hours = (now - conversation.created_at).total_seconds() / 3600
            if age_hours > max_age_hours:
                expired_sessions.append(session_id)
        
        for session_id in expired_sessions:
            del self._conversations[session_id]
        
        if expired_sessions:
            logger.info(f"Conversaciones expiradas eliminadas: {len(expired_sessions)}")
        
        return len(expired_sessions)
