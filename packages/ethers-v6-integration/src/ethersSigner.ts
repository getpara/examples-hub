import { ethers } from 'ethers';

import ParaCore, { SuccessfulSignatureRes, hexStringToBase64 } from '@getpara/core-sdk';

export class ParaEthersSigner extends ethers.AbstractSigner {
  private para: ParaCore;
  private currentWalletId: string;
  private messageSigningTimeoutMs?: number;

  /**
   * Signs a message.
   *
   * @param para - the ParaCore instance
   * @param provider - the ethers provider to use. If not present, will use the default ethers.Provider.
   * @param walletId - optional wallet ID to use. If not present, will use the first wallet found.
   * @param messageSigningTimeoutMs - optional timeout in milliseconds. If not present, defaults to 30 seconds.
   **/
  constructor(para: ParaCore, provider?: null | ethers.Provider, walletId?: string, messageSigningTimeoutMs?: number) {
    super(provider);

    this.currentWalletId = para.findWalletId(walletId, { type: ['EVM'] });
    this.para = para;
    this.messageSigningTimeoutMs = messageSigningTimeoutMs;
  }

  async getAddress(): Promise<string> {
    return this.para.wallets[this.currentWalletId].address;
  }

  connect(provider: ethers.Provider | null): ParaEthersSigner {
    return new ParaEthersSigner(this.para, provider, this.currentWalletId);
  }

  /**
   * Signs a message.
   *
   * @param message - the message to be signed
   **/
  async signMessage(message: string | Uint8Array): Promise<string> {
    const hashedMessage = ethers.hashMessage(message);
    const base64HashedMessage = hexStringToBase64(hashedMessage);
    const res = await this.para.signMessage({
      walletId: this.currentWalletId,
      messageBase64: base64HashedMessage,
      timeoutMs: this.messageSigningTimeoutMs,
    });

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

    const res = await this.para.signTransaction({
      walletId: this.currentWalletId,
      rlpEncodedTxBase64: hexStringToBase64(txObj.serialized),
      chainId: `${txObj.chainId}`,
    });

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

    const res = await this.para.signMessage({
      walletId: this.currentWalletId,
      messageBase64: hexStringToBase64(ethers.TypedDataEncoder.hash(populated.domain, types, populated.value)),
    });

    const signature = (res as SuccessfulSignatureRes).signature;
    return `0x${signature}`;
  }
}
