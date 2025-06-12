import { createStore } from 'zustand/vanilla';
import type { Config } from 'wagmi';

interface WagmiConfigState {
  config: Config | null;
}

const wagmiConfigStore = createStore<WagmiConfigState>(() => ({
  config: null,
}));

/**
 * Sets the Wagmi configuration in the global store.
 *
 * @param config - The Wagmi configuration object to be stored
 * @returns {void}
 */
export const setWagmiConfig = (config: Config) => {
  wagmiConfigStore.setState({ config });
};

/**
 * Retrieves the current Wagmi configuration from the global store.
 *
 * @returns {Config | null} - The current Wagmi configuration or null if not set
 */
export const getWagmiConfig = () => {
  return wagmiConfigStore.getState().config;
};
