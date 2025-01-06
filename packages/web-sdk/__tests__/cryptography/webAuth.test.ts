import { describe, expect, it } from 'vitest';
import {
  createCredential,
  Environment,
  generateSignature,
  getPortalDomain,
  parseCredentialCreationRes,
} from '../../src/index.js';
import { mockCreateCred, mockGetCred } from '../setup.js';
import { TEST_AAGUID, TEST_ATTESTATION_OBJECT_STRING, TEST_CLIENT_DATA_JSON, TEST_COSE_PUBLIC_KEY } from '../constants.js';
import base64url from 'base64url';

const testUserId = 'test-user';
const testIdentifier = 'test-identifier';

describe('webAuth', () => {
  describe('createCredential', () => {
    it('success', async () => {
      const resp = await createCredential(Environment.DEV, testUserId, testIdentifier);

      expect(mockCreateCred).toBeCalledTimes(1);
      expect(resp.userHandle).toStrictEqual(expect.stringMatching(/.{32}/));
    });
  });
  describe('parseCredentialCreationRes', () => {
    it('success - ES256', async () => {
      const resp = parseCredentialCreationRes(
        { response: { attestationObject: TEST_ATTESTATION_OBJECT_STRING, clientDataJSON: TEST_CLIENT_DATA_JSON } },
        -7,
      );

      expect(resp).toStrictEqual({
        cosePublicKey: TEST_COSE_PUBLIC_KEY,
        clientDataJSON: TEST_CLIENT_DATA_JSON,
        aaguid: TEST_AAGUID,
      });
    });
  });
  describe('generateSignature', () => {
    it('success', async () => {
      await generateSignature(Environment.DEV, 'test', ['test']);

      expect(mockGetCred).toBeCalledTimes(1);
      expect(mockGetCred).toBeCalledWith(
        expect.objectContaining({
          publicKey: {
            timeout: 60000,
            challenge: Buffer.from('test', 'base64'),
            allowCredentials: [
              {
                id: base64url.toBuffer('test'),
                type: 'public-key',
              },
            ],
            userVerification: 'required',
            rpId: getPortalDomain(Environment.DEV),
          },
        }),
      );
    });
  });
});
