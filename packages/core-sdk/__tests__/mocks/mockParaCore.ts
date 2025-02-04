import ParaCore from '../../src/index.js';
import { MockPlatformUtils } from './mockPlatformUtils.js';

export class MockPara extends ParaCore {
  protected getPlatformUtils() {
    return new MockPlatformUtils();
  }

  retrieveSessionCookie = () => 'session-cookie';

  persistSessionCookie = (_: string) => {};
}
