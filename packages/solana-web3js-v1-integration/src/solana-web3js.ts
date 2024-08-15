import * as solana from '@solana/web3.js';
import bs58 from 'bs58';

import CoreCapsule, {
  DeniedSignatureResWithUrl,
  SuccessfulSignatureRes,
  TransactionReviewError,
  WalletScheme,
  WalletType,
} from '@usecapsule/core-sdk';

export class CapsuleSolanaWeb3Signer {
  private connection: solana.Connection;
  private capsule: CoreCapsule;
  private currentWalletId: string;

  public address?: string;
  public sender?: solana.PublicKey;

  constructor(capsule: CoreCapsule, connection: solana.Connection, walletId?: string) {
    this.currentWalletId = capsule.findWalletId(walletId, {
      scheme: [WalletScheme.ED25519],
      type: [WalletType.SOLANA],
    });
    this.connection = connection;
    this.capsule = capsule;
    this.address = capsule.wallets[this.currentWalletId].address;
    this.sender = this.address ? new solana.PublicKey(bs58.decode(this.address)) : undefined;
  }

  async signBytes(bytes: Buffer): Promise<Buffer> {
    const res = await this.capsule.signMessage(this.currentWalletId, bytes.toString('base64'));
    if ((res as DeniedSignatureResWithUrl).transactionReviewUrl) {
      throw new TransactionReviewError((res as DeniedSignatureResWithUrl).transactionReviewUrl);
    }
    return Buffer.from((res as SuccessfulSignatureRes).signature, 'base64');
  }

  async signTransaction(transaction: solana.Transaction): Promise<solana.Transaction> {
    if (!transaction.recentBlockhash) {
      transaction.recentBlockhash = (await this.connection.getLatestBlockhash('finalized')).blockhash;
    }

    const bytesToSign = transaction.serializeMessage();
    const sigBytes = await this.signBytes(bytesToSign);
    transaction.addSignature(this.sender, sigBytes);
    return transaction;
  }

  async sendTransaction(transaction: solana.Transaction, options?: solana.SendOptions): Promise<string> {
    const signedTransaction = await this.signTransaction(transaction);
    return this.connection.sendRawTransaction(signedTransaction.serialize(), options);
  }
}
