// Variables de entorno y configuración
export const config = {
  // API URLs
  apiUrl: process.env.VITE_API_URL || 'http://localhost:3000',
  
  // Auth
  authTokenKey: 'auth_token',
  refreshTokenKey: 'refresh_token',
  
  // Feature flags
  features: {
    enableAnalytics: process.env.VITE_ENABLE_ANALYTICS === 'true',
    enableChat: process.env.VITE_ENABLE_CHAT === 'true',
  },
  
  // Límites de archivos
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['text/csv', 'audio/wav', 'audio/mp3'],
    maxFiles: 5,
  },
  
  // Configuración de caché
  cache: {
    ttl: 5 * 60 * 1000, // 5 minutos
  },
  
  // Timeouts
  timeouts: {
    api: 30000, // 30 segundos
    uploadTimeout: 5 * 60 * 1000, // 5 minutos
  },
  
  // Paginación
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100,
  },
  
  // Monitoreo (opcional - configurar solo si se necesita)
  monitoring: {
    enableErrorReporting: import.meta.env.PROD,
    environment: import.meta.env.MODE,
  },
  
  // Tema
  theme: {
    storageKey: 'theme',
    defaultTheme: 'light' as const,
  },
}
