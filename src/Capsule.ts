import {
  PublicKeyStatus,
  PublicKeyType,
} from '@usecapsule/user-management-client';
import { pki, jsbn } from 'node-forge';

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
import * as mpcComputationClient from './external/mpcComputationClient';
import { KeyContainer } from './shares/KeyContainer';
import { distributeNewShare } from './shares/shareDistribution';
import { openPopup } from './modal/utils';
import {
  FullSignatureRes,
  SuccessfulSignatureRes,
  DeniedSignatureRes,
} from './types/walletTypes';

// amount of time in ms that a web auth session lasts
const BIOMETRIC_VERIFICATION_TIME_MS = 15 * 60 * 1000;

export interface Wallet {
  id: string;
  signer: string;
  address?: string;
}

export interface ConstructorOpts {
  useStorageOverrides?: boolean;
  disableWorkers?: boolean;
  offloadMPCComputationURL?: string;
  useLocalFiles?: boolean;
  localStorageGetItemOverride?: (key: string) => Promise<string | null>;
  localStorageSetItemOverride?: (key: string, value: string) => Promise<void>;
  sessionStorageGetItemOverride?: (key: string) => Promise<string | null>;
  sessionStorageSetItemOverride?: (key: string, value: string) => Promise<void>;
  sessionStorageRemoveItemOverride?: (key: string) => Promise<void>;
  clearStorageOverride?: () => Promise<void>;
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

  private localStorageGetItem = async (key: string): Promise<string | null> => {
    return localStorage.getItem(key);
  };
  private localStorageSetItem = async (key: string, value: string): Promise<void> => {
    return localStorage.setItem(key, value);
  };
  private sessionStorageGetItem = async (key: string): Promise<string | null> => {
    return sessionStorage.getItem(key);
  };
  private sessionStorageSetItem = async (key: string, value: string): Promise<void> => {
    return sessionStorage.setItem(key, value);
  };
  private sessionStorageRemoveItem = async (key: string): Promise<void> => {
    return sessionStorage.removeItem(key);
  };
  // remove all local storage and session storage prefixed for capsule
  clearStorage = async (keepSecretKey?: boolean): Promise<void> => {
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
      if (
        key &&
        key.startsWith(PREFIX) &&
        !(keepSecretKey && key === SESSION_STORAGE_PAILLIER_SECRET_KEY)
      ) {
        sessionStorage.removeItem(key);
        j--;
      }
    }
  }

  private convertBigInt(bigInt: Record<string, any>): jsbn.BigInteger {
    const convertedBigInt = new jsbn.BigInteger(null);
    convertedBigInt.data = bigInt.data;
    convertedBigInt.s = bigInt.s;
    convertedBigInt.t = bigInt.t;
    return convertedBigInt;
  }

  private convertEncryptionKeyPair(jsonKeyPair: Record<string, any>): pki.rsa.KeyPair {
    return {
      privateKey: pki.setRsaPrivateKey(
        this.convertBigInt(jsonKeyPair.privateKey.n),
        this.convertBigInt(jsonKeyPair.privateKey.e),
        this.convertBigInt(jsonKeyPair.privateKey.d),
        this.convertBigInt(jsonKeyPair.privateKey.p),
        this.convertBigInt(jsonKeyPair.privateKey.q),
        this.convertBigInt(jsonKeyPair.privateKey.dP),
        this.convertBigInt(jsonKeyPair.privateKey.dQ),
        this.convertBigInt(jsonKeyPair.privateKey.qInv),
      ),
      publicKey: pki.setRsaPublicKey(
        this.convertBigInt(jsonKeyPair.publicKey.n),
        this.convertBigInt(jsonKeyPair.publicKey.e),
      ),
    };
  }

  // TODO: consider using sessionStorage instead of localStorage
  constructor(env: Environment, apiKey?: string, opts?: ConstructorOpts) {
    if (!opts) opts = {};
    this.ctx = {
      env,
      apiKey,
      capsuleClient: initClient(env, apiKey, opts.disableWorkers),
      disableWorkers: opts.disableWorkers,
      offloadMPCComputationURL: opts.offloadMPCComputationURL,
      useLocalFiles: opts.useLocalFiles,
    };
    if (opts.offloadMPCComputationURL) {
      this.ctx.mpcComputationClient = mpcComputationClient.initClient(opts.offloadMPCComputationURL);
    }

    if (opts.useStorageOverrides) {
      this.localStorageGetItem = opts.localStorageGetItemOverride;
      this.localStorageSetItem = opts.localStorageSetItemOverride;
      this.sessionStorageGetItem = opts.sessionStorageGetItemOverride;
      this.sessionStorageSetItem = opts.sessionStorageSetItemOverride;
      this.sessionStorageRemoveItem = opts.sessionStorageRemoveItemOverride;
      this.clearStorage = opts.clearStorageOverride;
      return;
    }

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
      this.loginEncryptionKeyPair = this.convertEncryptionKeyPair(JSON.parse(
        sessionStorage.getItem(LOCAL_STORAGE_LOGIN_ENCRYPTION_KEY_PAIR),
      ));
    }
  }

  async init(): Promise<void> {
    this.email = await this.localStorageGetItem(LOCAL_STORAGE_EMAIL) || undefined;
    this.userId = await this.localStorageGetItem(LOCAL_STORAGE_USER_ID) || undefined;
    this.wallets = JSON.parse(
      await this.localStorageGetItem(LOCAL_STORAGE_WALLETS) || '{}',
    );
    if (
      (await this.sessionStorageGetItem(LOCAL_STORAGE_LOGIN_ENCRYPTION_KEY_PAIR)) &&
      (await this.sessionStorageGetItem(LOCAL_STORAGE_LOGIN_ENCRYPTION_KEY_PAIR)) !==
        'undefined'
    ) {
      this.loginEncryptionKeyPair = this.convertEncryptionKeyPair(JSON.parse(
        await this.sessionStorageGetItem(LOCAL_STORAGE_LOGIN_ENCRYPTION_KEY_PAIR),
      ));
    }
  }

  async generatePaillierKey(): Promise<void> {
    if (this.ctx.offloadMPCComputationURL) {
      return;
    }
    const paillierKey = await this.sessionStorageGetItem(
      SESSION_STORAGE_PAILLIER_SECRET_KEY,
    );
    if (paillierKey) {
      return;
    }

    const { p, q } = await generateBlumPrimes(this.ctx);
    const base64Enc = Buffer.from(
      JSON.stringify({ pBase64: p, qBase64: q }),
      'utf-8',
    ).toString('base64');
    await this.sessionStorageSetItem(SESSION_STORAGE_PAILLIER_SECRET_KEY, base64Enc);
  }

  async setEmail(email: string): Promise<void> {
    this.email = email;
    await this.localStorageSetItem(LOCAL_STORAGE_EMAIL, email);
  }

  async setUserId(userId: string): Promise<void> {
    this.userId = userId;
    await this.localStorageSetItem(LOCAL_STORAGE_USER_ID, userId);
  }

  async setWallets(wallets: Record<string, Wallet>): Promise<void> {
    this.wallets = wallets;
    await this.localStorageSetItem(LOCAL_STORAGE_WALLETS, JSON.stringify(wallets));
  }

  private async setLoginEncryptionKeyPair(keyPair: pki.rsa.KeyPair): Promise<void> {
    this.loginEncryptionKeyPair = keyPair;
    await this.sessionStorageSetItem(
      LOCAL_STORAGE_LOGIN_ENCRYPTION_KEY_PAIR,
      JSON.stringify(keyPair),
    );
  }

  private async deleteLoginEncryptionKeyPair(): Promise<void> {
    this.loginEncryptionKeyPair = undefined;
    await this.sessionStorageRemoveItem('loginEncryptionKeyPair');
  }

  getEmail(): string | undefined {
    return this.email;
  }

  getWallets(): Record<string, Wallet> {
    return this.wallets;
  }

  private getWebAuthURLForCreate(
    webAuthId: string,
    partnerId?: string,
  ): string {
    const partnerIdQueryParam = partnerId ? `&partnerId=${partnerId}` : '';
    return `${getPortalBaseURL(this.ctx)}/web/users/${
      this.userId
    }/biometrics/${webAuthId}?email=${encodeURIComponent(
      this.email,
    )}${partnerIdQueryParam}`;
  }

  private getShortUrl(compressedUrl: string): string {
    return `${getPortalBaseURL(this.ctx)}/short/${compressedUrl}`;
  }

  private getWebAuthURLForLogin(
    sessionId: string,
    loginEncryptionPublicKey: string,
    partnerId?: string,
  ): string {
    const partnerIdQueryParam = partnerId ? `&partnerId=${partnerId}` : '';
    return `${getPortalBaseURL(
      this.ctx,
    )}/web/biometrics/login?email=${encodeURIComponent(
      this.email,
    )}&sessionId=${sessionId}&encryptionKey=${loginEncryptionPublicKey}${partnerIdQueryParam}`;
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
    await this.setWallets(this.wallets);
  }

  async checkIfUserExists(email: string): Promise<boolean> {
    const res = await this.ctx.capsuleClient.checkUserExists(email);
    return res.data.exists;
  }

  async createUser(email: string): Promise<void> {
    await this.setEmail(email);
    const { userId } = await this.ctx.capsuleClient.createUser({
      email: this.email!,
    });
    await this.setUserId(userId);
  }

  // returns web auth url for creating a new credential
  async verifyEmail(verificationCode: string): Promise<string> {
    await this.ctx.capsuleClient.verifyEmail(this.userId, { verificationCode });
    return this.getSetUpBiometricsURL();
  }

  // returns web auth url for creating a new credential
  async getSetUpBiometricsURL(): Promise<string> {
    const res = await this.ctx.capsuleClient.addSessionPublicKey(this.userId, {
      status: PublicKeyStatus.PENDING,
      type: PublicKeyType.WEB,
    });

    return this.getWebAuthURLForCreate(res.data.id, res.data.partnerId);
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
    await this.setEmail(email);
    const res = await this.ctx.capsuleClient.touchSession(true);
    if (!this.loginEncryptionKeyPair) {
      const keyPair = await getAsymmetricKeyPair(this.ctx);
      await this.setLoginEncryptionKeyPair(keyPair);
    }

    return this.getWebAuthURLForLogin(
      res.data.sessionId,
      getPublicKeyHex(this.loginEncryptionKeyPair),
      res.data.partnerId,
    );
  }

  async refreshSession(shouldOpenPopup: boolean): Promise<string> {
    const res = await this.ctx.capsuleClient.touchSession(true);
    if (!this.loginEncryptionKeyPair) {
      const keyPair = await getAsymmetricKeyPair(this.ctx);
      await this.setLoginEncryptionKeyPair(keyPair);
    }

    const link = this.getWebAuthURLForLogin(
      res.data.sessionId,
      getPublicKeyHex(this.loginEncryptionKeyPair),
    );

    if (shouldOpenPopup) {
      openPopup(link);
    }

    return link;
  }

  async userSetupAfterLogin(): Promise<void> {
    const res = await this.ctx.capsuleClient.touchSession();
    await this.setUserId(res.data.userId);
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

    await this.setUserId(res.data.userId);
    await this.deleteLoginEncryptionKeyPair();
    await this.populateWalletAddresses();
  }

  async distributeNewWalletShare(
    walletId: string,
    userShare: string,
  ): Promise<string> {
    const recoveryShare = await distributeNewShare(
      this.ctx,
      this.userId,
      walletId,
      userShare,
    );
    return recoveryShare;
  }

  async createWallet(
    skipDistribute: boolean = false,
    customFunction: Function,
  ): Promise<[Wallet, string | null]> {
    const secretKey = await this.sessionStorageGetItem(
      SESSION_STORAGE_PAILLIER_SECRET_KEY,
    );
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

    await this.setWallets(this.wallets);
    return [this.wallets[walletId], recoveryShare];
  }

  private getTransactionReviewUrl(transactionId: string): string {
    return `${getPortalBaseURL(this.ctx)}/web/users/${
      this.userId
    }/transaction-review/${transactionId}?email=${encodeURIComponent(
      this.email,
    )}`;
  }

  async signMessage(
    walletId: string,
    message: string,
  ): Promise<FullSignatureRes> {
    const res = await signMessage(
      this.ctx,
      this.userId,
      walletId,
      this.wallets[walletId].signer,
      message,
    );
    if ((res as DeniedSignatureRes).pendingTransactionId) {
      return {
        ...res,
        transactionReviewUrl: this.getTransactionReviewUrl(
          (res as DeniedSignatureRes).pendingTransactionId,
        ),
      };
    }

    return res as SuccessfulSignatureRes;
  }

  // pass in rlp encoded tx as base64 string
  async sendTransaction(
    walletId: string,
    rlpEncodedTxBase64: string,
    chainId: string,
  ): Promise<FullSignatureRes> {
    const res = await sendTransaction(
      this.ctx,
      this.userId,
      walletId,
      this.wallets[walletId].signer,
      rlpEncodedTxBase64,
      chainId,
    );
    if ((res as DeniedSignatureRes).pendingTransactionId) {
      return {
        ...res,
        transactionReviewUrl: this.getTransactionReviewUrl(
          (res as DeniedSignatureRes).pendingTransactionId,
        ),
      };
    }

    return res as SuccessfulSignatureRes;
  }

  async logout(): Promise<void> {
    await this.ctx.capsuleClient.logout();
    await this.clearStorage();
    this.wallets = {};
    this.loginEncryptionKeyPair = undefined;
    this.email = undefined;
    this.userId = undefined;
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
