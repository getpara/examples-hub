import { useQuery } from '@tanstack/react-query';
import { useInternalClient } from '../utils/useInternalClient.js';
import { useIsFullyLoggedIn } from './useIsFullyLoggedIn.js';
import { useStore } from '../../stores/useStore.js';
import { useContext } from 'react';
import { Account, getEmbeddedAccount } from '../../actions/getEmbeddedAccount.js';
import type {
  CosmosExternalWalletContextType,
  UseAccountParameters as UseCosmosAccountParameters,
} from '@getpara/cosmos-wallet-connectors';
import type { EvmExternalWalletContextType } from '@getpara/evm-wallet-connectors';
import type { Adapter } from '@getpara/solana-wallet-connectors';

export const ACCOUNT_BASE_KEY = 'PARA_ACCOUNT';

type EVMAccountType = ReturnType<ReturnType<typeof useContext<EvmExternalWalletContextType>>['useAccount']>;
type CosmosAccountType = Omit<
  ReturnType<ReturnType<typeof useContext<CosmosExternalWalletContextType>>['useAccount']>,
  'reconnect'
>;
type SolanaAccountType = Pick<
  Adapter,
  'publicKey' | 'name' | 'icon' | 'readyState' | 'supportedTransactionVersions' | 'url'
> & {
  isConnected?: boolean;
  isConnecting?: boolean;
};

type ConnectionType = 'embedded' | 'external' | 'both' | 'none';
type ExternalNetwork = 'evm' | 'cosmos' | 'solana';

/**
 * The return type for the useAccount hook.
 *
 * @property isConnected - Indicates whether there is a wallet connected (either embedded, external or both).
 * @property isLoading - Indicates whether the account is currently loading.
 * @property connectionType - The type of connection for the account:
 * @property embedded - The embedded account object.
 * @property external - An object containing connected external wallet account data:
 *   - `evm`: The connected EVM wallet account (if any).
 *   - `cosmos`: The connected Cosmos wallet account (if any), with the `reconnect` property omitted.
 *   - `solana`: The connected Solana wallet adapter, with only allowed properties included.
 */
export type UseAccountReturn = {
  /**
   *  Indicates whether there is a wallet connected (either embedded, external or both).
   */
  isConnected: boolean;
  /**
   *  Indicates whether the account is currently loading.
   */
  isLoading: boolean;
  /**
   * The type of connection for the account.
   * - 'embedded': Only the embedded account is connected.
   * - 'external': Only an external wallet is connected.
   * - 'both': Both embedded and external wallets are connected.
   * - 'none': No wallets are connected.
   */
  connectionType: ConnectionType;
  /**
   * The embedded account object. Use this instead of the deprecated top-level properties.
   */
  embedded: Omit<Account, 'isReady' | 'isFarcasterMiniApp' | 'isConnected' | 'isGuestMode'> & {
    isConnected: boolean;
    isGuestMode?: boolean;
  };
  /**
   * Connected external wallet account data.
   */
  external: {
    /**
     * The list of connected external networks, which can include 'evm', 'cosmos', and 'solana'.
     */
    connectedNetworks: ExternalNetwork[];
    /**
     * The connected EVM wallet (if any), with only allowed properties included.
     */
    evm: EVMAccountType;
    /**
     * The connected Cosmos wallet (if any), with only allowed properties included.
     */
    cosmos: CosmosAccountType;
    /**
     * The connected Solana wallet (if any), with only allowed properties included.
     */
    solana: SolanaAccountType;
  };
};

export type UseAccountParameters = {
  cosmos?: UseCosmosAccountParameters;
};

// Utility to pick only allowed keys from the Solana adapter
function pickSolanaAdapter(adapter: Adapter | undefined): SolanaAccountType {
  if (!adapter) return { isConnected: false } as SolanaAccountType;
  const { connected, connecting, publicKey, name, icon, readyState, supportedTransactionVersions, url } = adapter;
  return {
    isConnected: connected,
    isConnecting: connecting,
    publicKey,
    name,
    icon,
    readyState,
    supportedTransactionVersions,
    url,
  };
}

// Utility to pick only allowed keys from the Cosmos account (omit 'reconnect')
function pickCosmosAccount(account: CosmosAccountType | undefined): CosmosAccountType {
  if (!account) return { isConnected: false } as CosmosAccountType;
  // Destructure to remove 'reconnect'
  const { reconnect: _, ...rest } = account as any;
  return rest as CosmosAccountType;
}

/**
 * React Query hook for retrieving the current embedded account and connected external wallets.
 *
 * @returns {UseAccountReturn}
 *   The account data object, or undefined while loading.
 *
 * The returned object contains:
 * - `isConnected`: Indicates whether there is a wallet connected (either embedded, external or both).
 * - `isLoading`: Indicates whether the account is currently loading.
 * - `connectionType`: The type of connection for the account:
 * - `embedded`: The embedded account object.
 * - `external`: Connected external wallet data (EVM, Cosmos, Solana).
 */
export const useAccount = ({ cosmos }: UseAccountParameters = {}): UseAccountReturn => {
  const client = useInternalClient();
  const { data: isFullyLoggedIn, isSuccess } = useIsFullyLoggedIn();

  const evmContext = useStore(state => state.evmContext);
  const { useAccount: useEvmAccount } = useContext(evmContext);
  const evmAccount = useEvmAccount();
  const evmQueryKeys = [evmAccount?.status, evmAccount?.addresses, evmAccount?.chainId];

  const cosmosContext = useStore(state => state.cosmosContext);
  const { useAccount: useCosmosAccount } = useContext(cosmosContext);
  const cosmosAccount = useCosmosAccount(cosmos);
  const cosmosQueryKeys = [cosmosAccount?.status, cosmosAccount?.data];

  const solanaContext = useStore(state => state.solanaContext);
  const { useWallet: useSolanaWallet } = useContext(solanaContext);
  const solanaWallet = useSolanaWallet();
  const solanaQueryKeys = [
    solanaWallet?.wallet?.adapter?.connected,
    solanaWallet?.wallet?.adapter?.connecting,
    solanaWallet?.wallet?.adapter?.publicKey,
  ];
  const solanaAdapter = solanaWallet?.wallet?.adapter;

  const { data, isLoading } = useQuery({
    enabled: isSuccess && !!client,
    queryKey: [
      ACCOUNT_BASE_KEY,
      isFullyLoggedIn ?? null,
      client?.userId ?? null,
      evmQueryKeys,
      cosmosQueryKeys,
      solanaQueryKeys,
    ],
    queryFn: () => {
      const paraAccount = getEmbeddedAccount(client, isFullyLoggedIn);

      let connectionType: ConnectionType = 'none';

      if (paraAccount.isConnected) {
        connectionType = 'embedded';
        if (paraAccount.wallets.some(w => w.isExternal)) {
          connectionType = 'both';
        }
        // If there are no embedded wallets, but external wallets are connected then the connection type is 'external'
        if (
          paraAccount.wallets.every(w => w.isExternal) &&
          (evmAccount?.isConnected || cosmosAccount?.isConnected || solanaAdapter?.connected)
        ) {
          connectionType = 'external';
        }
      }

      // If the account is connected without a userId and not in guest mode, it is connected using an external wallet with connection only so technically it is not a Para connection.
      const isEmbeddedConnected = paraAccount.isConnected && (!!paraAccount.userId || paraAccount.isGuestMode);

      const connectedNetworks: ExternalNetwork[] = [];

      if (evmAccount?.isConnected) {
        connectedNetworks.push('evm');
      }
      if (cosmosAccount?.isConnected) {
        connectedNetworks.push('cosmos');
      }
      if (solanaAdapter?.connected) {
        connectedNetworks.push('solana');
      }

      return {
        isConnected: paraAccount.isConnected as boolean,
        connectionType,
        embedded: { ...paraAccount, isConnected: isEmbeddedConnected as boolean },
        external: {
          connectedNetworks,
          evm: evmAccount ?? {
            address: undefined,
            addresses: undefined,
            chain: undefined,
            chainId: undefined,
            connector: undefined,
            isConnected: false,
            isReconnecting: false,
            isConnecting: false,
            isDisconnected: true,
            status: 'disconnected',
          },
          cosmos: pickCosmosAccount(cosmosAccount),
          solana: pickSolanaAdapter(solanaAdapter),
        },
      };
    },
  });

  const defaultResp: UseAccountReturn = {
    isConnected: false,
    connectionType: 'none',
    isLoading,
    embedded: {
      isConnected: false,
    },
    external: {
      connectedNetworks: [],
      evm: {
        address: undefined,
        addresses: undefined,
        chain: undefined,
        chainId: undefined,
        connector: undefined,
        isConnected: false,
        isReconnecting: false,
        isConnecting: false,
        isDisconnected: true,
        status: 'disconnected',
      },
      cosmos: { isConnected: false } as CosmosAccountType,
      solana: { isConnected: false } as SolanaAccountType,
    },
  };

  return { ...(data ?? defaultResp), isLoading };
};
