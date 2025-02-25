import axios, {
  AxiosInstance,
  AxiosRequestHeaders,
  AxiosResponse,
  AxiosResponseHeaders,
  InternalAxiosRequestConfig,
} from 'axios';
import { AxiosRequestConfig } from 'axios';
import qs from 'qs';
import {
  Auth,
  AuthMethod,
  AuthParams,
  BackupKitEmailProps,
  BiometricLocationHint,
  Chain,
  CurrentWalletIds,
  EncryptedKeyShare,
  EncryptorType,
  KeyShareType,
  Network,
  OnRampAsset,
  OnRampConfig,
  OnRampProvider,
  OnRampPurchase,
  OnRampPurchaseCreateParams,
  OnRampPurchaseUpdateParams,
  PasswordStatus,
  PregenIds,
  PublicKeyStatus,
  PublicKeyType,
  TelegramAuthResponse,
  TPregenIdentifierType,
  VerificationEmailProps,
  WalletEntity,
  WalletParams,
  WalletScheme,
  WalletType,
} from './types/index.js';
import { extractWalletRef } from './utils.js';
import { SESSION_COOKIE_HEADER_NAME, VERSION_HEADER_NAME, PARTNER_ID_HEADER_NAME, API_KEY_HEADER_NAME } from './consts.js';
import { ParaApiError } from './error.js';

interface ConfigOpts {
  useFetchAdapter?: boolean;
}

type ClientConfig = {
  userManagementHost: string;
  version?: string;
  partnerId?: string;
  apiKey: string;
  opts?: ConfigOpts;
  retrieveSessionCookie?: () => string | undefined;
  persistSessionCookie?: (cookie: string) => void;
};

interface createUserBody {
  email: string;
}

interface createUserBodyForPhone {
  phone: string;
  countryCode: string;
}

interface ExternalWalletLoginBody {
  externalAddress: string;
  type: 'EVM' | 'SOLANA' | 'COSMOS';
  externalWalletProvider?: string;
}

interface ExternalWalletLoginRes {
  userId: string;
}

interface createUserIdRes {
  protocolId: string;
  userId: string;
}

interface verifyBody {
  verificationCode: string;
}

interface getWebChallengeRes {
  challenge: string;
  allowedPublicKeys?: string[];
}

interface GetParaShareRes {
  share: string;
}

interface sessionPublicKeyBody {
  publicKey?: string; // only not included when status is PENDING
  sigDerivedPublicKey?: string; // only include for type 'WEB'
  status?: PublicKeyStatus;
  type?: PublicKeyType;
  cosePublicKey?: string;
  clientDataJSON?: string;
  aaguid?: string;
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

type verifyWebChallengeBody = {
  sessionLookupId?: string;
  signature: WebSignature;
  publicKey: string;
  newDeviceSessionLookupId?: string;
};

type verifyPasswordChallengeBody = {
  sessionLookupId?: string;
  signature: string;
  publicKey: string;
  newDeviceSessionLookupId?: string;
};

interface verifySessionChallengeBody {
  signature: MobileSignature | WebSignature;
  publicKey?: string;
}

interface verifySessionChallengeRes {
  sessionChallenge: string;
}
interface GetWalletsRes {
  wallets: WalletEntity[];
}

interface PasswordEntity {
  id: string;
  userId: string;
  status: PasswordStatus;
  sigDerivedPublicKey: string;
  salt: string;
}

interface createWalletBody {
  useTwoSigners?: boolean;
  scheme: WalletScheme;
  type: WalletType;
  cosmosPrefix?: string;
}

interface updatePregenWalletBody {
  pregenIdentifier: string;
  pregenIdentifierType: TPregenIdentifierType;
}

interface createWalletRes {
  protocolId: string;
  walletId: string;
}

interface createPregenWalletBody {
  pregenIdentifier: string;
  pregenIdentifierType: TPregenIdentifierType;
  scheme?: WalletScheme;
  type: WalletType;
  cosmosPrefix?: string;
}

interface claimPreGenWalletsBody {
  userId: string;
  walletIds: string[];
}

interface signTransactionBody {
  transaction: string;
  chainId: string;
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

interface sessionPasswordBody {
  status?: PasswordStatus;
  sigDerivedPublicKey?: string;
  salt?: string;
}

type BiometricLocationHintParams = AuthParams;

export type VerifyTelegramRes =
  | {
      isValid: true;
      userId: string;
      telegramUserId: string;
      isNewUser: boolean;
      biometricHints?: BiometricLocationHint[];
      supportedAuthMethods: AuthMethod[];
    }
  | {
      isValid: false;
    };

export const handleResponseSuccess = (response: AxiosResponse<any, any>) => {
  if (response.status === 200) {
    return response;
  }
  throw new ParaApiError('Invalid status code');
};

export const handleResponseError = (error: any) => {
  if (error === null) throw new ParaApiError('Error is null');
  if (axios.isAxiosError(error)) {
    let message = error.response?.data ?? 'Unknown error';

    // Add meaningful messages to connection errors
    // Can do this for other Axios codes as well in the future if we need: https://github.com/axios/axios/blob/v1.x/lib/core/AxiosError.js#L61
    if (error.code === 'ERR_NETWORK') {
      message = 'Connection error';
    } else if (error.code === 'ERR_CANCELED') {
      message = 'Connection canceled';
    }
    throw new ParaApiError(message, error.code, error.response.status, error.request?.responseURL);
  }
  throw new ParaApiError('Unknown error');
};

class Client {
  private baseRequest: AxiosInstance;
  constructor({
    userManagementHost,
    apiKey,
    partnerId,
    version,
    opts,
    retrieveSessionCookie,
    persistSessionCookie,
  }: ClientConfig) {
    // TODO remove after this is not optional anymore
    const headers = {
      ...(apiKey && { [API_KEY_HEADER_NAME]: apiKey }),
      ...(partnerId && { [PARTNER_ID_HEADER_NAME]: partnerId }),
    };
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

          if (version) {
            headers[VERSION_HEADER_NAME] = version;
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

    // Intercept response to add more concise errors rather than returning the entire AxiosError
    this.baseRequest.interceptors.response.use(handleResponseSuccess, handleResponseError);
  }

  createUser = async (
    body: (createUserBody | createUserBodyForPhone) & VerificationEmailProps,
  ): Promise<createUserIdRes> => {
    const res = await this.baseRequest.post<createUserIdRes>(`/users`, body);
    return res.data;
  };

  checkUserExists = async (auth: Auth<'email' | 'phone'>): Promise<any> => {
    const res = await this.baseRequest.get<any>('/users/exists', {
      params: { ...auth },
    });
    return res;
  };

  verifyTelegram = async (authObject: TelegramAuthResponse): Promise<VerifyTelegramRes> => {
    return (
      await this.baseRequest.post<VerifyTelegramRes>('/users/telegram', {
        authObject,
      })
    ).data;
  };

  externalWalletLogin = async (body: ExternalWalletLoginBody): Promise<ExternalWalletLoginRes> => {
    const res = await this.baseRequest.post<createUserIdRes>(`/users/external-wallets/login`, body);
    return res.data;
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

  // GET /biometrics/location-hints
  getBiometricLocationHints = async (params: BiometricLocationHintParams): Promise<BiometricLocationHint[]> => {
    const res = await this.baseRequest.get<{ hints: BiometricLocationHint[] }>(`/biometrics/location-hints`, { params });
    return res.data.hints;
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
        [PARTNER_ID_HEADER_NAME]: partnerId,
      },
    });
    return res;
  };

  // GET /biometrics/challenge?email&publicKey
  getWebChallenge = async (auth?: Auth): Promise<getWebChallengeRes> => {
    const res = await this.baseRequest.get<any>('/biometrics/challenge', {
      params: { ...(auth || {}) },
    });

    return res.data;
  };

  // POST /touch
  touchSession = async (regenerate?: boolean): Promise<any> => {
    const res = await this.baseRequest.post<{ userId?: string; sessionLookupId: string; biometricVerifiedAt?: number }>(
      `/touch?regenerate=${!!regenerate}`,
    );
    return res;
  };

  // GET /session/origin
  sessionOrigin = async (sessionLookupId: string): Promise<{ origin?: string }> => {
    const res = await this.baseRequest.get<{ origin?: string }>(`/sessions/${sessionLookupId}/origin`);
    return res.data;
  };

  // POST /biometrics/verify
  verifyWebChallenge = async (partnerId: string, body: verifyWebChallengeBody): Promise<any> => {
    const res = await this.baseRequest.post<{}>(`/biometrics/verify`, body, {
      headers: {
        [PARTNER_ID_HEADER_NAME]: partnerId,
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
  createPregenWallet = async (body?: createPregenWalletBody): Promise<createWalletRes> => {
    const res = await this.baseRequest.post<createWalletRes>(`/wallets/pregen`, body);
    return res.data;
  };

  // GET /wallets/pregen?pregenIdentifier={pregenIdentifier}&pregenIdentifierType={pregenIdentifierType}
  getPregenWallets = async <ReturnType = { wallets: WalletEntity[] }>(
    pregenIds: PregenIds,
    isPortal = false,
    userId?: string,
  ): Promise<ReturnType> => {
    const res = await this.baseRequest.get<ReturnType>('/wallets/pregen', {
      params: { ids: pregenIds, expand: isPortal, userId },
    });

    return res.data;
  };

  // POST /wallets/pregen/claim
  claimPregenWallets = async <ReturnType = { walletIds?: string[] }>(body?: claimPreGenWalletsBody): Promise<ReturnType> => {
    const res = await this.baseRequest.post<ReturnType>(`/wallets/pregen/claim`, body);

    return res.data;
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
  refreshKeys = async (
    userId: string,
    walletId: string,
    oldPartnerId?: string,
    newPartnerId?: string,
    keyShareProtocolId?: string,
  ): Promise<any> => {
    const body = { oldPartnerId, newPartnerId, keyShareProtocolId };
    const res = await this.baseRequest.post<any>(`/users/${userId}/wallets/${walletId}/refresh`, body);
    return res;
  };

  // PATCH /wallets/pregen/:walletId
  updatePregenWallet = async (walletId: string, body: updatePregenWalletBody): Promise<any> => {
    const res = await this.baseRequest.patch<any>(`/wallets/pregen/${walletId}`, body);
    return res.data;
  };

  // GET /users/:userId/wallets
  getWallets = async (userId: string, includePartnerData?: boolean): Promise<AxiosResponse<GetWalletsRes, any>> => {
    const res = await this.baseRequest.get<GetWalletsRes>(
      `/users/${userId}/wallets${includePartnerData ? `?includePartnerData=${encodeURIComponent(includePartnerData)}` : ''}`,
    );
    return res;
  };

  // GET /users/:userId/all-wallets
  getAllWallets = async (userId: string): Promise<AxiosResponse<GetWalletsRes, any>> => {
    const res = await this.baseRequest.get<GetWalletsRes>(`/users/${userId}/all-wallets`);
    return res;
  };

  // POST /users/:userId/wallets/set
  setCurrentWalletIds = async (
    userId: string,
    walletIds: CurrentWalletIds,
    needsWallet = false,
    sessionLookupId?: string,
    newDeviceSessionLookupId?: string,
  ): Promise<any> => {
    const res = await this.baseRequest.post<any>(`/users/${userId}/wallets/set`, {
      walletIds,
      needsWallet,
      sessionLookupId,
      newDeviceSessionLookupId,
    });
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

  preSignMessage = async (
    userId: string,
    walletId: string,
    message: string,
    scheme?: WalletScheme,
    cosmosSignDoc?: string,
  ): Promise<any> => {
    const body = { message, scheme, cosmosSignDoc };
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
  async uploadKeyshares(userId: string, walletId: string, encryptedKeyshares: EncryptedKeyShare[]): Promise<any> {
    const body = { keyShares: encryptedKeyshares };
    const res = await this.baseRequest.post<any>(`/users/${userId}/wallets/${walletId}/key-shares`, body);
    return res;
  }

  // POST /users/:userId/key-shares
  async uploadUserKeyShares(userId: string, encryptedKeyshares: (EncryptedKeyShare & { walletId: string })[]): Promise<any> {
    const body = { keyShares: encryptedKeyshares };
    const res = await this.baseRequest.post<any>(`/users/${userId}/key-shares`, body);
    return res;
  }

  // GET /users/:userId/wallets/:walletId/key-shares
  async getKeyshare(userId: string, walletId: string, type: KeyShareType, encryptor?: EncryptorType): Promise<any> {
    const res = await this.baseRequest.get<any>(
      `/users/${userId}/wallets/${walletId}/key-shares?type=${type}${encryptor ? `&encryptor=${encryptor}` : ''}`,
    );
    return res;
  }

  // GET /users/:userId/biometrics/key-shares
  async getBiometricKeyshares(userId: string, biometricPublicKey: string, getAll?: boolean): Promise<any> {
    const res = await this.baseRequest.get<any>(
      `/users/${userId}/biometrics/key-shares?publicKey=${biometricPublicKey}&all=${!!getAll}`,
    );
    return res;
  }

  // GET /users/:userId/key-shares
  async getPasswordKeyshares(userId: string, passwordId: string, getAll?: boolean): Promise<any> {
    const res = await this.baseRequest.get<any>(
      `/users/${userId}/passwords/key-shares?passwordId=${passwordId}&all=${!!getAll}`,
    );
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
  getParaShare = async (userId: string, walletId: string): Promise<string> => {
    const res = await this.baseRequest.get<GetParaShareRes>(`/users/${userId}/wallets/${walletId}/capsule-share`);
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
    const res = await this.baseRequest.post<any>(`/recovery/cancel`, { email });
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
    const res = await this.baseRequest.get<{
      keyShare: { encryptedShare: string; encryptedKey?: string; type: string; walletId: string };
      keyShares: { encryptedShare: string; encryptedKey?: string; type: string; walletId: string }[];
    }>(`/recovery/users/${userId}/wallets/${walletId}/key-shares?type=USER&encryptor=RECOVERY`);
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

  async acceptScopes(userId: string, walletId: string, body: AcceptScopesBody) {
    const res = await this.baseRequest.post<any>(`/users/${userId}/wallets/${walletId}/scopes/accept`, body);
    return res;
  }

  async getPendingTransaction(userId: string, pendingTransactionId: string) {
    const res = await this.baseRequest.get<any>(`/users/${userId}/pending-transactions/${pendingTransactionId}`);
    return res;
  }

  async acceptPendingTransaction(userId: string, pendingTransactionId: string) {
    const res = await this.baseRequest.post<any>(`/users/${userId}/pending-transactions/${pendingTransactionId}/accept`);
    return res;
  }

  async getOnRampConfig() {
    const res = await this.baseRequest.get<OnRampConfig>(`/on-ramp-config`);
    return res.data;
  }

  async createOnRampPurchase({
    userId,
    params: {
      type,
      walletType,
      address,
      provider,
      networks,
      assets,
      defaultNetwork,
      defaultAsset,
      fiat,
      fiatQuantity,
      testMode = false,
    },
    ...params
  }: {
    userId: string;
    params: OnRampPurchaseCreateParams;
  } & WalletParams): Promise<OnRampPurchase> {
    const [key, identifier] = extractWalletRef(params);
    const walletString = key === 'walletId' ? `wallets/${identifier}` : `external-wallets/${identifier}`;

    const res = await this.baseRequest.post<OnRampPurchase>(`/users/${userId}/${walletString}/purchases`, {
      type,
      provider,
      walletType,
      address,
      networks,
      assets,
      defaultAsset,
      defaultNetwork,
      fiat,
      fiatQuantity,
      testMode,
    });

    return res.data;
  }

  async updateOnRampPurchase({
    userId,
    purchaseId,
    updates,
    ...params
  }: {
    userId: string;
    purchaseId: string;
    updates: OnRampPurchaseUpdateParams;
  } & WalletParams): Promise<OnRampPurchase> {
    const [key, identifier] = extractWalletRef(params);
    const walletString = key === 'walletId' ? `wallets/${identifier}` : `external-wallets/${identifier}`;

    const res = await this.baseRequest.patch<OnRampPurchase>(
      `/users/${userId}/${walletString}/purchases/${purchaseId}`,
      updates,
    );
    return res.data;
  }

  async getOnRampPurchase({
    userId,
    purchaseId,
    ...params
  }: {
    userId: string;
    purchaseId: string;
  } & WalletParams) {
    const [key, identifier] = extractWalletRef(params);
    const walletString = key === 'walletId' ? `wallets/${identifier}` : `external-wallets/${identifier}`;

    const res = await this.baseRequest.get<OnRampPurchase>(`/users/${userId}/${walletString}/purchases/${purchaseId}`);
    return res;
  }

  async signMoonPayUrl(
    userId: string,
    {
      url,
      type,
      cosmosPrefix,
      testMode,
      walletId,
      externalWalletAddress,
    }: {
      url: string;
      type: WalletType;
      cosmosPrefix: string;
      testMode?: boolean;
      walletId?: string;
      externalWalletAddress?: string;
    },
  ) {
    const walletString = walletId ? `wallets/${walletId}` : `external-wallets/${externalWalletAddress}`;

    const res = await this.baseRequest.post<{ signature: string }>(`/users/${userId}/${walletString}/moonpay-sign`, {
      url,
      type,
      cosmosPrefix,
      testMode,
    });
    return res;
  }

  async generateOffRampTx<ReturnType = { tx: string; asset: OnRampAsset; network: Network }>(
    userId: string,
    {
      provider,
      chainId,
      contractAddress,
      testMode,
      walletId,
      walletType,
      destinationAddress,
      sourceAddress,
      assetQuantity,
    }: {
      provider: OnRampProvider;
      chainId: string;
      contractAddress?: string;
      testMode?: boolean;
      walletId: string;
      walletType: WalletType;
      destinationAddress: string;
      sourceAddress?: string;
      assetQuantity: string | number;
    },
  ): Promise<ReturnType> {
    const res = await this.baseRequest.post<ReturnType>(`/users/${userId}/wallets/${walletId}/offramp-generate`, {
      provider,
      testMode,
      chainId,
      contractAddress,
      walletId,
      walletType,
      destinationAddress,
      sourceAddress,
      assetQuantity,
    });

    return res.data;
  }

  async sendOffRampTx<ReturnType = { txHash: string }>(
    userId: string,
    {
      tx,
      signature,
      network,
      walletId,
      walletType,
    }: {
      tx: string;
      signature: string;
      network: Network;
      walletId: string;
      walletType: WalletType;
    },
  ): Promise<ReturnType> {
    const res = await this.baseRequest.post<ReturnType>(`/users/${userId}/wallets/${walletId}/offramp-send`, {
      tx,
      signature,
      network,
      walletType,
    });

    return res.data;
  }

  async distributeParaShare({
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
    biometricPublicKey?: string,
    passwordId?: string,
  ) {
    const body = { encryptedWalletPrivateKey, encryptionKeyHash, biometricPublicKey, passwordId };
    const res = await this.baseRequest.post<any>(`/users/${userId}/encrypted-wallet-private-keys`, body);
    return res.data;
  }

  async getEncryptedWalletPrivateKeys(userId: string, encryptionKeyHash: string) {
    const res = await this.baseRequest.get<any>(`/users/${userId}/encrypted-wallet-private-keys/${encryptionKeyHash}`);
    return res.data;
  }

  async getConversionRate(chainId: string, symbol: string, currency: string) {
    const params = { symbol, currency };
    const res = await this.baseRequest.get<any>(`/chains/${chainId}/conversion-rate`, { params });
    return res.data;
  }

  async getGasEstimate(chainId: string, totalGasPrice: string) {
    const params = { totalGasPrice };
    const res = await this.baseRequest.get<any>(`/chains/${chainId}/gas-estimate`, { params });
    return res.data;
  }

  async getGasOracle(chainId: string) {
    const res = await this.baseRequest.get<any>(`/chains/${chainId}/gas-oracle`);
    return res.data;
  }

  // GET /users/:userId/wallets/:walletId/refresh-done
  async isRefreshDone(userId: string, walletId: string, partnerId?: string, protocolId?: string): Promise<{ isDone: true }> {
    const queryParams = {};
    if (partnerId) queryParams['partnerId'] = partnerId;
    if (protocolId) queryParams['protocolId'] = protocolId;
    const query = qs.stringify(queryParams);

    const res = await this.baseRequest.get<any>(`/users/${userId}/wallets/${walletId}/refresh-done?${query}`);
    return res.data;
  }

  async deletePendingTransaction(userId: string, pendingTransactionId: string) {
    const res = await this.baseRequest.delete<any>(`/users/${userId}/pending-transactions/${pendingTransactionId}`);
    return res.data;
  }

  // POST /users/:userId/passwords/key
  async addSessionPasswordPublicKey(userId: string, body: sessionPasswordBody): Promise<any> {
    const res = await this.baseRequest.post<any>(`/users/${userId}/passwords/key`, body);
    return res;
  }

  // PATCH /users/:userId/biometrics/:biometricId
  patchSessionPassword = async (
    partnerId: string,
    userId: string,
    passwordId: string,
    body: sessionPasswordBody,
  ): Promise<any> => {
    const res = await this.baseRequest.patch<any>(`/users/${userId}/passwords/${passwordId}`, body, {
      headers: {
        [PARTNER_ID_HEADER_NAME]: partnerId,
      },
    });
    return res;
  };

  async getSupportedAuthMethods(auth: Auth) {
    const res = await this.baseRequest.get<any>('/users/supported-auth-methods', {
      params: { ...auth },
    });
    return res.data;
  }

  async getPasswords(auth: Auth): Promise<PasswordEntity[]> {
    const res = await this.baseRequest.get<any>('/users/passwords', {
      params: { ...auth },
    });
    return res.data.passwords;
  }

  // POST /passwords/verify
  async verifyPasswordChallenge(partnerId: string, body: verifyPasswordChallengeBody): Promise<any> {
    const res = await this.baseRequest.post<{}>(`/passwords/verify`, body, {
      headers: {
        [PARTNER_ID_HEADER_NAME]: partnerId,
      },
    });
    return res;
  }

  async getEncryptedWalletPrivateKey(passwordId: string): Promise<any> {
    const queryParams = {};
    queryParams['passwordId'] = passwordId;
    const query = qs.stringify(queryParams);
    const res = await this.baseRequest.get<any>(`/encrypted-wallet-private-keys?${query}`);
    return res;
  }

  // GET /users/:userId
  async getUser(userId: string): Promise<any> {
    const res = await this.baseRequest.get<any>(`/users/${userId}`);
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
// GET /
