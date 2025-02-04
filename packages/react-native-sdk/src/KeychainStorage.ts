// Copyright (c) Capsule Labs Inc. All rights reserved.

import { StorageUtils } from '@getpara/web-sdk';
import Keychain from 'react-native-keychain';

const USERNAME = '@CAPSULE';
const KEYCHAIN_USER_CANCELLED_ERRORS = [
  'user canceled the operation',
  'error: code: 13, msg: cancel',
  'error: code: 10, msg: fingerprint operation canceled by the user',
];

function isUserCancelledError(error: Error) {
  return KEYCHAIN_USER_CANCELLED_ERRORS.some(userCancelledError =>
    error.toString().toLowerCase().includes(userCancelledError),
  );
}

/**
 * Implements `StorageUtils` using React Native `Keychain`.
 */
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
      if (error instanceof Error && !isUserCancelledError(error)) {
        // triggered when biometry verification fails and user cancels the action
        throw new Error('Error retrieving stored item ' + error.message);
      }
      throw error;
    }
  }
  async set(key: string, value: string): Promise<void> {
    const result = await Keychain.setGenericPassword(USERNAME, value, {
      service: key,
      accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
      securityLevel: Keychain.SECURITY_LEVEL.ANY,
    });
    if (!result) {
      throw new Error('Failed to store key ' + key);
    }
  }
  async removeItem(key: string): Promise<void> {
    await Keychain.resetGenericPassword({ service: key });
  }
  async clear(prefix: string): Promise<void> {
    const services = await Keychain.getAllGenericPasswordServices();
    for (const key of services) {
      if (key && key.startsWith(prefix)) {
        await Keychain.resetGenericPassword({ service: key });
      }
    }
  }
}
