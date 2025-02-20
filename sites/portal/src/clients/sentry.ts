import * as Sentry from '@sentry/react';
import { Environment } from '@getpara/web-sdk';

import { ENV } from '../constants';

// starting with non-prod to see what kind of errors we get and if sensitive data is tracked
// will turn on in prod after monitoring
if (ENV !== Environment.PROD && ENV !== Environment.DEV) {
  Sentry.init({
    environment: ENV.toLowerCase(),
    dsn: 'https://e4024b9777cf5697142f1b30eb16802d@o4504568036720640.ingest.us.sentry.io/4508845257064448',
    integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration(), Sentry.extraErrorDataIntegration()],
    tracesSampleRate: 0.01,
    replaysOnErrorSampleRate: 0.01,
  });
}
