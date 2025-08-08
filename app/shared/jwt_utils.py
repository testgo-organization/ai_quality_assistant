import jwt
from fastapi import HTTPException, status
from typing import Dict
import logging
from app.config import settings

logger = logging.getLogger(__name__)

def decode_jwt_token(token: str) -> Dict:
    if not settings.JWT_SECRET_KEY or not isinstance(settings.JWT_SECRET_KEY, str):
        logger.error("JWT_SECRET_KEY no está definido o no es string")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Configuración JWT inválida")
    try:
        return jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
            audience=getattr(settings, "JWT_AUDIENCE", None),
            options={"verify_aud": hasattr(settings, "JWT_AUDIENCE")}
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")
