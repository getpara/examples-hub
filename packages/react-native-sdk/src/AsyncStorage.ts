import { StorageUtils } from '@getpara/web-sdk';
import RNAsyncStorage from '@react-native-async-storage/async-storage';

export class AsyncStorage implements StorageUtils {
  async get(key: string): Promise<string | null> {
    try {
      return await RNAsyncStorage.getItem(key);
    } catch (error) {
      console.warn('Error retrieving stored item:', error);
      return null;
    }
  }

  async set(key: string, value: string): Promise<void> {
    try {
      await RNAsyncStorage.setItem(key, value);
    } catch (error) {
      console.warn(`Error storing key ${key}:`, error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await RNAsyncStorage.removeItem(key);
    } catch (error) {
      console.warn(`Error removing key ${key}:`, error);
    }
  }

  async clear(prefix: string): Promise<void> {
    try {
      const keys = await RNAsyncStorage.getAllKeys();
      for (const key of keys) {
        if (key.startsWith(prefix)) {
          try {
            await RNAsyncStorage.removeItem(key);
          } catch (error) {
            console.warn(`Error clearing key ${key}:`, error);
          }
        }
      }
    } catch (error) {
      console.warn(`Error getting keys for prefix ${prefix}:`, error);
    }
  }
}
