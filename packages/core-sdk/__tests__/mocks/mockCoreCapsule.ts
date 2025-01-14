import CoreCapsule from '../../src/index.js';
import { MockPlatformUtils } from './mockPlatformUtils.js';

export class MockCapsule extends CoreCapsule {
  protected getPlatformUtils() {
    return new MockPlatformUtils();
  }

  retrieveSessionCookie = () => 'session-cookie';

  persistSessionCookie = (_: string) => {};
}
