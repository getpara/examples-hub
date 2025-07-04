import { Decrypt as ECIESDecrypt } from '@celo/utils/lib/ecies.js';
import { KeyContainer } from '@getpara/core-sdk';

/**
 * Attempts to decrypt data using both new (eciesjs) and legacy (@celo/utils) methods
 * @param keyContainer - The KeyContainer instance
 * @param encryptedBackup - Base64 encoded encrypted data
 * @returns Decrypted string
 */
export function decryptWithFallback(keyContainer: KeyContainer, encryptedBackup: string): string {
  // Try new format first (eciesjs)
  try {
    return keyContainer.decrypt(encryptedBackup);
  } catch (newFormatError: any) {
    // Fallback to legacy format (@celo/utils)
    try {
      const buf = Buffer.from(encryptedBackup, 'base64');
      const data = ECIESDecrypt(Buffer.from(keyContainer.backupDecryptionKey, 'hex'), buf);
      return Buffer.from(data.buffer).toString('ucs2');
    } catch (legacyError: any) {
      throw new Error(
        `Failed to decrypt with both new and legacy formats. New format error: ${newFormatError.message}, Legacy format error: ${legacyError.message}`,
      );
    }
  }
}
