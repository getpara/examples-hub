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
import { extractRpcUrls } from '@wagmi/core';
import { getViemChain, createParaViemClient, createParaAccount } from '@getpara/viem-v2-integration';
import ParaWeb, { decimalToHex, hexToDecimal } from '@getpara/web-sdk';

const STORAGE_CHAIN_ID_KEY = '@CAPSULE/chainId';
const TEN_MINUTES_MS = 600000;

interface ParaEIP1193ProviderOpts {
  para: ParaWeb;
  chainId: string; // base-10 chain id number as a string
  chains: Chain[];
  disableModal?: boolean;
  storageOverride?: Pick<Storage, 'setItem' | 'getItem'>;
  transports?: Record<number, Transport>;
  renderModal?: (onClose: () => void) => { openModal: () => void };
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

export class ParaEIP1193Provider extends EventEmitter implements EIP1193Provider {
  private currentHexChainId: Hex;
  private walletClient: WalletClient;
  private chainTransportSubscribe?: WebSocketTransportSubscribeFn;
  private chains: Record<Hex, AddEthereumChainParameter>;
  private viemChains: Record<Hex, Chain>;
  private para: ParaWeb;
  private disableModal: boolean;
  private storage: Pick<Storage, 'setItem' | 'getItem'>;
  private isModalClosed: boolean;
  private transports?: Record<number, Transport>;
  private openModal?: () => void;

  constructor(opts: ParaEIP1193ProviderOpts) {
    super();

    this.storage = opts.storageOverride || typeof window === 'undefined' ? serverSessionStorageStub : sessionStorage;

    this.isModalClosed = true;
    this.para = opts.para;
    this.disableModal = !!opts.disableModal;
    this.viemChains = opts.chains.reduce((acc, curChain) => {
      acc[decimalToHex(`${curChain.id}`)] = curChain;
      return acc;
    }, {});
    this.chains = this.wagmiChainsToAddEthereumChainParameters(opts.chains);
    this.transports = opts.transports;

    if (!this.disableModal && opts.renderModal) {
      const { openModal } = opts.renderModal(this.closeModal);
      this.openModal = openModal;
    }

    const defaultChainId = this.getStorageChainId() || opts.chainId;
    const currentChainId = this.chains[decimalToHex(defaultChainId)] ? defaultChainId : `${opts.chains[0].id}`;
    this.setCurrentChain(decimalToHex(currentChainId));

    this.emit('connect', { chainId: this.currentHexChainId });
  }

  private get accounts(): string[] {
    return this.para.getWalletsByType('EVM').map(w => w.address);
  }

  private getStorageChainId(): string | null {
    return this.storage.getItem(STORAGE_CHAIN_ID_KEY);
  }

  private setChainId(hexChainId: Hex) {
    this.currentHexChainId = hexChainId;
    this.storage.setItem(STORAGE_CHAIN_ID_KEY, hexToDecimal(hexChainId));
  }

  private getRpcUrlsFromViemChain = (chain: Chain): string[] => {
    return extractRpcUrls({ chain, transports: this.transports });
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
    return createParaAccount(this.para, address);
  };

  private setCurrentChain = (chainId: Hex) => {
    const chain = this.chains[chainId];
    this.setChainId(chainId);

    const viemChain = this.viemChains[chainId] || getViemChain(hexToDecimal(chainId));
    const rpcUrls = this.getRpcUrlsFromViemChain(viemChain);
    let transport: Transport;

    if (this.transports[viemChain.id]) {
      transport = this.transports[viemChain.id];
    } else if (rpcUrls[0].startsWith('ws')) {
      transport = webSocket(chain.rpcUrls[0]);
    } else {
      transport = http(rpcUrls[0]);
      this.chainTransportSubscribe = undefined;
    }

    const chainTransport = transport({
      chain: viemChain,
    });
    if (chainTransport.config.type === 'ws') {
      this.chainTransportSubscribe = chainTransport.value.subscribe;
    }

    this.walletClient = createParaViemClient(
      this.para,
      {
        chain: viemChain,
        transport,
        // @ts-ignore
      },
      { noAccount: true },
    ).extend(publicActions);

    this.emit('chainChanged', this.currentHexChainId);
  };

  closeModal = () => {
    this.isModalClosed = true;
  };

  private async waitForLogin(timeoutMs = TEN_MINUTES_MS): Promise<boolean> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      if (await this.para.isFullyLoggedIn()) {
        return true;
      }

      if (!this.disableModal && this.isModalClosed) {
        throw new ProviderRpcError(new Error('user closed modal'), {
          code: 4001,
          shortMessage: 'user closed modal',
        });
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    throw new ProviderRpcError(new Error('timed out waiting for user to log in'), {
      code: 4900, //provider is disconnected code
      shortMessage: 'timed out waiting for user to log in',
    });
  }

  private async waitForAccounts(timeoutMs = 5000): Promise<string[]> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      const accounts = this.accounts;
      if (accounts && accounts.length > 0) {
        return accounts;
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    throw new ProviderRpcError(new Error('timed out waiting for accounts to load'), {
      code: 4900, //provider is disconnected code
      shortMessage: 'timed out waiting for accounts to load',
    });
  }

  request: EIP1193RequestFn<EIP1474Methods> = async (args): Promise<any> => {
    const { method, params } = args;

    switch (method) {
      case 'eth_accounts': {
        const accounts = this.accounts;
        return accounts || [];
      }
      case 'eth_chainId': {
        return this.currentHexChainId;
      }
      case 'eth_requestAccounts': {
        if (await this.para.isFullyLoggedIn()) {
          const accounts = this.accounts;
          if (accounts && accounts.length > 0) {
            return accounts;
          }
        }

        this.isModalClosed = false;

        this.openModal?.();

        await this.waitForLogin();

        try {
          const accounts = await this.waitForAccounts();
          this.emit('accountsChanged', accounts);
          return accounts;
        } catch (error) {
          throw new ProviderRpcError(new Error('accounts not available after login'), {
            code: 4001,
            shortMessage: 'accounts not available after login',
          });
        }
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
          onData: data => {
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
        // para doesn't support this type of functionality for now
        return [];
      }
      case 'wallet_requestPermissions': {
        // para doesn't support this type of functionality for now
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
        // para doesn't support this type of functionality for now
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
