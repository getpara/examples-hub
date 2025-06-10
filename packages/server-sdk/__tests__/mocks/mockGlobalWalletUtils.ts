import { vi } from 'vitest';
import { BASE64_SIGNATURE, SIGNATURE, WALLET } from '../constants';

export const mockEd25519CreateAccount = vi.fn((_, __, ___, cb) => {
  cb(null, WALLET.signer);
});
export const mockEd25519Sign = vi.fn((_, __, ___, cb) => {
  cb(null, BASE64_SIGNATURE);
});
export const mockDklsCreateAccount = vi.fn((_, __, ___, ____, _____, cb) => {
  cb(null, WALLET.signer);
});
export const mockCreateAccountV2 = vi.fn((_, __, ___, ____, _____, cb) => {
  cb(null, WALLET.signer);
});
export const mockDklsSignMessage = vi.fn((_, __, ___, ____, cb) => {
  cb(null, SIGNATURE);
});
export const mockSignMessage = vi.fn((_, __, ___, ____, cb) => {
  cb(null, SIGNATURE);
});
export const mockDklsSendTransaction = vi.fn((_, __, ___, ____, _____, cb) => {
  cb(null, SIGNATURE);
});
export const mockSendTransaction = vi.fn((_, __, ___, ____, _____, cb) => {
  cb(null, SIGNATURE);
});
export const mockDklsRefresh = vi.fn((_, __, ___, cb) => {
  cb(null, WALLET.signer);
});
export const mockRefresh = vi.fn((_, __, ___, cb) => {
  cb(null, WALLET.signer);
});
export const mockGetPrivateKey = vi.fn((_, __, cb) => {
  cb(null, WALLET.privateKey);
});
export const mockInitWasm = vi.fn(cb => {
  cb(null, null);
});

Object.defineProperty(globalThis, 'ed25519CreateAccount', {
  value: mockEd25519CreateAccount,
});
Object.defineProperty(globalThis, 'ed25519Sign', {
  value: mockEd25519Sign,
});
Object.defineProperty(globalThis, 'dklsCreateAccount', {
  value: mockDklsCreateAccount,
});
Object.defineProperty(globalThis, 'createAccountV2', {
  value: mockCreateAccountV2,
});
Object.defineProperty(globalThis, 'dklsSignMessage', {
  value: mockDklsSignMessage,
});
Object.defineProperty(globalThis, 'signMessage', {
  value: mockSignMessage,
});
Object.defineProperty(globalThis, 'dklsSendTransaction', {
  value: mockDklsSendTransaction,
});
Object.defineProperty(globalThis, 'sendTransaction', {
  value: mockSendTransaction,
});
Object.defineProperty(globalThis, 'dklsRefresh', {
  value: mockDklsRefresh,
});
Object.defineProperty(globalThis, 'refresh', {
  value: mockRefresh,
});
Object.defineProperty(globalThis, 'getPrivateKey', {
  value: mockGetPrivateKey,
});
Object.defineProperty(globalThis, 'initWasm', {
  value: mockInitWasm,
  writable: true,
  configurable: true,
});
