const API_URLS = {
  development: 'http://127.0.0.1:8000/api/v1/',
  staging: 'https://aws-cx-analyzer.testgoai.com/api/v1/',
  production: 'https://aws-cx-analyzer.testgoai.com/api/v1/',
};

const AIGO_API_URLS = {
  development: 'http://127.0.0.1:8010/',
  staging: 'https://agent-ai-quality.testgoai.com/',
  production: 'https://agent-ai-quality.testgoai.com/',
};

const environment = import.meta.env.MODE || 'production';

export const API_BASE_URL = API_URLS[environment as keyof typeof API_URLS] || API_URLS.staging;
export const AIGO_API_BASE_URL = AIGO_API_URLS[environment as keyof typeof AIGO_API_URLS] || AIGO_API_URLS.staging;