"""
Aplicación principal FastAPI - Configuración y enrutado
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import uvicorn

# Importar configuración
from .config import settings
# Importar routers
from .api import health
from .routes import history, direct_chat

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

# Incluir routers
app.include_router(health.router)
app.include_router(direct_chat.router)
app.include_router(history.router)  # <-- Agrega esta línea

logger.info("AiGO Streaming API v2.0 iniciada correctamente")

@app.get("/")
def read_root():
    return {"Hello": "World"}

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )
