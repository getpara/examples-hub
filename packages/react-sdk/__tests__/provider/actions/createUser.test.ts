import { describe, vi, afterEach, it, expect } from 'vitest';
import { mockCreateUser, mockCreateUserByPhone, MockPara } from '../../mocks/mockCorePara';
import { Environment } from '@getpara/web-sdk';
import { API_KEY } from '../../constants';
import { createUser, CreateUserType } from '../../../src/provider/actions/createUser';
import { CountryCallingCode } from 'libphonenumber-js';

describe('createUser', () => {
  const paraClient = new MockPara(Environment.DEV, API_KEY);

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('success', () => {
    it('email', async () => {
      await createUser(paraClient, { identifier: 'test@test.com', type: CreateUserType.EMAIL });

      expect(mockCreateUser).toHaveBeenCalledTimes(1);
    });
    it('phone', async () => {
      await createUser(paraClient, {
        identifier: '5555555',
        type: CreateUserType.PHONE,
        countryCode: '+1' as CountryCallingCode,
      });

      expect(mockCreateUserByPhone).toHaveBeenCalledTimes(1);
    });
  });
  describe('fail', () => {
    it('no para', async () => {
      expect(createUser(undefined, { identifier: 'test@test.com', type: CreateUserType.EMAIL })).rejects.toThrowError();
    });
    it('no args', async () => {
      expect(createUser(paraClient, undefined)).rejects.toThrowError();
    });
  });
});
