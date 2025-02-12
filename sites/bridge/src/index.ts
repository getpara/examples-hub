import { ParaWeb, Environment } from '@getpara/web-sdk';
import { parseCredentialCreationRes } from '@getpara/web-sdk/dist/cryptography/webAuth';
import {
  getAsymmetricKeyPair,
  getPublicKeyHex,
  getSHA256HashHex,
  encryptPrivateKey,
  decryptPrivateKeyAndDecryptShare,
  getDerivedPrivateKeyAndDecrypt,
  getPublicKeyFromSignature,
  Wallet,
  WalletScheme,
} from '@getpara/core-sdk';
import { PublicKeyStatus } from '@getpara/user-management-client';
import { ethers } from 'ethers';
import { base64ToBytes } from '@metamask/utils';
import { ParaEthersSigner } from '@getpara/ethers-v6-integration';

enum Platform {
  flutter,
  iOS,
}

interface BridgeResponse {
  method: string;
  requestId: string;
  responseData: any;
  error?: string;
}

let platform: Platform;
let version: string | undefined;

window.addEventListener('message', event => {
  console.log('Received message:', event.data);

  const data = event.data;
  const requestId = data['requestId'];

  switch (data['messageType']) {
    case 'Capsule#init':
    case 'Para#init': {
      console.log('Initializing Para with args:', data['arguments']);
      const initArgs = data['arguments'] ?? {};
      initPara(initArgs['environment'], initArgs['apiKey']);
      platform = Platform[initArgs['platform'] as keyof typeof Platform] ?? Platform.flutter;
      version = initArgs['version'];
      console.log('Para initialized successfully. Platform:', platform, 'Version:', version);
      sendResponse(data['messageType'], requestId, true);
      break;
    }
    case 'Capsule#invokeMethod':
    case 'Para#invokeMethod':
      console.log('Invoking method:', data['methodName'], 'with args:', data['arguments']);
      invokeParaMethod(data['methodName'], data['arguments'], requestId);
      break;

    default:
      console.log('Unknown message type:', data['messageType']);
      break;
  }
});

// Send a response back to the native layer
function sendResponse(method: string, requestId: string, responseData: any, error?: string) {
  const payload: BridgeResponse = { method, requestId, responseData, error };
  console.log('Sending response:', payload);

  switch (platform) {
    case Platform.flutter:
      window['flutter_inappwebview'].callHandler('asyncResult', payload);
      break;
    case Platform.iOS:
      window['webkit'].messageHandlers.callback.postMessage(payload);
      break;
  }
}

// Initialize ParaWeb with the provided environment and apiKey and store it in the window object
function initPara(environment: string, apiKey: string) {
  if (window['para'] != null) {
    throw new Error('Para already initialized');
  }

  const para = new ParaWeb(environment as Environment, apiKey, {
    disableWorkers: false,
  });
  para.init();
  window['para'] = para;
}

/**
 * Invokes a ParaWeb method or a custom handler based on methodName and arguments.
 * On completion or error, sends a response back with the requestId.
 */
async function invokeParaMethod(methodName: string, args: any[], requestId: string) {
  console.log(`Invoking method: ${methodName} with args:`, args, `and requestId: ${requestId}`);
  try {
    const para = window['para'] as ParaWeb;
    switch (methodName) {
      case 'check2FAStatus': {
        console.log('Checking 2FA status...');
        const is2FAEnabled = await para.check2FAStatus();
        sendResponse('check2FAStatus', requestId, is2FAEnabled);
        break;
      }
      case 'checkIfUserExists': {
        console.log('Checking if user exists...');
        const userExists = await para.checkIfUserExists({ email: args[0] });
        sendResponse('checkIfUserExists', requestId, userExists);
        break;
      }
      case 'checkIfUserExistsByPhone': {
        console.log('Checking if user exists by phone...');
        const userExistsByPhone = await para.checkIfUserExistsByPhone({ phone: args[0], countryCode: args[1] });
        sendResponse('checkIfUserExistsByPhone', requestId, userExistsByPhone);
        break;
      }
      case 'claimPregenWallets': {
        console.log('Claiming pregen wallets...');
        const claimResult = await para.claimPregenWallets({ pregenIdentifier: args[0], pregenIdentifierType: args[1] });
        sendResponse('claimPregenWallets', requestId, claimResult);
        break;
      }
      case 'clearStorage': {
        console.log('Clearing storage...');
        para.clearStorage();
        sendResponse('clearStorage', requestId, null);
        break;
      }
      case 'createPregenWalletPerType': {
        console.log('Creating pregen wallet per type...');
        const pregenWallets = await para.createPregenWalletPerType({
          pregenIdentifier: args[0],
          pregenIdentifierType: args[1],
          types: args[2],
        });
        sendResponse('createPregenWalletPerType', requestId, pregenWallets);
        break;
      }
      case 'createUser': {
        console.log('Creating user...');
        await para.createUser({ email: args[0] });
        sendResponse('createUser', requestId, null);
        break;
      }
      case 'createUserByPhone': {
        console.log('Creating user by phone...');
        await para.createUserByPhone({ phone: args[0], countryCode: args[1] });
        sendResponse('createUserByPhone', requestId, null);
        break;
      }
      case 'createWallet': {
        console.log('Creating wallet...');
        const [wallet, recoveryShare] = await para.createWallet({ type: args[0], skipDistribute: args[1] });
        console.log('Wallet created:', wallet, 'Recovery share:', recoveryShare);
        sendResponse('createWallet', requestId, [{ wallet, recoveryShare }]);
        break;
      }
      case 'createWalletPerType': {
        console.log('Creating wallet per type...');
        const wallets = await para.createWalletPerType({ skipDistribute: args[0], types: args[1] });
        sendResponse('createWalletPerType', requestId, wallets);
        break;
      }
      case 'createWalletPreGen': {
        console.log('Creating wallet pre-gen...');
        const wallet = await para.createPregenWallet({
          type: args[0],
          pregenIdentifier: args[1],
          pregenIdentifierType: args[2],
        });
        sendResponse('createWalletPreGen', requestId, wallet);
        break;
      }
      case 'distributeNewWalletShare': {
        console.log('Distributing new wallet share...');
        const distributeResult = await para.distributeNewWalletShare({ walletId: args[0], userShare: args[1] });
        sendResponse('distributeNewWalletShare', requestId, distributeResult);
        break;
      }
      case 'enable2FA': {
        console.log('Enabling 2FA...');
        await para.enable2FA({ verificationCode: args[0] });
        sendResponse('enable2FA', requestId, null);
        break;
      }
      case 'ethersSignMessage': {
        console.log('Signing ethers message...');
        const signature = await ethersSignMessage(args);
        sendResponse('ethersSignMessage', requestId, signature);
        break;
      }
      case 'ethersSignTransaction': {
        console.log('Signing ethers transaction...');
        const signature = await ethersSignTransaction(args);
        sendResponse('ethersSignTransaction', requestId, signature);
        break;
      }
      case 'ethersSendTransaction': {
        console.log('Sending ethers transaction...');
        const txResponse = await ethersSendTransaction(args);
        sendResponse('ethersSendTransaction', requestId, txResponse);
        break;
      }
      case 'exportSession': {
        console.log('Exporting session...');
        const exportedSession = para.exportSession();
        sendResponse('exportSession', requestId, exportedSession);
        break;
      }
      case 'externalWalletLogin': {
        console.log('Logging in external wallet...');
        const externalWalletLoginResult = await para.externalWalletLogin({ address: args[0], type: args[1] });
        sendResponse('externalWalletLogin', requestId, externalWalletLoginResult);
        break;
      }
      case 'fetchWallets': {
        console.log('Fetching wallets...');
        const wallets = await para.fetchWallets();
        sendResponse('fetchWallets', requestId, wallets);
        break;
      }
      case 'generatePasskey': {
        console.log('Generating passkey...');
        await generatePasskey(para, args);
        console.log('Passkey generated successfully.');
        sendResponse('generatePasskey', requestId, true);
        break;
      }
      case 'generatePasskeyV2': {
        console.log('Generating passkey V2...');
        await generatePasskeyV2(para, args);
        console.log('Passkey V2 generated successfully.');
        sendResponse('generatePasskeyV2', requestId, true);
        break;
      }
      case 'getEmail': {
        console.log('Getting email...');
        const email = para.getEmail();
        sendResponse('getEmail', requestId, email);
        break;
      }
      case 'getFarcasterConnectURL': {
        console.log('Getting Farcaster Connect URL...');
        const farcasterConnectURL = await para.getFarcasterConnectURL();
        sendResponse('getFarcasterConnectURL', requestId, farcasterConnectURL);
        break;
      }
      case 'getOAuthURL': {
        console.log('Getting OAuth URL...');
        const oAuthUrl = await para.getOAuthURL({ method: args[0], deeplinkUrl: args[1] });
        sendResponse('getOAuthURL', requestId, oAuthUrl);
        break;
      }
      case 'getPregenWallets': {
        console.log('Getting pregen wallets...');
        const pregenWallets = await para.getPregenWallets({ pregenIdentifier: args[0], pregenIdentifierType: args[1] });
        sendResponse('getPregenWallets', requestId, pregenWallets);
        break;
      }
      case 'getSetUpBiometricsURL': {
        console.log('Getting set up biometrics URL...');
        const url = await para.getSetUpBiometricsURL();
        sendResponse('getSetUpBiometricsURL', requestId, url);
        break;
      }
      case 'getUserShare': {
        console.log('Getting user share...');
        const userShare = para.getUserShare();
        sendResponse('getUserShare', requestId, userShare);
        break;
      }
      case 'getWallets': {
        console.log('Getting wallets...');
        const wallets = para.getWallets();
        sendResponse('getWallets', requestId, wallets);
        break;
      }
      case 'getWalletsByType': {
        console.log('Getting wallets by type...');
        const walletsByType = await para.getWalletsByType(args[0]);
        sendResponse('getWalletsByType', requestId, walletsByType);
        break;
      }
      case 'getWebChallenge': {
        console.log('Getting web challenge...');
        const getWebChallengeResult = await para.ctx.client.getWebChallenge(args[0] ?? { email: '' });
        console.log('Web challenge result:', getWebChallengeResult);
        sendResponse('getWebChallenge', requestId, getWebChallengeResult);
        break;
      }
      case 'hasPregenWallet': {
        console.log('Checking if pregen wallet exists...');
        const hasPregenWallet = await para.hasPregenWallet({ pregenIdentifier: args[0], pregenIdentifierType: args[1] });
        sendResponse('hasPregenWallet', requestId, hasPregenWallet);
        break;
      }
      case 'initEthersSigner': {
        await initEthersSigner(para, args);
        sendResponse('initEthersSigner', requestId, true);
        break;
      }
      case 'isFullyLoggedIn': {
        console.log('Checking if fully logged in...');
        const fullyLoggedIn = await para.isFullyLoggedIn();
        sendResponse('isFullyLoggedIn', requestId, fullyLoggedIn);
        break;
      }
      case 'isSessionActive': {
        console.log('Checking if session is active...');
        const sessionActive = await para.isSessionActive();
        sendResponse('isSessionActive', requestId, sessionActive);
        break;
      }
      case 'login': {
        console.log('Logging in...');
        const desiredWallet = await login(para, args);
        console.log('Login successful. Desired wallet:', desiredWallet);
        sendResponse('login', requestId, desiredWallet);
        break;
      }
      case 'loginV2': {
        console.log('Logging in V2...');
        const desiredWallet2 = await loginV2(para, args);
        console.log('Login V2 successful. Desired wallet:', desiredWallet2);
        sendResponse('loginV2', requestId, desiredWallet2);
        break;
      }
      case 'logout': {
        console.log('Logging out...');
        await para.logout();
        sendResponse('logout', requestId, null);
        break;
      }
      case 'resendVerificationCode': {
        console.log('Resending verification code...');
        await para.resendVerificationCode();
        sendResponse('resendVerificationCode', requestId, null);
        break;
      }
      case 'resendVerificationCodeByPhone': {
        console.log('Resending verification code by phone...');
        await para.resendVerificationCodeByPhone();
        sendResponse('resendVerificationCodeByPhone', requestId, null);
        break;
      }
      case 'setEmail': {
        console.log('Setting email...');
        await para.setEmail(args[0]);
        sendResponse('setEmail', requestId, null);
        break;
      }
      case 'setUserShare': {
        console.log('Setting user share...');
        await para.setUserShare(args[0]);
        sendResponse('setUserShare', requestId, null);
        break;
      }
      case 'setup2FA': {
        console.log('Setting up 2FA...');
        const setup2FAResult = await para.setup2FA();
        sendResponse('setup2FA', requestId, setup2FAResult);
        break;
      }
      case 'signMessage': {
        console.log('Signing message...');
        const signMessageResult = await para.signMessage({ walletId: args[0], messageBase64: args[1] });
        sendResponse('signMessage', requestId, signMessageResult);
        break;
      }
      case 'signTransaction': {
        console.log('Signing transaction...');
        const signTransactionResult = await para.signTransaction({
          walletId: args[0],
          rlpEncodedTxBase64: args[1],
          chainId: args[2],
        });
        sendResponse('signTransaction', requestId, signTransactionResult);
        break;
      }
      case 'updateWalletIdentifierPreGen': {
        console.log('Updating wallet identifier pre-gen...');
        await para.updatePregenWalletIdentifier({
          walletId: args[0],
          newPregenIdentifier: args[1],
          newPregenIdentifierType: args[2],
        });
        sendResponse('updateWalletIdentifierPreGen', requestId, null);
        break;
      }
      case 'verifyEmail': {
        console.log('Verifying email...');
        const verifyEmailResult = await para.verifyEmail({ verificationCode: args[0] });
        sendResponse('verifyEmail', requestId, verifyEmailResult);
        break;
      }
      case 'verifyPhone': {
        console.log('Verifying phone...');
        const verifyPhoneResult = await para.verifyPhone({ verificationCode: args[0] });
        sendResponse('verifyPhone', requestId, verifyPhoneResult);
        break;
      }
      case 'verifyWebChallenge': {
        console.log('Verifying web challenge...');
        const verifyWebChallengeResult = await verifyWebChallenge(para, args);
        console.log('Web challenge verified:', verifyWebChallengeResult);
        sendResponse(
          'verifyWebChallenge',
          requestId,
          platform === Platform.iOS ? verifyWebChallengeResult['data']['userId'] : verifyWebChallengeResult,
        );
        break;
      }
      case 'waitForFarcasterStatus': {
        console.log('Waiting for Farcaster status...');
        const waitForFarcasterStatusResult = await para.waitForFarcasterStatus();
        sendResponse('waitForFarcasterStatus', requestId, waitForFarcasterStatusResult);
        break;
      }
      case 'waitForOAuth': {
        console.log('Waiting for OAuth...');
        const waitForOAuthResult = await para.waitForOAuth();
        sendResponse('waitForOAuth', requestId, waitForOAuthResult);
        break;
      }
      default: {
        throw new Error(`Method ${methodName} not implemented`);
      }
    }
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error invoking method ${methodName}:`, errorMessage);
    sendResponse(methodName, requestId, null, errorMessage);
  }
}

async function initEthersSigner(capsule: ParaWeb, args: any[]) {
  const walletId = args[0];
  const providerUrl = args[1];
  const provider = new ethers.JsonRpcProvider(providerUrl);
  const ethersSigner = new ParaEthersSigner(capsule, provider, walletId);

  window['ethersSigner'] = ethersSigner;

  return;
}

async function ethersSignMessage(args: any[]) {
  const message = args[0];
  const ethersSigner = window['ethersSigner'] as ParaEthersSigner;

  const signature = await ethersSigner.signMessage(message);
  return signature;
}

async function ethersSignTransaction(args: any[]) {
  const b64EncodedTx = args[0];
  const txBytes = base64ToBytes(b64EncodedTx);
  const decoder = new TextDecoder();
  const jsonString = decoder.decode(txBytes);
  const jsonTx = JSON.parse(jsonString);

  const ethersSigner = window['ethersSigner'] as ParaEthersSigner;

  const signature = ethersSigner.signTransaction(jsonTx);
  return signature;
}

async function ethersSendTransaction(args: any[]) {
  const b64EncodedTx = args[0];
  const txBytes = base64ToBytes(b64EncodedTx);
  const decoder = new TextDecoder();
  const jsonString = decoder.decode(txBytes);
  const jsonTx = JSON.parse(jsonString);

  const ethersSigner = window['ethersSigner'] as ParaEthersSigner;

  const txResponse = await ethersSigner.sendTransaction(jsonTx);
  return txResponse;
}

// Legacy passkey generation
async function generatePasskey(para: ParaWeb, args: any[]) {
  const attestationObject = args[0];
  const clientDataJson = args[1];
  const credentialsId = args[2];
  const userHandle = args[3] as Uint8Array;
  const biometricsId = args[4];

  const credentials = {
    response: {
      attestationObject: attestationObject,
      clientDataJSON: clientDataJson,
    },
  };

  const { cosePublicKey, clientDataJSON } = parseCredentialCreationRes(credentials, -7);
  const publicKeyHex = await getPublicKeyFromSignature(para.ctx, userHandle);
  const session = await para.ctx.client.touchSession();

  await para.ctx.client.patchSessionPublicKey(session.data.partnerId, para.getUserId(), biometricsId, {
    publicKey: credentialsId,
    sigDerivedPublicKey: publicKeyHex,
    cosePublicKey,
    clientDataJSON,
    status: PublicKeyStatus.COMPLETE,
  });
}

// New style of passkey generation
async function generatePasskeyV2(para: ParaWeb, args: any[]) {
  const attestationObject = args[0];
  ``;
  const clientDataJson = args[1];
  const credentialsId = args[2] as string;
  const userHandle = args[3] as string;
  const biometricsId = args[4] as string;

  const credentials = {
    response: {
      attestationObject: attestationObject,
      clientDataJSON: clientDataJson,
    },
  };

  const { cosePublicKey, clientDataJSON } = parseCredentialCreationRes(credentials, -7);
  const keyPair = await getAsymmetricKeyPair(para.ctx);
  const publicKeyHex = getPublicKeyHex(keyPair);

  const encryptionKeyHash = getSHA256HashHex(userHandle);
  const encryptedPrivateKeyHex = await encryptPrivateKey(keyPair, userHandle);

  const session = await para.ctx.client.touchSession();

  await para.ctx.client.patchSessionPublicKey(session.data.partnerId, para.getUserId(), biometricsId, {
    publicKey: credentialsId,
    sigDerivedPublicKey: publicKeyHex,
    cosePublicKey,
    clientDataJSON,
    status: PublicKeyStatus.COMPLETE,
  });

  await para.ctx.client.uploadEncryptedWalletPrivateKey(
    para.getUserId(),
    encryptedPrivateKeyHex,
    encryptionKeyHash,
    credentialsId,
  );
}

async function verifyWebChallenge(para: ParaWeb, args: any[]) {
  const publicKey = args[0];
  const authenticatorData = args[1];
  const clientDataJSON = args[2];
  const signature = args[3];

  const session = await para.ctx.client.touchSession();
  return await para.ctx.client.verifyWebChallenge(session.data.partnerId, {
    publicKey,
    signature: {
      clientDataJSON,
      authenticatorData,
      signature,
    },
  });
}

async function login(para: ParaWeb, args: any[]) {
  const userId = args[0];
  const signatureId = args[1];
  const userHandle = args[2];

  await para.setUserId(userId);
  if (!para.getEmail()) {
    const touchRes = await para.ctx.client.touchSession();
    if (touchRes.data.email) {
      await para.setEmail(touchRes.data.email);
    }
  }

  const encryptedSharesRes = await para.ctx.client.getBiometricKeyshares(userId, signatureId);
  const decryptedShares = await getDerivedPrivateKeyAndDecrypt(para.ctx, userHandle, encryptedSharesRes.data.keyShares);

  const walletsRes = await para.ctx.client.getWallets(userId);
  const desiredWallets = walletsRes.data.wallets;

  const walletsToInsert: { [id: string]: Wallet } = {};
  for (let desiredWallet of desiredWallets) {
    const decryptedShare = decryptedShares.find(share => share.walletId === desiredWallet.id);
    if (decryptedShare) {
      walletsToInsert[decryptedShare.walletId] = {
        id: decryptedShare.walletId,
        signer: decryptedShare.signer,
        address: desiredWallet.address,
        publicKey: desiredWallet.publicKey,
        scheme: desiredWallet.scheme as WalletScheme,
      };
    }
    await para.setWallets(walletsToInsert);

    // Return first wallet for backwards compatibility
    return desiredWallets[0];
  }
}

async function loginV2(para: ParaWeb, args: any[]) {
  const userId = args[0];
  const credentialsId = args[1];
  const userHandle = args[2];

  await para.setUserId(userId);
  if (!para.getEmail()) {
    const touchRes = await para.ctx.client.touchSession();
    if (touchRes.data.email) {
      await para.setEmail(touchRes.data.email);
    }
  }

  const encryptionKeyHash = getSHA256HashHex(userHandle);
  const encryptedSharesRes = await para.ctx.client.getBiometricKeyshares(userId, credentialsId);
  const { encryptedPrivateKeys } = await para.ctx.client.getEncryptedWalletPrivateKeys(userId, encryptionKeyHash);
  let decryptedShares;

  if (encryptedPrivateKeys.length === 0) {
    decryptedShares = await getDerivedPrivateKeyAndDecrypt(para.ctx, userHandle, encryptedSharesRes.data.keyShares);
    const keyPair = await getAsymmetricKeyPair(para.ctx, userHandle);
    const encryptedPrivateKeyHex = await encryptPrivateKey(keyPair, userHandle);
    await para.ctx.client.uploadEncryptedWalletPrivateKey(userId, encryptedPrivateKeyHex, encryptionKeyHash, credentialsId);
  } else {
    decryptedShares = await decryptPrivateKeyAndDecryptShare(
      userHandle,
      encryptedSharesRes.data.keyShares,
      encryptedPrivateKeys[0].encryptedPrivateKey,
    );
  }

  const walletsRes = await para.ctx.client.getWallets(userId);
  const desiredWallets = walletsRes.data.wallets;

  const walletsToInsert: { [id: string]: Wallet } = {};
  for (let desiredWallet of desiredWallets) {
    const decryptedShare = decryptedShares.find(share => share.walletId === desiredWallet.id);
    if (decryptedShare) {
      walletsToInsert[decryptedShare.walletId] = {
        id: decryptedShare.walletId,
        signer: decryptedShare.signer,
        address: desiredWallet.address,
        publicKey: desiredWallet.publicKey,
        scheme: desiredWallet.scheme as WalletScheme,
        type: desiredWallet.type || undefined,
        isExternal: false,
      };
    }
  }

  await para.setWallets(walletsToInsert);

  return desiredWallets[0];
}

// Override window.open to forward links to the native layer
window['open'] = function (url?: string | URL, target?: string, features?: string) {
  if (target != null || features != null) {
    throw new Error('target and features are not supported');
  }
  window['flutter_inappwebview'].callHandler('open', url);
  return window;
};

export {};
