/* eslint-disable */
global.Buffer = global.Buffer || require('buffer').Buffer;

import { Capsule as CapsuleDeprecated } from './Capsule';
import { CapsuleModal as Modal } from './modal/CapsuleModal';
import { CapsuleButton as Button } from './modal/CapsuleModal'

export { Environment } from './core/definitions';
export { OAuthMethod } from './modal/oauth/oAuthMethods'
export * from './core/types';
export { Modal };
export { Button };
export { CapsuleEthersSigner } from './integrations/ethers/ethersSigner';
export { createCapsuleViemClient } from './integrations/wagmi/viemWalletClient';
export { CapsuleEIP1193Provider } from './integrations/wagmi/CapsuleEIP1193Provider';
export { CapsuleConnector } from './integrations/wagmi/CapsuleConnector';
export { CapsuleProtoSigner, CapsuleAminoSigner } from './integrations/cosmos/cosmosSigners';
import { Capsule as CapsuleWeb } from './CapsuleWeb';
export { CoreCapsule } from './core/CoreCapsule';
export type { StorageUtils } from './core/StorageUtils';

export {
  CapsuleWeb,
  CapsuleDeprecated,
}

export default CapsuleWeb;
