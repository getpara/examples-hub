import * as SecureStore from "expo-secure-store";
import { AuthCreds, STORAGE_KEYS } from "@/types";

export async function saveCreds(c: AuthCreds): Promise<void> {
  try {
    if (c.type === "email") {
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_EMAIL, c.email);
      await Promise.all([
        SecureStore.deleteItemAsync(STORAGE_KEYS.USER_PHONE),
        SecureStore.deleteItemAsync(STORAGE_KEYS.USER_COUNTRY_CODE),
      ]);
    } else {
      await Promise.all([
        SecureStore.setItemAsync(STORAGE_KEYS.USER_PHONE, c.phone),
        SecureStore.setItemAsync(STORAGE_KEYS.USER_COUNTRY_CODE, c.countryCode),
        SecureStore.deleteItemAsync(STORAGE_KEYS.USER_EMAIL),
      ]);
    }
  } catch (err) {
    console.error("Secure-store save error:", err);
  }
}

export async function getCreds(): Promise<AuthCreds | null> {
  try {
    const [email, phone, countryCode] = await Promise.all([
      SecureStore.getItemAsync(STORAGE_KEYS.USER_EMAIL),
      SecureStore.getItemAsync(STORAGE_KEYS.USER_PHONE),
      SecureStore.getItemAsync(STORAGE_KEYS.USER_COUNTRY_CODE),
    ]);

    if (email) return { type: "email", email };
    if (phone && countryCode) return { type: "phone", phone, countryCode };
    return null;
  } catch (err) {
    console.error("Secure-store read error:", err);
    return null;
  }
}

export async function clearCreds(): Promise<void> {
  try {
    await Promise.all([
      SecureStore.deleteItemAsync(STORAGE_KEYS.USER_EMAIL),
      SecureStore.deleteItemAsync(STORAGE_KEYS.USER_PHONE),
      SecureStore.deleteItemAsync(STORAGE_KEYS.USER_COUNTRY_CODE),
    ]);
  } catch (err) {
    console.error("Secure-store clear error:", err);
  }
}
