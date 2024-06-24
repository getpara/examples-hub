import { vi } from 'vitest';
import axios from 'axios';

axios.create = vi.fn(() => {
  return {
    get: vi.fn((...args) => {
      throw new Error(`axios get unexpected API call: ${args}`);
    }),
    patch: vi.fn((...args) => {
      throw new Error(`axios.patch unexpected API call: ${args}`);
    }),
    post: vi.fn((...args) => {
      throw new Error(`axios.post unexpected API call: ${args}`);
    }),
    delete: vi.fn((...args) => {
      throw new Error(`axios.delete unexpected API call: ${args}`);
    }),
  } as any;
});
