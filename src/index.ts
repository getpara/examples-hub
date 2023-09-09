import { Capsule } from './Capsule';
export { Environment } from './definitions';
export * from './types';
import { CapsuleModal as Modal } from './modal/CapsuleModal';
import { CapsuleButton as Button } from './modal/CapsuleModal'
export default Capsule;
export { Modal };
export { Button };
export { CapsuleEthersSigner } from './integrations/ethers/ethersSigner';
export { createCapsuleViemClient } from './integrations/wagmi/viemWalletClient';
export { CapsuleEIP1193Provider } from './integrations/wagmi/CapsuleEIP1193Provider';
export { CapsuleConnector } from './integrations/wagmi/CapsuleConnector';
export { CapsuleProtoSigner, CapsuleAminoSigner } from './integrations/cosmos/cosmosSigners';
export { Capsule as CapsuleWeb } from './CapsuleWeb';
export { CoreCapsule } from './CoreCapsule';
export type { StorageUtils } from './StorageUtils';

/* eslint-disable */
global.Buffer = global.Buffer || require('buffer').Buffer;
