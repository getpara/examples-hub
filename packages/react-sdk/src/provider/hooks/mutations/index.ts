import * as actions from '../../actions/index.js';
import { generateHook } from './utils.js';

export { useWaitForLoginAndSetup } from './useWaitForLoginAndSetup.js';
export { useWaitForAccountCreation } from './useWaitForAccountCreation.js';
export { useWaitForPasskeyAndCreateWallet } from './useWaitForPasskeyAndCreateWallet.js';
export { useCreateUser } from './useCreateUser.js';
export { useCheckIfUserExists } from './useCheckIfUserExists.js';
export { useInitiateLogin } from './useInitiateLogin.js';
export { useKeepSessionAlive } from './useKeepSessionAlive.js';
export { useSignMessage } from './useSignMessage.js';
export { useSignTransaction } from './useSignTransaction.js';

export const useSignUpOrLogIn = generateHook('signUpOrLogInV2', actions.signUpOrLogIn);
export const useVerifyNewAccount = generateHook('verifyNewAccountV2', actions.verifyNewAccount);
export const useWaitForLogin = generateHook('waitForLoginV2', actions.waitForLogin);
export const useWaitForSignup = generateHook('waitForSignupV2', actions.waitForSignup);
export const useWaitForWalletCreation = generateHook('waitForWalletCreationV2', actions.waitForWalletCreation);
export const useVerifyOAuth = generateHook('verifyOAuthV2', actions.verifyOAuth);
export const useVerifyFarcaster = generateHook('verifyFarcasterV2', actions.verifyFarcaster);
export const useVerifyTelegram = generateHook('verifyTelegramV2', actions.verifyTelegram);
export const useLoginExternalWallet = generateHook('loginExternalWalletV2', actions.loginExternalWallet);
export const useVerifyExternalWallet = generateHook('verifyExternalWalletV2', actions.verifyExternalWallet);
export const useSetup2fa = generateHook('setup2faV2', actions.setup2fa);
export const useEnable2fa = generateHook('enable2faV2', actions.enable2fa);
export const useVerify2fa = generateHook('verify2faV2', actions.verify2fa);
export const useKeepSessionAliveV2 = generateHook('keepSessionAlive', actions.keepSessionAlive);
export const useLogout = generateHook('logout', actions.logout);
export const useResendVerificationCode = generateHook('resendVerificationCode', actions.resendVerificationCode);
export const useCreateWallet = generateHook('createWallet', actions.createWallet);
export const useCreateWalletPerType = generateHook('createWalletPerType', actions.createWalletPerType);
export const useCreatePregenWallet = generateHook('createPregenWalletV2', actions.createPregenWallet);
export const useCreatePregenWalletPerType = generateHook('createPregenWalletPerTypeV2', actions.createPregenWalletPerType);
export const useClaimPregenWallets = generateHook('claimPregenWalletsV2', actions.claimPregenWallets);
export const useHasPregenWallet = generateHook('hasPregenWalletV2', actions.hasPregenWallet);
export const useUpdatePregenWalletIdentifier = generateHook(
  'updatePregenWalletIdentifierV2',
  actions.updatePregenWalletIdentifier,
);
export const useSignMessageV2 = generateHook('signMessage', actions.signMessage);
export const useSignTransactionV2 = generateHook('signTransaction', actions.signTransaction);
