import { beforeEach, describe, expect, it } from 'vitest';
import { MockPara } from '../mocks/mockParaCore';
import { AuthMethod, Environment } from '../../src';
import { API_KEY, USER_EMAIL } from '../constants';

describe('ParaCore - addCredential', () => {
  let para: MockPara;

  beforeEach(async () => {
    para = new MockPara(Environment.DEV, API_KEY);
  });

  describe('basic login', () => {
    it("can't add", async () => {
      para.supportedUserAuthMethods = () => Promise.resolve(new Set([AuthMethod.BASIC_LOGIN]));
      para.setAuth({ email: USER_EMAIL });

      await expect(para.addCredential({ authMethod: 'BASIC_LOGIN' })).rejects.toThrow(
        'That user is already using basic login',
      );
    });

    it('success', async () => {
      para.setAuth({ email: USER_EMAIL });

      const resp = await para.addCredential({ authMethod: 'BASIC_LOGIN' });
      expect(resp).toContain('https://test.com/auth/add-new-credential');
      expect(resp).toContain('addNewCredentialType=BASIC_LOGIN');
      expect(resp).toContain('isForNewDevice=true');
    });
  });

  describe('passkey only', () => {
    it('not supported', async () => {
      para.isPasskeySupported = () => Promise.resolve(false);

      await expect(para.addCredential({ authMethod: 'PASSKEY' })).rejects.toThrow('Passkeys are not supported.');
    });

    it('supported', async () => {
      para.isPasskeySupported = () => Promise.resolve(true);
      para.setAuth({ email: USER_EMAIL });

      const resp = await para.addCredential({ authMethod: 'PASSKEY' });
      expect(resp).toContain('https://test.com/auth/add-new-credential');
      expect(resp).toContain('addNewCredentialType=PASSKEY');
      expect(resp).toContain('addNewCredentialPasskeyId=');
      expect(resp).toContain('isForNewDevice=true');
    });
  });

  describe('PIN only', () => {
    it("can't add", async () => {
      para.isPasskeySupported = () => Promise.resolve(true);
      para.setAuth({ email: USER_EMAIL });

      await expect(para.addCredential({ authMethod: 'PIN' })).rejects.toThrow(
        'A user cannot have more than one password or PIN.',
      );
    });

    it('can add', async () => {
      para.supportedUserAuthMethods = () => Promise.resolve(new Set([AuthMethod.PASSKEY]));
      para.setAuth({ email: USER_EMAIL });

      const resp = await para.addCredential({ authMethod: 'PIN' });
      expect(resp).toContain('https://test.com/auth/add-new-credential');
      expect(resp).toContain('addNewCredentialType=PIN');
      expect(resp).toContain('addNewCredentialPasswordId=');
      expect(resp).toContain('isForNewDevice=true');
    });
  });

  describe('Password only', () => {
    it("can't add", async () => {
      para.isPasskeySupported = () => Promise.resolve(true);
      para.setAuth({ email: USER_EMAIL });

      await expect(para.addCredential({ authMethod: 'PASSWORD' })).rejects.toThrow(
        'A user cannot have more than one password or PIN.',
      );
    });

    it('can add', async () => {
      para.supportedUserAuthMethods = () => Promise.resolve(new Set([AuthMethod.PASSKEY]));
      para.setAuth({ email: USER_EMAIL });

      const resp = await para.addCredential({ authMethod: 'PASSWORD' });
      expect(resp).toContain('https://test.com/auth/add-new-credential');
      expect(resp).toContain('addNewCredentialType=PASSWORD');
      expect(resp).toContain('addNewCredentialPasswordId=');
      expect(resp).toContain('isForNewDevice=true');
    });
  });

  describe('All', () => {
    it('success', async () => {
      para.supportedUserAuthMethods = () => Promise.resolve(new Set([AuthMethod.PASSKEY]));
      para.setAuth({ email: USER_EMAIL });

      const resp = await para.addCredential({});
      expect(resp).toContain('https://test.com/auth/add-new-credential');
      expect(resp).toContain('addNewCredentialPasswordId=');
      expect(resp).toContain('addNewCredentialPasskeyId=');
      expect(resp).toContain('isForNewDevice=true');
    });
  });
});
