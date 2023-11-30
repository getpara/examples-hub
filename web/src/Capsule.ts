import {
  PublicKeyStatus,
  PublicKeyType,
} from '@usecapsule/user-management-client';
import { pki, jsbn } from 'node-forge';

import {
  decryptWithKeyPair,
  getAsymmetricKeyPair,
  getPublicKeyHex,
} from './core/cryptography/utils';
import { keygen } from './wallet/keygen';
import { sendTransaction, signTransaction, signMessage } from './wallet/signing';
import { Ctx, getPortalBaseURL } from './core/definitions';
import { Environment } from './core/definitions';
import { initClient } from './core/external/capsuleClient';
import * as mpcComputationClient from './core/external/mpcComputationClient';
import { distributeNewShare } from './core/shares/shareDistribution';
import { openPopup } from './modal/utils';
import {
  FullSignatureRes,
  SuccessfulSignatureRes,
  DeniedSignatureRes,
} from './core/types/walletTypes';
import * as transmissionUtils from './core/transmission/transmissionUtils';

// amount of time in ms that a web auth session lasts
const BIOMETRIC_VERIFICATION_TIME_MS = 30 * 60 * 1000;
const DEV_BIOMETRIC_VERIFICATION_TIME_MS = 60 * 60 * 1000;

enum WalletScheme {
  CGGMP = 'CGGMP',
  DKLS = 'DKLS',
}
// Make sure to keep this in sync with capsule-org/src/entities/recoveryAttemptEntity.ts
export enum RecoveryStatus {
  INITIATED = 'INITIATED',
  READY = 'READY',
  EXPIRED = 'EXPIRED',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED',
}

export interface Wallet {
  id: string;
  signer: string;
  address?: string;
  publicKey?: string;
  scheme?: WalletScheme;
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
  portalBackgroundColor?: string; // please use hex color codes
  portalPrimaryButtonColor?: string; // please use hex color codes
  portalTextColor?: string; // please use hex color codes
  portalPrimaryButtonTextColor?: string; // please use hex color codes
  useDKLSForCreation?: boolean;
}

const PREFIX = '@CAPSULE/';
const LOCAL_STORAGE_EMAIL = `${PREFIX}e-mail`;
const LOCAL_STORAGE_USER_ID = `${PREFIX}userId`;
const LOCAL_STORAGE_WALLETS = `${PREFIX}wallets`;
const SESSION_STORAGE_LOGIN_ENCRYPTION_KEY_PAIR = `${PREFIX}loginEncryptionKeyPair`;
const SESSION_STORAGE_SESSION_COOKIE = `${PREFIX}sessionCookie`;

function biometricVerifiedRecently(ctx: Ctx, verifiedAt: number): boolean {
  if (ctx.env !== Environment.PROD) {
    return Date.now() - verifiedAt <= DEV_BIOMETRIC_VERIFICATION_TIME_MS;
  }
  return Date.now() - verifiedAt <= BIOMETRIC_VERIFICATION_TIME_MS;
}

/**
 * Main entry point class.
 *
 * Deprecated. Use `CapsuleWeb` instead.
 * @internal
 **/
export class Capsule {
  ctx: Ctx;

  private email?: string;
  private userId?: string;
  loginEncryptionKeyPair?: pki.rsa.KeyPair;
  private wallets: Record<string, Wallet>;
  portalBackgroundColor?: string;
  portalPrimaryButtonColor?: string;
  portalTextColor?: string;
  portalPrimaryButtonTextColor?: string;
  private sessionCookie?: string;

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
  retrieveSessionCookie = (): string | undefined => {
    return this.sessionCookie;
  };
  persistSessionCookie = (cookie: string): void => {
    this.sessionCookie = cookie;
    this.sessionStorageSetItem(SESSION_STORAGE_SESSION_COOKIE, cookie);
  };

  // remove all local storage and session storage prefixed for capsule
  clearStorage = async (): Promise<void> => {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (key && key.startsWith(PREFIX)) {
        localStorage.removeItem(key);
        i--;
      }
    }
    for (let j = 0; j < sessionStorage.length; j++) {
      const key = sessionStorage.key(j);

      if (key && key.startsWith(PREFIX)) {
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

  private requireApiKey() {
    if (!this.ctx.apiKey) {
      throw new Error(
          `in order to create a wallet or user with Capsule, you
          must provide an API key to the capsule instance`
      );
    }
  }

  // TODO: consider using sessionStorage instead of localStorage
  constructor(env: Environment, apiKey?: string, opts?: ConstructorOpts) {
    if (!opts) opts = {};

    this.ctx = {
      env,
      apiKey,
      capsuleClient: initClient(env, apiKey, opts.disableWorkers, this.retrieveSessionCookie, this.persistSessionCookie),
      disableWorkers: opts.disableWorkers,
      offloadMPCComputationURL: opts.offloadMPCComputationURL,
      useLocalFiles: opts.useLocalFiles,
      useDKLS: opts.useDKLSForCreation || !opts.offloadMPCComputationURL,
    };
    if (opts.offloadMPCComputationURL) {
      this.ctx.mpcComputationClient = mpcComputationClient.initClient(opts.offloadMPCComputationURL, opts.disableWorkers);
    }

    this.portalBackgroundColor = opts.portalBackgroundColor;
    this.portalPrimaryButtonColor = opts.portalPrimaryButtonColor;
    this.portalTextColor = opts.portalTextColor;
    this.portalPrimaryButtonTextColor = opts.portalPrimaryButtonTextColor;

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
    this.sessionCookie = sessionStorage.getItem(SESSION_STORAGE_SESSION_COOKIE) || undefined;

    if (
      sessionStorage.getItem(SESSION_STORAGE_LOGIN_ENCRYPTION_KEY_PAIR) &&
      sessionStorage.getItem(SESSION_STORAGE_LOGIN_ENCRYPTION_KEY_PAIR) !==
        'undefined'
    ) {
      this.loginEncryptionKeyPair = this.convertEncryptionKeyPair(JSON.parse(
        sessionStorage.getItem(SESSION_STORAGE_LOGIN_ENCRYPTION_KEY_PAIR),
      ));
    }
  }

  async init(): Promise<void> {
    this.email = await this.localStorageGetItem(LOCAL_STORAGE_EMAIL) || undefined;
    this.userId = await this.localStorageGetItem(LOCAL_STORAGE_USER_ID) || undefined;
    this.wallets = JSON.parse(
      await this.localStorageGetItem(LOCAL_STORAGE_WALLETS) || '{}',
    );
    this.sessionCookie = await this.sessionStorageGetItem(SESSION_STORAGE_SESSION_COOKIE) || undefined;

    if (
      (await this.sessionStorageGetItem(SESSION_STORAGE_LOGIN_ENCRYPTION_KEY_PAIR)) &&
      (await this.sessionStorageGetItem(SESSION_STORAGE_LOGIN_ENCRYPTION_KEY_PAIR)) !==
        'undefined'
    ) {
      this.loginEncryptionKeyPair = this.convertEncryptionKeyPair(JSON.parse(
        await this.sessionStorageGetItem(SESSION_STORAGE_LOGIN_ENCRYPTION_KEY_PAIR),
      ));
    }
  }

  async generatePaillierKey(): Promise<void> {
    return;
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

  async setLoginEncryptionKeyPair(keyPair: pki.rsa.KeyPair): Promise<void> {
    this.loginEncryptionKeyPair = keyPair;
    await this.sessionStorageSetItem(
      SESSION_STORAGE_LOGIN_ENCRYPTION_KEY_PAIR,
      JSON.stringify(keyPair),
    );
  }

  private async deleteLoginEncryptionKeyPair(): Promise<void> {
    this.loginEncryptionKeyPair = undefined;
    await this.sessionStorageRemoveItem(SESSION_STORAGE_LOGIN_ENCRYPTION_KEY_PAIR);
  }

  getEmail(): string | undefined {
    return this.email;
  }

  getWallets(): Record<string, Wallet> {
    return this.wallets;
  }

  private async getPartnerURL(partnerId: string): Promise<string | undefined> {
    const res = await this.ctx.capsuleClient.getPartner(partnerId);
    return res.data.partner.portalUrl;
  }

  async getPortalURL(partnerId?: string): Promise<string> {
    return (partnerId && await this.getPartnerURL(partnerId)) || getPortalBaseURL(this.ctx);
  }

  private async getWebAuthURLForCreate(
    webAuthId: string,
    partnerId?: string,
    isForNewDevice?: boolean,
  ): Promise<string> {
    const partnerIdQueryParam = partnerId ? `&partnerId=${partnerId}` : '';
    const portalBackgroundColorQueryParam = this.portalBackgroundColor ? `&portalBackgroundColor=${encodeURIComponent(this.portalBackgroundColor)}` : '';
    const portalPrimaryButtonColorQueryParam = this.portalPrimaryButtonColor ? `&portalPrimaryButtonColor=${encodeURIComponent(this.portalPrimaryButtonColor)}` : '';
    const portalTextColorQueryParam = this.portalTextColor ? `&portalTextColor=${encodeURIComponent(this.portalTextColor)}` : '';
    const portalPrimaryButtonTextColorQueryParam = this.portalPrimaryButtonTextColor ? `&portalPrimaryButtonTextColor=${encodeURIComponent(this.portalPrimaryButtonTextColor)}` : '';
    const isForNewDeviceQueryParam = isForNewDevice ? `&isForNewDevice=${isForNewDevice}` : '';

    return `${(partnerId && await this.getPartnerURL(partnerId)) || getPortalBaseURL(this.ctx)}/web/users/${
      this.userId
    }/biometrics/${webAuthId}?email=${encodeURIComponent(
      this.email,
    )}${partnerIdQueryParam}${portalBackgroundColorQueryParam}${portalPrimaryButtonColorQueryParam}${portalTextColorQueryParam}${isForNewDeviceQueryParam}${portalPrimaryButtonTextColorQueryParam}`;
  }

  private getShortUrl(compressedUrl: string): string {
    return `${getPortalBaseURL(this.ctx)}/short/${compressedUrl}`;
  }

  async shortenLoginLink(link: string): Promise<string> {
    const url = await transmissionUtils.upload(link, this.ctx.capsuleClient);
    return this.getShortUrl(url);
  }

  async getWebAuthURLForLogin(
    sessionId: string,
    loginEncryptionPublicKey: string,
    partnerId?: string,
    newDeviceSessionId?: string,
    newDeviceEncryptionKey?: string,
  ): Promise<string> {
    const partnerIdQueryParam = partnerId ? `&partnerId=${partnerId}` : '';
    const portalBackgroundColorQueryParam = this.portalBackgroundColor ? `&portalBackgroundColor=${encodeURIComponent(this.portalBackgroundColor)}` : '';
    const portalPrimaryButtonColorQueryParam = this.portalPrimaryButtonColor ? `&portalPrimaryButtonColor=${encodeURIComponent(this.portalPrimaryButtonColor)}` : '';
    const portalTextColorQueryParam = this.portalTextColor ? `&portalTextColor=${encodeURIComponent(this.portalTextColor)}` : '';
    const portalPrimaryButtonTextColorQueryParam = this.portalPrimaryButtonTextColor ? `&portalPrimaryButtonTextColor=${encodeURIComponent(this.portalPrimaryButtonTextColor)}` : '';
    const newDeviceSessionIdQueryParam = newDeviceSessionId ? `&newDeviceSessionId=${newDeviceSessionId}` : '';
    const newDeviceEncryptionKeyQueryParam = newDeviceEncryptionKey ? `&newDeviceEncryptionKey=${newDeviceEncryptionKey}` : '';

    return `${(partnerId && await this.getPartnerURL(partnerId)) || getPortalBaseURL(this.ctx)}/web/biometrics/login?email=${encodeURIComponent(
      this.email,
    )}&sessionId=${sessionId}&encryptionKey=${loginEncryptionPublicKey}${partnerIdQueryParam}${portalBackgroundColorQueryParam}${portalPrimaryButtonColorQueryParam}${
      portalTextColorQueryParam
    }${newDeviceSessionIdQueryParam}${newDeviceEncryptionKeyQueryParam}${portalPrimaryButtonTextColorQueryParam}`;
  }

  async fetchWallets(): Promise<any[]> {
    const res = await this.ctx.capsuleClient.getWallets(this.userId);
    return res.data.wallets;
  }

  private async populateWalletAddresses(): Promise<void> {
    const res = await this.ctx.capsuleClient.getWallets(this.userId);
    const wallets = res.data.wallets;
    wallets.forEach((wallet: { id: string; address?: string; publicKey?: string; scheme?: WalletScheme }) => {
      if (this.wallets[wallet.id]) {
        this.wallets[wallet.id].address = wallet.address;
        this.wallets[wallet.id].publicKey = wallet.publicKey;
        this.wallets[wallet.id].scheme = wallet.scheme;
      }
    });
    await this.setWallets(this.wallets);
  }

  async checkIfUserExists(email: string): Promise<boolean> {
    const res = await this.ctx.capsuleClient.checkUserExists(email);
    return res.data.exists;
  }

  async createUser(email: string): Promise<void> {
    this.requireApiKey();
    await this.setEmail(email);
    const { userId } = await this.ctx.capsuleClient.createUser({
      email: this.email!,
    });
    await this.setUserId(userId);
  }

  // returns web auth url for creating a new credential
  async verifyEmail(verificationCode: string): Promise<string> {
    await this.ctx.capsuleClient.verifyEmail(this.userId, { verificationCode });
    return this.getSetUpBiometricsURL(false);
  }

  async verify2FA(email: string, verificationCode: string): Promise<{
    address?: string;
    initiatedAt?: Date;
    status?: RecoveryStatus;
    userId: string;
    walletId: string;
  }> {
    const res = await this.ctx.capsuleClient.verify2FA(email, verificationCode);
    return {
      address: res.data.address,
      initiatedAt: res.data.initiatedAt,
      status: res.data.status,
      userId: res.data.userId,
      walletId: res.data.walletId,
    }
  }

  async setup2FA(): Promise<{
    uri?: string
  }> {
    const res = await this.ctx.capsuleClient.setup2FA(this.userId);
    return {
      uri: res.data.uri,
    }
  }

  async enable2FA(verificationCode: string): Promise<void> {
    await this.ctx.capsuleClient.enable2FA(this.userId, verificationCode);
  }

  async check2FAStatus(): Promise<{
    isSetup: boolean
  }> {
    if (!this.userId) {
      return { isSetup: false }
    }
    const res = await this.ctx.capsuleClient.check2FAStatus(this.userId);
    return {
      isSetup: res.data.isSetup
    }
  }

  async resendVerificationCode(): Promise<void> {
    await this.ctx.capsuleClient.resendVerificationCode(this.userId);
  }

  // returns web auth url for creating a new credential
  async getSetUpBiometricsURL(isForNewDevice: boolean): Promise<string> {
    const res = await this.ctx.capsuleClient.addSessionPublicKey(this.userId, {
      status: PublicKeyStatus.PENDING,
      type: PublicKeyType.WEB,
    });

    return this.getWebAuthURLForCreate(res.data.id, res.data.partnerId, isForNewDevice);
  }

  // TODO: consider changing this to just hit a new endpoint that returns
  //   true/false if session is active
  async isSessionActive(): Promise<boolean> {
    const res = await this.ctx.capsuleClient.touchSession();
    return (
      res.data.biometricVerifiedAt &&
      biometricVerifiedRecently(this.ctx, res.data.biometricVerifiedAt)
    );
  }

  async isFullyLoggedIn(): Promise<boolean> {
    const isSessionActive = await this.isSessionActive();
    const walletAddress = this.getWallets()?.[Object.keys(this.getWallets())[0]]?.address;

    return isSessionActive && !!walletAddress;
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

    const link = await this.getWebAuthURLForLogin(
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

  async getTransmissionKeyShares(isForNewDevice?: boolean): Promise<any> {
    const res = await this.ctx.capsuleClient.touchSession();
    const sessionLookupId = isForNewDevice ?
      `${res.data.sessionLookupId}-new-device` :
      res.data.sessionLookupId;
    return this.ctx.capsuleClient.getTransmissionKeyshares(this.userId, sessionLookupId);
  }

  async setupAfterLogin(temporaryShares?: any[]): Promise<void> {
    if (!temporaryShares) {
      temporaryShares = (await this.getTransmissionKeyShares()).data.temporaryShares;
    }

    temporaryShares.forEach((share) => {
      this.wallets[share.walletId] = {
        id: share.walletId,
        signer: decryptWithKeyPair(
          this.loginEncryptionKeyPair,
          share.encryptedShare,
          share.encryptedKey,
        ),
      };
    });

    await this.deleteLoginEncryptionKeyPair();
    await this.populateWalletAddresses();
    await this.ctx.capsuleClient.touchSession(true);
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
    skipDistribute = false,
    customFunction?: (params?: any) => void,
  ): Promise<[Wallet, string | null]> {
    this.requireApiKey();
    const { signer, walletId, recoveryShare } = await keygen(
      this.ctx,
      this.userId,
      null,
      skipDistribute,
      this.retrieveSessionCookie(),
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

  // pass in base64 encoding of exact message that should be signed
  // if you want to sign the keccak256 hash of a message, hash the message first and then pass in the base64 encoded hash
  async signMessage(
    walletId: string,
    messageBase64: string,
  ): Promise<FullSignatureRes> {
    const wallet = this.wallets[walletId];
    const res = await signMessage(
      this.ctx,
      this.userId,
      walletId,
      this.wallets[walletId].signer,
      messageBase64,
      this.retrieveSessionCookie(),
      wallet.scheme === WalletScheme.DKLS,
    );
    if ((res as DeniedSignatureRes).pendingTransactionId) {
      console.log(this.getTransactionReviewUrl(
        (res as DeniedSignatureRes).pendingTransactionId,
      ));
      return {
        ...res,
        transactionReviewUrl: this.getTransactionReviewUrl(
          (res as DeniedSignatureRes).pendingTransactionId,
        ),
      };
    }

    return res as SuccessfulSignatureRes;
  }

  async signTransaction(
    walletId: string,
    rlpEncodedTxBase64: string,
    chainId: string,
  ): Promise<FullSignatureRes> {
    const wallet = this.wallets[walletId];
    const res = await signTransaction(
      this.ctx,
      this.userId,
      walletId,
      this.wallets[walletId].signer,
      rlpEncodedTxBase64,
      chainId,
      this.retrieveSessionCookie(),
      wallet.scheme === WalletScheme.DKLS,
    );
    if ((res as DeniedSignatureRes).pendingTransactionId) {
      console.log(this.getTransactionReviewUrl(
        (res as DeniedSignatureRes).pendingTransactionId,
      ));
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
    const wallet = this.wallets[walletId];
    const res = await sendTransaction(
      this.ctx,
      this.userId,
      walletId,
      this.wallets[walletId].signer,
      rlpEncodedTxBase64,
      chainId,
      this.retrieveSessionCookie(),
      wallet.scheme === WalletScheme.DKLS,
    );
    
    if ((res as DeniedSignatureRes).pendingTransactionId) {
      console.log(this.getTransactionReviewUrl(
        (res as DeniedSignatureRes).pendingTransactionId,
      ));
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
