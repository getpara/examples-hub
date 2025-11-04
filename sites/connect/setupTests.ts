import { beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock Next.js router
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
    route: '/',
    back: vi.fn(),
    forward: vi.fn(),
    reload: vi.fn(),
    events: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    },
    beforePopState: vi.fn(() => true),
    prefetch: vi.fn(() => Promise.resolve()),
  }),
}));

// Mock Next.js image
vi.mock('next/image', () => ({
  default: (props: any) => props,
}));

// Mock Next.js link
vi.mock('next/link', () => ({
  default: ({ children }: any) => children,
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock crypto API
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: vi.fn().mockImplementation((arr: any) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
    randomUUID: vi.fn().mockReturnValue('12345678-1234-1234-1234-123456789012'),
    subtle: {
      digest: vi.fn().mockResolvedValue(new ArrayBuffer(32)),
      encrypt: vi.fn().mockResolvedValue(new ArrayBuffer(16)),
      decrypt: vi.fn().mockResolvedValue(new ArrayBuffer(16)),
      sign: vi.fn().mockResolvedValue(new ArrayBuffer(64)),
      verify: vi.fn().mockResolvedValue(true),
      generateKey: vi.fn().mockResolvedValue({}),
      importKey: vi.fn().mockResolvedValue({}),
      exportKey: vi.fn().mockResolvedValue(new ArrayBuffer(32)),
      deriveBits: vi.fn().mockResolvedValue(new ArrayBuffer(32)),
      deriveKey: vi.fn().mockResolvedValue({}),
    },
  },
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
  sessionStorageMock.removeItem.mockClear();
  sessionStorageMock.clear.mockClear();
});
