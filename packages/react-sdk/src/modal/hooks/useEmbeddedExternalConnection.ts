import { useExternalWalletProviderStore } from '../stores/externalWalletProvider/useExternalWalletProviderStore.js';

export const useEmbeddedExternalConnection = () => {
  // Get the connectParaEvmWallet action if available. This is used to trigger Para as an active connection when the user logs in using a non external wallet method.
  const connectParaEvmWallet = useExternalWalletProviderStore(state => state.connectParaEvmWallet);
  const EvmProvider = useExternalWalletProviderStore(state => state.EvmProvider);
  const evmContext = useExternalWalletProviderStore(state => state.evmContext);
  const connectParaCosmosWallet = useExternalWalletProviderStore(state => state.connectParaCosmosWallet);
  const CosmosProvider = useExternalWalletProviderStore(state => state.CosmosProvider);
  const cosmosContext = useExternalWalletProviderStore(state => state.cosmosContext);

  const connectEmbeddedToExternalConnectors = async () => {
    // If we're in the ParaEvmProvider context call the connect method to trigger Para as an active connection
    if (evmContext && EvmProvider && connectParaEvmWallet) {
      try {
        const { error } = await connectParaEvmWallet();
        if (error) {
          console.warn('Failed to connect Para EVM wallet to Wagmi:', error);
        }
      } catch (err) {
        console.warn('Error calling connectParaEvmWallet:', err);
      }
    }
    // If we're in the ParaCosmosProvider context call the connect method to trigger Para as an active connection
    if (cosmosContext && CosmosProvider && connectParaCosmosWallet) {
      try {
        const { error } = await connectParaCosmosWallet();
        if (error) {
          console.warn('Failed to connect Para Cosmos wallet to Graz:', error);
        }
      } catch (err) {
        console.warn('Error calling connectParaCosmosWallet:', err);
      }
    }
  };

  return connectEmbeddedToExternalConnectors;
};
