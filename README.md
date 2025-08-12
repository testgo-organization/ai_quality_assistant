# TestGoAi - Plataforma Inteligente de Análisis de Contacto Cliente

## Descripción General

TestGoAi es una plataforma SaaS que permite analizar, comprender y mejorar las interacciones con clientes mediante inteligencia artificial avanzada. Soporta análisis de archivos de texto y audio, extracción de motivos de contacto, análisis de sentimientos, predicción de satisfacción (CSAT/NPS), cumplimiento de protocolos y mucho más.

---

## Tecnologías Utilizadas

- **Vite** (bundler)
- **TypeScript**
- **React**
- **shadcn-ui** (UI components)
- **Tailwind CSS**
- **Lucide-react** (iconos)
- **Context API** (manejo de autenticación y estado global)
- **Custom Hooks** (manejo de tareas, notificaciones, chat, etc.)

---

## Estructura Principal del Proyecto

- `/src/pages` - Páginas principales (Dashboard, Upload, Index, etc.)
- `/src/components` - Componentes reutilizables (Cards, Modals, Chat, etc.)
- `/src/contexts` - Contextos globales (AuthContext)
- `/src/hooks` - Hooks personalizados (useTaskStatus, useNotifications, useChatApi, etc.)
- `/src/types` - Tipos TypeScript globales
- `/src/config.ts` - Configuración de endpoints y variables globales

---

## Funcionalidades Clave

### 1. **Autenticación y Registro**
- Registro y login contra backend real.
- Manejo de sesión con token JWT (almacenado en localStorage).
- Modal de autenticación reutilizable.
- Estado global de usuario y token.

### 2. **Carga y Procesamiento de Archivos**
- Soporte para archivos `.txt`, `.csv` y audio.
- Drag & drop y selección manual.
- Validación de tipos de archivo.
- Envío de archivos al backend para procesamiento.
- Modal de progreso y polling de estado de tareas.

### 3. **Dashboard de Análisis**
- Visualización de resultados de análisis por archivo.
- KPIs: sentimiento, humor, razón de contacto, FCR, categorías, transcripción.
- Polling automático para actualizar el estado de las tareas.
- Manejo de errores y estados de carga.

### 4. **Notificaciones Globales**
- Notificaciones automáticas para cambios de estado de tareas (éxito, error, procesamiento).
- Sistema de notificaciones desacoplado mediante hooks y contexto.

### 5. **Onboarding Interactivo con AiGO**
- Chat interactivo de onboarding para nuevos usuarios.
- Activación automática tras login/registro si el usuario no ha completado el onboarding.
- Comunicación HTTP streaming con backend AiGO.
- Mensajes animados, quick actions, y cierre de onboarding con actualización de usuario.
- El estado de onboarding se actualiza en el backend al finalizar el flujo.
- El chat utiliza HTTP streaming para respuestas en tiempo real.
- El componente principal es `AiGoChat.tsx` y el hook `useChatApi.ts`.

### 6. **Planes y Precios**
- Sección de precios con planes diferenciados.
- Acciones protegidas según autenticación.

---

## Seguridad

- El token de autenticación se almacena en `localStorage` (conveniente pero no 100% seguro ante XSS).
- Se recomienda usar cookies HttpOnly para máxima seguridad en producción.
- Todas las llamadas al backend usan el token en el header `Authorization`.

---

## Cómo Ejecutar el Proyecto Localmente

```sh
# 1. Clona el repositorio
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# 2. Instala las dependencias
npm install

# 3. Inicia el servidor de desarrollo
npm run dev
```

---

## Despliegue

Puedes desplegar el proyecto directamente desde [Lovable](https://lovable.dev/projects/7acd8369-4f95-4899-9dc2-885ed4789b02) usando la opción Share -> Publish.

---

## Personalización y Extensión

- **Variables de entorno:** Edita `/src/config.ts` para cambiar endpoints y configuraciones globales.
- **Componentes UI:** Personaliza los componentes en `/src/components` para adaptar el look & feel.
- **Hooks:** Extiende la lógica de negocio en `/src/hooks`.

---

## Integración del Chat AiGO

- El chat de onboarding AiGO se activa automáticamente tras login/registro si el usuario no ha completado el onboarding.
- El estado de onboarding se actualiza en el backend al finalizar el flujo.
- El chat utiliza HTTP streaming para respuestas en tiempo real.
- El componente principal es `AiGoChat.tsx` y el hook `useChatApi.ts`.
- El contexto de autenticación (`AuthContext.tsx`) expone el estado y las funciones para mostrar/ocultar el chat y completar el onboarding.
- El chat soporta quick actions, mensajes animados, y feedback visual de conexión.

---

## Contacto y Soporte

- Email: contacto@tetgoai.com
- Teléfono: +1 (800) 123-4567
- Ciudad de México, México

---

## Licencia

Este proyecto es privado y propiedad de TestGoAi.

---

## Recursos Útiles

- [Documentación Lovable](https://docs.lovable.dev/)
- [shadcn-ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## Más sobre AiGO

Para detalles técnicos y de integración del chat AiGO, consulta el archivo [`AIGO_CHAT_README.md`](./AIGO_CHAT_README.md).
