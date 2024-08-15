import { ethers } from 'ethers';

import CoreCapsule, {
  TransactionReviewError,
  DeniedSignatureResWithUrl,
  SuccessfulSignatureRes,
  hexStringToBase64,
  NON_ED25519,
} from '@usecapsule/core-sdk';

export class CapsuleEthersSigner extends ethers.AbstractSigner {
  private capsule: CoreCapsule;
  private currentWalletId: string;

  constructor(capsule: CoreCapsule, provider?: null | ethers.Provider, walletId?: string) {
    super(provider);

    this.currentWalletId = capsule.findWalletId(walletId, { scheme: NON_ED25519 });
    this.capsule = capsule;
  }

  async getAddress(): Promise<string> {
    return this.capsule.wallets[this.currentWalletId].address;
  }

  connect(provider: ethers.Provider | null): CapsuleEthersSigner {
    return new CapsuleEthersSigner(this.capsule, provider, this.currentWalletId);
  }

  async signMessage(message: string | Uint8Array): Promise<string> {
    const hashedMessage = ethers.hashMessage(message);
    const base64HashedMessage = hexStringToBase64(hashedMessage);
    const res = await this.capsule.signMessage(this.currentWalletId, base64HashedMessage);

    if ((res as DeniedSignatureResWithUrl).transactionReviewUrl) {
      throw new TransactionReviewError((res as DeniedSignatureResWithUrl).transactionReviewUrl);
    }
    const signature = (res as SuccessfulSignatureRes).signature;
    return `0x${signature}`;
  }

  private async validateTx(tx: ethers.TransactionRequest): Promise<ethers.Transaction> {
    const { to, from } = await ethers.resolveProperties({
      to: tx.to ? ethers.resolveAddress(tx.to, this.provider) : undefined,
      from: tx.from ? ethers.resolveAddress(tx.from, this.provider) : undefined,
    });

    if (to) {
      tx.to = to;
    }
    if (from) {
      tx.from = from;
    }

    if (tx.from) {
      ethers.assertArgument(
        ethers.getAddress(<string>tx.from).toLowerCase() === (await this.getAddress()).toLowerCase(),
        'transaction from address mismatch',
        'tx.from',
        tx.from,
      );
      delete tx.from;
    }

    return ethers.Transaction.from(<ethers.TransactionLike<string>>tx);
  }

  async signTransaction(tx: ethers.TransactionRequest): Promise<string> {
    const txObj = await this.validateTx(tx);
    txObj.signature = {
      r: '0x0',
      s: '0x0',
      v: 0,
    };

    const res = await this.capsule.signTransaction(
      this.currentWalletId,
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

  async signTypedData(
    domain: ethers.TypedDataDomain,
    types: Record<string, Array<ethers.TypedDataField>>,
    value: Record<string, any>,
  ): Promise<string> {
    const populated = await ethers.TypedDataEncoder.resolveNames(domain, types, value, async (name: string) => {
      ethers.assert(this.provider != null, 'cannot resolve ENS names without a provider', 'UNSUPPORTED_OPERATION', {
        operation: 'resolveName',
        info: { name },
      });

      const address = await this.provider.resolveName(name);
      ethers.assert(address != null, 'unconfigured ENS name', 'UNCONFIGURED_NAME', {
        value: name,
      });

      return address;
    });

    const res = await this.capsule.signMessage(
      this.currentWalletId,
      hexStringToBase64(ethers.TypedDataEncoder.hash(populated.domain, types, populated.value)),
    );

    if ((res as DeniedSignatureResWithUrl).transactionReviewUrl) {
      throw new TransactionReviewError((res as DeniedSignatureResWithUrl).transactionReviewUrl);
    }
    const signature = (res as SuccessfulSignatureRes).signature;
    return `0x${signature}`;
  }
}
