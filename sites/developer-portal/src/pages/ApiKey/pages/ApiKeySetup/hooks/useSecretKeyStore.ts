import { create } from 'zustand';

interface SecretKeyState {
  secretKey?: string;
}

export interface SecretKeyActions {
  setSecretKey: (_?: string) => void;
}

export type SecretKeyStore = SecretKeyState & SecretKeyActions;

export const useSecretKeyStore = create<SecretKeyStore>(set => ({
  secretKey: undefined,
  setSecretKey: (secretKey?: string) => set({ secretKey }),
}));
