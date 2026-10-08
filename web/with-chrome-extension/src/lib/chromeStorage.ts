type StorageAreaName = "local" | "session";

const PARA_STORAGE_PREFIX = "@CAPSULE/";
const REQUIRED_LOCAL_KEYS = ["@CAPSULE/wallets", "@CAPSULE/ed25519Wallets"];

function isEmptyObjectKey(key: string) {
  return key.includes("guestWalletIds") || key.includes("pregenIds");
}

async function getItem(areaName: StorageAreaName, key: string): Promise<string | null> {
  try {
    const result = await chrome.storage[areaName].get(key);
    const value = key in result ? result[key] : undefined;

    if (value === undefined || value === null) {
      return isEmptyObjectKey(key) ? "{}" : null;
    }

    return String(value);
  } catch (error) {
    console.error(`Error getting item '${key}' from chrome.storage.${areaName}:`, error);
    return null;
  }
}

async function setItem(areaName: StorageAreaName, key: string, value: string): Promise<void> {
  try {
    await chrome.storage[areaName].set({ [key]: value });
  } catch (error) {
    console.error(`Error setting item '${key}' in chrome.storage.${areaName}:`, error);
  }
}

async function removeItem(areaName: StorageAreaName, key: string): Promise<void> {
  try {
    await chrome.storage[areaName].remove(key);
  } catch (error) {
    console.error(`Error removing item '${key}' from chrome.storage.${areaName}:`, error);
  }
}

async function removeParaKeys(areaName: StorageAreaName): Promise<void> {
  const items = await chrome.storage[areaName].get(null);
  const keys = Object.keys(items).filter((key) => key.startsWith(PARA_STORAGE_PREFIX));

  if (keys.length > 0) {
    await chrome.storage[areaName].remove(keys);
  }
}

export const chromeStorageOverrides = {
  localStorageGetItemOverride: (key: string) => getItem("local", key),
  localStorageSetItemOverride: (key: string, value: string) => setItem("local", key, value),
  localStorageRemoveItemOverride: (key: string) => removeItem("local", key),
  sessionStorageGetItemOverride: (key: string) => getItem("session", key),
  sessionStorageSetItemOverride: (key: string, value: string) => setItem("session", key, value),
  sessionStorageRemoveItemOverride: (key: string) => removeItem("session", key),
  clearStorageOverride: async (): Promise<void> => {
    try {
      await removeParaKeys("local");
      await removeParaKeys("session");
    } catch (error) {
      console.error(`Error clearing '${PARA_STORAGE_PREFIX}' keys from chrome storage:`, error);
    }
  },
};

export async function initializeRequiredStorageKeys(): Promise<void> {
  try {
    const result = await chrome.storage.local.get(REQUIRED_LOCAL_KEYS);
    const missingKeys = REQUIRED_LOCAL_KEYS.filter((key) => result[key] === undefined || result[key] === null);

    if (missingKeys.length > 0) {
      await chrome.storage.local.set(Object.fromEntries(missingKeys.map((key) => [key, "{}"])));
    }
  } catch (error) {
    console.error("Error initializing chrome storage:", error);
  }
}
