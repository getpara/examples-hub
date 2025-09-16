import { fromBech32 } from '@cosmjs/encoding';
import { SignDoc } from 'cosmjs-types/cosmos/tx/v1beta1/tx.js';
import { Wallet, SignDoc as GrazSignDoc, Key } from 'graz';
import { ParaAminoSigner, ParaProtoSigner } from '@getpara/cosmjs-v0-integration';
import { ParaWeb, Wallet as ParaWallet } from '@getpara/web-sdk';
import { Algo, DirectSignResponse, OfflineDirectSigner } from '@cosmjs/proto-signing';
import { AccountData, AminoSignResponse, OfflineAminoSigner, StdSignature, StdSignDoc } from '@cosmjs/amino';
import { ChainInfo, KeplrSignOptions } from '@keplr-wallet/types';

export type ParaGrazConnectorEvents = {
  onEnabled?: (chainIds: string[], connector: ParaGrazConnector) => void;
};

export interface ParaGrazConfig {
  paraWeb: ParaWeb;
  events?: ParaGrazConnectorEvents;
  noModal?: boolean;
}

export function toArray<T>(v: T | T[]): T[] {
  return Array.isArray(v) ? v : [v];
}

class ParaOfflineSigner implements OfflineDirectSigner {
  constructor(
    protected readonly chainId: string,
    protected readonly connector: ParaGrazConnector,
  ) {}

  protected get para() {
    return this.connector.getParaWebClient();
  }

  protected get prefix() {
    return this.connector.getBech32Prefix(this.chainId);
  }

  protected async wallet() {
    return this.connector.getFirstWallet();
  }

  async getAccounts(): Promise<readonly AccountData[]> {
    const key = await this.connector.getKey(this.chainId);
    return [
      {
        address: key.bech32Address,
        algo: key.algo as Algo,
        pubkey: key.pubKey,
      },
    ];
  }

  async signDirect(signerAddress: string, signDoc: SignDoc): Promise<DirectSignResponse> {
    if (this.chainId !== signDoc.chainId) {
      throw new Error(`Chain ID mismatch: expected ${this.chainId}, got ${signDoc.chainId}`);
    }

    const accounts = await this.getAccounts();
    if (accounts.every(a => a.address !== signerAddress)) {
      throw new Error(`Signer address ${signerAddress} not found in wallet`);
    }

    const signer = new ParaProtoSigner(this.para, this.prefix, (await this.wallet()).id);

    try {
      const result = await signer.signDirect(signerAddress, signDoc);
      return {
        signed: {
          bodyBytes: result.signed.bodyBytes,
          authInfoBytes: result.signed.authInfoBytes,
          chainId: result.signed.chainId,
          accountNumber: result.signed.accountNumber,
        },
        signature: result.signature,
      };
    } catch (err) {
      throw new Error(`Direct signing failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }
}

export class ParaGrazConnector implements Omit<Wallet, 'experimentalSuggestChain'> {
  protected paraWebClient: ParaWeb;
  protected enabledChainIds = new Set<string>();
  protected readonly events?: ParaGrazConnectorEvents;
  protected noModal?: boolean;

  constructor(
    protected readonly config: ParaGrazConfig,
    protected readonly chains: ChainInfo[] | null = null,
  ) {
    if (!config?.paraWeb) {
      throw new Error('ParaWeb instance required in config');
    }
    this.events = config.events;
    this.paraWebClient = config.paraWeb;
    this.noModal = config.noModal;
  }

  protected async ensureChainEnabled(chainId: string): Promise<void> {
    if (!this.enabledChainIds.has(chainId)) {
      throw new Error(`Chain ${chainId} not enabled. Call enable() first`);
    }

    if (!(await this.paraWebClient.isFullyLoggedIn())) {
      throw new Error('Para wallet not authenticated');
    }
  }

  protected async waitForLogin(timeoutMs = 60_000): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    let delay = 500;
    const MAX_DELAY = 5_000;

    while (true) {
      if (await this.paraWebClient.isFullyLoggedIn()) {
        return;
      }

      if (Date.now() >= deadline) {
        throw new Error(`Login timeout after ${timeoutMs / 1000}s`);
      }

      await new Promise(r => setTimeout(r, delay));
      delay = Math.min(delay * 1.5, MAX_DELAY);
    }
  }

  protected async waitForAccounts(timeoutMs = 5_000): Promise<ParaWallet[]> {
    const deadline = Date.now() + timeoutMs;
    let delay = 250;
    const MAX_DELAY = 1_000;

    while (true) {
      const wallets = this.paraWebClient.getWalletsByType('COSMOS');
      if (wallets.length) {
        return wallets;
      }

      if (Date.now() >= deadline) {
        throw new Error('No Cosmos wallets found');
      }

      await new Promise(r => setTimeout(r, delay));
      delay = Math.min(delay * 1.5, MAX_DELAY);
    }
  }

  protected async hasCosmosWallet(): Promise<boolean> {
    const isLoggedIn = await this.paraWebClient.isFullyLoggedIn();
    const wallets = this.paraWebClient.getWalletsByType('COSMOS');
    return isLoggedIn && wallets.length > 0;
  }

  async enable(chainIdsInput: string | string[]): Promise<void> {
    const chainIds = toArray(chainIdsInput);
    const previousEnabled = new Set(this.enabledChainIds);

    try {
      chainIds.forEach(id => this.enabledChainIds.add(id));

      if (await this.hasCosmosWallet()) {
        this.events?.onEnabled?.(chainIds, this);
        return;
      }

      if (!this.noModal) {
        throw new Error('Modal not supported. Use @getpara/graz-integration or set noModal: true');
      }

      await this.waitForLogin();
      await this.waitForAccounts();
      this.events?.onEnabled?.(chainIds, this);
    } catch (err) {
      this.enabledChainIds = previousEnabled;

      if (err instanceof Error) {
        throw err;
      }

      throw new Error('Failed to enable Para wallet');
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.paraWebClient.logout();
    } catch (err) {
      throw new Error('Disconnect failed');
    } finally {
      this.enabledChainIds.clear();
    }
  }

  async getFirstWallet(): Promise<ParaWallet> {
    try {
      const [wallet] = await this.waitForAccounts();
      return wallet;
    } catch (err) {
      throw new Error('No Para wallet available');
    }
  }

  getBech32Prefix(chainId: string): string {
    const prefix = this.chains?.find(c => c.chainId === chainId)?.bech32Config?.bech32PrefixAccAddr || 'cosmos';
    return prefix;
  }

  getParaWebClient(): ParaWeb {
    return this.paraWebClient;
  }

  getConfig(): ParaGrazConfig {
    return this.config;
  }

  protected buildHybridSigner(chainId: string): OfflineAminoSigner & OfflineDirectSigner {
    const aminoSigner = this.getOfflineSignerOnlyAmino(chainId);
    const directSigner = new ParaOfflineSigner(chainId, this);
    return {
      getAccounts: () => directSigner.getAccounts(),
      signAmino: (signer: string, signDoc: StdSignDoc) => aminoSigner.signAmino(signer, signDoc),
      signDirect: (signer: string, signDoc: SignDoc) => directSigner.signDirect(signer, signDoc),
    } as unknown as OfflineAminoSigner & OfflineDirectSigner;
  }

  async getKey(chainId: string): Promise<Key> {
    try {
      await this.ensureChainEnabled(chainId);
      const wallet = await this.getFirstWallet();
      const signer = new ParaProtoSigner(this.paraWebClient, this.getBech32Prefix(chainId), wallet.id);
      const [account] = await signer.getAccounts();

      if (!account) {
        throw new Error(`No Cosmos accounts for chain ${chainId}`);
      }

      return {
        name: 'Para Wallet',
        algo: account.algo,
        pubKey: account.pubkey,
        address: fromBech32(account.address).data,
        bech32Address: account.address,
        isKeystone: false,
        isNanoLedger: false,
      };
    } catch (err) {
      if (err instanceof Error) {
        throw err;
      }

      throw new Error(`Failed to get key for chain ${chainId}`);
    }
  }

  getOfflineSignerOnlyAmino(chainId: string): OfflineAminoSigner {
    void this.ensureChainEnabled(chainId);
    const wallet = this.paraWebClient.getWalletsByType('COSMOS')[0];

    if (!wallet) {
      throw new Error('No Cosmos wallet for Amino signing');
    }

    return new ParaAminoSigner(this.paraWebClient, this.getBech32Prefix(chainId), wallet.id);
  }

  getOfflineSigner(chainId: string): OfflineAminoSigner & OfflineDirectSigner {
    void this.ensureChainEnabled(chainId);
    return this.buildHybridSigner(chainId);
  }

  async getOfflineSignerAuto(chainId: string): Promise<OfflineAminoSigner | OfflineDirectSigner> {
    void this.ensureChainEnabled(chainId);
    return this.buildHybridSigner(chainId);
  }

  async signAmino(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc,
    _signOptions?: KeplrSignOptions,
  ): Promise<AminoSignResponse> {
    await this.ensureChainEnabled(chainId);

    try {
      const wallet = await this.getFirstWallet();
      const signerImpl = new ParaAminoSigner(this.paraWebClient, this.getBech32Prefix(chainId), wallet.id);
      const response = await signerImpl.signAmino(signer, signDoc);
      return response;
    } catch (err) {
      throw new Error(`Amino signing failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  async signDirect(
    chainId: string,
    signer: string,
    signDoc: GrazSignDoc,
    _signOptions?: KeplrSignOptions,
  ): Promise<DirectSignResponse> {
    await this.ensureChainEnabled(chainId);

    try {
      const wallet = await this.getFirstWallet();
      const signerImpl = new ParaProtoSigner(this.paraWebClient, this.getBech32Prefix(chainId), wallet.id);
      const convertedSignDoc: SignDoc = {
        bodyBytes: signDoc.bodyBytes ?? new Uint8Array(),
        authInfoBytes: signDoc.authInfoBytes ?? new Uint8Array(),
        chainId: signDoc.chainId,
        accountNumber: typeof signDoc.accountNumber === 'bigint' ? signDoc.accountNumber : BigInt(signDoc.accountNumber),
      };

      const result = await signerImpl.signDirect(signer, convertedSignDoc);
      return {
        signed: {
          bodyBytes: result.signed.bodyBytes,
          authInfoBytes: result.signed.authInfoBytes,
          chainId: result.signed.chainId,
          accountNumber: result.signed.accountNumber,
        },
        signature: result.signature,
      };
    } catch (err) {
      throw new Error(`Direct signing failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  async signArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<StdSignature> {
    await this.ensureChainEnabled(chainId);

    const encodedData =
      typeof data === 'string' ? Buffer.from(data, 'utf-8').toString('base64') : Buffer.from(data).toString('base64');

    const signDoc = {
      chain_id: '',
      account_number: '0',
      sequence: '0',
      fee: { gas: '0', amount: [] },
      msgs: [
        {
          type: 'sign/MsgSignData',
          value: { signer, data: encodedData },
        },
      ],
      memo: '',
    };

    try {
      const response = await this.signAmino(chainId, signer, signDoc);
      return response.signature;
    } catch (err) {
      throw new Error(`Arbitrary signing failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }
}
