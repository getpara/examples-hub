import CoreCapsule from './core';
import { ServerUtils } from './ServerUtils';

export class Capsule extends CoreCapsule {
  protected getPlatformUtils() {
    return new ServerUtils();
  }
}
