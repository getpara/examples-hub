import * as solana from '@solana/web3.js';
import bs58 from 'bs58';

import ParaCore, { DeniedSignatureResWithUrl, SuccessfulSignatureRes, TransactionReviewError } from '@getpara/core-sdk';

export class ParaSolanaWeb3Signer {
  private connection: solana.Connection;
  private para: ParaCore;
  private currentWalletId: string;

  public address?: string;
  public sender?: solana.PublicKey;

  constructor(para: ParaCore, connection: solana.Connection, walletId?: string) {
    this.currentWalletId = para.findWalletId(walletId, { type: ['SOLANA'] });
    this.connection = connection;
    this.para = para;
    this.address = para.wallets[this.currentWalletId].address;
    this.sender = this.address ? new solana.PublicKey(bs58.decode(this.address)) : undefined;
  }

  async signBytes(bytes: Buffer): Promise<Buffer> {
    const res = await this.para.signMessage({ walletId: this.currentWalletId, messageBase64: bytes.toString('base64') });
    if ((res as DeniedSignatureResWithUrl).transactionReviewUrl) {
      throw new TransactionReviewError((res as DeniedSignatureResWithUrl).transactionReviewUrl);
    }
    return Buffer.from((res as SuccessfulSignatureRes).signature, 'base64');
  }

  async signTransaction<T extends solana.Transaction | solana.VersionedTransaction>(transaction: T): Promise<T> {
    if (transaction instanceof solana.VersionedTransaction) {
      return (await this.signVersionedTransaction(transaction)) as T;
    }

    if (!transaction.recentBlockhash) {
      transaction.recentBlockhash = (await this.connection.getLatestBlockhash('finalized')).blockhash;
    }

    const bytesToSign = transaction.serializeMessage();
    const sigBytes = await this.signBytes(bytesToSign);
    transaction.addSignature(this.sender, sigBytes);
    return transaction as T;
  }

  async signVersionedTransaction(transaction: solana.VersionedTransaction): Promise<solana.VersionedTransaction> {
    if (!transaction.message.recentBlockhash) {
      transaction.message.recentBlockhash = (await this.connection.getLatestBlockhash('finalized')).blockhash;
    }

    const messageBytes = transaction.message.serialize();
    const sigBytes = await this.signBytes(Buffer.from(messageBytes));
    transaction.addSignature(this.sender, sigBytes);
    return transaction;
  }

  async sendTransaction(
    transaction: solana.Transaction | solana.VersionedTransaction,
    options?: solana.SendOptions,
  ): Promise<string> {
    const signedTransaction = await this.signTransaction(transaction);
    return this.connection.sendRawTransaction(signedTransaction.serialize(), options);
  }
}
