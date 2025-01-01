// 1) Node-like crypto + Web Crypto API (subtle + getRandomValues)
import crypto from 'react-native-quick-crypto';
import { webcrypto } from 'crypto';
import { Crypto } from '@peculiar/webcrypto';

if (typeof global.crypto === 'undefined') {
  // Attach Node-style crypto for randomFillSync, createHash, etc.
  global.crypto = crypto;
}

// If `crypto.subtle` is missing, patch it with `@peculiar/webcrypto`
if (!global.crypto.subtle) {
  const peculiarCrypto = new Crypto();
  global.crypto.subtle = peculiarCrypto.subtle;
  global.crypto.getRandomValues = peculiarCrypto.getRandomValues.bind(peculiarCrypto);
}

// Add getRandomValues to webcrypto from peculiar
const peculiarCrypto = new Crypto();
webcrypto.getRandomValues = peculiarCrypto.getRandomValues.bind(peculiarCrypto);

// 2) Provide TextEncoder / TextDecoder
import * as FSTED from 'fastestsmallesttextencoderdecoder';

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = FSTED.TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = FSTED.TextDecoder;
}

// 3) Provide atob / btoa via react-native-quick-base64
import { atob, btoa } from 'react-native-quick-base64';

if (typeof global.atob === 'undefined') {
  global.atob = atob;
}
if (typeof global.btoa === 'undefined') {
  global.btoa = btoa;
}

// 4) Patch node-forge with react-native-modpow for faster RSA ops
import Forge from 'node-forge';
import modPow from 'react-native-modpow';

Forge.jsbn.BigInteger.prototype.modPow = function nativeModPow(e, m) {
  const result = modPow({
    target: this.toString(16),
    value: e.toString(16),
    modifier: m.toString(16),
  });
  return new Forge.jsbn.BigInteger(result, 16);
};

// 5) Provide global Buffer
import { Buffer } from 'buffer';
if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}
