from fastapi import APIRouter
from app.api.controllers.direct_chat_controller import (
    chat,
    clear_session,
    get_sessions,
    test_client,
)

router = APIRouter(prefix="/direct", tags=["direct-chat"])
router.post("/chat/{session_id}")(chat)
router.delete("/chat/{session_id}")(clear_session)
router.get("/sessions")(get_sessions)
router.get("/test")(test_client)
