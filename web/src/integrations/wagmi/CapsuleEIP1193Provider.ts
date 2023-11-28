import {
  Address,
  EIP1474Methods,
  EIP1193Provider,
  EIP1193RequestFn,
  ProviderRpcError,
  WalletClient,
  webSocket,
  Hash,
  publicActions,
  LocalAccount,
  AddEthereumChainParameter,
  Hex,
  http,
  Transport,
  formatTransaction,
} from 'viem';
import { EventEmitter } from 'eventemitter3';
import { Chain } from '@wagmi/chains';

import { Capsule } from '../../Capsule';
import { getViemChain, createCapsuleViemClient, createCapsuleAccount } from './viemWalletClient';
import { decimalToHex, hexToDecimal } from '../../utils/formattingUtils';
import { renderModal } from './connectorModal';
import { CoreCapsule } from '../../core/CoreCapsule';

const STORAGE_CHAIN_ID_KEY = '@CAPSULE/chainId';
const TEN_MINUTES_MS = 600000;

interface CapsuleEIP1193ProviderOpts {
  capsule: Capsule | CoreCapsule;
  chainId: string; // base-10 chain id number as a string
  chains: Chain[];
  disableModal?: boolean;
  appName: string;
  storageOverride?: Pick<Storage, 'setItem' | 'getItem'>;
}

type WebSocketTransportSubscribeParameters = {
  onData: (data: unknown) => void;
  onError?: (error: unknown) => void;
}

type WebSocketTransportSubscribeReturnType = {
  subscriptionId: Hash;
  unsubscribe: () => Promise<unknown>;
}

type WebSocketTransportSubscribeFn = (
  args: WebSocketTransportSubscribeParameters & {
    params: ['newHeads'];
  },
) => Promise<WebSocketTransportSubscribeReturnType>;

export class CapsuleEIP1193Provider extends EventEmitter implements EIP1193Provider {
  private currentHexChainId: Hex;
  private walletClient: WalletClient;
  private chainTransportSubscribe?: WebSocketTransportSubscribeFn;
  private chains: Record<Hex, AddEthereumChainParameter>;
  private capsule: Capsule | CoreCapsule;
  private disableModal: boolean;
  private appName: string;
  private storage: Pick<Storage, 'setItem' | 'getItem'>;

  constructor(opts: CapsuleEIP1193ProviderOpts) {
    super();

    this.storage = opts.storageOverride || sessionStorage;
    const chainId = this.getStorageChainId() || opts.chainId;

    this.capsule = opts.capsule;
    this.appName = opts.appName;
    this.disableModal = !!opts.disableModal;
    this.chains = this.wagmiChainsToAddEthereumChainParameters(opts.chains);
    this.setCurrentChain(decimalToHex(chainId));

    this.emit('connect', { chainId: this.currentHexChainId });
  }

  private getStorageChainId(): string | null {
    return this.storage.getItem(STORAGE_CHAIN_ID_KEY);
  }

  private setChainId(hexChainId: Hex) {
    this.currentHexChainId = hexChainId;
    this.storage.setItem(STORAGE_CHAIN_ID_KEY, hexToDecimal(hexChainId));
  }

  private getRpcUrlsFromViemChain = (chain: Chain): string[] => {
    return [...(chain.rpcUrls.default.webSocket || []), ...chain.rpcUrls.default.http];
  }

  private wagmiChainsToAddEthereumChainParameters = (chains: Chain[]): Record<Hex, AddEthereumChainParameter> => {
    return Object.fromEntries(chains.map((chain) => {
      const hexChainId = decimalToHex(`${chain.id}`);
      const viemChain = getViemChain(`${chain.id}`);

      return [hexChainId, {
        chainId: hexChainId,
        chainName: viemChain.name,
        nativeCurrency: {
          name: viemChain.nativeCurrency.name,
          symbol: viemChain.nativeCurrency.symbol,
          decimals: viemChain.nativeCurrency.decimals,
        },
        rpcUrls: this.getRpcUrlsFromViemChain(chain),
      }];
    }));
  }

  private accountFromAddress = (address: Address): LocalAccount => {
    return createCapsuleAccount(this.capsule, address);
  }

  private setCurrentChain = (chainId: Hex) => {
    const chain = this.chains[chainId];
    this.setChainId(chainId);

    const viemChain = getViemChain(hexToDecimal(chainId));
    let transport: Transport;
    if (chain.rpcUrls[0].startsWith('ws')) {
      transport = webSocket(chain.rpcUrls[0]);
      this.chainTransportSubscribe = transport({ chain: viemChain }).value.subscribe;
    } else {
      transport = http(chain.rpcUrls[0]);
      this.chainTransportSubscribe = undefined;
    }

    this.walletClient = createCapsuleViemClient(this.capsule, {
      chain: viemChain,
      transport,
      // @ts-ignore
    }, { noAccount: true }).extend(publicActions);

    this.emit('chainChanged', this.currentHexChainId);
  }

  request: EIP1193RequestFn<EIP1474Methods> = async(args): Promise<any> => {
    const { method, params } = args;

    switch (method) {
      case 'eth_accounts': {
        return Object.values(this.capsule.getWallets()).map(w => w.address);
      }
      case 'eth_chainId': {
        return this.currentHexChainId;
      }
      case 'eth_requestAccounts': {
        if (await this.capsule.isFullyLoggedIn()) {
          return Object.values(this.capsule.getWallets()).map(w => w.address);
        }
        if (this.disableModal) {
          throw new ProviderRpcError(
            new Error('the provider is disconnected'),
            { code: 4900, shortMessage: 'the provider is disconnected' },
          );
        }

        let isClosed = false;
        const onClose = () => { isClosed = true; };
        renderModal(this.capsule, this.appName, onClose);
        // check if capsule is fully logged in every 2 seconds for 10 minutes at most
        const now = Date.now();
        while ((Date.now() - now) < TEN_MINUTES_MS) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          if (await this.capsule.isFullyLoggedIn()) {
            const addresses = Object.values(this.capsule.getWallets()).map(w => w.address);
            this.emit('accountsChanged', addresses);
            return addresses;
          }
          if (isClosed) {
            throw new ProviderRpcError(
              new Error('user closed modal'),
              { code: 4001, shortMessage: 'user closed modal' },
            );
          }
        }

        throw new ProviderRpcError(
          new Error('timed out waiting for user to log in'),
          { code: 4001, shortMessage: 'timed out waiting for user to log in' },
        );
      }
      case 'eth_sendTransaction': {
        const fromAddress = params[0].from;
        return this.walletClient.sendTransaction({
          ...formatTransaction(params[0]),
          chain: undefined, // uses the chain from the wallet client
          account: this.accountFromAddress(fromAddress),
        });
      }
      case 'eth_sign':
      case 'personal_sign': {
        return this.walletClient.signMessage({
          message: { raw: params[0] },
          account: this.accountFromAddress(params[1]),
        });
      }
      case 'eth_signTransaction': {
        const fromAddress = params[0].from;
        return this.accountFromAddress(fromAddress).signTransaction(formatTransaction(params[0]));
      }
      case 'eth_signTypedData_v4': {
        const fromAddress = params[0];
        let typedMessage = params[1];

        if (typeof typedMessage === 'string') {
          typedMessage = JSON.parse(typedMessage);
        }
        return this.walletClient.signTypedData({
          ...typedMessage,
          account: this.accountFromAddress(fromAddress),
        });
      }
      case 'eth_subscribe': {
        if (!this.chainTransportSubscribe) {
          throw new ProviderRpcError(
            new Error('chain does not support subscriptions'),
            { code: 4200, shortMessage: 'chain does not support subscriptions' },
          );
        }

        const res = await this.chainTransportSubscribe({
          params: params as ['newHeads'],
          onData: (data) => {
            this.emit('message', {
              type: 'eth_subscription',
              data,
            });
          },
        });
        return res.subscriptionId;
      }
      case 'wallet_addEthereumChain': {
        if (!this.chains[params[0].chainId]) {
          this.chains[params[0].chainId] = params[0];
        }
        return;
      }
      case 'wallet_getPermissions': {
        // capsule doesn't support this type of functionality for now
        return [];
      }
      case 'wallet_requestPermissions': {
        // capsule doesn't support this type of functionality for now
        return [];
      }
      case 'wallet_switchEthereumChain': {
        if (!this.chains[params[0].chainId]) {
          throw new ProviderRpcError(
            new Error(`chainId: ${params[0]} not connected`),
            { code: 4901, shortMessage: 'chainId not connected' },
          );
        }
        if (this.currentHexChainId !== params[0].chainId) {
          this.setCurrentChain(params[0].chainId);
        }
        return;
      }
      case 'wallet_watchAsset': {
        // capsule doesn't support this type of functionality for now
        return false;
      }
      default: {
        return this.walletClient.request({
          method,
          params,
        });
      }
    }
  }
}
