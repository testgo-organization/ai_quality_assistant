from fastapi import HTTPException, status, Depends
from app.db.dynamodb import get_conversation_history, put_conversation_history
from app.shared.dependencies import get_current_user

async def get_history(session_id: str, user=Depends(get_current_user)):
    """
    Obtener historial de conversación por session_id y user_id
    """
    history = get_conversation_history(user["user_id"], session_id)
    if not history:
        raise HTTPException(status_code=404, detail="Historial no encontrado")
    return {"session_id": session_id, "history": history}