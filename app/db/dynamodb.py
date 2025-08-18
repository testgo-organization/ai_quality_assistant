from uuid import uuid4
from app.config import settings
from pynamodb.models import Model
from pynamodb.attributes import UnicodeAttribute, NumberAttribute, ListAttribute, MapAttribute
from datetime import datetime
from pynamodb.exceptions import DoesNotExist

# --- Atributos anidados (igual que antes) ---
class ErroresGravesNegocio(MapAttribute):
    empresa = ListAttribute(of=UnicodeAttribute)
    cliente = ListAttribute(of=UnicodeAttribute)

class Protocolo(MapAttribute):
    saludo_inicial = UnicodeAttribute()
    despedida = UnicodeAttribute()

class ReglasEvaluacion(MapAttribute):
    error_grave_cliente = UnicodeAttribute()
    error_grave_negocio = UnicodeAttribute()
    error_no_grave = UnicodeAttribute()

class ModelContext(MapAttribute):
    servicio = UnicodeAttribute()
    campaña = UnicodeAttribute()
    tipo_gestion = UnicodeAttribute()
    tiempo_espera_aprobado_segundos = NumberAttribute(null=True)
    errores_graves_cliente = ListAttribute(of=UnicodeAttribute, null=True)
    errores_graves_negocio = ErroresGravesNegocio(null=True)
    errores_no_graves = ListAttribute(of=UnicodeAttribute, null=True)
    protocolo = Protocolo(null=True)
    reglas_evaluacion = ReglasEvaluacion(null=True)

class Message(MapAttribute):
    role = UnicodeAttribute()
    content = UnicodeAttribute()
    timestamp = UnicodeAttribute()

class UserConversationModel(Model):
    class Meta:
        table_name = settings.DYNAMODB_TABLE
        region = settings.DYNAMODB_REGION
        aws_access_key_id = settings.DYNAMODB_ACCESS_KEY
        aws_secret_access_key = settings.DYNAMODB_SECRET_KEY

    
    full_name = UnicodeAttribute(null=True)
    
    pk = UnicodeAttribute(hash_key=True)
    sk = UnicodeAttribute(range_key=True)
    
    # Atributos específicos de la conversación (opcionales, ya que se anidan en el JSON)
    messages = ListAttribute(of=Message, null=True)
    model_context = ModelContext(null=True)
    
    # Atributos adicionales que necesites
    user_id = UnicodeAttribute(null=True)
    session_id = UnicodeAttribute(null=True)

def put_conversation_item(item: dict):
    """
    Agrega un mensaje a la conversación en DynamoDB.
    Si la conversación no existe, la crea.
    """
    pk = f"USER#{item['user_id']}"
    sk = f"CONVERSATION#{item['session_id']}"
    timestamp = datetime.utcnow().isoformat()
    message_obj = {
        "role": item.get("role", "user"),
        "content": item.get("message"),
        "timestamp": timestamp
    }

    try:
        # Intentar obtener la conversación existente
        conv = UserConversationModel.get(pk, sk)
        # Si existe, agregar el mensaje a la lista
        if conv.messages is None:
            conv.messages = []
        conv.messages.append(message_obj)
        # Actualizar otros campos si es necesario
        if item.get("full_name"):
            conv.full_name = item["full_name"]
        if item.get("type"):
            conv.type = item["type"]
        if item.get("function_data"):
            conv.model_context = item["function_data"]
        conv.save()
    except DoesNotExist:
        # Si no existe, crear la conversación con el mensaje inicial
        conv = UserConversationModel(
            pk=pk,
            sk=sk,
            user_id=item["user_id"],
            session_id=item["session_id"],
            full_name=item.get("full_name"),
            messages=[message_obj]
        )
        if item.get("function_data"):
            conv.model_context = item["function_data"]
        conv.save()

def put_model_context(user_id: str, session_id: str, model_context: dict):
    """
    Actualiza el campo model_context de una conversación en DynamoDB.
    """
    pk = f"USER#{user_id}"
    sk = f"CONVERSATION#{session_id}"
    try:
        conv = UserConversationModel.get(pk, sk)
        conv.model_context = model_context
        conv.save()
    except DoesNotExist:
        # Si no existe la conversación, la crea solo con el model_context
        conv = UserConversationModel(
            pk=pk,
            sk=sk,
            user_id=user_id,
            session_id=session_id,
            model_context=model_context
        )
        conv.save()

def get_conversation_history(user_id: str, session_id: str):
    """
    Obtiene el historial de mensajes de una conversación.
    """
    pk = f"USER#{user_id}"
    sk = f"CONVERSATION#{session_id}"
    try:
        conv = UserConversationModel.get(pk, sk)
        return {
            "messages": conv.messages or [],
            "model_context": conv.model_context.as_dict() if conv.model_context else None,
            "full_name": conv.full_name,
            "session_id": conv.session_id,
            "user_id": conv.user_id,
        }
    except DoesNotExist:
        return None

def put_conversation_history(user_id: str, session_id: str, data: dict):
    """
    Actualiza o crea el historial completo de una conversación.
    """
    pk = f"USER#{user_id}"
    sk = f"CONVERSATION#{session_id}"
    try:
        conv = UserConversationModel.get(pk, sk)
        if "messages" in data:
            conv.messages = data["messages"]
        if "model_context" in data:
            conv.model_context = data["model_context"]
        if "full_name" in data:
            conv.full_name = data["full_name"]
        conv.save()
    except DoesNotExist:
        conv = UserConversationModel(
            pk=pk,
            sk=sk,
            user_id=user_id,
            session_id=session_id,
            full_name=data.get("full_name"),
            messages=data.get("messages", []),
            model_context=data.get("model_context"),
        )
        conv.save()