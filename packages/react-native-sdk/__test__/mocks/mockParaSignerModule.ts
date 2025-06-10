/* eslint-disable @typescript-eslint/no-unused-vars */
import { vi } from 'vitest';

const toHexSig = (tag: string) => `0x${tag}-deadbeef`;
const toBase64Sig = (tag: string) => Buffer.from(tag).toString('base64');
const toSigner = (tag: string) => `signer-${tag}`;

export const ParaSignerModule = {
  setServerUrl: vi.fn(),
  setWsServerUrl: vi.fn(),
  createAccount: vi.fn(async (walletId: string, protocolId: string, _shareType: string, _userId: string) =>
    toSigner(`cggmp-${walletId}-${protocolId}`),
  ),
  sendTransaction: vi.fn(async (_pid: string, _ser: string, _tx: string, _uid: string) => toHexSig('cggmp-tx')),
  signMessage: vi.fn(async (_pid: string, _ser: string, _msg: string, _uid: string) => toHexSig('cggmp-msg')),
  refresh: vi.fn(async (_pid: string, _ser: string, _uid: string) => toSigner('cggmp-refreshed')),

  dklsCreateAccount: vi.fn(async (walletId: string, protocolId: string, _shareType: string, _userId: string) =>
    toSigner(`dkls-${walletId}-${protocolId}`),
  ),
  dklsSendTransaction: vi.fn(async (_pid: string, _ser: string, _tx: string, _uid: string) => toHexSig('dkls-tx')),
  dklsSignMessage: vi.fn(async (_pid: string, _ser: string, _msg: string, _uid: string) => toHexSig('dkls-msg')),
  dklsRefresh: vi.fn(async (_pid: string, _ser: string, _uid: string) => toSigner('dkls-refreshed')),
  ed25519CreateAccount: vi.fn(async (walletId: string, _protocolId: string) => toSigner(`ed25519-${walletId}`)),
  ed25519Sign: vi.fn(async (_pid: string, _ser: string, _msg: string) => toBase64Sig('ed25519-sig')),
};
