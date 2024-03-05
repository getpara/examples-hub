import CoreCapsule from '@usecapsule/core-sdk'
import { WebUtils } from './WebUtils'

export class Capsule extends CoreCapsule {
  protected getPlatformUtils() {
    return new WebUtils();
  }
}
