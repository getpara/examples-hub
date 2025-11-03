import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { EnclaveClient } from '../../src/shares/enclave';

// Mock crypto.subtle
const mockCrypto = {
  subtle: {
    generateKey: vi.fn(),
    exportKey: vi.fn(),
    importKey: vi.fn(),
    deriveBits: vi.fn(),
    digest: vi.fn(),
    encrypt: vi.fn(),
    decrypt: vi.fn(),
  },
  getRandomValues: vi.fn((arr: Uint8Array) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  }),
};

vi.stubGlobal('crypto', mockCrypto);

describe('EnclaveClient', () => {
  let enclaveClient: EnclaveClient;
  let mockUserManagementClient: any;
  let mockRetrieveJwt: vi.Mock;
  let mockPersistJwt: vi.Mock;
  let mockRetrieveRefreshJwt: vi.Mock;
  let mockPersistRefreshJwt: vi.Mock;

  beforeEach(() => {
    mockUserManagementClient = {
      getEnclavePublicKey: vi.fn(),
      persistEnclaveShares: vi.fn(),
      retrieveEnclaveShares: vi.fn(),
      issueEnclaveJwt: vi.fn(),
      refreshEnclaveJwt: vi.fn(),
    };

    mockRetrieveJwt = vi.fn().mockReturnValue('mock-jwt');
    mockPersistJwt = vi.fn();
    mockRetrieveRefreshJwt = vi.fn().mockReturnValue('mock-refresh-jwt');
    mockPersistRefreshJwt = vi.fn();

    enclaveClient = new EnclaveClient({
      userManagementClient: mockUserManagementClient,
      retrieveJwt: mockRetrieveJwt,
      persistJwt: mockPersistJwt,
      retrieveRefreshJwt: mockRetrieveRefreshJwt,
      persistRefreshJwt: mockPersistRefreshJwt,
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with required dependencies', () => {
      expect(enclaveClient).toBeDefined();
      expect(enclaveClient['userManagementClient']).toBe(mockUserManagementClient);
      expect(enclaveClient['retrieveJwt']).toBe(mockRetrieveJwt);
      expect(enclaveClient['persistJwt']).toBe(mockPersistJwt);
      expect(enclaveClient['retrieveRefreshJwt']).toBe(mockRetrieveRefreshJwt);
      expect(enclaveClient['persistRefreshJwt']).toBe(mockPersistRefreshJwt);
    });

    it('should initialize with null enclave public key and frontend key pair', () => {
      expect(enclaveClient['enclavePublicKey']).toBeNull();
      expect(enclaveClient['frontendKeyPair']).toBeNull();
    });
  });

  describe('getEnclavePublicKey', () => {
    it('should fetch and cache enclave public key', async () => {
      const mockPublicKey = '-----BEGIN PUBLIC KEY-----\nMOCKPUBLICKEY\n-----END PUBLIC KEY-----';
      mockUserManagementClient.getEnclavePublicKey.mockResolvedValue({ publicKey: mockPublicKey });

      const result = await enclaveClient['getEnclavePublicKey']();

      expect(result).toBe(mockPublicKey);
      expect(enclaveClient['enclavePublicKey']).toBe(mockPublicKey);
      expect(mockUserManagementClient.getEnclavePublicKey).toHaveBeenCalledTimes(1);
    });

    it('should return cached enclave public key on subsequent calls', async () => {
      const mockPublicKey = '-----BEGIN PUBLIC KEY-----\nMOCKPUBLICKEY\n-----END PUBLIC KEY-----';
      mockUserManagementClient.getEnclavePublicKey.mockResolvedValue({ publicKey: mockPublicKey });

      await enclaveClient['getEnclavePublicKey']();
      const result = await enclaveClient['getEnclavePublicKey']();

      expect(result).toBe(mockPublicKey);
      expect(mockUserManagementClient.getEnclavePublicKey).toHaveBeenCalledTimes(1);
    });
  });

  describe('generateFrontendKeyPair', () => {
    it('should generate and cache a P-256 keypair', async () => {
      const mockKeyPair = { publicKey: 'mock-public', privateKey: 'mock-private' };
      mockCrypto.subtle.generateKey.mockResolvedValue(mockKeyPair);

      const result = await enclaveClient['generateFrontendKeyPair']();

      expect(result).toBe(mockKeyPair);
      expect(enclaveClient['frontendKeyPair']).toBe(mockKeyPair);
      expect(mockCrypto.subtle.generateKey).toHaveBeenCalledWith({ name: 'ECDH', namedCurve: 'P-256' }, true, [
        'deriveBits',
      ]);
    });

    it('should return cached keypair on subsequent calls', async () => {
      const mockKeyPair = { publicKey: 'mock-public', privateKey: 'mock-private' };
      mockCrypto.subtle.generateKey.mockResolvedValue(mockKeyPair);

      await enclaveClient['generateFrontendKeyPair']();
      const result = await enclaveClient['generateFrontendKeyPair']();

      expect(result).toBe(mockKeyPair);
      expect(mockCrypto.subtle.generateKey).toHaveBeenCalledTimes(1);
    });
  });

  describe('exportPublicKeyToPEM', () => {
    it('should export public key to PEM format', async () => {
      const mockExportedKey = new Uint8Array([1, 2, 3, 4, 5]);
      mockCrypto.subtle.exportKey.mockResolvedValue(mockExportedKey.buffer);

      const mockPublicKey = {} as CryptoKey;
      const result = await enclaveClient['exportPublicKeyToPEM'](mockPublicKey);

      expect(mockCrypto.subtle.exportKey).toHaveBeenCalledWith('spki', mockPublicKey);
      expect(result).toContain('-----BEGIN PUBLIC KEY-----');
      expect(result).toContain('-----END PUBLIC KEY-----');
    });
  });

  describe('importPublicKeyFromPEM', () => {
    it('should import PEM-formatted public key', async () => {
      const pemString = '-----BEGIN PUBLIC KEY-----\nAQIDBAU=\n-----END PUBLIC KEY-----';
      const mockImportedKey = {} as CryptoKey;
      mockCrypto.subtle.importKey.mockResolvedValue(mockImportedKey);

      const result = await enclaveClient['importPublicKeyFromPEM'](pemString);

      expect(result).toBe(mockImportedKey);
      expect(mockCrypto.subtle.importKey).toHaveBeenCalledWith(
        'spki',
        expect.any(Uint8Array),
        { name: 'ECDH', namedCurve: 'P-256' },
        false,
        [],
      );
    });

    it('should handle PEM strings with whitespace', async () => {
      const pemString = '-----BEGIN PUBLIC KEY-----\n  AQIDBAUG  \n  Hg==  \n-----END PUBLIC KEY-----';
      const mockImportedKey = {} as CryptoKey;
      mockCrypto.subtle.importKey.mockResolvedValue(mockImportedKey);

      await enclaveClient['importPublicKeyFromPEM'](pemString);

      expect(mockCrypto.subtle.importKey).toHaveBeenCalled();
    });
  });

  describe('encryptForEnclave', () => {
    it('should encrypt plaintext for enclave using ECIES', async () => {
      const plaintext = 'test data';
      const mockPublicKey = '-----BEGIN PUBLIC KEY-----\nMOCKKEY\n-----END PUBLIC KEY-----';
      const mockEnclaveKey = {} as CryptoKey;
      const mockEphemeralKeyPair = {
        publicKey: {} as CryptoKey,
        privateKey: {} as CryptoKey,
      };
      const mockSharedSecret = new Uint8Array(32);
      const mockEncryptionKey = {} as CryptoKey;
      const mockEncrypted = new Uint8Array(16);
      const mockExportedEphemeral = new Uint8Array(65);

      mockUserManagementClient.getEnclavePublicKey.mockResolvedValue({ publicKey: mockPublicKey });
      mockCrypto.subtle.importKey.mockResolvedValueOnce(mockEnclaveKey);
      mockCrypto.subtle.generateKey.mockResolvedValue(mockEphemeralKeyPair);
      mockCrypto.subtle.deriveBits.mockResolvedValue(mockSharedSecret.buffer);
      mockCrypto.subtle.digest.mockResolvedValue(new Uint8Array(32).buffer);
      mockCrypto.subtle.importKey.mockResolvedValueOnce(mockEncryptionKey);
      mockCrypto.subtle.encrypt.mockResolvedValue(mockEncrypted.buffer);
      mockCrypto.subtle.exportKey.mockResolvedValue(mockExportedEphemeral.buffer);

      const result = await enclaveClient['encryptForEnclave'](plaintext);

      expect(result).toHaveProperty('encryptedData');
      expect(result).toHaveProperty('keyId', '');
      expect(result).toHaveProperty('algorithm', 'ECIES-P256-AES256-SHA256');
      expect(result).toHaveProperty('ephemeral');
      expect(mockCrypto.subtle.encrypt).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'AES-GCM' }),
        mockEncryptionKey,
        expect.any(Uint8Array),
      );
    });
  });

  describe('decryptForFrontend', () => {
    it('should decrypt response encrypted for frontend', async () => {
      const mockFrontendKeyPair = {
        publicKey: {} as CryptoKey,
        privateKey: {} as CryptoKey,
      };
      enclaveClient['frontendKeyPair'] = mockFrontendKeyPair;

      const encryptedPayload = {
        encryptedData: btoa(String.fromCharCode(...new Uint8Array(28))), // 12 byte IV + 16 byte data
        keyId: 'test-key',
        algorithm: 'ECIES-P256-AES256-SHA256',
        ephemeral: btoa(String.fromCharCode(...new Uint8Array(65))),
      };

      const mockEphemeralKey = {} as CryptoKey;
      const mockSharedSecret = new Uint8Array(32);
      const mockDecryptionKey = {} as CryptoKey;
      const decryptedData = { test: 'data' };

      mockCrypto.subtle.importKey.mockResolvedValueOnce(mockEphemeralKey);
      mockCrypto.subtle.deriveBits.mockResolvedValue(mockSharedSecret.buffer);
      mockCrypto.subtle.digest.mockResolvedValue(new Uint8Array(32).buffer);
      mockCrypto.subtle.importKey.mockResolvedValueOnce(mockDecryptionKey);
      mockCrypto.subtle.decrypt.mockResolvedValue(new TextEncoder().encode(JSON.stringify(decryptedData)));

      const result = await enclaveClient['decryptForFrontend'](encryptedPayload);

      expect(result).toEqual(decryptedData);
      expect(mockCrypto.subtle.decrypt).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'AES-GCM' }),
        mockDecryptionKey,
        expect.any(Uint8Array),
      );
    });

    it('should throw error if frontend keypair not available', async () => {
      const encryptedPayload = {
        encryptedData: 'test',
        keyId: 'test-key',
        algorithm: 'ECIES-P256-AES256-SHA256',
        ephemeral: 'test',
      };

      await expect(enclaveClient['decryptForFrontend'](encryptedPayload)).rejects.toThrow('Frontend keypair not available');
    });
  });

  describe('refreshJwt', () => {
    it('should refresh JWT tokens', async () => {
      const mockKeyPair = { publicKey: {} as CryptoKey, privateKey: {} as CryptoKey };
      const mockEncryptedPayload = { encryptedData: 'test' };
      const mockResponse = { payload: JSON.stringify(mockEncryptedPayload) };
      const mockDecryptedResponse = {
        jwt: 'new-jwt',
        refreshJwt: 'new-refresh-jwt',
      };

      mockCrypto.subtle.generateKey.mockResolvedValue(mockKeyPair);
      mockCrypto.subtle.exportKey.mockResolvedValue(new Uint8Array(65).buffer);
      vi.spyOn(enclaveClient as any, 'encryptForEnclave').mockResolvedValue(mockEncryptedPayload);
      mockUserManagementClient.refreshEnclaveJwt.mockResolvedValue(mockResponse);
      vi.spyOn(enclaveClient as any, 'decryptForFrontend').mockResolvedValue(mockDecryptedResponse);

      await enclaveClient['refreshJwt']();

      expect(mockRetrieveRefreshJwt).toHaveBeenCalled();
      expect(mockUserManagementClient.refreshEnclaveJwt).toHaveBeenCalled();
      expect(mockPersistJwt).toHaveBeenCalledWith('new-jwt');
      expect(mockPersistRefreshJwt).toHaveBeenCalledWith('new-refresh-jwt');
    });
  });

  describe('withJwtRefreshRetry', () => {
    it('should execute function successfully without retry', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');

      const result = await enclaveClient['withJwtRefreshRetry'](mockFn);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry with JWT refresh on failure', async () => {
      const mockFn = vi.fn().mockRejectedValueOnce(new Error('auth failed')).mockResolvedValueOnce('success');

      vi.spyOn(enclaveClient as any, 'refreshJwt').mockResolvedValue(undefined);

      const result = await enclaveClient['withJwtRefreshRetry'](mockFn);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(enclaveClient['refreshJwt']).toHaveBeenCalledTimes(1);
    });
  });

  describe('issueEnclaveJwt', () => {
    it('should issue new enclave JWT', async () => {
      const mockKeyPair = { publicKey: {} as CryptoKey, privateKey: {} as CryptoKey };
      const mockEncryptedPayload = { encryptedData: 'test' };
      const mockResponse = JSON.stringify({ jwt: 'new-jwt' });

      mockCrypto.subtle.generateKey.mockResolvedValue(mockKeyPair);
      mockCrypto.subtle.exportKey.mockResolvedValue(new Uint8Array(65).buffer);
      vi.spyOn(enclaveClient as any, 'encryptForEnclave').mockResolvedValue(mockEncryptedPayload);
      mockUserManagementClient.issueEnclaveJwt.mockResolvedValue(mockResponse);
      vi.spyOn(enclaveClient as any, 'decryptForFrontend').mockResolvedValue({ jwt: 'new-jwt' });

      await enclaveClient['issueEnclaveJwt']();

      expect(mockUserManagementClient.issueEnclaveJwt).toHaveBeenCalled();
      expect(mockPersistJwt).toHaveBeenCalledWith('new-jwt');
    });
  });

  describe('persistShares', () => {
    it('should persist shares to enclave', async () => {
      const shares = [
        {
          userId: 'user1',
          walletId: 'wallet1',
          walletScheme: 'MPC',
          signer: 'signer1',
        },
      ];
      const mockEncryptedPayload = { encryptedData: 'test' };
      const mockResponse = { success: true };

      vi.spyOn(enclaveClient as any, 'encryptForEnclave').mockResolvedValue(mockEncryptedPayload);
      mockUserManagementClient.persistEnclaveShares.mockResolvedValue(mockResponse);

      const result = await enclaveClient['persistShares'](shares);

      expect(result).toEqual(mockResponse);
      expect(enclaveClient['encryptForEnclave']).toHaveBeenCalledWith(JSON.stringify({ shares, jwt: 'mock-jwt' }));
      expect(mockUserManagementClient.persistEnclaveShares).toHaveBeenCalledWith({
        encryptedPayload: JSON.stringify(mockEncryptedPayload),
      });
    });
  });

  describe('retrieveShares', () => {
    it('should retrieve shares from enclave', async () => {
      const query = [{ userId: 'user1' }];
      const mockKeyPair = { publicKey: {} as CryptoKey, privateKey: {} as CryptoKey };
      const mockEncryptedPayload = { encryptedData: 'test' };
      const mockResponse = { payload: JSON.stringify(mockEncryptedPayload) };
      const mockShares = [
        {
          userId: 'user1',
          walletId: 'wallet1',
          walletScheme: 'MPC',
          signer: 'signer1',
        },
      ];

      vi.spyOn(enclaveClient as any, 'issueEnclaveJwt').mockResolvedValue(undefined);
      mockCrypto.subtle.generateKey.mockResolvedValue(mockKeyPair);
      mockCrypto.subtle.exportKey.mockResolvedValue(new Uint8Array(65).buffer);
      vi.spyOn(enclaveClient as any, 'encryptForEnclave').mockResolvedValue(mockEncryptedPayload);
      mockUserManagementClient.retrieveEnclaveShares.mockResolvedValue(mockResponse);
      vi.spyOn(enclaveClient as any, 'decryptForFrontend').mockResolvedValue({ shares: mockShares });

      const result = await enclaveClient['retrieveShares'](query);

      expect(result).toEqual(mockShares);
      expect(enclaveClient['issueEnclaveJwt']).toHaveBeenCalled();
      expect(mockUserManagementClient.retrieveEnclaveShares).toHaveBeenCalledWith(JSON.stringify(mockEncryptedPayload));
    });
  });

  describe('retrieveSharesWithRetry', () => {
    it('should retrieve shares with retry logic', async () => {
      const query = [{ userId: 'user1' }];
      const mockShares = [
        {
          userId: 'user1',
          walletId: 'wallet1',
          walletScheme: 'MPC',
          signer: 'signer1',
        },
      ];

      vi.spyOn(enclaveClient as any, 'retrieveShares').mockResolvedValue(mockShares);

      const result = await enclaveClient.retrieveSharesWithRetry(query);

      expect(result).toEqual(mockShares);
      expect(enclaveClient['retrieveShares']).toHaveBeenCalledWith(query);
    });

    it('should retry on failure', async () => {
      const query = [{ userId: 'user1' }];
      const mockShares = [
        {
          userId: 'user1',
          walletId: 'wallet1',
          walletScheme: 'MPC',
          signer: 'signer1',
        },
      ];

      vi.spyOn(enclaveClient as any, 'retrieveShares')
        .mockRejectedValueOnce(new Error('auth failed'))
        .mockResolvedValueOnce(mockShares);
      vi.spyOn(enclaveClient as any, 'refreshJwt').mockResolvedValue(undefined);

      const result = await enclaveClient.retrieveSharesWithRetry(query);

      expect(result).toEqual(mockShares);
      expect(enclaveClient['retrieveShares']).toHaveBeenCalledTimes(2);
      expect(enclaveClient['refreshJwt']).toHaveBeenCalledTimes(1);
    });
  });

  describe('persistSharesWithRetry', () => {
    it('should persist shares without retry logic', async () => {
      const shares = [
        {
          userId: 'user1',
          walletId: 'wallet1',
          walletScheme: 'MPC',
          signer: 'signer1',
        },
      ];
      const mockResponse = { success: true };

      vi.spyOn(enclaveClient as any, 'persistShares').mockResolvedValue(mockResponse);

      const result = await enclaveClient.persistSharesWithRetry(shares);

      expect(result).toEqual(mockResponse);
      expect(enclaveClient['persistShares']).toHaveBeenCalledWith(shares);
    });

    it('should not retry on failure', async () => {
      const shares = [
        {
          userId: 'user1',
          walletId: 'wallet1',
          walletScheme: 'MPC',
          signer: 'signer1',
        },
      ];
      const error = new Error('auth failed');

      vi.spyOn(enclaveClient as any, 'persistShares').mockRejectedValue(error);

      await expect(enclaveClient.persistSharesWithRetry(shares)).rejects.toThrow('auth failed');
      expect(enclaveClient['persistShares']).toHaveBeenCalledTimes(1);
      expect(enclaveClient['persistShares']).toHaveBeenCalledWith(shares);
    });
  });
});
