import * as actions from '../../actions/index.js';
import { generateHook, generateStateHook } from './utils.js';

export const useSignUpOrLogIn = generateHook('signUpOrLogIn', actions.signUpOrLogIn);
export const useVerifyNewAccount = generateHook('verifyNewAccount', actions.verifyNewAccount);
export const useWaitForLogin = generateHook('waitForLogin', actions.waitForLogin);
export const useWaitForSignup = generateHook('waitForSignup', actions.waitForSignup);
export const useWaitForWalletCreation = generateHook('waitForWalletCreation', actions.waitForWalletCreation);
export const useVerifyOAuth = generateHook('verifyOAuth', actions.verifyOAuth);
export const useVerifyFarcaster = generateHook('verifyFarcaster', actions.verifyFarcaster);
export const useVerifyTelegram = generateHook('verifyTelegram', actions.verifyTelegram);
export const useLoginExternalWallet = generateHook('loginExternalWallet', actions.loginExternalWallet);
export const useVerifyExternalWallet = generateHook('verifyExternalWallet', actions.verifyExternalWallet);
export const useSetup2fa = generateHook('setup2fa', actions.setup2fa);
export const useEnable2fa = generateHook('enable2fa', actions.enable2fa);
export const useVerify2fa = generateHook('verify2fa', actions.verify2fa);
export const useKeepSessionAlive = generateHook('keepSessionAlive', actions.keepSessionAlive);
export const useLogout = generateHook('logout', actions.logout);
export const useResendVerificationCode = generateHook('resendVerificationCode', actions.resendVerificationCode);
export const useCreateWallet = generateHook('createWallet', actions.createWallet);
export const useCreateWalletPerType = generateHook('createWalletPerType', actions.createWalletPerType);
export const useCreatePregenWallet = generateHook('createPregenWallet', actions.createPregenWallet);
export const useCreatePregenWalletPerType = generateHook('createPregenWalletPerType', actions.createPregenWalletPerType);
export const useClaimPregenWallets = generateHook('claimPregenWallets', actions.claimPregenWallets);
export const useHasPregenWallet = generateHook('hasPregenWallet', actions.hasPregenWallet);
export const useUpdatePregenWalletIdentifier = generateHook(
  'updatePregenWalletIdentifier',
  actions.updatePregenWalletIdentifier,
);
export const useCreateGuestWallets = generateHook('createGuestWallets', actions.createGuestWallets);
export const useSignMessage = generateHook('signMessage', actions.signMessage);
export const useSignTransaction = generateHook('signTransaction', actions.signTransaction);

export const useCreateGuestWalletsState = generateStateHook('createGuestWallets');
