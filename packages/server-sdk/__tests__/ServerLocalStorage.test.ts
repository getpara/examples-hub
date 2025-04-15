import { beforeEach, describe, expect, it } from 'vitest';
import { ServerLocalStorage } from '../src/ServerLocalStorage.js';

describe('ServerLocalStorage', () => {
  let storage: ServerLocalStorage;

  beforeEach(() => {
    storage = new ServerLocalStorage();
  });

  describe('get', () => {
    it('should return null for non-existent key', () => {
      expect(storage.get('nonExistentKey')).toBeNull();
    });

    it('should return the value for an existing key', () => {
      storage.set('testKey', 'testValue');
      expect(storage.get('testKey')).toBe('testValue');
    });
  });

  describe('set', () => {
    it('should set a key-value pair', () => {
      storage.set('testKey', 'testValue');
      expect(storage.get('testKey')).toBe('testValue');
    });

    it('should override existing value', () => {
      storage.set('testKey', 'initialValue');
      storage.set('testKey', 'updatedValue');
      expect(storage.get('testKey')).toBe('updatedValue');
    });
  });

  describe('removeItem', () => {
    it('should remove an existing key', () => {
      storage.set('testKey', 'testValue');
      expect(storage.get('testKey')).toBe('testValue');

      storage.removeItem('testKey');
      expect(storage.get('testKey')).toBeNull();
    });

    it('should do nothing for non-existent key', () => {
      storage.removeItem('nonExistentKey');
      expect(storage.get('nonExistentKey')).toBeNull();
    });
  });

  describe('clear', () => {
    beforeEach(() => {
      storage.set('prefix_key1', 'value1');
      storage.set('prefix_key2', 'value2');
      storage.set('other_key', 'value3');
    });

    it('should clear all keys with the specified prefix', () => {
      storage.clear('prefix_');

      expect(storage.get('prefix_key1')).toBeNull();
      expect(storage.get('prefix_key2')).toBeNull();
      expect(storage.get('other_key')).toBe('value3');
    });

    it('should do nothing if no keys match the prefix', () => {
      storage.clear('unknown_prefix_');

      expect(storage.get('prefix_key1')).toBe('value1');
      expect(storage.get('prefix_key2')).toBe('value2');
      expect(storage.get('other_key')).toBe('value3');
    });

    it('should verify items are actually removed from storage', () => {
      for (let i = 0; i < 5; i++) {
        storage.set(`test_prefix_${i}`, `value${i}`);
      }

      storage.clear('test_prefix_');

      for (let i = 0; i < 5; i++) {
        expect(storage.get(`test_prefix_${i}`)).toBeNull();
      }

      expect(storage.get('prefix_key1')).toBe('value1');
      expect(storage.get('other_key')).toBe('value3');
    });
  });
});
