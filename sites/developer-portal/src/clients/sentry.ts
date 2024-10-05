import { init, extraErrorDataIntegration } from '@sentry/react';
import { ENV_VARS } from '../utils/constants';

init({
  dsn: 'https://1539dfd114264da8b8675e9c49310c26@o4504568036720640.ingest.us.sentry.io/4508054352953344',
  environment: ENV_VARS.environment.toLowerCase(),
  integrations: [extraErrorDataIntegration()],
});
