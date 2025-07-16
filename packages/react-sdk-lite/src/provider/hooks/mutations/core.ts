import * as actions from '../../actions/index.js';
import { generateCoreMutation } from './utils.js';

export const useSignUpOrLogIn = generateCoreMutation('signUpOrLogIn', actions.signUpOrLogIn);
export const useVerifyNewAccount = generateCoreMutation('verifyNewAccount', actions.verifyNewAccount);
export const useWaitForLogin = generateCoreMutation('waitForLogin', actions.waitForLogin);
export const useWaitForSignup = generateCoreMutation('waitForSignup', actions.waitForSignup);
export const useWaitForWalletCreation = generateCoreMutation('waitForWalletCreation', actions.waitForWalletCreation);
export const useVerifyOAuth = generateCoreMutation('verifyOAuth', actions.verifyOAuth);
export const useVerifyFarcaster = generateCoreMutation('verifyFarcaster', actions.verifyFarcaster);
export const useVerifyTelegram = generateCoreMutation('verifyTelegram', actions.verifyTelegram);
export const useLoginExternalWallet = generateCoreMutation('loginExternalWallet', actions.loginExternalWallet);
export const useVerifyExternalWallet = generateCoreMutation('verifyExternalWallet', actions.verifyExternalWallet);
export const useSetup2fa = generateCoreMutation('setup2fa', actions.setup2fa);
export const useEnable2fa = generateCoreMutation('enable2fa', actions.enable2fa);
export const useVerify2fa = generateCoreMutation('verify2fa', actions.verify2fa);
export const useKeepSessionAlive = generateCoreMutation('keepSessionAlive', actions.keepSessionAlive);
export const useLogout = generateCoreMutation('logout', actions.logout);
export const useResendVerificationCode = generateCoreMutation('resendVerificationCode', actions.resendVerificationCode);
export const useCreateWallet = generateCoreMutation('createWallet', actions.createWallet);
export const useCreateWalletPerType = generateCoreMutation('createWalletPerType', actions.createWalletPerType);
export const useCreatePregenWallet = generateCoreMutation('createPregenWallet', actions.createPregenWallet);
export const useCreatePregenWalletPerType = generateCoreMutation(
  'createPregenWalletPerType',
  actions.createPregenWalletPerType,
);
export const useClaimPregenWallets = generateCoreMutation('claimPregenWallets', actions.claimPregenWallets);
export const useHasPregenWallet = generateCoreMutation('hasPregenWallet', actions.hasPregenWallet);
export const useUpdatePregenWalletIdentifier = generateCoreMutation(
  'updatePregenWalletIdentifier',
  actions.updatePregenWalletIdentifier,
);
export const useCreateGuestWallets = generateCoreMutation('createGuestWallets', actions.createGuestWallets);
export const useSignMessage = generateCoreMutation('signMessage', actions.signMessage);
export const useSignTransaction = generateCoreMutation('signTransaction', actions.signTransaction);
export const useIssueJwt = generateCoreMutation('issueJwt', actions.issueJwt);
