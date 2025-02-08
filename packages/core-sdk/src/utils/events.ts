import { BaseEvent, ParaEvent } from '../types/index.js';

export function dispatchEvent<T>(type: ParaEvent, data: T, error?: string) {
  typeof window !== 'undefined' &&
    !!window.dispatchEvent &&
    window.dispatchEvent(
      new CustomEvent<BaseEvent<T>>(type, { detail: { data, ...(error && { error: new Error(error) }) } }),
    );
}
