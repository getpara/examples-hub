import CoreCapsule, { PlatformUtils } from '@usecapsule/core-sdk';
import { ServerUtils } from './ServerUtils.js';

export class Capsule extends CoreCapsule {
  protected getPlatformUtils(): PlatformUtils {
    return new ServerUtils();
  }
}
