"""
Aplicación principal FastAPI - Configuración y enrutado
"""
from fastapi import FastAPI
from mangum import Mangum
from fastapi.middleware.cors import CORSMiddleware
import logging
import uvicorn

# Importar configuración
from .config import settings

# Importar capas
from .infrastructure.openai_client import OpenAIClient
from .infrastructure.session_store import SessionStore
from .infrastructure.websocket_manager import WebSocketManager
from .domain.services import ConversationService, MessageService

# Importar routers
from .api import health, chat, direct_chat

# Configurar logging
logging.basicConfig(level=getattr(logging, settings.LOG_LEVEL))
logger = logging.getLogger(__name__)

# Validar configuración
settings.validate()

# Crear aplicación
app = FastAPI(
    title="AiGO Streaming API v2.0",
    description="API para conversaciones streaming con el asistente AiGO de OpenAI - Arquitectura refactorizada",
    version="2.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializar dependencias
openai_client = OpenAIClient()
session_store = SessionStore()
message_service = MessageService()
conversation_service = ConversationService(openai_client, session_store)
websocket_manager = WebSocketManager(conversation_service, openai_client, message_service)

# Inyectar dependencias en los routers
chat.websocket_manager = websocket_manager
chat.session_store = session_store

# Incluir routers
app.include_router(health.router)
app.include_router(chat.router)
app.include_router(direct_chat.router)

logger.info("AiGO Streaming API v2.0 iniciada correctamente")

@app.get("/")
def read_root():
    return {"Hello": "World"}

# Este es el handler que AWS Lambda buscará.
handler = Mangum(app)

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )
