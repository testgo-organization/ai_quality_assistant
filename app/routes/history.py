from fastapi import APIRouter
from app.api.controllers.history_controller import get_history

router = APIRouter(prefix="/aigo/chat/history", tags=["history"])
router.get("/{session_id}")(get_history)