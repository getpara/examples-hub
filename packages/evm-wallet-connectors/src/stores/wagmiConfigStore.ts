import { createStore } from 'zustand/vanilla';
import type { Config } from 'wagmi';

interface WagmiConfigState {
  config: Config | null;
}

const wagmiConfigStore = createStore<WagmiConfigState>(() => ({
  config: null,
}));

export const setWagmiConfig = (config: Config) => {
  wagmiConfigStore.setState({ config });
};

export const getWagmiConfig = () => {
  return wagmiConfigStore.getState().config;
};
