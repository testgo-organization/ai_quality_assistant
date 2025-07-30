"""
Endpoints de salud y estado del sistema
"""
from fastapi import APIRouter
from datetime import datetime
from ..config import settings

router = APIRouter(prefix="", tags=["health"])


@router.get("/")
async def root():
    """Endpoint raíz"""
    return {"message": "AiGO Streaming API", "status": "active"}


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "assistant_id": settings.ASSISTANT_ID,
        "debug_mode": settings.DEBUG,
        "version": "2.0.0"
    }
