import axios, {
  AxiosInstance,
  AxiosRequestHeaders,
  AxiosResponse,
  AxiosResponseHeaders,
  InternalAxiosRequestConfig,
} from 'axios';
import { AxiosRequestConfig } from 'axios';
import qs from 'qs';

export const USER_NOT_VERIFIED = 'user must verify biometrics';
export const USER_NOT_AUTHENTICATED_ERROR = 'user must be authenticated';
export const USER_NOT_MATCHING_ERROR = 'route param userId must match session userId';

interface ConfigOpts {
  useFetchAdapter?: boolean;
}

type ClientConfig = {
  userManagementHost: string;
  apiKey?: string;
  opts?: ConfigOpts;
  retrieveSessionCookie?: () => string | undefined;
  persistSessionCookie?: (cookie: string) => void;
};

export enum EmailTheme {
  LIGHT = 'light',
  DARK = 'dark',
}

export interface VerificationEmailProps {
  theme?: EmailTheme;
  homepageUrl?: string;
  xUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  supportUrl?: string;
  brandColor?: string;
}

export interface BackupKitEmailProps {
  theme?: EmailTheme;
  homepageUrl?: string;
  xUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  supportUrl?: string;
  brandColor?: string;
}

export interface createUserBody {
  email: string;
}

export interface createUserBodyForPhone {
  phone: string;
  countryCode: string;
}

export interface createUserIdRes {
  protocolId: string;
  userId: string;
}

export interface verifyBody {
  verificationCode: string;
}

export interface getWebChallengeRes {
  challenge: string;
  allowedPublicKeys?: string[];
}

export interface GetCapsuleShareRes {
  share: string;
}

export enum PublicKeyStatus {
  PENDING = 'PENDING',
  COMPLETE = 'COMPLETE',
}

export enum PublicKeyType {
  MOBILE = 'MOBILE',
  WEB = 'WEB',
}

interface sessionPublicKeyBody {
  publicKey?: string; // only not included when status is PENDING
  sigDerivedPublicKey?: string; // only include for type 'WEB'
  status?: PublicKeyStatus;
  type?: PublicKeyType;
  cosePublicKey?: string;
  clientDataJSON?: string;
}

interface WebSignature {
  clientDataJSON: string;
  authenticatorData: string;
  signature: string;
}

interface MobileSignature {
  r: string;
  s: string;
  recoveryParam: number;
}

interface verifyWebChallengeBody {
  email?: string;
  phone?: string;
  countryCode?: string;
  farcasterUsername?: string;
  sessionLookupId?: string;
  signature: WebSignature;
  publicKey?: string;
  newDeviceSessionLookupId?: string;
}

interface verifySessionChallengeBody {
  signature: MobileSignature | WebSignature;
  publicKey?: string;
}

interface verifySessionChallengeRes {
  sessionChallenge: string;
}

export enum SignatureScheme {
  DKLS = 'DKLS',
  CGGMP = 'CGGMP',
  ED25519 = 'ED25519',
}

export interface WalletEntity {
  address: string | null;
  createdAt: string;
  pregenIdentifier: string;
  pregenIdentifierType: string;
  id: string;
  keyGenComplete: boolean;
  name: string | null;
  partnerId: string;
  publicKey: string | null;
  scheme: string;
  type: string;
  updatedAt: string;
  userId: string | null;
}

interface getWalletsRes {
  wallets: WalletEntity[];
}

interface createWalletBody {
  useTwoSigners?: boolean;
  scheme: SignatureScheme;
}

interface updatePregenWalletBody {
  pregenIdentifier: string;
  pregenIdentifierType: string;
}

interface createWalletRes {
  protocolId: string;
  walletId: string;
}

interface createPreGenWalletBody {
  pregenIdentifier: string;
  pregenIdentifierType: string;
  scheme?: SignatureScheme;
}

interface claimPreGenWalletBody {
  userId: string;
  walletId: string;
}

interface signTransactionBody {
  transaction: string;
  chainId: string;
}

export enum Chain {
  ETH = 'ETH',
  CELO = 'CELO',
  MATIC = 'MATIC',
}

// TODO: delete chain field and make chainId required
interface sendTransactionBody {
  transaction: string;
  chain?: Chain;
  chainId?: string;
}

interface AcceptScopesBody {
  scopeIds: string[];
  partnerId: string;
}

export interface encryptedKeyshare {
  encryptedShare: string;
  encryptedKey?: string;
  type: (typeof KeyType)[keyof typeof KeyType];
  biometricPublicKey?: string;
  encryptor: (typeof EncryptorType)[keyof typeof EncryptorType];
  recoveryPublicKeyId?: string;
}

export enum EncryptorType {
  USER = 'USER',
  RECOVERY = 'RECOVERY',
  BIOMETRICS = 'BIOMETRICS',
}

export const KeyType = {
  USER: 'USER',
  RECOVERY: 'RECOVERY',
} as const;

export enum Network {
  ETHEREUM = 'ETHEREUM',
  ARBITRUM = 'ARBITRUM',
  BASE = 'BASE',
  OPTIMISM = 'OPTIMISM',
  POLYGON = 'POLYGON',
}

export enum OnRampProvider {
  RAMP = 'RAMP',
  STRIPE = 'STRIPE',
}

export enum OnRampAsset {
  ETHEREUM = 'ETHEREUM',
  USDC = 'USDC',
  POLYGON = 'POLYGON',
}

export enum OnRampPurchaseStatus {
  INITIATED = 'INITIATED',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED',
}
export interface OnRampPurchase {
  id: string;
  userId: string;
  walletId: string;
  status: OnRampPurchaseStatus;
  provider: OnRampProvider;
  providerKey?: string | null;
  fiatCurrency?: string | null;
  fiatQuantity?: string | null;
  asset: OnRampAsset;
  assetQuantity?: string | null;
}

const SESSION_COOKIE_HEADER_NAME = 'x-capsule-sid';

class Client {
  private baseRequest: AxiosInstance;
  constructor({ userManagementHost, apiKey, opts, retrieveSessionCookie, persistSessionCookie }: ClientConfig) {
    // TODO remove after this is not optional anymore
    const headers = apiKey ? { 'X-External-API-Key': apiKey } : undefined;
    const axiosConfig = {
      baseURL: userManagementHost,
      withCredentials: true,
      headers,
    } as AxiosRequestConfig;

    if (retrieveSessionCookie) {
      const defaultTransformRequest = Array.isArray(axios.defaults.transformRequest)
        ? axios.defaults.transformRequest
        : [axios.defaults.transformRequest];

      axiosConfig.transformRequest = [
        function (this: InternalAxiosRequestConfig, data: any, headers: AxiosRequestHeaders): any {
          const currentSessionCookie = retrieveSessionCookie();
          if (currentSessionCookie) {
            headers[SESSION_COOKIE_HEADER_NAME] = currentSessionCookie;
          }

          return data;
        },
        ...defaultTransformRequest,
      ];
    }

    if (persistSessionCookie) {
      const defaultTransformResponse = Array.isArray(axios.defaults.transformResponse)
        ? axios.defaults.transformResponse
        : [axios.defaults.transformResponse];

      axiosConfig.transformResponse = [
        ...defaultTransformResponse,
        function (this: InternalAxiosRequestConfig, data: any, headers: AxiosResponseHeaders, _status?: number): any {
          if (headers?.[SESSION_COOKIE_HEADER_NAME]) {
            persistSessionCookie(headers[SESSION_COOKIE_HEADER_NAME]);
          }

          return data;
        },
      ];
    }

    this.baseRequest = axios.create(axiosConfig);

    if (opts?.useFetchAdapter) {
      axios.defaults.adapter = function (config: InternalAxiosRequestConfig) {
        return fetch(config.baseURL + config.url.substring(1), {
          method: config.method,
          headers: config.headers as [string, string][] | Record<string, string>,
          body: config.data,
          credentials: config.withCredentials ? 'include' : undefined,
        })
          .then(response =>
            response.text().then(text => ({
              data: text,
              status: response.status,
              statusText: response.statusText,
              headers: response.headers,
              config: config,
              request: fetch,
            })),
          )
          .catch(function (reason) {
            throw reason;
          });
      } as any;
    }
  }

  createUser = async (
    body: (createUserBody | createUserBodyForPhone) & VerificationEmailProps,
  ): Promise<createUserIdRes> => {
    const res = await this.baseRequest.post<createUserIdRes>(`/users`, body);
    return res.data;
  };

  checkUserExists = async (email: string, phone: string, countryCode: string): Promise<any> => {
    const res = await this.baseRequest.get<any>(
      `/users/exists?email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}&countryCode=${encodeURIComponent(countryCode)}`,
    );
    return res;
  };

  // POST /users/:userId/verify-email
  verifyEmail = async (userId: string, body: verifyBody): Promise<any> => {
    const res = await this.baseRequest.post<any>(`/users/${userId}/verify-email`, body);
    return res;
  };

  verifyPhone = async (userId: string, body: verifyBody): Promise<any> => {
    const res = await this.baseRequest.post<any>(`/users/${userId}/verify-identifier`, body);
    return res;
  };

  // POST /users/:userId/biometrics/key
  addSessionPublicKey = async (userId: string, body: sessionPublicKeyBody): Promise<any> => {
    const res = await this.baseRequest.post<any>(`/users/${userId}/biometrics/key`, body);
    return res;
  };

  // GET /users/:userId/biometrics/keys
  getSessionPublicKeys = async (userId: string): Promise<any> => {
    const res = await this.baseRequest.get<any>(`/users/${userId}/biometrics/keys`);
    return res;
  };

  // GET /users/:userId/biometrics/:biometricId
  getSessionPublicKey = async (userId: string, biometricId: string): Promise<any> => {
    const res = await this.baseRequest.get<any>(`/users/${userId}/biometrics/${biometricId}`);
    return res;
  };

  // PATCH /users/:userId/biometrics/:biometricId
  patchSessionPublicKey = async (
    partnerId: string,
    userId: string,
    biometricId: string,
    body: sessionPublicKeyBody,
  ): Promise<any> => {
    const res = await this.baseRequest.patch<any>(`/users/${userId}/biometrics/${biometricId}`, body, {
      headers: {
        'X-Partner-ID': partnerId,
      },
    });
    return res;
  };

  // GET /biometrics/challenge?email&publicKey
  getWebChallenge = async (
    email?: string,
    phone?: string,
    countryCode?: string,
    farcasterUsername?: string,
    publicKey?: string,
  ): Promise<getWebChallengeRes> => {
    const queryParams = {};
    if (email) {
      queryParams['email'] = email;
    }
    if (phone) {
      queryParams['phone'] = phone;
    }
    if (countryCode) {
      queryParams['countryCode'] = countryCode;
    }
    if (farcasterUsername) {
      queryParams['farcasterUsername'] = farcasterUsername;
    }
    if (publicKey) {
      queryParams['publicKey'] = publicKey;
    }
    const query = qs.stringify(queryParams);
    const res = await this.baseRequest.get<any>(`/biometrics/challenge${query === '' ? '' : `?${query}`}`);
    return res.data;
  };

  // POST /touch
  touchSession = async (regenerate?: boolean): Promise<any> => {
    const res = await this.baseRequest.post<{ userId?: string; sessionLookupId: string; biometricVerifiedAt?: number }>(
      `/touch?regenerate=${!!regenerate}`,
    );
    return res;
  };

  // POST /biometrics/verify
  verifyWebChallenge = async (partnerId: string, body: verifyWebChallengeBody): Promise<any> => {
    const res = await this.baseRequest.post<{}>(`/biometrics/verify`, body, {
      headers: {
        'X-Partner-ID': partnerId,
      },
    });
    return res;
  };

  // GET /users/:userId/biometrics/challenge
  getSessionChallenge = async (userId: string): Promise<any> => {
    const res = await this.baseRequest.get<any>(`/users/${userId}/biometrics/challenge`);
    return res;
  };

  // POST /users/:userId/biometrics/verify
  verifySessionChallenge = async (userId: string, body: verifySessionChallengeBody): Promise<any> => {
    const res = await this.baseRequest.post<verifySessionChallengeRes>(`/users/${userId}/biometrics/verify`, body);
    return res;
  };

  // POST /users/:userId/wallets
  createWallet = async (userId: string, body?: createWalletBody): Promise<createWalletRes> => {
    const res = await this.baseRequest.post<createWalletRes>(`/users/${userId}/wallets`, body);
    return res.data;
  };

  // POST /wallets/pregen
  createPregenWallet = async (body?: createPreGenWalletBody): Promise<createWalletRes> => {
    const res = await this.baseRequest.post<createWalletRes>(`/wallets/pregen`, body);
    return res.data;
  };

  // GET /wallets/pregen?pregenIdentifier={pregenIdentifier}&pregenIdentifierType={pregenIdentifierType}
  getPregenWallets = async (pregenIdentifier: string, pregenIdentifierType: string): Promise<getWalletsRes> => {
    const res = await this.baseRequest.get<any>(
      `/wallets/pregen?pregenIdentifier=${encodeURIComponent(pregenIdentifier)}&pregenIdentifierType=${encodeURIComponent(pregenIdentifierType)}`,
    );
    return res.data;
  };

  // POST /wallets/pregen/claim
  claimPregenWallet = async (body?: claimPreGenWalletBody): Promise<void> => {
    await this.baseRequest.post<WalletEntity>(`/wallets/pregen/claim`, body);
  };

  // POST /users/:userId/wallets/:walletId/transactions/send
  sendTransaction = async (userId: string, walletId: string, body: sendTransactionBody): Promise<any> => {
    const res = await this.baseRequest.post<any>(`/users/${userId}/wallets/${walletId}/transactions/send`, body);
    return res;
  };

  // functionality changed to only sign transactions and not send them
  // POST /users/:userId/wallets/:walletId/transactions/sign
  signTransaction = async (userId: string, walletId: string, body: signTransactionBody): Promise<any> => {
    const res = await this.baseRequest.post<any>(`/users/${userId}/wallets/${walletId}/transactions/sign`, body);
    return res;
  };

  // POST /users/:userId/wallets/:walletId/refresh
  refreshKeys = async (userId: string, walletId: string): Promise<any> => {
    const res = await this.baseRequest.post<any>(`/users/${userId}/wallets/${walletId}/refresh`);
    return res;
  };

  // PATCH /wallets/pregen/:walletId
  updatePregenWallet = async (walletId: string, body: updatePregenWalletBody): Promise<any> => {
    const res = await this.baseRequest.patch<any>(`wallets/pregen/${walletId}`, body);
    return res.data;
  };

  // GET /users/:userId/wallets
  getWallets = async (userId: string): Promise<AxiosResponse<getWalletsRes, any>> => {
    const res = await this.baseRequest.get<getWalletsRes>(`/users/${userId}/wallets`);
    return res;
  };

  // POST /login
  login = async (props: { email: string } & VerificationEmailProps): Promise<any> => {
    const body = props;

    const res = await this.baseRequest.post<any>('/login', body);
    return res;
  };

  // POST /login
  verifyLogin = async (verificationCode: string): Promise<any> => {
    const body = { verificationCode };
    const res = await this.baseRequest.post<any>('/login/verify-email', body);
    return res;
  };

  // GET /logout
  logout = async (): Promise<any> => {
    const res = await this.baseRequest.get<any>('/logout');
    return res;
  };

  // POST /recovery/verification
  recoveryVerification = async (email: string, verificationCode: string): Promise<any> => {
    const body = { email, verificationCode };
    const res = await this.baseRequest.post<any>('/recovery/verification', body);
    return res;
  };

  // POST /recovery
  recoveryInit = async (email: string): Promise<any> => {
    const body = { email };
    const res = await this.baseRequest.post<any>('/recovery', body);
    return res;
  };

  preSignMessage = async (userId: string, walletId: string, message: string, scheme?: SignatureScheme): Promise<any> => {
    const body = { message, scheme };
    const res = await this.baseRequest.post<any>(`/users/${userId}/wallets/${walletId}/messages/sign`, body);
    return res.data;
  };

  //DELETE /users/:userId
  deleteSelf = async (userId: string): Promise<any> => {
    const res = await this.baseRequest.delete<any>(`/users/${userId}`);
    return res;
  };

  // DEPRECATED: use uploadUserKeyShares instead
  // POST /users/:userId/wallets/:walletId/key-shares
  async uploadKeyshares(userId: string, walletId: string, encryptedKeyshares: encryptedKeyshare[]): Promise<any> {
    const body = { keyShares: encryptedKeyshares };
    const res = await this.baseRequest.post<any>(`/users/${userId}/wallets/${walletId}/key-shares`, body);
    return res;
  }

  // POST /users/:userId/wallets/:walletId/key-shares
  async uploadUserKeyShares(userId: string, encryptedKeyshares: (encryptedKeyshare & { walletId: string })[]): Promise<any> {
    const body = { keyShares: encryptedKeyshares };
    const res = await this.baseRequest.post<any>(`/users/${userId}/key-shares`, body);
    return res;
  }

  // GET /users/:userId/wallets/:walletId/key-shares
  async getKeyshare(
    userId: string,
    walletId: string,
    type: (typeof KeyType)[keyof typeof KeyType],
    encryptor?: (typeof EncryptorType)[keyof typeof EncryptorType],
  ): Promise<any> {
    const res = await this.baseRequest.get<any>(
      `/users/${userId}/wallets/${walletId}/key-shares?type=${type}${encryptor ? `&encryptor=${encryptor}` : ''}`,
    );
    return res;
  }

  // GET /users/:userId/biometrics/key-shares
  async getBiometricKeyshares(userId: string, biometricPublicKey: string): Promise<any> {
    const res = await this.baseRequest.get<any>(`/users/${userId}/biometrics/key-shares?publicKey=${biometricPublicKey}`);
    return res;
  }

  // POST '/users/:userId/temporary-shares',
  async uploadTransmissionKeyshares(
    userId: string,
    shares: { walletId: string; encryptedShare: string; encryptedKey?: string; sessionLookupId: string }[],
  ): Promise<any> {
    const body = { shares };
    const res = await this.baseRequest.post<any>(`/users/${userId}/temporary-shares`, body);
    return res;
  }

  // GET /users/:userId/temporary-shares returns { temporaryShares: { userId: string, walletId: string, encryptedShare: string, encryptedKey?: string }[] }
  async getTransmissionKeyshares(userId: string, sessionLookupId: string): Promise<any> {
    const res = await this.baseRequest.get<any>(`/users/${userId}/temporary-shares?sessionLookupId=${sessionLookupId}`);
    return res;
  }

  // GET /users/:userId/wallets/:walletId/capsule-share
  getCapsuleShare = async (userId: string, walletId: string): Promise<string> => {
    const res = await this.baseRequest.get<GetCapsuleShareRes>(`/users/${userId}/wallets/${walletId}/capsule-share`);
    return res.data.share;
  };

  // GET /download-backup-kit/:userId
  getBackupKit = async (userId: string): Promise<any> => {
    const res = await this.baseRequest.get<Blob>(`/download-backup-kit/${userId}`, { responseType: 'blob' });
    return res;
  };

  // POST '/users/:userId/resend-verification-code
  async resendVerificationCode({ userId, ...rest }: { userId: string } & VerificationEmailProps) {
    const res = await this.baseRequest.post<any>(`/users/${userId}/resend-verification-code`, rest);
    return res;
  }

  // POST '/users/:userId/resend-verification-code-by-phone
  async resendVerificationCodeByPhone({ userId, ...rest }: { userId: string } & VerificationEmailProps) {
    const res = await this.baseRequest.post<any>(`/users/${userId}/resend-verification-code-by-phone`, rest);
    return res;
  }

  // POST recovery/cancel
  async cancelRecoveryAttempt(email: string) {
    const res = await this.baseRequest.post<any>(`recovery/cancel`, { email });
    return res;
  }

  // GET '/2fa/users/:userId/check-status'
  async check2FAStatus(userId: string) {
    const res = await this.baseRequest.get<any>(`/2fa/users/${userId}/check-status`);
    return res;
  }

  // POST '/2fa/users/:userId/enable'
  async enable2FA(userId: string, verificationCode: string) {
    const res = await this.baseRequest.post<any>(`/2fa/users/${userId}/enable`, { verificationCode });
    return res;
  }

  // POST '/2fa/users/:userId/setup'
  async setup2FA(userId: string) {
    const res = await this.baseRequest.post<any>(`/2fa/users/${userId}/setup`);
    return res;
  }

  // POST /recovery/init
  async initializeRecovery(email: string) {
    const res = await this.baseRequest.post<any>(`/recovery/init`, { email });
    return res;
  }

  // POST /auth/farcaster/init
  async initializeFarcasterLogin() {
    const res = await this.baseRequest.post<any>(`/auth/farcaster/init`);
    return res;
  }

  // POST /auth/farcaster/status
  async getFarcasterAuthStatus() {
    const res = await this.baseRequest.post<any>(`/auth/farcaster/status`);
    return res;
  }

  // POST /recovery/init
  async initializeRecoveryForPhone(phone: string, countryCode: string) {
    const res = await this.baseRequest.post<any>(`/recovery/init`, { phone, countryCode });
    return res;
  }

  // POST /recovery/users/:userId/wallets/:walletId/finish
  async finalizeRecovery(userId: string, walletId: string) {
    const res = await this.baseRequest.post<any>(`/recovery/users/${userId}/wallets/${walletId}/finish`);
    return res;
  }

  // GET /recovery/users/:userId/wallets/:walletId/key-shares
  async recoverUserShares(userId: string, walletId: string) {
    const res = await this.baseRequest.get<any>(
      `/recovery/users/${userId}/wallets/${walletId}/key-shares?type=USER&encryptor=RECOVERY`,
    );
    return res;
  }

  // POST /recovery/verify-email
  async verifyEmailForRecovery(email: string, verificationCode: string) {
    const body = { email, verificationCode };
    const res = await this.baseRequest.post<any>(`/recovery/verify-email`, body);
    return res;
  }

  // POST /recovery/verify-identifier
  async verifyPhoneForRecovery(phone: string, countryCode: string, verificationCode: string) {
    const body = { phone, countryCode, verificationCode };
    const res = await this.baseRequest.post<any>(`/recovery/verify-identifier`, body);
    return res;
  }

  // POST /2fa/verify
  async verify2FA(email: string, verificationCode: string) {
    const body = { email, verificationCode };
    const res = await this.baseRequest.post<any>('/2fa/verify', body);
    return res;
  }

  // POST /2fa/phone/verify
  async verify2FAForPhone(phone: string, countryCode: string, verificationCode: string) {
    const body = { phone, countryCode, verificationCode };
    const res = await this.baseRequest.post<any>('/2fa/verify', body);
    return res;
  }

  async tempTrasmissionInit(message: string, userId?: string) {
    const body = { message, userId };
    const res = await this.baseRequest.post<any>('/temporary-transmissions', body);
    return res;
  }

  async tempTrasmission(id: string) {
    const res = await this.baseRequest.get<any>(`/temporary-transmissions/${id}`);
    return res;
  }

  async getPartner(partnerId: string) {
    const res = await this.baseRequest.get<any>(`/partners/${partnerId}`);
    return res;
  }

  async acceptScopes(userId: string, body: AcceptScopesBody) {
    const res = await this.baseRequest.post<any>(`/users/${userId}/scopes/accept`, body);
    return res;
  }

  async getPendingTransaction(userId: string, pendingTransactionid: string) {
    const res = await this.baseRequest.get<any>(`/users/${userId}/pending-transactions/${pendingTransactionid}`);
    return res;
  }

  async acceptPendingTransaction(userId: string, pendingTransactionId: string) {
    const res = await this.baseRequest.post<any>(`/users/${userId}/pending-transactions/${pendingTransactionId}/accept`);
    return res;
  }

  async getPolicyPermissions(userId: string, policyId: string) {
    const res = await this.baseRequest.get<any>(`/users/${userId}/policies/${policyId}/permissions`);
    return res;
  }

  async createOnRampPurchase(
    userId: string,
    walletId: string,
    provider: OnRampProvider,
    network: Network,
    asset: OnRampAsset,
    testMode = false,
  ) {
    const res = await this.baseRequest.post<OnRampPurchase>(`/users/${userId}/wallets/${walletId}/purchases`, {
      provider,
      network,
      asset,
      testMode,
    });
    return res;
  }

  async updateOnRampPurchase(
    userId: string,
    walletId: string,
    purchaseId: string,
    updates: Partial<Pick<OnRampPurchase, 'status' | 'fiatCurrency' | 'fiatQuantity' | 'providerKey'>>,
  ) {
    const res = await this.baseRequest.patch<OnRampPurchase>(
      `/users/${userId}/wallets/${walletId}/purchases/${purchaseId}`,
      updates,
    );
    return res;
  }

  async getOnRampPurchase(userId: string, walletId: string, purchaseId: string) {
    const res = await this.baseRequest.get<OnRampPurchase>(`/users/${userId}/wallets/${walletId}/purchases/${purchaseId}`);
    return res;
  }

  async distributeCapsuleShare({
    userId,
    walletId,
    ...rest
  }: { userId: string; walletId: string; useDKLS: boolean } & BackupKitEmailProps) {
    const body = rest;
    const res = await this.baseRequest.post<any>(`/users/${userId}/wallets/${walletId}/capsule-share/distribute`, body);
    return res;
  }

  async keepSessionAlive(userId: string) {
    const res = await this.baseRequest.post<any>(`/users/${userId}/session/keep-alive`);
    return res.data;
  }

  async persistRecoveryPublicKeys(
    userId: string,
    publicKeys: string[],
  ): Promise<{ recoveryPublicKeys: { id: string; publicKey: string }[] }> {
    const res = await this.baseRequest.post<any>(`/users/${userId}/recovery-public-keys`, { publicKeys });
    return res.data;
  }

  async getRecoveryPublicKeys(userId: string): Promise<{ recoveryPublicKeys: { id: string; publicKey: string }[] }> {
    const res = await this.baseRequest.get<any>(`/users/${userId}/recovery-public-keys`);
    return res.data;
  }

  async uploadEncryptedWalletPrivateKey(
    userId: string,
    encryptedWalletPrivateKey: string,
    encryptionKeyHash: string,
    biometricPublicKey: string,
  ) {
    const body = { encryptedWalletPrivateKey, encryptionKeyHash, biometricPublicKey };
    const res = await this.baseRequest.post<any>(`/users/${userId}/encrypted-wallet-private-keys`, body);
    return res.data;
  }

  async getEncryptedWalletPrivateKeys(userId: string, encryptionKeyHash: string) {
    const res = await this.baseRequest.get<any>(`/users/${userId}/encrypted-wallet-private-keys/${encryptionKeyHash}`);
    return res.data;
  }
}

export default Client;

// GET /users/:userId/wallets/:walletId/send (NOTE: endpoint not found in server)

// NOT USED IN DEMO

// POST /users/:userId/wallets/:walletId/presign
// POST /users/:userId/wallets/:walletId/presign-online
// POST /auth/signup/web
// GET /logout
// POST /users/:userId/wallets/:walletId/key
// GET /users/:userId/wallets/:walletId/key
// GET /users/:userId/configurations
// POST /users/:userId/permissions
// GET /
