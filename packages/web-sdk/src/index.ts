/* eslint-disable */
global.Buffer = global.Buffer || require('buffer').Buffer;

export * from '@usecapsule/core-sdk';
import { Capsule as CapsuleWeb } from './CapsuleWeb';
import CoreCapsule from '@usecapsule/core-sdk';
export type { StorageUtils } from '@usecapsule/core-sdk';
export { createCredential, generateSignature, parseCredentialCreationRes } from './cryptography/webAuth';

export {
  CapsuleWeb,
  CoreCapsule,
};

export default CapsuleWeb;
