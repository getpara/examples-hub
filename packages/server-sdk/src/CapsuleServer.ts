import CoreCapsule from '@usecapsule/core-sdk';
import { ServerUtils } from './ServerUtils';

export class Capsule extends CoreCapsule {
  protected getPlatformUtils() {
    return new ServerUtils();
  }
}
