import { Chain, PublicKeyStatus, PublicKeyType } from '@capsule/client';
import { pki } from 'node-forge';
import { useLocalStorage } from 'react-use';
import { Dispatch, SetStateAction } from 'react';

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
  private ctx: Ctx;
  private email: string;

  private userId?: string;
  private currentWalletId?: string;
  private loginEncryptionKeyPair?: pki.rsa.KeyPair;
  private wallets: Record<string, Wallet>;

  private storageSetUserId: Dispatch<SetStateAction<string | undefined>>;
  private storageSetCurrentWalletId: Dispatch<
    SetStateAction<string | undefined>
  >;
  private storageSetLoginEncryptionKeyPair: Dispatch<
    SetStateAction<pki.rsa.KeyPair | undefined>
  >;
  private storageSetWallets: Dispatch<SetStateAction<Record<string, Wallet>>>;

  // prefix local storage keys with email to avoid collisions
  constructor(env: Environment, email: string) {
    this.ctx = {
      env,
      capsuleClient: initClient(env),
    };
    this.email = email;

    [this.userId, this.storageSetUserId] = useLocalStorage(
      `${email}-userId`,
      undefined,
    );
    [this.currentWalletId, this.storageSetCurrentWalletId] = useLocalStorage(
      `${email}-currentWalletId`,
      undefined,
    );
    [this.loginEncryptionKeyPair, this.storageSetLoginEncryptionKeyPair] =
      useLocalStorage(`${email}-loginEncryptionKeyPair`, undefined);
    [this.wallets, this.storageSetWallets] = useLocalStorage(
      `${email}-wallets`,
      {},
    );

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
    this.storageSetWallets(this.wallets);
  }

  async createUser(): Promise<void> {
    const { userId } = await this.ctx.capsuleClient.createUser({
      email: this.email,
    });
    this.userId = userId;
    this.storageSetUserId(this.userId);
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
      this.storageSetLoginEncryptionKeyPair(this.loginEncryptionKeyPair);
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

    this.storageSetUserId(this.userId);
    this.storageSetWallets(this.wallets);
    this.storageSetLoginEncryptionKeyPair(this.loginEncryptionKeyPair);
  }

  async createWallet(): Promise<string> {
    const { shares, walletId } = await keygen(this.ctx, this.userId);
    this.wallets[walletId] = {
      id: walletId,
      signer: shares[0],
    };
    await this.populateWalletAddresses();

    this.storageSetWallets(this.wallets);
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
    this.storageSetCurrentWalletId(this.currentWalletId);
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
