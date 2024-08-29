import { Environment } from '../types/environment';

export const ENV_VARS = {
  environment: import.meta.env.VITE_ENVIRONMENT as string,
  capsuleApiKey: import.meta.env.VITE_CAPSULE_API_KEY,
  statsigClientKey: import.meta.env.VITE_STATSIG_CLIENT_KEY,
  statsigEnv:
    import.meta.env.VITE_ENVIRONMENT === Environment.DEV
      ? 'development'
      : import.meta.env.VITE_ENVIRONMENT === Environment.SANDBOX
        ? 'staging'
        : 'production',
};

export const BRAND_COLORS = {
  primary: '#FF754A',
  secondary: '#9C1EFF',
};

export const DOCS_LINK = 'https://docs.usecapsule.com/';

export const MOBILE_SIZE = 1000;

export const IS_PROD = ENV_VARS.environment === Environment.PROD;
export const IS_BETA = ENV_VARS.environment === Environment.BETA;
// TODO: this can be removed when sample data is removed
export const IS_DEMO = true;

export const EMAIL_FONTS = [
  'Arial',
  'Courier New',
  'Georgia',
  'Helvetica',
  'Lucida Sans',
  'Tahoma',
  'Times New Roman',
  'Trebuchet MS',
];

export const TWITTER_URL = 'https://twitter.com/usecapsule';
export const LINKEDIN_URL = 'https://www.linkedin.com/company/usecapsule';
export const SUPPORT_URL = 'mailto:support@usecapsule.com';
