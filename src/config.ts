const API_URLS = {
  development: 'http://127.0.0.1:8000/api/v1/',
  staging: 'https://aws-cx-analyzer.testgoai.com/api/v1/',
};

const environment = import.meta.env.MODE || 'development';

export const API_BASE_URL = API_URLS[environment as keyof typeof API_URLS] || API_URLS.development; 