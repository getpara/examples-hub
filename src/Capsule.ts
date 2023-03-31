import { Chain, PublicKeyStatus, PublicKeyType } from '@capsule/client';
import { pki } from 'node-forge';
import { useLocalStorage, useSessionStorage } from 'react-use';
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

export class Capsule {
  private ctx: Ctx;

  private email?: string;
  private userId?: string;
  private loginEncryptionKeyPair?: pki.rsa.KeyPair;
  private wallets: Record<string, Wallet>;

  private storageSetEmail: Dispatch<SetStateAction<string | undefined>>;
  private storageSetUserId: Dispatch<SetStateAction<string | undefined>>;
  private storageSetWallets: Dispatch<SetStateAction<Record<string, Wallet>>>;
  private storageSetLoginEncryptionKeyPair: (value: pki.rsa.KeyPair) => void;

  // TODO: consider using sessionStorage instead of localStorage
  constructor(env: Environment) {
    this.ctx = {
      env,
      capsuleClient: initClient(env),
    };

    [this.email, this.storageSetEmail] = useLocalStorage(
      'email',
      undefined,
    );
    [this.userId, this.storageSetUserId] = useLocalStorage(
      'userId',
      undefined,
    );
    [this.wallets, this.storageSetWallets] = useLocalStorage(
      'wallets',
      {},
    );
    [this.loginEncryptionKeyPair, this.storageSetLoginEncryptionKeyPair] = useSessionStorage<pki.rsa.KeyPair>(
      'loginEncryptionKeyPair',
      undefined,
    );
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
    wallets.forEach((wallet: { id: string; address?: string }) => {
      if (this.wallets[wallet.id]) {
        this.wallets[wallet.id].address = wallet.address;
      }
    });
    this.storageSetWallets(this.wallets);
  }

  setEmail(email: string): void {
    this.email = email;
    this.storageSetEmail(email);
  }

  getEmail(): string | undefined {
    return this.email;
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

  // TODO: consider changing this to just hit a new endpoint that returns
  //   true/false if session is active
  async isSessionActive(): Promise<boolean> {
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
      const keyPair = await getAsymmetricKeyPair();
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
    this.loginEncryptionKeyPair = undefined;

    await this.populateWalletAddresses();
    this.storageSetUserId(this.userId);
    this.storageSetLoginEncryptionKeyPair(this.loginEncryptionKeyPair);
  }

  async createWallet(): Promise<Wallet> {
    const { signer, walletId } = await keygen(this.ctx, this.userId);
    this.wallets[walletId] = {
      id: walletId,
      signer,
    };
    await this.populateWalletAddresses();

    return this.wallets[walletId];
  }

  async signMessage(walletId: string, message: string): Promise<string> {
    const messageSignature = await signMessage(
      this.ctx,
      this.userId,
      walletId,
      this.wallets[walletId].signer,
      message,
    );
    return messageSignature;
  }

  // pass in rlp encoded tx as base64 string
  async sendTransaction(
    walletId: string,
    rlpEncodedTxBase64: string,
    chain: Chain,
  ): Promise<string> {
    const txSignature = await sendTransaction(
      this.ctx,
      this.userId,
      walletId,
      this.wallets[walletId].signer,
      rlpEncodedTxBase64,
      chain,
    );
    return txSignature;
  }

  getWallets(): Record<string, Wallet> {
    return this.wallets;
  }

  clearStorage(): void {
    localStorage.removeItem('email');
    localStorage.removeItem('userId');
    localStorage.removeItem('wallets');
    sessionStorage.removeItem('loginEncryptionKeyPair');
  }

  async logout(): Promise<void> {
    await this.ctx.capsuleClient.logout();
  }

  // remove sensitive data when logging this class
  toString(): string {
    const redactedWallets = Object.keys(this.wallets).reduce(
      (acc, walletId) => ({
        ...acc,
        [walletId]: {
          id: walletId,
          address: this.wallets[walletId].address,
          signer: this.wallets[walletId].signer ? '[REDACTED]' : undefined,
        },
      }),
      {},
    );
    const obj = {
      email: this.email,
      userId: this.userId,
      wallets: redactedWallets,
      loginEncryptionKeyPair: this.loginEncryptionKeyPair ? '[REDACTED]' : undefined,
    }

    return `Capsule ${JSON.stringify(obj)}`;
  }
}
