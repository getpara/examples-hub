import * as Sentry from '@sentry/browser';
import ParaCore, { ConstructorOpts, Environment } from '@getpara/core-sdk';
import { WebUtils } from './WebUtils.js';

export class Para extends ParaCore {
  constructor(env: Environment, apiKey?: string, opts?: ConstructorOpts) {
    super(env, apiKey, opts);

    // starting with non-prod to see what kind of errors we get and if sensitive data is tracked
    // will turn on in prod after monitoring
    /* v8 ignore next 6 */
    if (env !== Environment.PROD && env !== Environment.DEV) {
      Sentry.init({
        environment: env.toLowerCase(),
        dsn: 'https://38f27d4836da617ab9e95cf66b9611d9@o4504568036720640.ingest.us.sentry.io/4508850812944384',
      });
    }
  }
  protected getPlatformUtils() {
    return new WebUtils();
  }
}
