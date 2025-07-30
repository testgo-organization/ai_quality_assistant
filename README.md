# AiGO Streaming API

API FastAPI para conversaciones streaming en tiempo real con el asistente AiGO de OpenAI.

## Características

- 🔄 **Streaming en tiempo real** - Respuestas en vivo vía WebSocket
- 🤖 **Integración OpenAI Assistant** - Conecta directamente con AiGO (asst_MhtIYnV2GIIGf2DK2)
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

### Componentes Principales

- **ConversationManager**: Gestiona threads de OpenAI y streaming
- **WebSocket Handler**: Maneja conexiones en tiempo real
- **Function Detection**: Detecta automáticamente `generar_json_final`
- **Session Management**: Mantiene conversaciones independientes

### Flujo de Conversación

1. Cliente se conecta vía WebSocket (opcionalmente con parámetro `full_name`)
2. Se crea/recupera thread de OpenAI
3. Si se proporciona `full_name`, se envían instrucciones adicionales al asistente para personalización
4. Mensajes se envían al asistente AiGO
5. Respuestas se envían en streaming (personalizadas con el nombre si se proporcionó)
6. Si se detecta `generar_json_final`, se procesa y finaliza la conversación

## Desarrollo

### Estructura del Proyecto
```
app/
├── __init__.py
├── main.py          # Aplicación principal FastAPI
├── models.py        # Modelos Pydantic
└── config.py        # Configuración

.env.example         # Variables de entorno template
run.py              # Script de inicio
pyproject.toml      # Configuración Poetry
```

### Agregar Dependencias
```bash
poetry add nueva-dependencia
poetry add --group dev dependencia-dev
```

### Testing
```bash
# Instalar dependencias de testing (cuando estén configuradas)
poetry run pytest
```

## Configuración

### Variables de Entorno (.env)

```env
OPENAI_API_KEY=your_openai_api_key_here
ASSISTANT_ID=asst_MhtIYnV2GIIGf2DK2
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

### Personalización por Nombre
- El endpoint WebSocket acepta un parámetro opcional `full_name`
- Cuando se proporciona, el asistente recibe instrucciones para personalizar la conversación
- Ejemplo: `ws://localhost:8000/ws/chat/session123?full_name=María%20García`
- El asistente usará el nombre en sus respuestas para crear una experiencia más personal

### Detección de Función Final
- Monitorea automáticamente las llamadas a `generar_json_final`
- Captura los datos finales antes de la despedida
- Finaliza la conversación de forma elegante

### Gestión de Sesiones
- Cada conexión WebSocket tiene un ID único
- Las conversaciones se mantienen independientes
- Se almacena el nombre del usuario cuando se proporciona
- Cleanup automático al desconectar

### Error Handling
- Manejo robusto de errores de OpenAI
- Reconexión automática en caso de fallos
- Logging detallado para debugging

## Troubleshooting

### Errores Comunes

1. **"OPENAI_API_KEY is required"**
   - Configurar la variable de entorno en `.env`

2. **WebSocket connection failed**
   - Verificar que el servidor esté ejecutándose
   - Revisar configuración de CORS

3. **Assistant not responding**
   - Verificar que el ASSISTANT_ID sea correcto
   - Revisar logs del servidor

### Logs
Los logs se imprimen en consola con nivel INFO por defecto. Ajustar con `LOG_LEVEL=DEBUG` para más detalle.
