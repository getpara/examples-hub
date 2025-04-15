import { StorageUtils } from '@getpara/web-sdk';
import Keychain from 'react-native-keychain';

const USERNAME = '@CAPSULE';

export class KeychainStorage implements StorageUtils {
  async get(key: string): Promise<string | null> {
    try {
      const item = await Keychain.getGenericPassword({
        service: key,
      });
      if (!item) {
        return null;
      }
      return item.password;
    } catch (error) {
      console.warn('Error retrieving stored item:', error);
      return null;
    }
  }

  async set(key: string, value: string): Promise<void> {
    try {
      const result = await Keychain.setGenericPassword(USERNAME, value, {
        service: key,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
        securityLevel: Keychain.SECURITY_LEVEL.ANY,
        storage: Keychain.STORAGE_TYPE.AES_GCM_NO_AUTH,
      });
      if (!result) {
        console.warn(`Failed to store key ${key}`);
      }
    } catch (error) {
      console.warn(`Error storing key ${key}:`, error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await Keychain.resetGenericPassword({ service: key });
    } catch (error) {
      console.warn(`Error removing key ${key}:`, error);
    }
  }

  async clear(prefix: string): Promise<void> {
    try {
      const services = await Keychain.getAllGenericPasswordServices();
      for (const key of services) {
        if (key && key.startsWith(prefix)) {
          try {
            await Keychain.resetGenericPassword({ service: key });
          } catch (error) {
            console.warn(`Error clearing key ${key}:`, error);
          }
        }
      }
    } catch (error) {
      console.warn(`Error getting services for prefix ${prefix}:`, error);
    }
  }
}
