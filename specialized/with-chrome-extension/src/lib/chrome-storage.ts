/**
 * Chrome storage overrides for Para SDK
 * These functions replace the default localStorage and sessionStorage
 * to work within Chrome extension environment
 */

export const chromeStorageOverrides = {
  localStorageGetItemOverride: async (key: string): Promise<string | null> => {
    try {
      const result = await chrome.storage.local.get(key);
      if (key in result) {
        const value = result[key];
        // Handle cases where the SDK expects certain values to be initialized
        if (value === undefined || value === null) {
          // Return empty object for guest wallet related keys
          if (key.includes('guestWalletIds') || key.includes('pregenIds')) {
            return '{}';
          }
          return null;
        }
        return String(value);
      }
      // Initialize guest wallet related keys with empty object
      if (key.includes('guestWalletIds') || key.includes('pregenIds')) {
        return '{}';
      }
      return null;
    } catch (error) {
      console.error(`Error getting item '${key}' from chrome.storage.local:`, error);
      return null;
    }
  },

  localStorageSetItemOverride: async (key: string, value: string): Promise<void> => {
    try {
      await chrome.storage.local.set({ [key]: value });
    } catch (error) {
      console.error(`Error setting item '${key}' in chrome.storage.local:`, error);
    }
  },

  localStorageRemoveItemOverride: async (key: string): Promise<void> => {
    try {
      await chrome.storage.local.remove(key);
    } catch (error) {
      console.error(`Error removing item '${key}' from chrome.storage.local:`, error);
    }
  },

  sessionStorageGetItemOverride: async (key: string): Promise<string | null> => {
    try {
      const result = await chrome.storage.session.get(key);
      if (key in result) {
        const value = result[key];
        // Handle cases where the SDK expects certain values to be initialized
        if (value === undefined || value === null) {
          // Return empty object for guest wallet related keys
          if (key.includes('guestWalletIds') || key.includes('pregenIds')) {
            return '{}';
          }
          return null;
        }
        return String(value);
      }
      // Initialize guest wallet related keys with empty object
      if (key.includes('guestWalletIds') || key.includes('pregenIds')) {
        return '{}';
      }
      return null;
    } catch (error) {
      console.error(`Error getting item '${key}' from chrome.storage.session:`, error);
      return null;
    }
  },

  sessionStorageSetItemOverride: async (key: string, value: string): Promise<void> => {
    try {
      await chrome.storage.session.set({ [key]: value });
    } catch (error) {
      console.error(`Error setting item '${key}' in chrome.storage.session:`, error);
    }
  },

  sessionStorageRemoveItemOverride: async (key: string): Promise<void> => {
    try {
      await chrome.storage.session.remove(key);
    } catch (error) {
      console.error(`Error removing item '${key}' from chrome.storage.session:`, error);
    }
  },

  clearStorageOverride: async (): Promise<void> => {
    try {
      const prefix = "@CAPSULE/";
      // Handle local storage clearing
      const localItems = await chrome.storage.local.get(null);
      const localKeysToRemove = Object.keys(localItems).filter((key) => key.startsWith(prefix));

      if (localKeysToRemove.length > 0) {
        await chrome.storage.local.remove(localKeysToRemove);
      }

      const sessionItems = await chrome.storage.session.get(null);
      const sessionKeysToRemove = Object.keys(sessionItems).filter((key) => key.startsWith(prefix));

      if (sessionKeysToRemove.length > 0) {
        await chrome.storage.session.remove(sessionKeysToRemove);
      }
    } catch (error) {
      console.error(`Error clearing '@CAPSULE/' keys from chrome storage:`, error);
    }
  },
};
