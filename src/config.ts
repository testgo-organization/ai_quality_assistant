const API_URLS = {
  development: 'http://127.0.0.1:8000/api/v1/',
  staging: 'https://aws-cx-analyzer.testgoai.com/api/v1/',
};

const AIGO_API_URLS = {
  development: 'http://127.0.0.1:8010',
  staging: 'https://your-staging-aigo-api.com', // Reemplazar cuando tengas staging
};

const environment = import.meta.env.MODE || 'development';

export const API_BASE_URL = API_URLS[environment as keyof typeof API_URLS] || API_URLS.development;
export const AIGO_API_BASE_URL = AIGO_API_URLS[environment as keyof typeof AIGO_API_URLS] || AIGO_API_URLS.development;