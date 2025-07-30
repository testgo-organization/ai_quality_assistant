#!/usr/bin/env python3
"""
Script de entrada para ejecutar la aplicación AiGO API
"""

import uvicorn
from app.config import settings

if __name__ == "__main__":
    # Validar configuración
    settings.validate()
    
    # Ejecutar servidor
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )
