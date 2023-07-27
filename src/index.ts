import { Capsule } from './Capsule';
export { Environment } from './definitions';
export * from './types';
import { CapsuleModal as Modal } from './modal/CapsuleModal';
export default Capsule;
export { Modal };
export { CapsuleEthersSigner } from './integrations/ethersSigner';

global.Buffer = global.Buffer || require('buffer').Buffer;
