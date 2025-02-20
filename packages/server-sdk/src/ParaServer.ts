import ParaCore, { PlatformUtils, ConstructorOpts, Environment } from '@getpara/core-sdk';
import * as Sentry from '@sentry/node';
import { ServerUtils } from './ServerUtils.js';

export class Para extends ParaCore {
  constructor(env: Environment, apiKey?: string, opts?: ConstructorOpts) {
    super(env, apiKey, opts);

    // starting with non-prod to see what kind of errors we get and if sensitive data is tracked
    // will turn on in prod after monitoring
    /* v8 ignore next 6 */
    if (env !== Environment.PROD && env !== Environment.DEV) {
      Sentry.init({
        environment: env.toLowerCase(),
        dsn: 'https://2a26842d951255c2721fde5c1dd2b252@o4504568036720640.ingest.us.sentry.io/4508850906791936',
      });
    }
  }
  protected getPlatformUtils(): PlatformUtils {
    return new ServerUtils();
  }
}
