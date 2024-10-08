import { init, extraErrorDataIntegration } from '@sentry/react';
import { ENV_VARS } from '../utils/constants';

init({
  dsn: 'https://4cbbbada7a241787f984587db5d98741@o4504568036720640.ingest.us.sentry.io/4508054352953344',
  environment: ENV_VARS.environment.toLowerCase(),
  integrations: [extraErrorDataIntegration()],
});
