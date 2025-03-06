import { ParaWeb } from '@getpara/web-sdk';
import { logger } from './logging';
import {
  initEthersSigner,
  ethersSignMessage,
  ethersSignTransaction,
  ethersSendTransaction,
  ethersSignTypedData,
} from './signers/ethersSigner';
import {
  initSolanaWeb3Signer,
  solanaWeb3SendTransaction,
  solanaWeb3SignTransaction,
  solanaWeb3SignVersionedTransaction,
} from './signers/solanaWeb3Signer';
import { initCosmJsSigners, cosmJsSignAmino, cosmJsSignDirect } from './signers/cosmjsSigner';
import { login, loginV2, generatePasskey, generatePasskeyV2, verifyWebChallenge } from './bridgeAuth';

export const methodHandlers: Record<string, (para: ParaWeb, args: any[]) => Promise<any>> = {
  check2FAStatus: async (para, _) => {
    logger.info('Checking 2FA status...');
    const is2FAEnabled = await para.check2FAStatus();
    return is2FAEnabled;
  },
  checkIfUserExists: async (para, args) => {
    logger.info('Checking if user exists...');
    const userExists = await para.checkIfUserExists({ email: args[0] });
    return userExists;
  },
  checkIfUserExistsByPhone: async (para, args) => {
    logger.info('Checking if user exists by phone...');
    const userExistsByPhone = await para.checkIfUserExistsByPhone({ phone: args[0], countryCode: args[1] });
    return userExistsByPhone;
  },
  claimPregenWallets: async (para, args) => {
    logger.info('Claiming pregen wallets...');
    const claimResult = await para.claimPregenWallets({ pregenIdentifier: args[0], pregenIdentifierType: args[1] });
    return claimResult;
  },
  clearStorage: async (para, _) => {
    logger.info('Clearing storage...');
    para.clearStorage();
    return null;
  },
  cosmJsSignAmino: async (_, args) => {
    logger.info('Signing CosmJS transaction...');
    const signature = await cosmJsSignAmino(args);
    return signature;
  },
  cosmJsSignDirect: async (_, args) => {
    logger.info('Signing direct message...');
    const signature = await cosmJsSignDirect(args);
    return signature;
  },
  createPregenWalletPerType: async (para, args) => {
    logger.info('Creating pregen wallet per type...');
    const pregenWallets = await para.createPregenWalletPerType({
      pregenIdentifier: args[0],
      pregenIdentifierType: args[1],
      types: args[2],
    });
    return pregenWallets;
  },
  createUser: async (para, args) => {
    logger.info('Creating user...');
    await para.createUser({ email: args[0] });
    return null;
  },
  createUserByPhone: async (para, args) => {
    logger.info('Creating user by phone...');
    await para.createUserByPhone({ phone: args[0], countryCode: args[1] });
    return null;
  },
  createWallet: async (para, args) => {
    logger.info('Creating wallet...');
    const [wallet, recoveryShare] = await para.createWallet({ type: args[0], skipDistribute: args[1] });
    logger.info('Wallet created:', wallet, 'Recovery share:', recoveryShare);
    return [{ wallet, recoveryShare }];
  },
  createWalletPerType: async (para, args) => {
    logger.info('Creating wallet per type...');
    const wallets = await para.createWalletPerType({ skipDistribute: args[0], types: args[1] });
    return wallets;
  },
  createWalletPreGen: async (para, args) => {
    logger.info('Creating wallet pre-gen...');
    const wallet = await para.createPregenWallet({
      type: args[0],
      pregenIdentifier: args[1],
      pregenIdentifierType: args[2],
    });
    return wallet;
  },
  distributeNewWalletShare: async (para, args) => {
    logger.info('Distributing new wallet share...');
    const distributeResult = await para.distributeNewWalletShare({ walletId: args[0], userShare: args[1] });
    return distributeResult;
  },
  enable2FA: async (para, args) => {
    logger.info('Enabling 2FA...');
    await para.enable2FA({ verificationCode: args[0] });
    return null;
  },
  ethersSignMessage: async (_, args) => {
    logger.info('Signing ethers message...');
    const signature = await ethersSignMessage(args);
    return signature;
  },
  ethersSignTransaction: async (_, args) => {
    logger.info('Signing ethers transaction...');
    const signature = await ethersSignTransaction(args);
    return signature;
  },
  ethersSignTypedData: async (_, args) => {
    logger.info('Signing typed data...');
    const signature = await ethersSignTypedData(args);
    return signature;
  },
  ethersSendTransaction: async (_, args) => {
    logger.info('Sending ethers transaction...');
    const txResponse = await ethersSendTransaction(args);
    return txResponse;
  },
  exportSession: async (para, _) => {
    logger.info('Exporting session...');
    const exportedSession = para.exportSession();
    return exportedSession;
  },
  externalWalletLogin: async (para, args) => {
    logger.info('Logging in external wallet...');
    const externalWalletLoginResult = await para.externalWalletLogin({
      address: args[0],
      type: args[1],
      provider: args[2],
      shouldTrackUser: args[3],
    });
    return externalWalletLoginResult;
  },
  fetchWallets: async (para, _) => {
    logger.info('Fetching wallets...');
    const wallets = await para.fetchWallets();
    return wallets;
  },
  generatePasskey: async (para, args) => {
    logger.info('Generating passkey...');
    const result = await generatePasskey(para, args);
    logger.info('Passkey generated successfully.');
    return result;
  },
  generatePasskeyV2: async (para, args) => {
    logger.info('Generating passkey V2...');
    const result = await generatePasskeyV2(para, args);
    logger.info('Passkey V2 generated successfully.');
    return result;
  },
  getEmail: async (para, _) => {
    logger.info('Getting email...');
    const email = para.getEmail();
    return email;
  },
  getFarcasterConnectURL: async (para, _) => {
    logger.info('Getting Farcaster Connect URL...');
    const farcasterConnectURL = await para.getFarcasterConnectURL();
    return farcasterConnectURL;
  },
  getOAuthURL: async (para, args) => {
    logger.info('Getting OAuth URL...');
    const oAuthUrl = await para.getOAuthURL({ method: args[0], deeplinkUrl: args[1] });
    return oAuthUrl;
  },
  getPregenWallets: async (para, args) => {
    logger.info('Getting pregen wallets...');
    const pregenWallets = await para.getPregenWallets({ pregenIdentifier: args[0], pregenIdentifierType: args[1] });
    return pregenWallets;
  },
  getSetUpBiometricsURL: async (para, _) => {
    logger.info('Getting set up biometrics URL...');
    const url = await para.getSetUpBiometricsURL();
    return url;
  },
  getUserShare: async (para, _) => {
    logger.info('Getting user share...');
    const userShare = para.getUserShare();
    return userShare;
  },
  getWallets: async (para, _) => {
    logger.info('Getting wallets...');
    const wallets = para.getWallets();
    return wallets;
  },
  getWalletsByType: async (para, args) => {
    logger.info('Getting wallets by type...');
    const walletsByType = await para.getWalletsByType(args[0]);
    return walletsByType;
  },
  getWebChallenge: async (para, args) => {
    logger.info('Getting web challenge...');
    const getWebChallengeResult = await para.ctx.client.getWebChallenge(args[0] ?? { email: '' });
    logger.info('Web challenge result:', getWebChallengeResult);
    return getWebChallengeResult;
  },
  hasPregenWallet: async (para, args) => {
    logger.info('Checking if pregen wallet exists...');
    const hasPregenWallet = await para.hasPregenWallet({ pregenIdentifier: args[0], pregenIdentifierType: args[1] });
    return hasPregenWallet;
  },
  initEthersSigner: async (para, args) => {
    logger.info('Initializing Ethers signer...');
    const result = await initEthersSigner(para, args);
    return result;
  },
  initSolanaWeb3Signer: async (para, args) => {
    logger.info('Initializing Solana signer...');
    const result = await initSolanaWeb3Signer(para, args);
    return result;
  },
  initCosmJsSigners: async (para, args) => {
    logger.info('Initializing CosmJS signers...');
    const result = await initCosmJsSigners(para, args);
    return result;
  },
  isFullyLoggedIn: async (para, _) => {
    logger.info('Checking if fully logged in...');
    const fullyLoggedIn = await para.isFullyLoggedIn();
    return fullyLoggedIn;
  },
  isSessionActive: async (para, _) => {
    logger.info('Checking if session is active...');
    const sessionActive = await para.isSessionActive();
    return sessionActive;
  },
  login: async (para, args) => {
    logger.info('Logging in...');
    const desiredWallet = await login(para, args);
    logger.info('Login successful. Desired wallet:', desiredWallet);
    return desiredWallet;
  },
  loginV2: async (para, args) => {
    logger.info('Logging in V2...');
    const desiredWallet2 = await loginV2(para, args);
    logger.info('Login V2 successful. Desired wallet:', desiredWallet2);
    return desiredWallet2;
  },
  logout: async (para, _) => {
    logger.info('Logging out...');
    await para.logout();
    return null;
  },
  resendVerificationCode: async (para, _) => {
    logger.info('Resending verification code...');
    await para.resendVerificationCode();
    return null;
  },
  resendVerificationCodeByPhone: async (para, _) => {
    logger.info('Resending verification code by phone...');
    await para.resendVerificationCodeByPhone();
    return null;
  },
  setEmail: async (para, args) => {
    logger.info('Setting email...');
    await para.setEmail(args[0]);
    return null;
  },
  setUserShare: async (para, args) => {
    logger.info('Setting user share...');
    await para.setUserShare(args[0]);
    return null;
  },
  setup2FA: async (para, _) => {
    logger.info('Setting up 2FA...');
    const setup2FAResult = await para.setup2FA();
    return setup2FAResult;
  },
  signMessage: async (para, args) => {
    logger.info('Signing message...');
    const signMessageResult = await para.signMessage({ walletId: args[0], messageBase64: args[1] });
    return signMessageResult;
  },
  signTransaction: async (para, args) => {
    logger.info('Signing transaction...');
    const signTransactionResult = await para.signTransaction({
      walletId: args[0],
      rlpEncodedTxBase64: args[1],
      chainId: args[2],
    });
    return signTransactionResult;
  },
  solanaWeb3SendTransaction: async (_, args) => {
    logger.info('Sending Solana transaction...');
    const txResponse = await solanaWeb3SendTransaction(args);
    return txResponse;
  },
  solanaWeb3SignTransaction: async (_, args) => {
    logger.info('Signing Solana transaction...');
    const txResponse = await solanaWeb3SignTransaction(args);
    return txResponse;
  },
  solanaWeb3SignVersionedTransaction: async (_, args) => {
    logger.info('Signing Solana versioned transaction...');
    const txResponse = await solanaWeb3SignVersionedTransaction(args);
    return txResponse;
  },
  updateWalletIdentifierPreGen: async (para, args) => {
    logger.info('Updating wallet identifier pre-gen...');
    await para.updatePregenWalletIdentifier({
      walletId: args[0],
      newPregenIdentifier: args[1],
      newPregenIdentifierType: args[2],
    });
    return null;
  },
  verifyExternalWallet: async (para, args) => {
    logger.info('Verifying external wallet...');
    const verifyExternalWalletResult = await para.verifyExternalWallet({ address: args[0], signedMessage: args[1] });
    return verifyExternalWalletResult;
  },
  verifyEmail: async (para, args) => {
    logger.info('Verifying email...');
    const verifyEmailResult = await para.verifyEmail({ verificationCode: args[0] });
    return verifyEmailResult;
  },
  verifyPhone: async (para, args) => {
    logger.info('Verifying phone...');
    const verifyPhoneResult = await para.verifyPhone({ verificationCode: args[0] });
    return verifyPhoneResult;
  },
  verifyWebChallenge: async (para, args) => {
    logger.info('Verifying web challenge...');
    const verifyWebChallengeResult = await verifyWebChallenge(para, args);
    logger.info('Web challenge verified:', verifyWebChallengeResult);
    return verifyWebChallengeResult;
  },
  waitForFarcasterStatus: async (para, _) => {
    logger.info('Waiting for Farcaster status...');
    const waitForFarcasterStatusResult = await para.waitForFarcasterStatus();
    return waitForFarcasterStatusResult;
  },
  waitForOAuth: async (para, _) => {
    logger.info('Waiting for OAuth...');
    const waitForOAuthResult = await para.waitForOAuth();
    return waitForOAuthResult;
  },
};
