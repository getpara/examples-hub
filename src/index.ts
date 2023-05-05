import { Capsule } from './Capsule';
export { Environment } from './definitions';
import { CapsuleModal as Modal } from './modal/CapsuleModal';
export default Capsule;
export { Modal };

global.Buffer = global.Buffer || require('buffer').Buffer;
