import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { authCreation, AuthCreationParams } from '../../src/utils/authCreation';
import { ParaPortal } from '../../src/classes/ParaPortal';
import { KeyShareType, AuthMethodStatus, EncryptorType, AuthMethod } from '@getpara/user-management-client';

vi.mock('@getpara/web-sdk', async () => {
  const actual = await vi.importActual('@getpara/web-sdk');
  return {
    ...actual,
    createCredential: vi.fn(),
    parseCredentialCreationRes: vi.fn(),
    getAsymmetricKeyPair: vi.fn(),
    getPublicKeyHex: vi.fn(),
    encryptPrivateKey: vi.fn(),
    decryptWithPrivateKey: vi.fn(),
    encryptWithDerivedPublicKey: vi.fn(),
    getSHA256HashHex: vi.fn(),
  };
});

import {
  createCredential,
  parseCredentialCreationRes,
  getAsymmetricKeyPair,
  getPublicKeyHex,
  encryptPrivateKey,
  decryptWithPrivateKey,
  encryptWithDerivedPublicKey,
  getSHA256HashHex,
} from '@getpara/web-sdk';

const mockDeleteShares = vi.fn();

describe('authCreation', () => {
  const mockParaPortal = {
    ctx: {
      client: {
        patchSessionPublicKey: vi.fn(),
        uploadEncryptedWalletPrivateKey: vi.fn(),
        uploadUserKeyShares: vi.fn(),
        sessionAuth: vi.fn().mockResolvedValue({ loginAuthMethods: { methods: [AuthMethod.BASIC_LOGIN] } }),
      },
      enclaveClient: {
        deleteSharesWithRetry: mockDeleteShares,
      },
    },
    getTransmissionKeyShares: vi.fn(),
    loginEncryptionKeyPair: {
      privateKey: 'mock-private-key',
    },
  } as unknown as ParaPortal;

  const mockAuthParams: AuthCreationParams = {
    biometricId: 'mock-biometric-id',
    partnerId: 'mock-partner-id',
    isForNewDevice: false,
    userId: 'mock-user-id',
    authInfo: { auth: { email: 'test@example.com' }, authType: 'email', identifier: 'test@example.com' },
  };

  const mockCredential = {
    id: 'mock-credential-id',
    rawId: new ArrayBuffer(8),
    response: {
      clientDataJSON: 'mock-client-data-json',
      attestationObject: 'mock-attestation-object',
    },
    type: 'public-key',
  };

  const mockUserHandle = 'mock-user-handle';
  const mockAlgorithm = 'ES256';
  const mockCosePublicKey = 'mock-cose-public-key';
  const mockClientDataJSON = 'mock-client-data-json';
  const mockAaguid = 'mock-aaguid';
  const mockKeyPair = { privateKey: 'mock-private-key', publicKey: 'mock-public-key' };
  const mockPublicKeyHex = 'mock-public-key-hex';
  const mockEncryptionKeyHash = 'mock-encryption-key-hash';
  const mockEncryptedPrivateKeyHex = 'mock-encrypted-private-key-hex';

  beforeEach(() => {
    (createCredential as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      creds: mockCredential,
      userHandle: mockUserHandle,
      algorithm: mockAlgorithm,
    });

    (parseCredentialCreationRes as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      cosePublicKey: mockCosePublicKey,
      clientDataJSON: mockClientDataJSON,
      aaguid: mockAaguid,
    });

    (getAsymmetricKeyPair as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockKeyPair);
    (getPublicKeyHex as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockPublicKeyHex);
    (getSHA256HashHex as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockEncryptionKeyHash);
    (encryptPrivateKey as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockEncryptedPrivateKeyHex);

    (mockParaPortal.ctx.client.patchSessionPublicKey as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    (mockParaPortal.ctx.client.uploadEncryptedWalletPrivateKey as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      undefined,
    );
    (mockParaPortal.ctx.client.uploadUserKeyShares as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should throw an error if required parameters are missing', async () => {
    const incompleteParams = { ...mockAuthParams } as unknown as AuthCreationParams;
    delete (incompleteParams as any).authInfo;

    await expect(authCreation(mockParaPortal, incompleteParams)).rejects.toThrow();
  });

  it('should correctly create credentials and process cryptographic operations', async () => {
    await authCreation(mockParaPortal, mockAuthParams);

    expect(createCredential).toHaveBeenCalledWith(
      expect.any(String),
      mockAuthParams.userId,
      mockAuthParams.authInfo.identifier,
      mockParaPortal.ctx.isE2E,
    );

    expect(parseCredentialCreationRes).toHaveBeenCalledWith(mockCredential, mockAlgorithm);

    expect(getAsymmetricKeyPair).toHaveBeenCalledWith(mockParaPortal.ctx);
    expect(getPublicKeyHex).toHaveBeenCalledWith(mockKeyPair);
    expect(encryptPrivateKey).toHaveBeenCalledWith(mockKeyPair, mockUserHandle);
    expect(getSHA256HashHex).toHaveBeenCalledWith(mockUserHandle);

    expect(mockParaPortal.ctx.client.patchSessionPublicKey).toHaveBeenCalledWith(
      mockAuthParams.partnerId,
      mockAuthParams.userId,
      mockAuthParams.biometricId,
      {
        publicKey: mockCredential.id,
        sigDerivedPublicKey: mockPublicKeyHex,
        cosePublicKey: mockCosePublicKey,
        clientDataJSON: mockClientDataJSON,
        status: AuthMethodStatus.COMPLETE,
        aaguid: mockAaguid,
      },
    );

    expect(mockParaPortal.ctx.client.uploadEncryptedWalletPrivateKey).toHaveBeenCalledWith(
      mockAuthParams.userId,
      mockEncryptedPrivateKeyHex,
      mockEncryptionKeyHash,
      mockCredential.id,
    );

    expect(mockParaPortal.getTransmissionKeyShares).not.toHaveBeenCalled();
    expect(mockParaPortal.ctx.client.uploadUserKeyShares).not.toHaveBeenCalled();
  });

  it('should process temporary shares when isForNewDevice is true', async () => {
    const mockShares = [
      {
        walletId: 'mock-wallet-id-1',
        encryptedShare: 'mock-encrypted-share-1',
        encryptedKey: 'mock-encrypted-key-1',
        partnerId: 'mock-partner-id-1',
      },
      {
        walletId: 'mock-wallet-id-2',
        encryptedShare: 'mock-encrypted-share-2',
        encryptedKey: 'mock-encrypted-key-2',
        partnerId: 'mock-partner-id-2',
      },
    ];

    (mockParaPortal.getTransmissionKeyShares as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { temporaryShares: mockShares },
    });

    (decryptWithPrivateKey as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (_privateKey, encryptedShare, _encryptedKey) => `decrypted-${encryptedShare}`,
    );

    (encryptWithDerivedPublicKey as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (publicKeyHex, decryptedShare) => ({
        encryptedMessageHex: `encrypted-message-${decryptedShare}`,
        encryptedKeyHex: `encrypted-key-${decryptedShare}`,
      }),
    );

    await authCreation(mockParaPortal, { ...mockAuthParams, isForNewDevice: true, sessionId: 'mock-session-id' });

    expect(mockParaPortal.getTransmissionKeyShares).toHaveBeenCalledWith({
      isForNewDevice: true,
    });

    expect(decryptWithPrivateKey).toHaveBeenCalledTimes(2);
    expect(encryptWithDerivedPublicKey).toHaveBeenCalledTimes(2);

    mockShares.forEach((share, index) => {
      expect(decryptWithPrivateKey).toHaveBeenNthCalledWith(
        index + 1,
        mockParaPortal.loginEncryptionKeyPair?.privateKey,
        share.encryptedShare,
        share.encryptedKey,
      );
    });

    expect(mockParaPortal.ctx.client.uploadUserKeyShares).toHaveBeenCalledWith(
      mockAuthParams.userId,
      expect.arrayContaining(
        mockShares.map(share =>
          expect.objectContaining({
            walletId: share.walletId,
            encryptedShare: expect.stringContaining('encrypted-message-decrypted'),
            encryptedKey: expect.stringContaining('encrypted-key-decrypted'),
            type: KeyShareType.USER,
            encryptor: EncryptorType.BIOMETRICS,
            biometricPublicKey: mockPublicKeyHex,
            partnerId: share.partnerId,
          }),
        ),
      ),
    );

    expect(mockDeleteShares).toBeCalledTimes(1);
  });
});
