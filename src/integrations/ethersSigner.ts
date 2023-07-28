import { ethers } from 'ethers';

import { Capsule } from '../Capsule';
import { TransactionReviewError } from '../errors';
import { DeniedSignatureResWithUrl, SuccessfulSignatureRes } from '../types/walletTypes';
import { hexStringToBase64 } from '../utils/formattingUtils';

export class CapsuleEthersSigner extends ethers.AbstractSigner {
  private capsule: Capsule;
  private currentWalletId: string;

  constructor(capsule: Capsule, provider?: null | ethers.Provider) {
    super(provider);

    this.capsule = capsule;
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

  connect(provider: ethers.Provider | null): CapsuleEthersSigner {
    return new CapsuleEthersSigner(this.capsule, provider);
  }

  async signMessage(message: string | Uint8Array): Promise<string> {
    const hashedMessage = ethers.hashMessage(message);
    const base64HashedMessage = hexStringToBase64(hashedMessage);
    const res = await this.capsule.signMessage(this.getCurrentWalletId(), base64HashedMessage);

    const signature = (res as SuccessfulSignatureRes).signature;
    return `0x${signature}`;
  }

  private async validateTx(tx: ethers.TransactionRequest): Promise<ethers.Transaction> {
    const { to, from } = await ethers.resolveProperties({
      to: (tx.to ? ethers.resolveAddress(tx.to, this.provider): undefined),
      from: (tx.from ? ethers.resolveAddress(tx.from, this.provider): undefined)
    });

    if (to) { tx.to = to; }
    if (from) { tx.from = from; }

    if (tx.from) {
      ethers.assertArgument(
        ethers.getAddress(<string>(tx.from)).toLowerCase() === (await this.getAddress()).toLowerCase(),
        "transaction from address mismatch",
        "tx.from",
        tx.from,
      );
      delete tx.from;
    }

    return ethers.Transaction.from(<ethers.TransactionLike<string>>tx);
  }

  async signTransaction(tx: ethers.TransactionRequest): Promise<string> {
    const txObj = await this.validateTx(tx);
    txObj.signature = {
      r: "0x0",
      s: "0x0",
      v: 0,
    };

    const res = await this.capsule.signTransaction(
      this.getCurrentWalletId(),
      hexStringToBase64(txObj.serialized),
      `${txObj.chainId}`,
    );
    if ((res as DeniedSignatureResWithUrl).transactionReviewUrl) {
      throw new TransactionReviewError((res as DeniedSignatureResWithUrl).transactionReviewUrl);
    }

    const signature = (res as SuccessfulSignatureRes).signature;
    const btx = ethers.Transaction.from(<ethers.TransactionLike<string>>tx);
    btx.signature = `0x${signature}`;
    return btx.serialized;
  }

  async signTypedData(domain: ethers.TypedDataDomain, types: Record<string, Array<ethers.TypedDataField>>, value: Record<string, any>): Promise<string> {
    const populated = await ethers.TypedDataEncoder.resolveNames(domain, types, value, async (name: string) => {
      ethers.assert(this.provider != null, "cannot resolve ENS names without a provider", "UNSUPPORTED_OPERATION", {
        operation: "resolveName",
        info: { name }
      });

      const address = await this.provider.resolveName(name);
      ethers.assert(address != null, "unconfigured ENS name", "UNCONFIGURED_NAME", {
          value: name
      });

      return address;
    });

    const res = await this.capsule.signMessage(
      this.getCurrentWalletId(),
      hexStringToBase64(ethers.TypedDataEncoder.hash(populated.domain, types, populated.value)),
    );
    const signature = (res as SuccessfulSignatureRes).signature;
    return `0x${signature}`;
  }
}
