import CoreCapsule from '@usecapsule/core-sdk';
import { WebUtils } from './WebUtils.js';

export class Capsule extends CoreCapsule {
  protected getPlatformUtils() {
    return new WebUtils();
  }
}
