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
      case 'createWallet': {
        console.log('Creating wallet...');
        const [wallet, recoveryShare] = await para.createWallet({ type: args[0], skipDistribute: args[1] });
        console.log('Wallet created:', wallet, 'Recovery share:', recoveryShare);
        sendResponse('createWallet', requestId, [{ wallet, recoveryShare }]);
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
      case 'getWebChallenge': {
        console.log('Getting web challenge...');
        const getWebChallengeResult = await para.ctx.client.getWebChallenge(args[0] ?? { email: '' });
        console.log('Web challenge result:', getWebChallengeResult);
        sendResponse('getWebChallenge', requestId, getWebChallengeResult);
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
      case 'initEthersSigner': {
        await initEthersSigner(para, args);
        sendResponse('initEthersSigner', requestId, true);
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
      default: {
        console.log(`Invoking default method: ${methodName}`);
        const result = para[methodName](...args);
        const resolvedResult = result instanceof Promise ? await result : result;
        console.log(`Method ${methodName} invoked successfully. Result:`, resolvedResult);
        sendResponse(methodName, requestId, resolvedResult);
        break;
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
