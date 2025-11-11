import quickCrypto from 'react-native-quick-crypto';
import { webcrypto } from 'crypto';
import { Crypto as PeculiarCrypto } from '@peculiar/webcrypto';
import { ec as EllipticEC } from 'elliptic';
import Forge from 'node-forge';
import modPow from 'react-native-modpow';
import { atob, btoa } from 'react-native-quick-base64';
import { Buffer } from '@craftzdog/react-native-buffer';
import process from 'process';
import 'react-native-url-polyfill/auto';
import { TextEncoder, TextDecoder } from 'text-encoding';

let cachedStructuredCloneImpl;

const resolveStructuredClone = () => {
  if (typeof cachedStructuredCloneImpl !== 'undefined') {
    return cachedStructuredCloneImpl;
  }

  if (typeof globalThis.structuredClone === 'function') {
    cachedStructuredCloneImpl = globalThis.structuredClone.bind(globalThis);
    return cachedStructuredCloneImpl;
  }

  const isHermes = typeof globalThis.HermesInternal === 'object' && globalThis.HermesInternal !== null;
  if (isHermes) {
    // Hermes crashes when @ungap/structured-clone rewires Reflect helpers.
    cachedStructuredCloneImpl = null;
    return cachedStructuredCloneImpl;
  }

  try {
    const maybePolyfill = require('@ungap/structured-clone');
    const polyfill = (maybePolyfill && maybePolyfill.default) || maybePolyfill;
    if (typeof polyfill === 'function') {
      cachedStructuredCloneImpl = polyfill;
      return cachedStructuredCloneImpl;
    }
  } catch (err) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.warn('[Para React Native shim] Failed to load structuredClone polyfill', err);
    }
  }

  cachedStructuredCloneImpl = null;
  return cachedStructuredCloneImpl;
};

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

const curveAliases = {
  'P-256': 'p256',
  'p-256': 'p256',
  'prime256v1': 'p256',
  'secp256r1': 'p256',
  'secp256k1': 'secp256k1',
};

const getBufferImpl = () => {
  const BufferImpl = globalThis.Buffer;
  if (!BufferImpl) {
    // prettier-ignore
    throw new Error(
      "[Para React Native shim] Buffer global missing. Please import '@getpara/react-native-wallet/shim' before using cryptography helpers."
    );
  }
  return BufferImpl;
};

const bufferFrom = (data, encoding = 'binary') => {
  const BufferImpl = getBufferImpl();
  if (BufferImpl.isBuffer && BufferImpl.isBuffer(data)) {
    return data;
  }

  if (typeof data === 'string') {
    switch (encoding) {
      case 'hex':
        return BufferImpl.from(data, 'hex');
      case 'base64':
        return BufferImpl.from(data, 'base64');
      default:
        return BufferImpl.from(data, 'binary');
    }
  }

  return BufferImpl.from(data);
};

const bufferTo = (buf, encoding = 'binary') => {
  const BufferImpl = getBufferImpl();
  switch (encoding) {
    case 'hex':
      return BufferImpl.from(buf).toString('hex');
    case 'base64':
      return BufferImpl.from(buf).toString('base64');
    case 'binary':
    default:
      return BufferImpl.from(buf);
  }
};

let cachedCreateECDH = null;

const ensureCreateECDH = () => {
  if (!cachedCreateECDH) {
    cachedCreateECDH = curveName => {
      const BufferImpl = getBufferImpl();
      const normalizedCurve = curveAliases[curveName] || curveName;
      if (!normalizedCurve && typeof __DEV__ !== 'undefined' && __DEV__) {
        console.warn('[Para React Native shim] Unknown curve alias', curveName);
      }

      const ec = new EllipticEC(normalizedCurve);
      const secretByteLength = (() => {
        const order = (ec && ec.curve && ec.curve.n) || (ec && ec.n);
        if (!order) {
          return null;
        }
        if (typeof order.byteLength === 'function') {
          return order.byteLength();
        }
        if (typeof order.bitLength === 'function') {
          return Math.ceil(order.bitLength() / 8);
        }
        return null;
      })();
      let keyPair = ec.genKeyPair();

      return {
        generateKeys: (encoding = 'binary', format = 'uncompressed') => {
          keyPair = ec.genKeyPair();
          const compressed = format === 'compressed' || format === 'comp';
          const publicKey = keyPair.getPublic(compressed, 'array');
          return bufferTo(BufferImpl.from(publicKey), encoding || 'binary');
        },
        computeSecret: (publicKey, inputEncoding = 'binary', outputEncoding = 'binary') => {
          const publicKeyBuf = bufferFrom(publicKey, inputEncoding || 'binary');
          const derived = keyPair.derive(ec.keyFromPublic(publicKeyBuf).getPublic());
          const padded = secretByteLength ? derived.toArray('be', secretByteLength) : derived.toArray('be');
          // Match Node's ECDH API: shared secret is always curve-size bytes.
          const secret = BufferImpl.from(padded);
          return bufferTo(secret, outputEncoding || 'binary');
        },
        getPrivateKey: (encoding = 'binary') => {
          return bufferTo(keyPair.getPrivate().toArrayLike(BufferImpl, 'be', 32), encoding || 'binary');
        },
        getPublicKey: (encoding = 'binary', format = 'uncompressed') => {
          const compressed = format === 'compressed' || format === 'comp';
          const publicKey = keyPair.getPublic(compressed, 'array');
          return bufferTo(BufferImpl.from(publicKey), encoding || 'binary');
        },
        setPrivateKey: (privateKey, encoding = 'binary') => {
          keyPair = ec.keyFromPrivate(bufferFrom(privateKey, encoding));
        },
        setPublicKey: (publicKey, encoding = 'binary') => {
          keyPair = ec.keyFromPublic(bufferFrom(publicKey, encoding));
        },
      };
    };
  }

  const possibleTargets = [];
  const globalCrypto = globalThis.crypto;
  if (globalCrypto) {
    possibleTargets.push(globalCrypto, globalCrypto.default);
  }
  possibleTargets.push(quickCrypto, quickCrypto && quickCrypto.default);

  try {
    const nodeCrypto = require('crypto');
    possibleTargets.push(nodeCrypto, nodeCrypto && nodeCrypto.default);
    // eslint-disable-next-line no-unused-vars
  } catch (_err) {
    // The Node crypto module is not available in React Native; ignore failures.
  }

  const patchedTargets = new Set(possibleTargets.filter(Boolean));
  let patched = false;

  patchedTargets.forEach(target => {
    if (target && typeof target === 'object' && target.createECDH !== cachedCreateECDH) {
      try {
        target.createECDH = cachedCreateECDH;
        patched = true;
      } catch (err) {
        if (typeof __DEV__ !== 'undefined' && __DEV__) {
          console.warn('[Para React Native shim] Failed to patch createECDH', err);
        }
      }
    }
  });

  if (patched && typeof __DEV__ !== 'undefined' && __DEV__) {
    console.info('[Para React Native shim] createECDH patched function');
  }

  return cachedCreateECDH;
};

const syncWindowLikeGlobals = cryptoObj => {
  const maybeWindow = globalThis.window;
  if (maybeWindow && typeof maybeWindow === 'object' && maybeWindow.crypto !== cryptoObj) {
    maybeWindow.crypto = cryptoObj;
  }

  const maybeSelf = globalThis.self;
  if (maybeSelf && typeof maybeSelf === 'object' && maybeSelf.crypto !== cryptoObj) {
    maybeSelf.crypto = cryptoObj;
  }
};

const ensureParaCrypto = () => {
  getBufferImpl();
  const baseCrypto = (typeof globalThis.crypto === 'object' && globalThis.crypto) || quickCrypto;

  if (!baseCrypto || typeof baseCrypto !== 'object') {
    throw new Error('[Para React Native shim] No crypto object found to polyfill');
  }

  if (typeof baseCrypto.default === 'undefined') {
    baseCrypto.default = baseCrypto;
  }

  const peculiarCrypto = new PeculiarCrypto();

  baseCrypto.subtle = peculiarCrypto.subtle;
  baseCrypto.getRandomValues = peculiarCrypto.getRandomValues.bind(peculiarCrypto);

  if (baseCrypto.default && baseCrypto.default !== baseCrypto) {
    baseCrypto.default.subtle = baseCrypto.subtle;
    baseCrypto.default.getRandomValues = baseCrypto.getRandomValues;
  }

  globalThis.crypto = baseCrypto;
  syncWindowLikeGlobals(baseCrypto);
  try {
    const brorand = require('brorand');
    if (brorand && brorand.Rand) {
      brorand.Rand.prototype._rand = function _rand(n) {
        const arr = new Uint8Array(n);
        baseCrypto.getRandomValues(arr);
        return arr;
      };
    }
  } catch (err) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.warn('[Para React Native shim] Failed to patch brorand RNG', err);
    }
  }
  ensureCreateECDH();

  return { baseCrypto, peculiarCrypto };
};

const setupCryptoPolyfills = () => {
  const { peculiarCrypto } = ensureParaCrypto();

  if (webcrypto && typeof webcrypto === 'object') {
    webcrypto.getRandomValues = peculiarCrypto.getRandomValues.bind(peculiarCrypto);
  }

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

const setupStructuredClonePolyfill = () => {
  if (typeof globalThis.structuredClone === 'function') {
    return;
  }

  const structuredCloneImpl = resolveStructuredClone();
  const safeStructuredClone = (value, options) => {
    if (typeof structuredCloneImpl === 'function') {
      try {
        return structuredCloneImpl(value, options);
      } catch (err) {
        if (typeof __DEV__ !== 'undefined' && __DEV__) {
          console.warn('[Para React Native shim] structuredClone polyfill failed, falling back to JSON clone', err);
        }
      }
    }
    try {
      return JSON.parse(JSON.stringify(value));
    } catch (_err) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.warn('[Para React Native shim] JSON clone failed, returning original value', _err);
      }
      return value;
    }
  };

  Object.defineProperty(globalThis, 'structuredClone', {
    value: safeStructuredClone,
    configurable: true,
    enumerable: false,
    writable: true,
  });
};

setupProcessPolyfill();
setupBufferPolyfill();
setupBase64Polyfills();
setupCryptoPolyfills();
setupTextEncodingPolyfills();
setupStructuredClonePolyfill();

export { ensureParaCrypto, ensureCreateECDH };
