import { Transaction, ethers } from 'ethers';

import { _TypedDataEncoder } from '@ethersproject/hash';

import CoreCapsule, {
  hexStringToBase64,
  DeniedSignatureResWithUrl,
  SuccessfulSignatureRes,
  TransactionReviewError,
} from '@usecapsule/core-sdk';
import { defineReadOnly, keccak256, resolveProperties, serializeTransaction } from 'ethers/lib/utils';

export class CapsuleEthersV5Signer extends ethers.Signer {
  private capsule: CoreCapsule;
  private currentWalletId: string;

  constructor(capsule: CoreCapsule, provider?: null | ethers.providers.Provider) {
    super();
    this.capsule = capsule;
    defineReadOnly(this, 'provider', provider);
  }

  setCurrentWalletId(walletId: string) {
    if (!this.capsule.getWallets()[walletId]) {
      throw new Error(`no wallet exists with id ${walletId}`);
    }
    this.currentWalletId = walletId;
  }

  getCurrentWalletId(): string {
    const id = this.currentWalletId || Object.values(this.capsule.getWallets())[0]?.id;
    if (!id) {
      throw new Error(`no wallet available`);
    }
    if (!this.capsule.getWallets()[id]) {
      throw new Error(`no wallet exists with id ${id}`);
    }
    return id;
  }

  async getAddress(): Promise<string> {
    const walletId = this.getCurrentWalletId();
    if (!walletId) {
      throw new Error('no wallet available');
    }
    return this.capsule.getWallets()[walletId].address;
  }

  connect(provider: ethers.providers.Provider | null): CapsuleEthersV5Signer {
    return new CapsuleEthersV5Signer(this.capsule, provider);
  }

  async signMessage(message: string | Uint8Array): Promise<string> {
    const hashedMessage = ethers.utils.hashMessage(message);
    const base64HashedMessage = hexStringToBase64(hashedMessage);
    const res = await this.capsule.signMessage(this.getCurrentWalletId(), base64HashedMessage);

    if ((res as DeniedSignatureResWithUrl).transactionReviewUrl) {
      throw new TransactionReviewError((res as DeniedSignatureResWithUrl).transactionReviewUrl);
    }
    const signature = (res as SuccessfulSignatureRes).signature;
    return `0x${signature}`;
  }

  async signTransaction(tx: ethers.providers.TransactionRequest): Promise<string> {
    return resolveProperties(tx).then(async (tx) => {
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

    const res = await this.capsule.signMessage(
      this.getCurrentWalletId(),
      hexStringToBase64(_TypedDataEncoder.hash(populated.domain, types, populated.value)),
    );

    if ((res as DeniedSignatureResWithUrl).transactionReviewUrl) {
      throw new TransactionReviewError((res as DeniedSignatureResWithUrl).transactionReviewUrl);
    }
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
