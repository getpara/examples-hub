import { PublicKeyStatus, PublicKeyType } from '@capsule/client';
import { pki } from 'node-forge';

import {
  decryptWithKeyPair,
  getAsymmetricKeyPair,
  getPublicKeyHex,
} from './cryptography/utils';
import { generateBlumPrimes, keygen } from './wallet/keygen';
import { sendTransaction, signMessage } from './wallet/signing';
import { Ctx, getPortalBaseURL } from './definitions';
import { Environment } from './definitions';
import { initClient } from './external/capsuleClient';
import { KeyContainer } from './shares/KeyContainer';
import { distributeNewShare } from './shares/shareDistribution';

// amount of time in ms that a web auth session lasts
const BIOMETRIC_VERIFICATION_TIME_MS = 5 * 60 * 1000;

export interface Wallet {
  id: string;
  signer: string;
  address?: string;
}

const PREFIX = '@CAPSULE/';
const LOCAL_STORAGE_EMAIL = `${PREFIX}e-mail`;
const LOCAL_STORAGE_USER_ID = `${PREFIX}userId`;
const LOCAL_STORAGE_WALLETS = `${PREFIX}wallets`;
const LOCAL_STORAGE_LOGIN_ENCRYPTION_KEY_PAIR = `${PREFIX}loginEncryptionKeyPair`;
const SESSION_STORAGE_PAILLIER_SECRET_KEY = `${PREFIX}paillierSecretKey`;

function biometricVerifiedRecently(verifiedAt: number): boolean {
  return Date.now() - verifiedAt <= BIOMETRIC_VERIFICATION_TIME_MS;
}

export class Capsule {
  private ctx: Ctx;

  private email?: string;
  private userId?: string;
  private loginEncryptionKeyPair?: pki.rsa.KeyPair;
  private wallets: Record<string, Wallet>;

  // TODO: consider using sessionStorage instead of localStorage
  constructor(env: Environment, apiKey?: string) {
    this.ctx = {
      env,
      capsuleClient: initClient(env, apiKey),
    };

    this.email = localStorage.getItem(LOCAL_STORAGE_EMAIL) || undefined;
    this.userId = localStorage.getItem(LOCAL_STORAGE_USER_ID) || undefined;
    this.wallets = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_WALLETS) || '{}',
    );
    if (
      sessionStorage.getItem(LOCAL_STORAGE_LOGIN_ENCRYPTION_KEY_PAIR) &&
      sessionStorage.getItem(LOCAL_STORAGE_LOGIN_ENCRYPTION_KEY_PAIR) !==
        'undefined'
    ) {
      this.loginEncryptionKeyPair = JSON.parse(
        sessionStorage.getItem(LOCAL_STORAGE_LOGIN_ENCRYPTION_KEY_PAIR),
      );
    }
  }

  getPaillierKey(): string | null {
    return sessionStorage.getItem(SESSION_STORAGE_PAILLIER_SECRET_KEY);
  }

  async generatePaillierKey(): Promise<void> {
    const paillierKey = sessionStorage.getItem(SESSION_STORAGE_PAILLIER_SECRET_KEY);
    if (paillierKey) {
      return;
    }

    const { p, q } = await generateBlumPrimes(this.ctx.env);
    const base64Enc = Buffer.from(JSON.stringify({ pBase64: p, qBase64: q }), 'utf-8').toString('base64');
    sessionStorage.setItem(SESSION_STORAGE_PAILLIER_SECRET_KEY, base64Enc);
  };

  private setEmail(email: string): void {
    this.email = email;
    localStorage.setItem(LOCAL_STORAGE_EMAIL, email);
  }

  setUserId(userId: string): void {
    this.userId = userId;
    localStorage.setItem(LOCAL_STORAGE_USER_ID, userId);
  }

  private setWallets(wallets: Record<string, Wallet>): void {
    this.wallets = wallets;
    localStorage.setItem(LOCAL_STORAGE_WALLETS, JSON.stringify(wallets));
  }

  private setLoginEncryptionKeyPair(keyPair: pki.rsa.KeyPair): void {
    this.loginEncryptionKeyPair = keyPair;
    sessionStorage.setItem(
      LOCAL_STORAGE_LOGIN_ENCRYPTION_KEY_PAIR,
      JSON.stringify(keyPair),
    );
  }

  private deleteLoginEncryptionKeyPair(): void {
    this.loginEncryptionKeyPair = undefined;
    sessionStorage.removeItem('loginEncryptionKeyPair');
  }

  getEmail(): string | undefined {
    return this.email;
  }

  getWallets(): Record<string, Wallet> {
    return this.wallets;
  }

  private getWebAuthURLForCreate(webAuthId: string): string {
    return `${getPortalBaseURL(this.ctx)}/web/users/${
      this.userId
    }/biometrics/${webAuthId}?email=${encodeURIComponent(this.email)}`;
  }

  private getWebAuthURLForLogin(
    sessionId: string,
    loginEncryptionPublicKey: string,
  ): string {
    return `${getPortalBaseURL(
      this.ctx,
    )}/web/biometrics/login?email=${encodeURIComponent(
      this.email,
    )}&sessionId=${sessionId}&encryptionKey=${loginEncryptionPublicKey}`;
  }

  async fetchWallets(): Promise<any[]> {
    const res = await this.ctx.capsuleClient.getWallets(this.userId);
    return res.data.wallets;
  }

  private async populateWalletAddresses(): Promise<void> {
    const res = await this.ctx.capsuleClient.getWallets(this.userId);
    const wallets = res.data.wallets;
    wallets.forEach((wallet: { id: string; address?: string }) => {
      if (this.wallets[wallet.id]) {
        this.wallets[wallet.id].address = wallet.address;
      }
    });
    this.setWallets(this.wallets);
  }

  async createUser(email: string): Promise<void> {
    this.setEmail(email);
    const { userId } = await this.ctx.capsuleClient.createUser({
      email: this.email!,
    });
    this.setUserId(userId);
  }

  // returns web auth url for creating a new credential
  async verifyEmail(verificationCode: string): Promise<string> {
    await this.ctx.capsuleClient.verifyEmail(this.userId, { verificationCode });
    return await this.getSetUpBiometricsURL();
  }

  // returns web auth url for creating a new credential
  async getSetUpBiometricsURL(): Promise<string> {
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
  async initiateUserLogin(email: string): Promise<string> {
    this.setEmail(email);
    const res = await this.ctx.capsuleClient.touchSession(true);
    if (!this.loginEncryptionKeyPair) {
      const keyPair = await getAsymmetricKeyPair();
      this.setLoginEncryptionKeyPair(keyPair);
    }

    return this.getWebAuthURLForLogin(
      res.data.sessionId,
      getPublicKeyHex(this.loginEncryptionKeyPair),
    );
  }

  async userSetupAfterLogin(): Promise<void> {
    const res = await this.ctx.capsuleClient.touchSession();
    this.setUserId(res.data.userId);
  }

  async getTransmissionKeyShares(): Promise<any> {
    return this.ctx.capsuleClient.getTransmissionKeyshares(this.userId);
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

    this.setUserId(res.data.userId);
    this.deleteLoginEncryptionKeyPair();
    await this.populateWalletAddresses();
  }

  async distributeNewWalletShare(
    walletId: string,
    userShare: string,
  ): Promise<string> {
    const recoveryShare = await distributeNewShare(this.ctx, this.userId, walletId, userShare);
    return recoveryShare;
  }

  async createWallet(skipDistribute: boolean = false, customFunction: Function): Promise<[Wallet, string | null]> {
    const secretKey = sessionStorage.getItem(SESSION_STORAGE_PAILLIER_SECRET_KEY);
    const { signer, walletId, recoveryShare } = await keygen(
      this.ctx,
      this.userId,
      secretKey,
      skipDistribute,
      customFunction,
    );
    this.wallets[walletId] = {
      id: walletId,
      signer,
    };
    await this.populateWalletAddresses();

    this.setWallets(this.wallets);
    return [this.wallets[walletId], recoveryShare];
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
    chainId: string,
  ): Promise<string> {
    const txSignature = await sendTransaction(
      this.ctx,
      this.userId,
      walletId,
      this.wallets[walletId].signer,
      rlpEncodedTxBase64,
      chainId,
    );
    return txSignature;
  }

  // remove all local storage and session storage prefixed for capsule
  clearStorage(keepSecretKey?: boolean): void {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
  
      if (key && key.startsWith(PREFIX)) {
        localStorage.removeItem(key);
        i--;
      }
    }
    for (let j = 0; j < sessionStorage.length; j++) {
      const key = sessionStorage.key(j);
  
      // paillier secret key may be generated before this is called on account creation
      if (key && key.startsWith(PREFIX) && !(keepSecretKey && key === SESSION_STORAGE_PAILLIER_SECRET_KEY)) {
        sessionStorage.removeItem(key);
        j--;
      }
    }
  }

  async logout(): Promise<void> {
    await this.ctx.capsuleClient.logout();
  }

  // remove sensitive data when logging this class
  // doesn't work for all types of logging
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
      loginEncryptionKeyPair: this.loginEncryptionKeyPair
        ? '[REDACTED]'
        : undefined,
    };

    return `Capsule ${JSON.stringify(obj)}`;
  }
}
