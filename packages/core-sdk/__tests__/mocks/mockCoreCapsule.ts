import CoreCapsule from '../../src';
import { MockPlatformUtils } from './mockPlatformUtils';

export class MockCapsule extends CoreCapsule {
  protected getPlatformUtils() {
    return new MockPlatformUtils();
  }
}
