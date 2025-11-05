export const API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY ?? '';

if (!API_KEY) {
  throw new Error('API key is not defined. Please set NEXT_PUBLIC_PARA_API_KEY in your environment variables.');
}

// Detect environment from API key prefix
export const ENVIRONMENT = API_KEY.startsWith('prod_')
  ? 'production'
  : API_KEY.startsWith('beta_')
    ? 'beta'
    : API_KEY.startsWith('sandbox_')
      ? 'sandbox'
      : 'unknown';

export const IS_PRODUCTION = ENVIRONMENT === 'production';
