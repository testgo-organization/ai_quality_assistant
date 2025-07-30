# Chat AiGO - Onboarding Interactivo

## Descripción

El chat AiGO es un sistema de onboarding interactivo que se activa automáticamente cuando un usuario inicia sesión o se registra y aún no ha completado el onboarding de AI Quality. El sistema utiliza WebSockets para comunicación en tiempo real con el asistente AI.

## Características Principales

### 🎨 Diseño Atractivo
- **Gradientes animados**: Header con gradientes que crean un efecto visual atractivo
- **Animaciones fluidas**: Mensajes que aparecen con animaciones slide-in
- **Estados visuales**: Indicadores de conexión y carga con spinners animados
- **Paleta de colores consistente**: Respeta la paleta de colores de la aplicación

### 🔗 Comunicación WebSocket
- **Tiempo real**: Conexión WebSocket a `ws://localhost:8010/ws/chat/session_123?full_name=Usuario`
- **Reconexión automática**: Manejo de reconexión y cola de mensajes
- **Estado de conexión**: Indicador visual del estado de la conexión
- **Manejo de errores**: Gestión robusta de errores de conexión

### 🚀 Funcionalidades UX/UI

#### Inicialización Automática
- **Saludo dinámico**: El mensaje de bienvenida viene del servidor, no está hardcodeado
- **Conexión transparente**: Se envía un "hola" automático en background al conectarse
- **Estado de carga**: Indicador "AiGO se está inicializando..." mientras se establece la conexión
- **Sin mensajes falsos**: Solo se muestran mensajes reales del servidor

#### Header Interactivo
- Avatar animado del bot AiGO con indicador de estado
- Badge de onboarding activo con ícono giratorio
- Indicador de conexión en tiempo real
- Botón de cerrar con efectos hover

#### Área de Mensajes
- **Scroll automático**: Se desplaza automáticamente al último mensaje
- **Mensajes diferenciados**: Estilos diferentes para usuario y bot
- **Timestamps**: Hora de cada mensaje
- **Animaciones de entrada**: Cada mensaje aparece con animación
- **Indicador de escritura**: Spinner cuando AiGO está respondiendo

#### Acciones Rápidas
- Botones de acciones comunes para nuevos usuarios
- Solo se muestran después del primer mensaje del servidor (mensaje de bienvenida)
- Desaparecen automáticamente cuando hay más interacción

#### Input Avanzado
- **Envío con Enter**: Soporte para envío con tecla Enter
- **Estado deshabilitado**: Input se deshabilita durante el envío
- **Placeholder dinámico**: Texto de ayuda contextual
- **Botón de envío**: Con spinner durante el proceso

### 🏗️ Arquitectura del Código

#### Componentes Principales

1. **`AiGoChat.tsx`** - Componente principal del chat
   - Maneja la UI del chat
   - Integra con el contexto de autenticación
   - Gestiona el estado de los mensajes

2. **`useChatApi.ts`** - Hook personalizado para WebSocket
   - Conexión y reconexión automática
   - Cola de mensajes para garantizar entrega
   - Callbacks para eventos de conexión y mensajes

3. **`AuthContext.tsx`** - Contexto de autenticación extendido
   - Control del estado de onboarding
   - Gestión de la visibilidad del chat
   - Función para completar onboarding

#### Flujo de Funcionamiento

1. **Inicio de sesión/registro**
   ```
   Usuario se autentica → 
   Verifica estado de onboarding → 
   Si no completado → Muestra chat AiGO
   ```

2. **Conexión WebSocket e Inicialización**
   ```
   Componente se monta → 
   Hook inicia conexión WS → 
   Conexión establecida → 
   Envía "hola" automático en background → 
   Servidor responde con mensaje de bienvenida personalizado →
   Se muestra el primer mensaje real del servidor
   ```

3. **Envío de mensaje**
   ```
   Usuario escribe → 
   Mensaje se agrega localmente → 
   Se envía por WebSocket → 
   Respuesta llega por callback → 
   Se agrega a la lista de mensajes
   ```

4. **Completar onboarding**
   ```
   Usuario completa → 
   Estado se actualiza → 
   Chat se cierra → 
   No se vuelve a mostrar
   ```

## Configuración del API

### Endpoint WebSocket
```
ws://localhost:8010/ws/chat/{session_id}?full_name={nombre_usuario}
```

### Formato de Mensajes

**Envío:**
```json
{
  "message": "Texto del mensaje del usuario",
  "timestamp": "2025-07-30T10:30:00.000Z"
}
```

**Recepción:**
```json
{
  "message": "Respuesta del asistente AiGO",
  "response": "Texto alternativo de respuesta"
}
```

## Integración

### 1. Contexto de Autenticación
```typescript
// El contexto incluye nuevas propiedades:
interface AuthContextType {
  // ... propiedades existentes
  showAiGoChat: boolean;
  setShowAiGoChat: (show: boolean) => void;
  completeAiQualityOnboarding: () => void;
}
```

### 2. Uso en la Aplicación
```typescript
// En App.tsx se incluye el wrapper del chat
function AiGoChatWrapper() {
  const { showAiGoChat, setShowAiGoChat } = useAuth();
  return <AiGoChat open={showAiGoChat} onOpenChange={setShowAiGoChat} />;
}
```

### 3. Activación Automática
El chat se activa automáticamente cuando:
- Usuario completa login exitoso Y `hasCompletedAiQualityOnboarding === false`
- Usuario completa registro exitoso (siempre se activa)

## Personalización

### Colores y Estilos
El chat respeta las variables CSS de la aplicación:
- `--primary`: Color principal para gradientes
- `--secondary`: Color secundario para gradientes
- `--background`: Fondo de la aplicación

### Sesiones
Cada usuario tiene una sesión única basada en su ID:
```typescript
sessionId: `session_${user?.id || Date.now()}`
```

### Mensajes de Bienvenida
El mensaje inicial se personaliza con el nombre del usuario:
```typescript
content: `¡Hola ${user?.name || 'Usuario'}! 👋 Soy AiGO...`
```

## Desarrollo y Testing

### Ejecutar en Desarrollo
```bash
npm run dev
```

### Verificar Conexión WebSocket
1. Asegúrate de que el servidor AiGO esté ejecutándose en `localhost:8010`
2. Abre las herramientas de desarrollador
3. Ve a la pestaña Network → WS para ver la conexión WebSocket
4. Los logs aparecerán en la consola

### Estados de Conexión
- **Conectado**: Badge verde con "Conectado"
- **Desconectado**: Badge rojo con "Desconectado"
- **Enviando**: Spinner en el botón de envío
- **Escribiendo**: Indicador de que AiGO está respondiendo

## Mejoras Futuras

1. **Persistencia de conversación**: Guardar historial en localStorage
2. **Temas personalizados**: Modo oscuro/claro
3. **Emojis y reacciones**: Añadir soporte para emojis
4. **Archivos adjuntos**: Permitir envío de imágenes/documentos
5. **Notificaciones**: Alertas cuando el chat está minimizado
6. **Analytics**: Métricas de uso y completitud de onboarding

## Troubleshooting

### El chat no aparece
- Verificar que `hasCompletedAiQualityOnboarding` sea `false`
- Revisar el estado de autenticación en DevTools

### WebSocket no conecta
- Verificar que el servidor esté ejecutándose en puerto 8010
- Revisar la consola para errores de conexión
- Verificar que no haya firewall bloqueando conexiones locales

### Mensajes no se envían
- Verificar estado de conexión WebSocket
- Revisar la cola de mensajes en el hook
- Verificar formato de mensajes en la consola de red
