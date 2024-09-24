export * from '@usecapsule/core-sdk';
import { Capsule as CapsuleWeb } from './CapsuleWeb.js';
import CoreCapsule from '@usecapsule/core-sdk';
export {
  type StorageUtils,
  type ConstructorOpts,
  Environment,
  type OnRampConfig,
  type OnRampAllowedAssets,
} from '@usecapsule/core-sdk';
export { createCredential, generateSignature, parseCredentialCreationRes } from './cryptography/webAuth.js';
export { truncateEthAddress } from './utils/truncateEthAddress.js';
export * from './utils/isMobile.js';

export { CapsuleWeb, CoreCapsule };
export default CapsuleWeb;
