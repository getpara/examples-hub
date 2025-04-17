import { ParaCore } from './ParaCore.js';

export {
  type AuthInfo,
  type PrimaryAuthInfo,
  type VerifiedAuthInfo,
  AuthMethod,
  type AuthExtras,
  type CurrentWalletIds,
  EmailTheme,
  type PartnerEntity,
  type WalletEntity,
  Network,
  type TWalletType,
  type TWalletScheme,
  OnRampAsset,
  OnRampPurchaseType,
  OnRampProvider,
  OnRampPurchaseStatus,
  type OnRampConfig,
  type OnRampAllowedAssets,
  type OnRampPurchase,
  type TOAuthMethod,
  type SupportedWalletTypes,
  type TPregenIdentifierType,
  type PregenIds,
  NON_ED25519,
  PREGEN_IDENTIFIER_TYPES,
  WALLET_TYPES,
  WALLET_SCHEMES,
  OAUTH_METHODS,
} from '@getpara/user-management-client';
export {
  OnRampMethod,
  PopupType,
  PregenIdentifierType,
  RecoveryStatus,
  type AuthStateSignup,
  type AuthStateVerify,
  type AuthStateLogin,
  type AuthState,
  type OAuthResponse,
  type CoreAuthInfo,
  type ProviderAssetInfo,
  type SignatureRes,
  type FullSignatureRes,
  type SuccessfulSignatureRes,
  type DeniedSignatureRes,
  type DeniedSignatureResWithUrl,
  type OnRampAssetInfo,
  type Theme,
  type Wallet,
  type GetWalletBalanceParams,
} from './types/index.js';
export * from './types/coreApi.js';
export * from './types/events.js';
export * from './types/config.js';
export { getPortalDomain, entityToWallet, constructUrl, shortenUrl } from './utils/index.js';
export { PREFIX as STORAGE_PREFIX } from './constants.js';
export { distributeNewShare } from './shares/shareDistribution.js';
export { KeyContainer } from './shares/KeyContainer.js';
export type { PlatformUtils } from './PlatformUtils.js';
export type { StorageUtils } from './StorageUtils.js';
export { getBaseUrl, initClient } from './external/userManagementClient.js';
export * as mpcComputationClient from './external/mpcComputationClient.js';
export {
  decryptWithKeyPair,
  decryptWithPrivateKey,
  getAsymmetricKeyPair,
  getPublicKeyHex,
  encryptWithDerivedPublicKey,
  encodePrivateKeyToPemHex,
  getDerivedPrivateKeyAndDecrypt,
  getPublicKeyFromSignature,
  getSHA256HashHex,
  encryptPrivateKey,
  decryptPrivateKey,
  decryptPrivateKeyAndDecryptShare,
  hashPasswordWithSalt,
  encryptPrivateKeyWithPassword,
  decryptPrivateKeyWithPassword,
  publicKeyFromHex,
} from './cryptography/utils.js';
export * from './external/userManagementClient.js';
export * from './errors.js';
export * from './utils/formatting.js';
export * from './utils/polling.js';
export * from './utils/phone.js';
export { isWalletSupported } from './utils/wallet.js';
export { getNetworkPrefix, getOnRampAssets, getOnRampNetworks, toAssetInfoArray } from './utils/onRamps.js';
export { getPortalBaseURL } from './utils/url.js';
export { retrieve as transmissionUtilsRetrieve } from './transmission/transmissionUtils.js';

export const paraVersion = ParaCore.version;
export default ParaCore;
