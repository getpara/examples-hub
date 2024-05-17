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
import { Chain } from 'wagmi/chains';

import { getViemChain, createCapsuleViemClient, createCapsuleAccount } from '@usecapsule/viem-v2-integration';
import CapsuleWeb, { decimalToHex, hexToDecimal, CapsuleModalProps } from '@usecapsule/react-sdk';
import { renderModal } from './connectorModal.js';

const STORAGE_CHAIN_ID_KEY = '@CAPSULE/chainId';
const TEN_MINUTES_MS = 600000;

interface CapsuleEIP1193ProviderOpts extends Partial<CapsuleModalProps> {
  capsule: CapsuleWeb;
  chainId: string; // base-10 chain id number as a string
  chains: Chain[];
  disableModal?: boolean;
  storageOverride?: Pick<Storage, 'setItem' | 'getItem'>;
}

type WebSocketTransportSubscribeParameters = {
  onData: (data: unknown) => void;
  onError?: (error: unknown) => void;
};

type WebSocketTransportSubscribeReturnType = {
  subscriptionId: Hash;
  unsubscribe: () => Promise<unknown>;
};

type WebSocketTransportSubscribeFn = (
  args: WebSocketTransportSubscribeParameters & {
    params: ['newHeads'];
  },
) => Promise<WebSocketTransportSubscribeReturnType>;

const serverSessionStorageStub = {
  setItem: () => {},
  getItem: () => null,
};

export class CapsuleEIP1193Provider extends EventEmitter implements EIP1193Provider {
  private currentHexChainId: Hex;
  private walletClient: WalletClient;
  private chainTransportSubscribe?: WebSocketTransportSubscribeFn;
  private chains: Record<Hex, AddEthereumChainParameter>;
  private viemChains: Record<Hex, Chain>;
  private capsule: CapsuleWeb;
  private disableModal: boolean;
  private storage: Pick<Storage, 'setItem' | 'getItem'>;
  private modalProps: Partial<CapsuleModalProps>;

  constructor(opts: CapsuleEIP1193ProviderOpts) {
    super();

    this.storage = opts.storageOverride || typeof window === 'undefined' ? serverSessionStorageStub : sessionStorage;

    this.capsule = opts.capsule;
    this.modalProps = { ...opts };
    this.disableModal = !!opts.disableModal;
    this.viemChains = opts.chains.reduce((acc, curChain) => {
      acc[decimalToHex(`${curChain.id}`)] = curChain;
      return acc;
    }, {});
    this.chains = this.wagmiChainsToAddEthereumChainParameters(opts.chains);

    const defaultChainId = this.getStorageChainId() || opts.chainId;
    const currentChainId = this.chains[decimalToHex(defaultChainId)] ? defaultChainId : `${opts.chains[0].id}`;
    this.setCurrentChain(decimalToHex(currentChainId));

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
  };

  private wagmiChainToAddEthereumChainParameters = (chain: Chain): [Hex, AddEthereumChainParameter] => {
    const hexChainId = decimalToHex(`${chain.id}`);

    return [
      hexChainId,
      {
        chainId: hexChainId,
        chainName: chain.name,
        nativeCurrency: chain.nativeCurrency,
        rpcUrls: this.getRpcUrlsFromViemChain(chain),
      },
    ];
  };

  private wagmiChainsToAddEthereumChainParameters = (chains: Chain[]): Record<Hex, AddEthereumChainParameter> => {
    return Object.fromEntries(chains.map(this.wagmiChainToAddEthereumChainParameters));
  };

  private accountFromAddress = (address: Address): LocalAccount => {
    return createCapsuleAccount(this.capsule, address);
  };

  private setCurrentChain = (chainId: Hex) => {
    const chain = this.chains[chainId];
    this.setChainId(chainId);

    const viemChain = this.viemChains[chainId] || getViemChain(hexToDecimal(chainId));
    let transport: Transport;
    if (chain.rpcUrls[0].startsWith('ws')) {
      transport = webSocket(chain.rpcUrls[0]);
      this.chainTransportSubscribe = transport({
        chain: viemChain,
      }).value.subscribe;
    } else {
      transport = http(chain.rpcUrls[0]);
      this.chainTransportSubscribe = undefined;
    }

    this.walletClient = createCapsuleViemClient(
      this.capsule,
      {
        chain: viemChain,
        transport,
        // @ts-ignore
      },
      { noAccount: true },
    ).extend(publicActions);

    this.emit('chainChanged', this.currentHexChainId);
  };

  request: EIP1193RequestFn<EIP1474Methods> = async (args): Promise<any> => {
    const { method, params } = args;

    switch (method) {
      case 'eth_accounts': {
        return Object.values(this.capsule.getWallets()).map((w) => w.address);
      }
      case 'eth_chainId': {
        return this.currentHexChainId;
      }
      case 'eth_requestAccounts': {
        if (await this.capsule.isFullyLoggedIn()) {
          return Object.values(this.capsule.getWallets()).map((w) => w.address);
        }

        let isClosed = false;
        const onClose = () => {
          isClosed = true;
        };

        if (!this.disableModal) {
          renderModal(this.capsule, this.modalProps, onClose);
        }

        // check if capsule is fully logged in every 2 seconds for 10 minutes at most
        const now = Date.now();
        while (Date.now() - now < TEN_MINUTES_MS) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          if (await this.capsule.isFullyLoggedIn()) {
            const addresses = Object.values(this.capsule.getWallets()).map((w) => w.address);
            this.emit('accountsChanged', addresses);
            return addresses;
          }
          if (isClosed) {
            throw new ProviderRpcError(new Error('user closed modal'), {
              code: 4001,
              shortMessage: 'user closed modal',
            });
          }
        }

        throw new ProviderRpcError(new Error('timed out waiting for user to log in'), {
          code: 4001,
          shortMessage: 'timed out waiting for user to log in',
        });
      }
      case 'eth_sendTransaction': {
        const fromAddress = params[0].from;
        return this.walletClient.sendTransaction({
          ...formatTransaction(params[0]),
          chain: undefined, // uses the chain from the wallet client
          account: this.accountFromAddress(fromAddress),
        } as any);
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
          throw new ProviderRpcError(new Error('chain does not support subscriptions'), {
            code: 4200,
            shortMessage: 'chain does not support subscriptions',
          });
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
        return null;
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
          const chain = getViemChain(hexToDecimal(params[0].chainId));
          const [hexChainId, addEthereumChainParameter] = this.wagmiChainToAddEthereumChainParameters(chain);
          this.chains[hexChainId] = addEthereumChainParameter;

          this.setCurrentChain(params[0].chainId);
        }
        if (this.currentHexChainId !== params[0].chainId) {
          this.setCurrentChain(params[0].chainId);
        }
        return null;
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
  };
}
