export * from '@getpara/core-sdk';
import { Para as ParaWeb } from './ParaWeb.js';
import ParaCore from '@getpara/core-sdk';
export {
  type StorageUtils,
  type ConstructorOpts,
  Environment,
  type OnRampConfig,
  type OnRampAllowedAssets,
} from '@getpara/core-sdk';
export { createCredential, generateSignature, parseCredentialCreationRes } from './cryptography/webAuth.js';
export { truncateEthAddress } from './utils/truncateEthAddress.js';
export * from './utils/isMobile.js';

export { ParaWeb, ParaCore };
export default ParaWeb;
