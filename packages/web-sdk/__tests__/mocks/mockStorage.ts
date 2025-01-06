import { vi } from 'vitest';

export const mockGetItem = vi.fn();
export const mockSetItem = vi.fn();
export const mockRemoveItem = vi.fn();
export const mockKey = vi.fn();
export const mockLength = vi.fn();

const store = {};

class StorageMock {
  get length() {
    return Object.keys(store).length;
  }

  getItem = mockGetItem.mockImplementation(key => {
    return store[key];
  });

  setItem = mockSetItem.mockImplementation((key, value) => {
    store[key] = value.toString();
  });

  removeItem = mockRemoveItem.mockImplementation(key => {
    delete store[key];
  });

  key = mockKey.mockImplementation(index => {
    return Object.keys(store)[index];
  });
}

const localStorage = new StorageMock();

const sessionStorage = new StorageMock();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorage,
});

Object.defineProperty(globalThis, 'sessionStorage', {
  value: sessionStorage,
});
