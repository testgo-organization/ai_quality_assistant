# Copilot Instructions - AiGO Streaming API

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a FastAPI application for real-time streaming conversations with OpenAI Assistant "AiGO" (ID: asst_MhtIYnV2GIIGf2DK2). The API provides WebSocket-based streaming responses and special handling for the `generar_json_final` function that signals conversation completion.

## Key Architecture Patterns

### WebSocket Streaming Pattern
- Use `ConversationManager` class for managing OpenAI threads and runs
- Stream responses via WebSocket with JSON message protocol
- Handle OpenAI Assistant states: `in_progress`, `completed`, `requires_action`, `failed`
- Always check run status in loops with `asyncio.sleep(1)` to avoid rate limiting

### Function Call Handling
- Monitor for `generar_json_final` function calls in `requires_action` state
- Set `conversation.is_final = True` when this function is detected
- Send `final_data` message type before farewell message
- Always include tool_outputs response to continue the run

### Session Management
- Use session_id as key in `active_conversations` dict
- Each session has: `manager`, `created_at`, `websocket`
- Clean up sessions on WebSocket disconnect
- Thread IDs are managed per session

## Development Workflows

### Running the Application
```bash
# Development mode
poetry run python run.py

# Or direct uvicorn
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Environment Setup
- Always use `.env` file for configuration
- Required: `OPENAI_API_KEY` and `ASSISTANT_ID`
- Use `app.config.Settings` class for configuration management

### Testing WebSocket
- Use the built-in test client at `/test` endpoint
- Test JSON message format: `{"type": "message", "content": "text"}`
- Monitor different message types: `message`, `status`, `function_call`, `final_data`, `farewell`

## Code Conventions

### WebSocket Message Types
- `message`: Regular chat responses
- `status`: Processing updates  
- `function_call`: When assistant calls a function
- `final_data`: Data from `generar_json_final`
- `farewell`: Conversation completion
- `error`: Error states
- `connection`: Initial connection confirmation

### Error Handling
- Always wrap OpenAI API calls in try-catch
- Send error messages via WebSocket as JSON with `type: "error"`
- Log errors with context using the configured logger
- Continue conversation flow even after non-critical errors

### Async Patterns
- Use `AsyncOpenAI` client for all OpenAI operations
- Implement proper WebSocket lifecycle with accept/disconnect handling
- Use `asyncio.sleep()` for polling intervals, not blocking calls

## Integration Points

### OpenAI Assistant Integration
- Uses OpenAI Assistants API v2 (beta)
- Creates threads per conversation session
- Submits tool outputs for function calls
- Monitors run status for streaming updates

### FastAPI Configuration
- CORS enabled for frontend integration
- Health check endpoint at `/health`
- Session management endpoints for monitoring
- HTML test client for development

When implementing new features, follow these patterns and always test with the `/test` endpoint before frontend integration.
