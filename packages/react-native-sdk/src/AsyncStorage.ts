// Copyright (c) Capsule Labs Inc. All rights reserved.

import { StorageUtils } from '@usecapsule/web-sdk';
import RNAsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Implements `StorageUtils` using React Native Async Storage.
 */
export class AsyncStorage implements StorageUtils {
  async clear(prefix: string): Promise<void> {
    const keys = await RNAsyncStorage.getAllKeys();
    for (const key of keys) {
      if (key.startsWith(prefix)) {
        await RNAsyncStorage.removeItem(key);
      }
    }
  }

  async get(key: string): Promise<string | null> {
    return RNAsyncStorage.getItem(key);
  }

  async removeItem(key: string): Promise<void> {
    await RNAsyncStorage.removeItem(key);
  }

  async set(key: string, value: string): Promise<void> {
    await RNAsyncStorage.setItem(key, value);
  }
}
