from fastapi import Depends, Header, HTTPException, status
from typing import Optional
from app.shared.jwt_utils import decode_jwt_token

def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Falta token Bearer")
    token = authorization.split(" ")[1]
    claims = decode_jwt_token(token)
    user_id = claims.get("sub")
    full_name = claims.get("full_name")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token sin sub (user_id)")
    return {"user_id": user_id, "full_name": full_name, "claims": claims}
