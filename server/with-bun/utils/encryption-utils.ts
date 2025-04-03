const ALGORITHM = "AES-GCM";
const IV_LENGTH = 12;

function getEncryptionKey(): string {
  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (!encryptionKey || encryptionKey.length !== 32) {
    throw new Error("ENCRYPTION_KEY must be set and be 32 bytes long");
  }
  return encryptionKey;
}

async function importSecretKey(keyString: string): Promise<CryptoKey> {
  try {
    const keyBuffer = Buffer.from(keyString, "utf-8");
    return await crypto.subtle.importKey("raw", keyBuffer, { name: ALGORITHM }, false, ["encrypt", "decrypt"]);
  } catch (error) {
    throw new Error(`Failed to import secret key: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function encrypt(text: string): Promise<string> {
  if (!text) {
    throw new Error("Text to encrypt must be provided");
  }

  try {
    const keyString = getEncryptionKey();
    const cryptoKey = await importSecretKey(keyString);
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const encodedText = new TextEncoder().encode(text);

    const encryptedBuffer = await crypto.subtle.encrypt({ name: ALGORITHM, iv: iv }, cryptoKey, encodedText);

    const ivBase64 = Buffer.from(iv.buffer).toString("base64");
    const encryptedBase64 = Buffer.from(encryptedBuffer).toString("base64");

    return `${ivBase64}:${encryptedBase64}`;
  } catch (error) {
    throw new Error(`Encryption process failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function decrypt(encryptedText: string): Promise<string> {
  if (!encryptedText || !encryptedText.includes(":")) {
    throw new Error("Encrypted text must be in the format 'IV(base64):Ciphertext(base64)'");
  }

  const parts = encryptedText.split(":");

  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error("Encrypted text format is invalid. Expected 'IV(base64):Ciphertext(base64)'.");
  }

  const [ivBase64, encryptedDataBas64] = parts;

  let iv: Uint8Array;
  let encryptedBuffer: ArrayBuffer;
  let cryptoKey: CryptoKey;

  try {
    const ivBuf = Buffer.from(ivBase64, "base64");
    const encryptedBuf = Buffer.from(encryptedDataBas64, "base64");

    iv = new Uint8Array(ivBuf);

    encryptedBuffer = encryptedBuf.buffer.slice(
      encryptedBuf.byteOffset,
      encryptedBuf.byteOffset + encryptedBuf.byteLength
    );

    if (iv.byteLength !== IV_LENGTH) {
      throw new Error(`Invalid IV length. Expected ${IV_LENGTH} bytes, got ${iv.byteLength}`);
    }

    const keyString = getEncryptionKey();
    cryptoKey = await importSecretKey(keyString);
  } catch (error) {
    throw new Error(
      `Failed to prepare components for decryption: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  try {
    const decryptedBuffer = await crypto.subtle.decrypt({ name: ALGORITHM, iv: iv }, cryptoKey, encryptedBuffer);

    const decryptedText = new TextDecoder().decode(decryptedBuffer);
    return decryptedText;
  } catch (error) {
    throw new Error(
      `Decryption failed. Key may be incorrect or data corrupted: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
