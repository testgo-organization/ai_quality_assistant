# Ai## Características

- 🔄 **Streaming en tiempo real** - Respuestas en vivo vía WebSocket
- 🤖 **Integración OpenAI Assistant** - Conecta directamente con AiGO
- 🎯 **Manejo especial de `generar_json_final`** - Detecta y procesa automáticamente la función final
- 👤 **Personalización por nombre** - El asistente puede personalizar respuestas usando el nombre del usuario
- 📝 **Gestión de sesiones** - Mantiene conversaciones independientes con persistencia
- 🏗️ **Arquitectura DDD** - Domain-Driven Design para código mantenible y escalable
- 🔧 **Inyección de dependencias** - Arquitectura desacoplada y testeable
- 🧪 **Cliente de prueba mejorado** - Interface web moderna para testing
- 📊 **Monitoreo de estados** - Seguimiento detallado del estado de conversacionesming API v2.0

API FastAPI para conversaciones streaming en tiempo real con el asistente AiGO de OpenAI. Refactorizada con arquitectura DDD (Domain-Driven Design) para mayor escalabilidad y mantenibilidad.

## Características

- 🔄 **Streaming en tiempo real** - Respuestas en vivo vía WebSocket
- 🤖 **Integración OpenAI Assistant** - Conecta directamente con AiGO
- 🎯 **Manejo especial de `generar_json_final`** - Detecta y procesa automáticamente la función final
- � **Personalización por nombre** - El asistente puede personalizar respuestas usando el nombre del usuario
- �📝 **Gestión de sesiones** - Mantiene conversaciones independientes
- 🧪 **Cliente de prueba incluido** - Interface web para testing

## Instalación

### Requisitos
- Python 3.9+
- Poetry (para gestión de dependencias)
- Clave API de OpenAI

### Configuración

1. **Clonar y configurar el proyecto:**
```bash
cd backend/api_agent
poetry install
```

2. **Configurar variables de entorno:**
```bash
cp .env.example .env
# Editar .env con tu OPENAI_API_KEY
```

3. **Ejecutar la aplicación:**
```bash
# Opción 1: Con Poetry
poetry run python run.py

# Opción 2: Directo con uvicorn
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Uso

### API Endpoints

- `GET /` - Estado de la API
- `GET /health` - Health check
- `GET /test` - Cliente de prueba web
- `WebSocket /ws/chat/{session_id}` - Endpoint principal para chat streaming (acepta parámetro opcional `full_name`)
- `GET /sessions` - Listar sesiones activas
- `DELETE /sessions/{session_id}` - Cerrar sesión específica

### WebSocket Protocol

#### Conexión con personalización (opcional):
```javascript
// Sin personalización
const ws = new WebSocket('ws://localhost:8000/ws/chat/mi_session_123');

// Con personalización por nombre
const ws = new WebSocket('ws://localhost:8000/ws/chat/mi_session_123?full_name=Juan%20Pérez');
```

#### Enviar mensaje:
```json
{
  "type": "message",
  "content": "Hola AiGO, ¿cómo estás?"
}
```

#### Respuestas del servidor:
```json
{
  "type": "message",
  "content": "¡Hola! Estoy muy bien...",
  "status": "completed"
}
```

#### Función final detectada:
```json
{
  "type": "final_data",
  "data": { /* datos finales del asistente */ },
  "status": "completed"
}
```

#### Despedida automática:
```json
{
  "type": "farewell",
  "content": "¡Gracias por usar AiGO! La conversación ha finalizado.",
  "final_data": { /* datos finales */ },
  "status": "completed"
}
```

### Cliente de Prueba

Visita `http://localhost:8000/test` para usar el cliente web de prueba.

### Ejemplos de Uso

#### Conexión básica (anónima):
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/chat/session_123');
```

#### Conexión personalizada:
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/chat/session_123?full_name=Ana%20López');
```

#### Con herramientas de testing:
```bash
# Con wscat (sin personalización)
wscat -c "ws://localhost:8000/ws/chat/test_session"

# Con wscat (personalizada)
wscat -c "ws://localhost:8000/ws/chat/test_session?full_name=Carlos%20Ruiz"
```

#### Desde Postman WebSocket:
- URL: `ws://localhost:8000/ws/chat/mi_session_456`
- Con personalización: `ws://localhost:8000/ws/chat/mi_session_456?full_name=Pedro%20Martínez`

## Arquitectura

### Diseño Domain-Driven (DDD)

La aplicación sigue una arquitectura por capas basada en DDD para garantizar separación de responsabilidades y facilitar el mantenimiento:

```
app/
├── api/                    # 🌐 Capa de Presentación
│   ├── chat.py            # Endpoints de WebSocket y gestión de sesiones
│   └── health.py          # Endpoints de monitoreo y salud
├── domain/                 # 🧠 Capa de Dominio (Lógica de Negocio)
│   ├── entities.py        # Entidades del dominio (User, Conversation, Message)
│   ├── services.py        # Servicios de dominio (ConversationService, MessageService)
│   └── events.py          # Eventos del dominio (MessageReceived, ConversationEnded)
├── infrastructure/        # 🔧 Capa de Infraestructura
│   ├── openai_client.py   # Cliente para OpenAI API
│   ├── session_store.py   # Almacenamiento de sesiones en memoria
│   └── websocket_manager.py # Gestión de conexiones WebSocket
├── shared/                 # 📦 Código compartido
│   ├── exceptions.py      # Excepciones personalizadas
│   └── types.py          # Tipos y enums comunes
├── core/                   # ⚙️ Configuración central
│   └── dependencies.py   # Inyección de dependencias
└── main.py                # 🚀 Punto de entrada y configuración FastAPI
```

### Componentes Principales

#### Capa de Dominio (Domain Layer)
- **Entities**: `User`, `Conversation`, `Message` - Objetos de negocio con identidad y comportamiento
- **Services**: `ConversationService`, `MessageService` - Lógica de negocio pura
- **Events**: Eventos para comunicación entre bounded contexts

#### Capa de Infraestructura (Infrastructure Layer)
- **OpenAIClient**: Abstracción para la API de OpenAI con manejo de errores
- **SessionStore**: Repositorio en memoria para gestión de sesiones
- **WebSocketManager**: Orquestador de conexiones WebSocket y streaming

#### Capa de Presentación (API Layer)  
- **Endpoints REST y WebSocket**: Interfaz con el mundo exterior
- **Inyección de dependencias**: Desacoplamiento entre capas
- **Validación de entrada**: Usando Pydantic y FastAPI

### Flujo de Conversación

1. **Conexión**: Cliente se conecta vía WebSocket (opcionalmente con parámetro `full_name`)
2. **Inicialización**: Se crea una nueva `Conversation` entity con `User` asociado
3. **Persistencia**: `SessionStore` almacena la conversación en memoria
4. **Thread Creation**: `OpenAIClient` crea un thread en OpenAI para la conversación
5. **Personalización**: Si se proporciona `full_name`, se envían instrucciones adicionales al asistente
6. **Streaming**: `ConversationService` maneja el envío de mensajes y streaming de respuestas
7. **Event Handling**: `MessageService` procesa eventos como `generar_json_final`
8. **Finalización**: Al detectar función final, se emite evento de cierre y se finaliza la conversación

### Ventajas de la Arquitectura

- **🔒 Separación de responsabilidades**: Cada capa tiene una responsabilidad específica
- **🧪 Facilidad de testing**: Dependencias inyectadas permiten mocking fácil
- **📈 Escalabilidad**: Estructura preparada para crecimiento y nuevas funcionalidades
- **🔄 Mantenibilidad**: Código organizado y fácil de entender
- **🎯 Reutilización**: Servicios de dominio reutilizables en diferentes contextos

## Desarrollo

### Estructura del Proyecto (DDD)
```
app/
├── __init__.py
├── main.py                 # 🚀 FastAPI app y configuración
├── config.py              # ⚙️ Variables de entorno
├── api/                    # 🌐 Capa de Presentación
│   ├── __init__.py
│   ├── chat.py            # WebSocket y endpoints de chat
│   └── health.py          # Health checks y monitoreo
├── domain/                 # 🧠 Lógica de Negocio Pura
│   ├── __init__.py
│   ├── entities.py        # User, Conversation, Message
│   ├── services.py        # ConversationService, MessageService
│   └── events.py          # Eventos del dominio
├── infrastructure/        # 🔧 Implementaciones Técnicas
│   ├── __init__.py
│   ├── openai_client.py   # Cliente OpenAI
│   ├── session_store.py   # Repositorio de sesiones
│   └── websocket_manager.py # Gestión WebSocket
├── shared/                 # 📦 Código Compartido
│   ├── __init__.py
│   ├── exceptions.py      # Excepciones personalizadas
│   └── types.py          # Enums y tipos comunes
└── core/                   # ⚙️ Configuración Central
    ├── __init__.py
    └── dependencies.py    # Inyección de dependencias

# Archivos de configuración
.env                       # Variables de entorno
.env.example              # Template de configuración
run.py                    # Script de inicio
pyproject.toml           # Configuración Poetry
```

### Agregar Dependencias
```bash
# Dependencias de producción
poetry add nueva-dependencia

# Dependencias de desarrollo
poetry add --group dev dependencia-dev

# Reinstalar después de cambios en pyproject.toml
poetry install
```

### Testing
```bash
# Instalar dependencias de testing
poetry add --group dev pytest pytest-asyncio httpx

# Ejecutar tests (cuando estén implementados)
poetry run pytest

# Tests con cobertura
poetry run pytest --cov=app
```

### Extensión de la Arquitectura

#### Agregar nueva funcionalidad:

1. **Nueva entidad de dominio**:
```python
# app/domain/entities.py
@dataclass
class NewEntity:
    id: str
    # ... otros campos
```

2. **Nuevo servicio de dominio**:
```python
# app/domain/services.py
class NewService:
    def __init__(self, repository: INewRepository):
        self._repository = repository
    
    async def business_logic(self) -> None:
        # Lógica de negocio aquí
        pass
```

3. **Nueva implementación de infraestructura**:
```python
# app/infrastructure/new_client.py
class NewClient:
    async def external_call(self) -> dict:
        # Implementación técnica
        pass
```

4. **Nuevo endpoint**:
```python
# app/api/new_endpoints.py
router = APIRouter(prefix="/new", tags=["new"])

@router.get("/")
async def get_new(service=Depends(get_new_service)):
    return await service.business_logic()
```

## Configuración

### Variables de Entorno (.env)

```env
OPENAI_API_KEY=your_openai_api_key_here
VECTOR_STORE_ID=your_vector_store_id
HOST=0.0.0.0
PORT=8000
DEBUG=True
LOG_LEVEL=INFO
ALLOWED_ORIGINS=*
```

## Deployment

### Producción

1. **Configurar variables:**
```bash
export OPENAI_API_KEY="tu_clave_real"
export DEBUG=False
export ALLOWED_ORIGINS="https://tu-frontend.com"
```

2. **Ejecutar:**
```bash
poetry run python run.py
```

### Docker (opcional)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY pyproject.toml poetry.lock ./
RUN pip install poetry && poetry install --no-dev
COPY . .
CMD ["poetry", "run", "python", "run.py"]
```

## Características Avanzadas

### Arquitectura Domain-Driven Design
- **Separation of Concerns**: Cada capa tiene responsabilidades bien definidas
- **Dependency Injection**: Facilita testing y intercambio de implementaciones
- **Event-Driven**: Comunicación entre componentes mediante eventos
- **Repository Pattern**: Abstracción del almacenamiento de datos
- **Service Layer**: Lógica de negocio centralizada y reutilizable

### Personalización por Nombre
- El endpoint WebSocket acepta un parámetro opcional `full_name`
- Cuando se proporciona, el asistente recibe instrucciones para personalizar la conversación
- Ejemplo: `ws://localhost:8000/ws/chat/session123?full_name=María%20García`
- El asistente usará el nombre en sus respuestas para crear una experiencia más personal

### Detección de Función Final
- Monitorea automáticamente las llamadas a `generar_json_final`
- Captura los datos finales antes de la despedida
- Finaliza la conversación de forma elegante

### Gestión Avanzada de Sesiones
- Cada conexión WebSocket tiene un ID único
- Las conversaciones se modelan como entidades de dominio
- Estados de conversación (Active, Completed, Failed, etc.)
- Se almacena información completa del usuario y contexto
- Cleanup automático y manejo de desconexiones inesperadas
- Eventos de dominio para auditoria y monitoreo

### Manejo Robusto de Errores
- Excepciones personalizadas por capa de la aplicación
- Logging estructurado con contexto de sesión
- Recuperación automática de conexiones perdidas
- Validación de entrada en múltiples niveles
- Manejo graceful de errores de OpenAI API

### Troubleshooting

### Errores Comunes

1. **"OPENAI_API_KEY is required"**
   - Configurar la variable de entorno en `.env`
   - Verificar que el archivo `.env` esté en el directorio raíz

2. **"Assistant not found"**
   - Verificar que el ASSISTANT_ID sea correcto en `.env`
   - Confirmar que el asistente existe en tu cuenta de OpenAI

3. **WebSocket connection failed**
   - Verificar que el servidor esté ejecutándose en el puerto correcto
   - Revisar configuración de CORS en caso de conexión desde frontend
   - Verificar que no haya firewall bloqueando el puerto

4. **Import errors después de refactoring**
   - Ejecutar `poetry install` para reinstalar dependencias
   - Verificar que todos los archivos `__init__.py` estén presentes
   - Revisar imports relativos en la nueva estructura

5. **Dependency injection errors**
   - Verificar que las dependencias estén configuradas en `main.py`
   - Asegurar que los servicios se inicialicen correctamente
   - Revisar que los routers tengan acceso a las instancias inyectadas

### Logs y Debugging
Los logs se imprimen en consola con nivel INFO por defecto. Para debugging:
```bash
# Modo debug con logs detallados
LOG_LEVEL=DEBUG poetry run python run.py

# Verificar configuración
curl http://localhost:8000/health

# Monitorear sesiones activas
curl http://localhost:8000/sessions
```

### Migración desde v1.0
Si estás migrando desde la versión anterior:
1. La API pública se mantiene igual (mismos endpoints)
2. Los WebSocket mantienen el mismo protocolo de mensajes
3. El cliente de prueba tiene mejoras visuales pero misma funcionalidad
4. Variables de entorno siguen siendo las mismas

## Roadmap

### v2.1 (Próxima versión)
- [ ] Tests unitarios completos para todas las capas
- [ ] Integración con Redis para persistencia de sesiones
- [ ] Métricas y observabilidad con Prometheus
- [ ] Rate limiting por usuario
- [ ] Autenticación JWT

### v2.2 (Futuro)
- [ ] Soporte para múltiples asistentes
- [ ] Webhooks para notificaciones
- [ ] API REST complementaria
- [ ] Dashboard de administración
- [ ] Clustering y alta disponibilidad

## Contribución

### Estructura de commits
```
type(scope): description

- feat: nueva funcionalidad
- fix: corrección de errores
- refactor: refactorización de código
- docs: documentación
- test: pruebas
```

### Pull Requests
1. Fork del repositorio
2. Crear rama con nombre descriptivo: `feature/nueva-funcionalidad`
3. Implementar cambios siguiendo la arquitectura DDD
4. Agregar tests si es necesario
5. Actualizar documentación
6. Crear PR con descripción detallada
