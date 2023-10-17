// TODO: move to separate package
import { CoreCapsule } from './core/CoreCapsule'
import { WebUtils } from './WebUtils'

export class Capsule extends CoreCapsule {
  protected getPlatformUtils() {
    return new WebUtils();
  }
}
