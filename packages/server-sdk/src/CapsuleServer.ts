import CoreCapsule from '@usecapsule/core-sdk';
import { ServerUtils } from './ServerUtils.js';

export class Capsule extends CoreCapsule {
  protected getPlatformUtils() {
    return new ServerUtils();
  }
}
