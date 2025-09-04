export * from '@getpara/core-sdk';
import { Para as ParaWeb } from './ParaWeb.js';
import ParaCore from '@getpara/core-sdk';
export {
  type StorageUtils,
  type ConstructorOpts,
  Environment,
  type OnRampConfig,
  type OnRampAssets,
} from '@getpara/core-sdk';
export { createCredential, generateSignature, parseCredentialCreationRes } from './cryptography/webAuth.js';
export { truncateEthAddress, isPasskeySupported, offRampSend } from './utils/index.js';
export * from './utils/isMobile.js';
export * from './types/index.js';

export { ParaWeb, ParaCore };
export default ParaWeb;
