import { useExternalWalletProviderStore } from '../stores/externalWalletProvider/useExternalWalletProviderStore.js';

export const useEmbeddedExternalConnection = () => {
  // Get the connectCapsuleEvmWallet action if available. This is used to trigger Capsule as an active connection when the user logs in using a non external wallet method.
  const connectCapsuleEvmWallet = useExternalWalletProviderStore(state => state.connectCapsuleEvmWallet);
  const EvmProvider = useExternalWalletProviderStore(state => state.EvmProvider);
  const evmContext = useExternalWalletProviderStore(state => state.evmContext);
  const connectCapsuleCosmosWallet = useExternalWalletProviderStore(state => state.connectCapsuleCosmosWallet);
  const CosmosProvider = useExternalWalletProviderStore(state => state.CosmosProvider);
  const cosmosContext = useExternalWalletProviderStore(state => state.cosmosContext);

  const connectEmbeddedToExternalConnectors = async () => {
    // If we're in the CapsuleEvmProvider context call the connect method to trigger Capsule as an active connection
    if (evmContext && EvmProvider && connectCapsuleEvmWallet) {
      try {
        const { error } = await connectCapsuleEvmWallet();
        if (error) {
          console.warn('Failed to connect Capsule EVM wallet to Wagmi:', error);
        }
      } catch (err) {
        console.warn('Error calling connectCapsuleEvmWallet:', err);
      }
    }
    // If we're in the CapsuleCosmosProvider context call the connect method to trigger Capsule as an active connection
    if (cosmosContext && CosmosProvider && connectCapsuleCosmosWallet) {
      try {
        const { error } = await connectCapsuleCosmosWallet();
        if (error) {
          console.warn('Failed to connect Capsule Cosmos wallet to Graz:', error);
        }
      } catch (err) {
        console.warn('Error calling connectCapsuleCosmosWallet:', err);
      }
    }
  };

  return connectEmbeddedToExternalConnectors;
};
