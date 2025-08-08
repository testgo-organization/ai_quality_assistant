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
