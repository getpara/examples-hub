import { describe, expect, it, beforeEach } from 'vitest';
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
  beforeEach(() => {
    // Reset mocks before each test
    mockCreateCred.mockClear();
    mockGetCred.mockClear();
  });

  describe('createCredential', () => {
    it('success', async () => {
      const resp = await createCredential(Environment.DEV, testUserId, testIdentifier);

      expect(mockCreateCred).toBeCalledTimes(1);
      expect(resp.userHandle).toStrictEqual(expect.stringMatching(/.{32}/));
    });

    it('returns undefined when navigator is undefined', async () => {
      // Mock navigator as undefined
      const originalNavigator = global.navigator;
      // @ts-ignore
      global.navigator = undefined;

      const resp = await createCredential(Environment.DEV, testUserId, testIdentifier);

      expect(resp).toBeUndefined();

      // Restore navigator
      global.navigator = originalNavigator;
    });

    it('handles RS256 algorithm from credential response', async () => {
      // Mock the credential response to return RS256 algorithm
      const mockCredential = {
        response: {
          getPublicKeyAlgorithm: () => -257, // RS256_ALGORITHM
        },
      };

      mockCreateCred.mockResolvedValueOnce(mockCredential);

      const resp = await createCredential(Environment.DEV, testUserId, testIdentifier);

      expect(mockCreateCred).toBeCalledTimes(1);
      expect(resp.algorithm).toBe(-257);
    });

    it('defaults to ES256 when getPublicKeyAlgorithm is not available', async () => {
      // Mock the credential response without getPublicKeyAlgorithm
      const mockCredential = {
        response: {},
      };

      mockCreateCred.mockResolvedValueOnce(mockCredential);

      const resp = await createCredential(Environment.DEV, testUserId, testIdentifier);

      expect(mockCreateCred).toBeCalledTimes(1);
      expect(resp.algorithm).toBe(-7); // ES256_ALGORITHM
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

    it('success with isE2E parameter', async () => {
      await generateSignature(Environment.DEV, 'test', ['test'], true);

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
            rpId: getPortalDomain(Environment.DEV, true),
          },
        }),
      );
    });
  });

  describe('publicKeyCredentialToJSON', () => {
    // Test the internal function indirectly through createCredential
    it('handles ArrayBuffer input', async () => {
      const mockArrayBuffer = new ArrayBuffer(8);
      const mockCredential = {
        response: {
          getPublicKeyAlgorithm: () => -7,
        },
        rawId: mockArrayBuffer,
      };

      mockCreateCred.mockResolvedValueOnce(mockCredential);

      const resp = await createCredential(Environment.DEV, testUserId, testIdentifier);

      expect(mockCreateCred).toBeCalledTimes(1);
      expect(resp.creds).toHaveProperty('rawId');
    });

    it('handles Array input', async () => {
      const mockCredential = {
        response: {
          getPublicKeyAlgorithm: () => -7,
        },
        rawId: [new ArrayBuffer(4), new ArrayBuffer(4)],
      };

      mockCreateCred.mockResolvedValueOnce(mockCredential);

      const resp = await createCredential(Environment.DEV, testUserId, testIdentifier);

      expect(mockCreateCred).toBeCalledTimes(1);
      expect(resp.creds).toHaveProperty('rawId');
      expect(Array.isArray(resp.creds.rawId)).toBe(true);
    });

    it('handles Object input with nested properties', async () => {
      const mockCredential = {
        response: {
          getPublicKeyAlgorithm: () => -7,
          clientDataJSON: new ArrayBuffer(8),
        },
      };

      mockCreateCred.mockResolvedValueOnce(mockCredential);

      const resp = await createCredential(Environment.DEV, testUserId, testIdentifier);

      expect(mockCreateCred).toBeCalledTimes(1);
      expect(resp.creds).toHaveProperty('response');
      expect(resp.creds.response).toHaveProperty('clientDataJSON');
    });
  });
});
