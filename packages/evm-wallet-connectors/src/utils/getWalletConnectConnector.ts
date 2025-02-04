import { createConnector } from 'wagmi';
import type { CreateConnectorFn } from 'wagmi';
import { WalletConnectParameters, walletConnect } from 'wagmi/connectors';
import type { CreateConnector, ParaDetails, ParaWalletConnectParameters, WalletDetailsParams } from '../types/Wallet.js';

interface GetWalletConnectConnectorParams {
  projectId: string;
  walletConnectParameters?: ParaWalletConnectParameters;
}

interface CreateWalletConnectConnectorParams {
  projectId: string;
  walletDetails: WalletDetailsParams;
  walletConnectParameters?: ParaWalletConnectParameters;
}

interface GetOrCreateWalletConnectInstanceParams {
  projectId: string;
  walletConnectParameters?: ParaWalletConnectParameters;
  paraDetailsShowQrModal?: ParaDetails['showQrModal'];
}

const walletConnectInstances = new Map<string, ReturnType<typeof walletConnect>>();

// Function to get or create a walletConnect instance
const getOrCreateWalletConnectInstance = ({
  projectId,
  walletConnectParameters,
  paraDetailsShowQrModal,
}: GetOrCreateWalletConnectInstanceParams): ReturnType<typeof walletConnect> => {
  let config: WalletConnectParameters = {
    ...(walletConnectParameters ? walletConnectParameters : {}),
    projectId,
    showQrModal: false, // Required. Otherwise WalletConnect modal (Web3Modal) will popup during time of connection for a wallet
  };

  // `paraDetailsShowQrModal` should always be `true`
  if (paraDetailsShowQrModal) {
    config = { ...config, showQrModal: true };
  }

  const serializedConfig = JSON.stringify(config);

  const sharedWalletConnector = walletConnectInstances.get(serializedConfig);

  if (sharedWalletConnector) {
    return sharedWalletConnector;
  }

  // Create a new walletConnect instance and store it
  const newWalletConnectInstance = walletConnect(config);

  walletConnectInstances.set(serializedConfig, newWalletConnectInstance);

  return newWalletConnectInstance;
};

// Creates a WalletConnect connector with the given project ID and additional options.
function createWalletConnectConnector({
  projectId,
  walletDetails,
  walletConnectParameters,
}: CreateWalletConnectConnectorParams): CreateConnectorFn {
  // Create and configure the WalletConnect connector with project ID and options.
  return createConnector(config => ({
    ...getOrCreateWalletConnectInstance({
      projectId,
      walletConnectParameters,
      // Used in `connectorsForWallets` to add another
      // walletConnect wallet into Para with modal popup option
      paraDetailsShowQrModal: walletDetails.paraDetails.showQrModal,
    })(config),
    ...walletDetails,
    id: walletDetails.paraDetails.id,
  }));
}

// Factory function to obtain a configured WalletConnect connector.
export function getWalletConnectConnector({
  projectId,
  walletConnectParameters,
}: GetWalletConnectConnectorParams): CreateConnector {
  if (!projectId || projectId === '') {
    throw new Error(
      'No projectId found. Every dApp must now provide a WalletConnect Cloud projectId to enable WalletConnect v2. Sign up for your free key at https://cloud.walletconnect.com/sign-in',
    );
  }

  // Return a function that merges additional wallet details with `CreateConnectorFn`.
  return (walletDetails: WalletDetailsParams) =>
    createWalletConnectConnector({
      projectId,
      walletDetails,
      walletConnectParameters,
    });
}
