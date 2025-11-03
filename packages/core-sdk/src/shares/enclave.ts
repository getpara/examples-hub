import UserManagementClient from '@getpara/user-management-client';

export interface ShareData {
  userId: string;
  walletId: string;
  walletScheme: string;
  partnerId?: string;
  protocolId?: string;
  signer: string;
  createdAt?: string; // ISO 8601 timestamp
  updatedAt?: string; // ISO 8601 timestamp
}

export interface ShareQuery {
  userId: string;
  walletId?: string;
  partnerId?: string;
}

export interface EncryptedPayload {
  encryptedData: string;
  keyId: string;
  algorithm: string;
  ephemeral: string;
}

/**
 * Enclave client for secure key share operations
 * Handles encryption/decryption and communication with the enclave service
 */
export class EnclaveClient {
  private userManagementClient: UserManagementClient;
  private enclavePublicKey: string | null = null;
  private frontendKeyPair: CryptoKeyPair | null = null;
  private retrieveJwt: () => string;
  private persistJwt: (jwt: string) => void;
  private retrieveRefreshJwt: () => string;
  private persistRefreshJwt: (refreshJwt: string) => void;

  constructor({
    userManagementClient,
    retrieveJwt,
    persistJwt,
    retrieveRefreshJwt,
    persistRefreshJwt,
  }: {
    userManagementClient: UserManagementClient;
    retrieveJwt: () => string;
    persistJwt: (jwt: string) => void;
    retrieveRefreshJwt: () => string;
    persistRefreshJwt: (refreshJwt: string) => void;
  }) {
    this.userManagementClient = userManagementClient;
    this.retrieveJwt = retrieveJwt;
    this.persistJwt = persistJwt;
    this.retrieveRefreshJwt = retrieveRefreshJwt;
    this.persistRefreshJwt = persistRefreshJwt;
  }

  private async refreshJwt(): Promise<void> {
    // Generate frontend keypair to receive encrypted response
    const frontendKeyPair = await this.generateFrontendKeyPair();
    const responsePublicKeyPEM = await this.exportPublicKeyToPEM(frontendKeyPair.publicKey);

    const payload = {
      refreshJwt: this.retrieveRefreshJwt(),
      responsePublicKey: responsePublicKeyPEM,
    };

    const encryptedPayload = await this.encryptForEnclave(JSON.stringify(payload));
    const response = await this.userManagementClient.refreshEnclaveJwt(JSON.stringify(encryptedPayload));
    const decryptedResponse = await this.decryptForFrontend(JSON.parse(response.payload));
    this.persistJwt(decryptedResponse.jwt);
    this.persistRefreshJwt(decryptedResponse.refreshJwt);
  }

  private async withJwtRefreshRetry(fn: () => Promise<any>): Promise<any> {
    try {
      return await fn();
    } catch (error) {
      await this.refreshJwt();
      return await fn();
    }
  }

  async issueEnclaveJwt(): Promise<void> {
    // Generate frontend keypair to receive encrypted response
    const frontendKeyPair = await this.generateFrontendKeyPair();
    const responsePublicKeyPEM = await this.exportPublicKeyToPEM(frontendKeyPair.publicKey);

    const payload = {
      responsePublicKey: responsePublicKeyPEM,
    };

    const encryptedPayload = await this.encryptForEnclave(JSON.stringify(payload));
    const response = await this.userManagementClient.issueEnclaveJwt(JSON.stringify(encryptedPayload));

    const decryptedResponse = await this.decryptForFrontend(JSON.parse(response as any));
    this.persistJwt(decryptedResponse.jwt);
  }

  /**
   * Generate a P-256 keypair for the frontend to receive encrypted responses
   */
  private async generateFrontendKeyPair(): Promise<CryptoKeyPair> {
    if (this.frontendKeyPair) {
      return this.frontendKeyPair;
    }

    this.frontendKeyPair = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);

    return this.frontendKeyPair;
  }

  /**
   * Get the enclave's public key from the user-management service
   */
  private async getEnclavePublicKey(): Promise<string> {
    if (this.enclavePublicKey) {
      return this.enclavePublicKey;
    }

    const response = await this.userManagementClient.getEnclavePublicKey();
    this.enclavePublicKey = response.publicKey;
    return this.enclavePublicKey;
  }

  /**
   * Import a PEM-formatted public key for use with Web Crypto API
   */
  private async importPublicKeyFromPEM(pemString: string): Promise<CryptoKey> {
    // Remove PEM headers and decode base64
    const pemContents = pemString
      .replace('-----BEGIN PUBLIC KEY-----', '')
      .replace('-----END PUBLIC KEY-----', '')
      .replace(/\s/g, '');

    const keyData = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

    return await crypto.subtle.importKey('spki', keyData, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  }

  /**
   * Export a public key to PEM format
   */
  private async exportPublicKeyToPEM(publicKey: CryptoKey): Promise<string> {
    const exported = await crypto.subtle.exportKey('spki', publicKey);
    const exportedAsBase64 = btoa(String.fromCharCode(...new Uint8Array(exported)));

    return `-----BEGIN PUBLIC KEY-----\n${exportedAsBase64}\n-----END PUBLIC KEY-----`;
  }

  /**
   * Encrypt data using P-256 ECIES for the enclave
   */
  private async encryptForEnclave(plaintext: string): Promise<EncryptedPayload> {
    const enclavePublicKeyPEM = await this.getEnclavePublicKey();
    const enclavePublicKey = await this.importPublicKeyFromPEM(enclavePublicKeyPEM);

    // Generate ephemeral keypair for ECDH
    const ephemeralKeyPair = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);

    // Perform ECDH to get shared secret
    const sharedSecretBits = await crypto.subtle.deriveBits(
      { name: 'ECDH', public: enclavePublicKey },
      ephemeralKeyPair.privateKey,
      256, // 32 bytes = 256 bits
    );

    // Derive AES key using SHA-256 (matching Go implementation)
    const encryptionKeyBuffer = await crypto.subtle.digest('SHA-256', sharedSecretBits);
    const encryptionKey = await crypto.subtle.importKey('raw', encryptionKeyBuffer, { name: 'AES-GCM' }, false, ['encrypt']);

    // Generate random IV for AES-GCM
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV

    // Encrypt the plaintext
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      encryptionKey,
      new TextEncoder().encode(plaintext),
    );

    // Combine IV + encrypted data + auth tag (AES-GCM includes auth tag automatically)
    const encryptedArray = new Uint8Array(encrypted);
    const combined = new Uint8Array(iv.length + encryptedArray.length);
    combined.set(iv);
    combined.set(encryptedArray, iv.length);

    // Export ephemeral public key
    const ephemeralPublicKeyBuffer = await crypto.subtle.exportKey('spki', ephemeralKeyPair.publicKey);

    return {
      encryptedData: btoa(String.fromCharCode(...combined)),
      keyId: '', // Will be set by the enclave
      algorithm: 'ECIES-P256-AES256-SHA256',
      ephemeral: btoa(String.fromCharCode(...new Uint8Array(ephemeralPublicKeyBuffer))),
    };
  }

  /**
   * Decrypt response encrypted for the frontend
   */
  private async decryptForFrontend(encryptedPayload: EncryptedPayload): Promise<Record<string, any>> {
    if (!this.frontendKeyPair) {
      throw new Error('Frontend keypair not available');
    }

    const encryptedData = Uint8Array.from(atob(encryptedPayload.encryptedData), c => c.charCodeAt(0));
    const ephemeralPublicKeyData = Uint8Array.from(atob(encryptedPayload.ephemeral), c => c.charCodeAt(0));

    // Import ephemeral public key
    const ephemeralPublicKey = await crypto.subtle.importKey(
      'spki',
      ephemeralPublicKeyData,
      { name: 'ECDH', namedCurve: 'P-256' },
      false,
      [],
    );

    // Perform ECDH to get shared secret
    const sharedSecretBits = await crypto.subtle.deriveBits(
      { name: 'ECDH', public: ephemeralPublicKey },
      this.frontendKeyPair.privateKey,
      256,
    );

    // Derive AES key using SHA-256
    const encryptionKeyBuffer = await crypto.subtle.digest('SHA-256', sharedSecretBits);
    const encryptionKey = await crypto.subtle.importKey('raw', encryptionKeyBuffer, { name: 'AES-GCM' }, false, ['decrypt']);

    // Extract IV and ciphertext
    const iv = encryptedData.slice(0, 12);
    const ciphertext = encryptedData.slice(12);

    // Decrypt
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, encryptionKey, ciphertext);
    return JSON.parse(new TextDecoder().decode(decrypted));
  }

  /**
   * Persist key shares to the enclave
   * @param shares Array of share data to persist
   */
  private async persistShares(shares: ShareData[]): Promise<any> {
    // Encrypt the shares array for the enclave
    const payload = {
      shares,
      jwt: this.retrieveJwt(),
    };
    const encryptedPayload = await this.encryptForEnclave(JSON.stringify(payload));

    // Convert to string format expected by user-management service
    const encryptedPayloadStr = JSON.stringify(encryptedPayload);

    // Call user-management service
    return await this.userManagementClient.persistEnclaveShares({ encryptedPayload: encryptedPayloadStr });
  }

  /**
   * Retrieve key shares from the enclave
   * @param query Query parameters for finding shares (single query or array of queries)
   */
  private async retrieveShares(query: ShareQuery[]): Promise<ShareData[]> {
    await this.issueEnclaveJwt();
    // Generate frontend keypair to receive encrypted response
    const frontendKeyPair = await this.generateFrontendKeyPair();
    const responsePublicKeyPEM = await this.exportPublicKeyToPEM(frontendKeyPair.publicKey);

    // Add the response public key to the queries
    const fullQuery = query.map(q => ({
      userId: q.userId,
    }));
    const payload = {
      query: fullQuery,
      responsePublicKey: responsePublicKeyPEM,
      jwt: this.retrieveJwt(),
    };

    // Encrypt the query for the enclave
    const encryptedPayload = await this.encryptForEnclave(JSON.stringify(payload));

    // Convert to string format expected by user-management service
    const encryptedPayloadStr = JSON.stringify(encryptedPayload);

    // Call user-management service
    const response = await this.userManagementClient.retrieveEnclaveShares(encryptedPayloadStr);

    // The response should be an encrypted payload containing the shares
    const encryptedResponse = JSON.parse(response.payload);

    // Decrypt the response
    const decryptedData = await this.decryptForFrontend(encryptedResponse);
    return decryptedData.shares;
  }

  async retrieveSharesWithRetry(query: ShareQuery[]): Promise<ShareData[]> {
    return await this.withJwtRefreshRetry(async () => this.retrieveShares(query));
  }

  async persistSharesWithRetry(shares: ShareData[]): Promise<any> {
    return await this.persistShares(shares);
  }
}
