import { Chain, PublicKeyStatus, PublicKeyType } from '@capsule/client';
import { pki } from 'node-forge';

import {
  decryptWithKeyPair,
  getAsymmetricKeyPair,
  getPublicKeyHex,
} from './cryptography/utils';
import { keygen } from './wallet/keygen';
import { sendTransaction, signMessage } from './wallet/signing';
import { Ctx, getPortalBaseURL } from './definitions';
import { Environment } from './definitions';
import { initClient } from './external/userManagementClient';

// amount of time in ms that a web auth session lasts
const BIOMETRIC_VERIFICATION_TIME_MS = 5 * 60 * 1000;

export interface Wallet {
  id: string;
  signer: string;
  address?: string;
}

function biometricVerifiedRecently(verifiedAt: number): boolean {
  return Date.now() - verifiedAt <= BIOMETRIC_VERIFICATION_TIME_MS;
}

// TODO: see if we can override default logging of fields that should be secure
export class Capsule {
  // we'll want most/all of these set in session storage or similar
  // so it's there across refreshes or page open and close
  private userId?: string;
  private email: string;
  private currentWalletId?: string;
  private wallets: Record<string, Wallet>;
  private loginEncryptionKeyPair?: pki.rsa.KeyPair;
  private ctx: Ctx;

  constructor(env: Environment, email: string) {
    this.email = email;
    this.wallets = {};
    this.ctx = {
      env,
      capsuleClient: initClient(env),
    };

    initClient(env);
  }

  private getWebAuthURLForCreate(webAuthId: string): string {
    return `${getPortalBaseURL(this.ctx)}/web/users/${
      this.userId
    }/biometrics/${webAuthId}?email=${this.email}`;
  }

  private getWebAuthURLForLogin(
    sessionId: string,
    loginEncryptionPublicKey: string,
  ): string {
    return `${getPortalBaseURL(this.ctx)}/web/biometrics/login?email=${
      this.email
    }&sessionId=${sessionId}&encryptionKey=${loginEncryptionPublicKey}`;
  }

  private async populateWalletAddresses(): Promise<void> {
    const res = await this.ctx.capsuleClient.getWallets(this.userId);
    const wallets = res.data.wallets;
    wallets.forEach((wallet) => {
      if (this.wallets[wallet.id]) {
        this.wallets[wallet.id].address = wallet.address;
      }
    });
  }

  async createUser(): Promise<void> {
    const { userId } = await this.ctx.capsuleClient.createUser({
      email: this.email,
    });
    this.userId = userId;
  }

  // returns web auth url for creating a new credential
  async verifyEmail(verificationCode: string): Promise<string> {
    await this.ctx.capsuleClient.verifyEmail(this.userId, { verificationCode });
    const res = await this.ctx.capsuleClient.addSessionPublicKey(this.userId, {
      status: PublicKeyStatus.PENDING,
      type: PublicKeyType.WEB,
    });

    return this.getWebAuthURLForCreate(res.data.id);
  }

  async isFullyAuthed(): Promise<boolean> {
    const res = await this.ctx.capsuleClient.touchSession();
    return (
      res.data.biometricVerifiedAt &&
      biometricVerifiedRecently(res.data.biometricVerifiedAt)
    );
  }

  // returns web auth url for logging in
  async initiateUserLogin(): Promise<string> {
    const res = await this.ctx.capsuleClient.touchSession(true);
    if (!this.loginEncryptionKeyPair) {
      const keyPair = await getAsymmetricKeyPair(this.ctx);
      this.loginEncryptionKeyPair = keyPair;
    }

    return this.getWebAuthURLForLogin(
      res.data.sessionId,
      getPublicKeyHex(this.loginEncryptionKeyPair),
    );
  }

  async setupAfterLogin(): Promise<void> {
    const res = await this.ctx.capsuleClient.touchSession(true);
    const tempSharesRes = await this.ctx.capsuleClient.getTransmissionKeyshares(
      res.data.userId,
    );

    tempSharesRes.data.temporaryShares.forEach((share) => {
      this.wallets[share.walletId] = {
        id: share.walletId,
        signer: decryptWithKeyPair(
          this.loginEncryptionKeyPair,
          share.encryptedShare,
          share.encryptedKey,
        ),
      };
    });

    this.userId = res.data.userId;
    await this.populateWalletAddresses();
    this.loginEncryptionKeyPair = undefined;
  }

  async createWallet(): Promise<string> {
    const { shares, walletId } = await keygen(this.ctx, this.userId);
    this.wallets[walletId] = {
      id: walletId,
      signer: shares[0],
    };
    await this.populateWalletAddresses();

    return walletId;
  }

  async signMessage(message: string): Promise<string> {
    const messageSignature = await signMessage(
      this.userId,
      this.currentWalletId,
      this.wallets[this.currentWalletId].signer,
      message,
    );
    return messageSignature;
  }

  // pass in rlp encoded tx as base64 string
  async sendTransaction(
    rlpEncodedTxBase64: string,
    chain: Chain,
  ): Promise<string> {
    const txSignature = await sendTransaction(
      this.userId,
      this.currentWalletId,
      this.wallets[this.currentWalletId].signer,
      rlpEncodedTxBase64,
      chain,
    );
    return txSignature;
  }

  setCurrentWallet(walletId: string): Wallet {
    this.currentWalletId = walletId;
    return this.wallets[walletId];
  }

  getCurrentWallet(): Wallet | undefined {
    return this.wallets[this.currentWalletId];
  }

  getWallets(): Record<string, Wallet> {
    return this.wallets;
  }

  async logout(): Promise<void> {
    await this.ctx.capsuleClient.logout();
  }
}

// Notes:
// when session is expired, dapp expected to go through login flow again
