import os
from typing import Optional
from dotenv import load_dotenv

# Cargar variables de entorno desde .env
load_dotenv()

# Configuración de la aplicación
class Settings:
    # OpenAI
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY")
    ASSISTANT_ID: str = os.getenv("ASSISTANT_ID")
    VECTOR_STORE_ID: str = os.getenv("VECTOR_STORE_ID", "vs_688943d84c488191aa0c47fffd1eb866")
    
    # Servidor
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8010"))
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    # CORS
    ALLOWED_ORIGINS: list = os.getenv("ALLOWED_ORIGINS", "*").split(",")
    
    # DynamoDB
    DYNAMODB_REGION = os.environ.get("DYNAMODB_REGION")
    DYNAMODB_ACCESS_KEY = os.environ.get("DYNAMODB_ACCESS_KEY")
    DYNAMODB_SECRET_KEY = os.environ.get("DYNAMODB_SECRET_KEY")
    DYNAMODB_TABLE = os.environ.get("DYNAMODB_TABLE")
    
    # Validación
    def validate(self):
        if not self.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY es requerida")
        if not self.ASSISTANT_ID:
            raise ValueError("ASSISTANT_ID es requerido")

settings = Settings()
