import { CoreCapsule, PREFIX as STORAGE_PREFIX, PregenIdentifierType, isWalletSupported } from './CoreCapsule.js';

export {
  AuthMethod,
  type CurrentWalletIds,
  EmailTheme,
  type PartnerEntity,
  type WalletEntity,
  WalletType,
  WalletScheme,
  OnRampPurchaseType,
  type OnRampConfig,
  type OnRampAllowedAssets,
  OAuthMethod,
  type TPregenIdentifierType,
  type PregenIds,
  NON_ED25519,
  PREGEN_IDENTIFIER_TYPES,
} from '@usecapsule/user-management-client';
export * from './definitions.js';
export type { Ctx } from './definitions.js';
export * from './types/index.js';
export { distributeNewShare } from './shares/shareDistribution.js';
export { KeyContainer } from './shares/KeyContainer.js';
export { RecoveryStatus, stringToPhoneNumber, entityToWallet } from './CoreCapsule.js';
export type { Wallet, ConstructorOpts, SupportedWalletTypes, ExternalWalletType } from './CoreCapsule.js';
export type { PlatformUtils } from './PlatformUtils.js';
export type { StorageUtils } from './StorageUtils.js';
export { initClient } from './external/capsuleClient.js';
export * as mpcComputationClient from './external/mpcComputationClient.js';
export { getBaseUrl } from './external/capsuleClient.js';
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
export * from './external/capsuleClient.js';
export * from './utils/pollingUtils.js';
export * from './errors.js';
export * from './utils/formattingUtils.js';
export { retrieve as transmissionUtilsRetrieve } from './transmission/transmissionUtils.js';
export { STORAGE_PREFIX, PregenIdentifierType, isWalletSupported };

export const capsuleVersion = CoreCapsule.version;
export default CoreCapsule;
