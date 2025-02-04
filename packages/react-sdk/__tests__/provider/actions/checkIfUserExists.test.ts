import { describe, vi, afterEach, it, expect } from 'vitest';
import { mockCheckIfUserExists, mockCheckIfUserExistsByPhone, MockPara } from '../../mocks/mockCorePara';
import { Environment } from '@getpara/web-sdk';
import { API_KEY } from '../../constants';
import { checkIfUserExists } from '../../../src/provider/actions/checkIfUserExists';
import { CreateUserType } from '../../../src/provider/actions/createUser';
import { CountryCallingCode } from 'libphonenumber-js';

describe('checkIfUserExists', () => {
  const paraClient = new MockPara(Environment.DEV, API_KEY);

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('success', () => {
    it('email', async () => {
      await checkIfUserExists(paraClient, { identifier: 'test@test.com', type: CreateUserType.EMAIL });

      expect(mockCheckIfUserExists).toHaveBeenCalledTimes(1);
    });
    it('phone', async () => {
      await checkIfUserExists(paraClient, {
        identifier: '5555555',
        type: CreateUserType.PHONE,
        countryCode: '+1' as CountryCallingCode,
      });

      expect(mockCheckIfUserExistsByPhone).toHaveBeenCalledTimes(1);
    });
  });
  describe('fail', () => {
    it('no para', async () => {
      expect(
        checkIfUserExists(undefined, { identifier: 'test@test.com', type: CreateUserType.EMAIL }),
      ).rejects.toThrowError();
    });
    it('no args', async () => {
      expect(checkIfUserExists(paraClient, undefined)).rejects.toThrowError();
    });
  });
});
