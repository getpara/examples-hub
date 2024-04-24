export * from '@usecapsule/core-sdk';
import { Capsule as CapsuleWeb } from './CapsuleWeb.js';
import CoreCapsule from '@usecapsule/core-sdk';
export type { StorageUtils } from '@usecapsule/core-sdk';
export { createCredential, generateSignature, parseCredentialCreationRes } from './cryptography/webAuth.js';
export { truncateEthAddress } from './utils/truncateEthAddress.js';

export { CapsuleWeb, CoreCapsule };

export default CapsuleWeb;
