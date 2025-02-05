import { encrypt, decrypt } from "../../utils/encryption-utils";
import { expect, test, beforeAll, afterAll, describe } from "bun:test";

const originalEnv = process.env;

describe("Encryption Utils", () => {
  beforeAll(() => {
    process.env = { ...originalEnv, ENCRYPTION_KEY: "12345678901234567890123456789012" };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test("Encrypt and decrypt a valid string", () => {
    const text = "Hello, Capsule!";
    const encryptedText = encrypt(text);
    const decryptedText = decrypt(encryptedText);
    expect(decryptedText).toBe(text);
  });

  test("Decrypt an incorrectly formatted string", () => {
    const invalidEncryptedText = "InvalidFormat";
    expect(() => decrypt(invalidEncryptedText)).toThrow();
  });

  test("Encrypt with missing encryption key", () => {
    process.env.ENCRYPTION_KEY = "12345678901234567890123456789012"; // Ensure valid key for encrypting
    const text = "Hello, Capsule!";
    const encryptedText = encrypt(text);
    process.env.ENCRYPTION_KEY = "";
    expect(() => decrypt(encryptedText)).toThrow("ENCRYPTION_KEY must be set and be 32 bytes long");
  });

  test("Decrypt with missing encryption key", () => {
    process.env.ENCRYPTION_KEY = "";
    expect(() => encrypt("Hello, Capsule!")).toThrow("ENCRYPTION_KEY must be set and be 32 bytes long");
  });

  test("Encrypt and decrypt with invalid key length", () => {
    process.env.ENCRYPTION_KEY = "shortkey";
    const text = "Hello, Capsule!";
    expect(() => encrypt(text)).toThrow("ENCRYPTION_KEY must be set and be 32 bytes long");
  });
});
