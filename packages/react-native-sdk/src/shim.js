import crypto from 'react-native-quick-crypto';
import { webcrypto } from 'crypto';
import { Crypto } from '@peculiar/webcrypto';
import Forge from 'node-forge';
import modPow from 'react-native-modpow';
import { atob, btoa } from 'react-native-quick-base64';
import { Buffer } from '@craftzdog/react-native-buffer';
import process from 'process';
import 'react-native-url-polyfill/auto';
import { TextEncoder, TextDecoder } from 'text-encoding';

const setupProcessPolyfill = () => {
  if (typeof globalThis.process === 'undefined') {
    globalThis.process = process;
  }
};

const setupBufferPolyfill = () => {
  if (typeof globalThis.Buffer === 'undefined') {
    globalThis.Buffer = Buffer;
  }
  if (typeof globalThis.Buffer !== 'function') {
    throw new Error('Buffer polyfill failed to initialize');
  }
};

const setupBase64Polyfills = () => {
  if (typeof globalThis.atob === 'undefined') {
    globalThis.atob = atob;
  }
  if (typeof globalThis.btoa === 'undefined') {
    globalThis.btoa = btoa;
  }
  if (typeof globalThis.atob !== 'function' || typeof globalThis.btoa !== 'function') {
    throw new Error('Base64 polyfills failed to initialize');
  }
};

const setupCryptoPolyfills = () => {
  const peculiarCrypto = new Crypto();
  if (typeof globalThis.crypto === 'undefined') {
    globalThis.crypto = crypto;
  }
  if (!globalThis.crypto.subtle) {
    globalThis.crypto.subtle = peculiarCrypto.subtle;
    globalThis.crypto.getRandomValues = peculiarCrypto.getRandomValues.bind(peculiarCrypto);
  }
  webcrypto.getRandomValues = peculiarCrypto.getRandomValues.bind(peculiarCrypto);
  if (typeof Forge === 'undefined') {
    throw new Error('node-forge not loaded');
  }
  if (!Forge.jsbn || !Forge.jsbn.BigInteger) {
    return;
  }
  Forge.jsbn.BigInteger.prototype.modPow = function (e, m) {
    const result = modPow({
      target: this.toString(16),
      value: e.toString(16),
      modifier: m.toString(16),
    });
    return new Forge.jsbn.BigInteger(result, 16);
  };
};

const setupTextEncodingPolyfills = () => {
  globalThis.TextEncoder = TextEncoder;
  globalThis.TextDecoder = TextDecoder;
};

setupProcessPolyfill();
setupBufferPolyfill();
setupBase64Polyfills();
setupCryptoPolyfills();
setupTextEncodingPolyfills();
