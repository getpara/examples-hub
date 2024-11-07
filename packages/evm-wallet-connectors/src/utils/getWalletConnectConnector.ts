import { createConnector } from 'wagmi';
import type { CreateConnectorFn } from 'wagmi';
import { WalletConnectParameters, walletConnect } from 'wagmi/connectors';
import type {
  CreateConnector,
  CapsuleDetails,
  CapsuleWalletConnectParameters,
  WalletDetailsParams,
} from '../types/Wallet.js';

interface GetWalletConnectConnectorParams {
  projectId: string;
  walletConnectParameters?: CapsuleWalletConnectParameters;
}

interface CreateWalletConnectConnectorParams {
  projectId: string;
  walletDetails: WalletDetailsParams;
  walletConnectParameters?: CapsuleWalletConnectParameters;
}

interface GetOrCreateWalletConnectInstanceParams {
  projectId: string;
  walletConnectParameters?: CapsuleWalletConnectParameters;
  capsuleDetailsShowQrModal?: CapsuleDetails['showQrModal'];
}

const walletConnectInstances = new Map<string, ReturnType<typeof walletConnect>>();

// Function to get or create a walletConnect instance
const getOrCreateWalletConnectInstance = ({
  projectId,
  walletConnectParameters,
  capsuleDetailsShowQrModal,
}: GetOrCreateWalletConnectInstanceParams): ReturnType<typeof walletConnect> => {
  let config: WalletConnectParameters = {
    ...(walletConnectParameters ? walletConnectParameters : {}),
    projectId,
    showQrModal: false, // Required. Otherwise WalletConnect modal (Web3Modal) will popup during time of connection for a wallet
  };

  // `capsuleDetailsShowQrModal` should always be `true`
  if (capsuleDetailsShowQrModal) {
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
      // walletConnect wallet into capsule with modal popup option
      capsuleDetailsShowQrModal: walletDetails.capsuleDetails.showQrModal,
    })(config),
    ...walletDetails,
    id: walletDetails.capsuleDetails.id,
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
