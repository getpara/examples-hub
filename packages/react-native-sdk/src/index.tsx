import 'react-native-get-random-values';

import { TextEncoder, TextDecoder } from 'text-encoding';
import forge from 'node-forge';
import modPow from 'react-native-modpow';
export { Environment, WalletType } from '@usecapsule/web-sdk';
export { CapsuleMobile } from './react-native/CapsuleMobile';

export function shim() {
  forge.jsbn.BigInteger.prototype.modPow = function nativeModPow(e, m) {
    const result = modPow({
      target: this.toString(16),
      value: e.toString(16),
      modifier: m.toString(16),
    });

    return new forge.jsbn.BigInteger(result, 16);
  };

  // @ts-ignore
  global.TextEncoder = TextEncoder;
  // @ts-ignore
  global.TextDecoder = TextDecoder;
}
