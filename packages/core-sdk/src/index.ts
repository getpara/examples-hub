import { ParaCore, PREFIX as STORAGE_PREFIX, PregenIdentifierType, isWalletSupported } from './ParaCore.js';

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
} from '@getpara/user-management-client';
export * from './definitions.js';
export type { Ctx } from './definitions.js';
export * from './types/index.js';
export { distributeNewShare } from './shares/shareDistribution.js';
export { KeyContainer } from './shares/KeyContainer.js';
export { RecoveryStatus, stringToPhoneNumber, entityToWallet } from './ParaCore.js';
export type { Wallet, ConstructorOpts, SupportedWalletTypes } from './ParaCore.js';
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
export * from './utils/pollingUtils.js';
export * from './errors.js';
export * from './utils/formattingUtils.js';
export { retrieve as transmissionUtilsRetrieve } from './transmission/transmissionUtils.js';
export { STORAGE_PREFIX, PregenIdentifierType, isWalletSupported };

export const paraVersion = ParaCore.version;
export default ParaCore;
