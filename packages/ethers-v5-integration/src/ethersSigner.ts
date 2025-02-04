import { Transaction, ethers } from 'ethers';

import { _TypedDataEncoder } from '@ethersproject/hash';

import ParaCore, { hexStringToBase64, SuccessfulSignatureRes } from '@getpara/core-sdk';
import { defineReadOnly, keccak256, resolveProperties, serializeTransaction } from 'ethers/lib/utils';

export class ParaEthersV5Signer extends ethers.Signer {
  private para: ParaCore;
  private currentWalletId: string;

  constructor(para: ParaCore, provider?: null | ethers.providers.Provider, walletId?: string) {
    super();

    this.currentWalletId = para.findWalletId(walletId, { type: ['EVM'] });
    this.para = para;
    defineReadOnly(this, 'provider', provider);
  }

  setCurrentWalletId(walletId: string) {
    if (!this.para.wallets[walletId]) {
      throw new Error(`no wallet exists with id ${walletId}`);
    }
    this.currentWalletId = walletId;
  }

  getCurrentWalletId(): string {
    const id = this.currentWalletId;
    if (!id) {
      throw new Error(`no wallet available`);
    }
    if (!this.para.wallets[id]) {
      throw new Error(`no wallet exists with id ${id}`);
    }
    return id;
  }

  async getAddress(): Promise<string> {
    const walletId = this.getCurrentWalletId();
    if (!walletId) {
      throw new Error('no wallet available');
    }
    return this.para.wallets[walletId].address;
  }

  connect(provider: ethers.providers.Provider | null): ParaEthersV5Signer {
    return new ParaEthersV5Signer(this.para, provider, this.currentWalletId);
  }

  async signMessage(message: string | Uint8Array): Promise<string> {
    const hashedMessage = ethers.utils.hashMessage(message);
    const base64HashedMessage = hexStringToBase64(hashedMessage);
    const res = await this.para.signMessage({ walletId: this.getCurrentWalletId(), messageBase64: base64HashedMessage });

    const signature = (res as SuccessfulSignatureRes).signature;
    return `0x${signature}`;
  }

  async signTransaction(tx: ethers.providers.TransactionRequest): Promise<string> {
    return resolveProperties(tx).then(async tx => {
      if (tx.from != null) {
        if ((await this.getAddress()).toLowerCase() !== ethers.utils.getAddress(tx.from).toLowerCase()) {
          throw new Error('transaction from address mismatch');
        }
        delete tx.from;
      }

      let txObj = tx as Transaction;
      txObj.r = '0x0';
      txObj.s = '0x0';
      txObj.v = 0;
      const serializedTx = serializeTransaction(txObj);
      const message = hexStringToBase64(keccak256(serializedTx));
      const signature = await this.signMessage(message);
      return serializeTransaction(txObj, signature);
    });
  }

  async signTypedData(
    domain: ethers.TypedDataDomain,
    types: Record<string, Array<ethers.TypedDataField>>,
    value: Record<string, any>,
  ): Promise<string> {
    const populated = await _TypedDataEncoder.resolveNames(domain, types, value, async (name: string) => {
      if (!this.provider) {
        throw new Error('cannot resolve ENS names without a provider');
      }

      const address = await this.provider.resolveName(name);
      if (!address) {
        throw new Error('unconfigured ENS name');
      }

      return address;
    });

    const res = await this.para.signMessage({
      walletId: this.getCurrentWalletId(),
      messageBase64: hexStringToBase64(_TypedDataEncoder.hash(populated.domain, types, populated.value)),
    });

    const signature = (res as SuccessfulSignatureRes).signature;
    return `0x${signature}`;
  }

  async _signTypedData(
    domain: ethers.TypedDataDomain,
    types: Record<string, Array<ethers.TypedDataField>>,
    value: Record<string, any>,
  ): Promise<string> {
    return this.signTypedData(domain, types, value);
  }
}
