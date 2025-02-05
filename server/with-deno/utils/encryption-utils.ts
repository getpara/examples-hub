import { Aes } from "https://deno.land/x/crypto@v0.10.1/aes.ts";
import { Cbc, Padding } from "https://deno.land/x/crypto@v0.10.1/block-modes.ts";

const ENCRYPTION_KEY = Deno.env.get("ENCRYPTION_KEY");

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 16) {
  throw new Error("ENCRYPTION_KEY must be set and be 16 bytes long");
}

const IV_LENGTH = 16;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function getKey(): Uint8Array {
  return textEncoder.encode(ENCRYPTION_KEY);
}

function toHex(buffer: Uint8Array): string {
  return Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string): Uint8Array {
  return new Uint8Array(hex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));
}

export function encrypt(text: string): string {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = getKey();
  const data = textEncoder.encode(text);

  const cipher = new Cbc(Aes, key, iv, Padding.PKCS7);
  const encrypted = cipher.encrypt(data);

  return `${toHex(iv)}:${toHex(encrypted)}`;
}

export function decrypt(encryptedText: string): string {
  const [ivHex, encryptedDataHex] = encryptedText.split(":");
  const iv = fromHex(ivHex);
  const encryptedData = fromHex(encryptedDataHex);

  const key = getKey();

  const decipher = new Cbc(Aes, key, iv, Padding.PKCS7);
  const decrypted = decipher.decrypt(encryptedData);

  return textDecoder.decode(decrypted);
}
