import { CapsuleWeb, Environment } from '@usecapsule/web-sdk';
import {
  SignTypedDataVersion,
  TypedDataUtils,
  typedSignatureHash,
  TypedDataV1,
  TypedMessage,
  recoverTypedSignature,
} from '@metamask/eth-sig-util';
import { parseCredentialCreationRes } from '@usecapsule/web-sdk/dist/cryptography/webAuth';
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
} from '@usecapsule/core-sdk';
import { PublicKeyStatus } from '@usecapsule/user-management-client';

const div = document.createElement('div');
document.getElementsByTagName('body')[0].appendChild(div);
div.innerHTML = "<center><h1 id='message'></h1></center>";
document.getElementById('message').innerHTML = 'Errors will appear here';

enum Platform {
  flutter,
  iOS,
}

let platform: Platform;
let version;

window.addEventListener('message', function (event) {
  const data = event.data;
  switch (data['messageType']) {
    case 'Capsule#init':
      initCapsule(data['arguments']['environment'], data['arguments']['apiKey']);
      platform = Platform[data['arguments']['platform'] as keyof typeof Platform] ?? Platform.flutter;
      version = data['arguments']['version'];
      break;
    case 'Capsule#invokeMethod':
      invokeCapsuleMethod(data['methodName'], data['arguments']);
      break;
    case undefined:
      break;
    default:
      throw new Error('Unknown message type: ' + data['messageType']);
  }
});

function sendResponse(method: string, responseData: any, error: Error | undefined = undefined) {
  switch (platform) {
    case Platform.flutter:
      switch (version) {
        case undefined:
        case null:
          window['flutter_inappwebview'].callHandler('asyncResult', responseData);
          break;
        default:
          window['flutter_inappwebview'].callHandler('asyncResult', { responseData, error });
      }
      break;
    case Platform.iOS:
      window['webkit'].messageHandlers.callback.postMessage({ method, responseData, error });
      break;
  }
}

function initCapsule(environment: string, apiKey: string) {
  document.getElementById('message').innerHTML = 'Initializing Capsule';
  if (window['capsule'] != null) {
    // TODO: Support multiple Capsules
    throw new Error('Capsule already initialized');
  }
  const capsule = new CapsuleWeb(environment as Environment, apiKey, {
    disableWorkers: false,
  });
  capsule.init();
  window['capsule'] = capsule;
  document.getElementById('message').innerHTML = 'Capsule initialized';
}

async function invokeCapsuleMethod(methodName: string, args: any[]) {
  try {
    const capsule = window['capsule'] as CapsuleWeb;
    switch (methodName) {
      case 'createWallet':
        const [wallet, recoveryShare] = await capsule.createWallet(args[0], args[1]);
        sendResponse('createWallet', [
          {
            wallet: { id: wallet.id, signer: wallet.signer, address: wallet.address, publicKey: wallet.publicKey },
            recoveryShare: recoveryShare,
          },
        ]);
        break;
      case 'getUserId':
        // @ts-ignore
        const userId = capsule.userId;
        sendResponse('getUserId', userId);
        break;
      case 'signTypedData': {
        const signMessageResult = await signTypedData(capsule, args);
        sendResponse('signTypedData', signMessageResult);
        break;
      }
      case 'recoverTypedSignature':
        const data = args[0];
        const signature = args[1];
        const version = args[2];
        const prefixedSignature = signature.startsWith('0x') ? signature : `0x${signature}`;
        const address = recoverTypedSignature({ data, signature: prefixedSignature, version: version });
        sendResponse('recoverTypedSignature', address);
        break;
      case 'generatePasskey':
        await generatePasskey(capsule, args);
        sendResponse('generatePasskey', true);
        break;
      case 'generatePasskeyV2':
        await generatePasskeyV2(capsule, args);
        sendResponse('generatePasskeyV2', true);
        break;
      case 'getWebChallenge':
        const getWebChallengeResult = await capsule.ctx.capsuleClient.getWebChallenge('');
        sendResponse('getWebChallenge', getWebChallengeResult);
        break;
      case 'verifyWebChallenge':
        const verifyWebChallengeResult = await verifyWebChallenge(capsule, args);
        sendResponse(
          'verifyWebChallenge',
          platform === Platform.iOS ? verifyWebChallengeResult['data']['userId'] : verifyWebChallengeResult,
        );
        break;
      case 'login':
        const desiredWallet = await login(capsule, args);
        sendResponse('login', desiredWallet);
        break;
      case 'loginV2':
        const desiredWallet2 = await loginV2(capsule, args);
        sendResponse('loginV2', desiredWallet2);
        break;
      default:
        const result = capsule[methodName](...args);
        const resolvedResult = result instanceof Promise ? await result : result;
        sendResponse(methodName, resolvedResult);
        break;
    }
  } catch (error) {
    sendResponse(methodName, null, error.message);
  }
}

async function signTypedData(capsule: CapsuleWeb, args: any[]) {
  // https://github.com/MetaMask/eth-sig-util/blob/3f135714c1bf4ccc4ad41346a66005d5492c5be1/src/sign-typed-data.ts#L815
  const from: string = args[0];
  const data = args[1];
  const opts = args[2];
  const currentWallet = Object.values(capsule.wallets).find(wallet => wallet.address === from);
  const walletId = currentWallet!.id;
  const hashedTypedData =
    opts['version'] === SignTypedDataVersion.V1
      ? Buffer.from(typedSignatureHash(data as TypedDataV1).substring(2), 'hex')
      : TypedDataUtils.eip712Hash(data as unknown as TypedMessage<any>, opts['version']);
  const message = Buffer.from(hashedTypedData).toString('base64');
  const signMessageResult = await capsule.signMessage(walletId, message);

  return signMessageResult;
}

// This is the legacy style of passkey generation. We have to support
// this so we don't break apps that have not updated to the latest version
// yet.
async function generatePasskey(capsule: CapsuleWeb, args: any[]) {
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
  const publicKeyHex = await getPublicKeyFromSignature(capsule.ctx, userHandle);
  const session = await capsule.ctx.capsuleClient.touchSession();

  await capsule.ctx.capsuleClient.patchSessionPublicKey(session.data.partnerId, capsule.getUserId(), biometricsId, {
    publicKey: credentialsId,
    sigDerivedPublicKey: publicKeyHex,
    cosePublicKey,
    clientDataJSON,
    status: PublicKeyStatus.COMPLETE,
  });
}

// This is the new style of passkey generation using userHandleEncoded
// instead of the UInt16Array of the userHandle. This also generates a
// random keyPair and encrypts it using the userHandleEncoded instead of
// generating it from the userHandle itself.
async function generatePasskeyV2(capsule: CapsuleWeb, args: any[]) {
  const attestationObject = args[0];
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
  const keyPair = await getAsymmetricKeyPair(capsule.ctx);
  const publicKeyHex = getPublicKeyHex(keyPair);

  const encryptionKeyHash = getSHA256HashHex(userHandle);

  const encryptedPrivateKeyHex = await encryptPrivateKey(keyPair, userHandle);

  const session = await capsule.ctx.capsuleClient.touchSession();

  await capsule.ctx.capsuleClient.patchSessionPublicKey(session.data.partnerId, capsule.getUserId(), biometricsId, {
    publicKey: credentialsId,
    sigDerivedPublicKey: publicKeyHex,
    cosePublicKey,
    clientDataJSON,
    status: PublicKeyStatus.COMPLETE,
  });

  await capsule.ctx.capsuleClient.uploadEncryptedWalletPrivateKey(
    capsule.getUserId(),
    encryptedPrivateKeyHex,
    encryptionKeyHash,
    credentialsId,
  );
}

async function verifyWebChallenge(capsule: CapsuleWeb, args: any[]) {
  const publicKeyId = args[0];
  const authenticatorData = args[1];
  const clientDataJSON = args[2];
  const signature = args[3];

  const session = await capsule.ctx.capsuleClient.touchSession();
  const verifyWebChallengeResult = await capsule.ctx.capsuleClient.verifyWebChallenge(session.data.partnerId, {
    publicKey: publicKeyId,
    signature: {
      clientDataJSON: clientDataJSON,
      authenticatorData: authenticatorData,
      signature: signature,
    },
  });

  return verifyWebChallengeResult;
}

async function login(capsule: CapsuleWeb, args: any[]) {
  const userId = args[0];
  const signatureId = args[1];
  const userHandle = args[2];

  await capsule.setUserId(userId);

  const encryptedSharesRes = await capsule.ctx.capsuleClient.getBiometricKeyshares(userId, signatureId);
  const decryptedShares = await getDerivedPrivateKeyAndDecrypt(capsule.ctx, userHandle, encryptedSharesRes.data.keyShares);

  const walletsRes = await capsule.ctx.capsuleClient.getWallets(userId);
  const desiredWallet = walletsRes.data.wallets[0];

  var walletsToInsert: { [id: string]: Wallet } = {};
  walletsToInsert[decryptedShares[0].walletId] = {
    id: decryptedShares[0].walletId,
    signer: decryptedShares[0].signer,
    address: desiredWallet.address,
    publicKey: desiredWallet.publicKey,
    scheme: desiredWallet.scheme as WalletScheme,
  };

  await capsule.setWallets(walletsToInsert);

  return desiredWallet;
}

async function loginV2(capsule: CapsuleWeb, args: any[]) {
  const userId = args[0];
  const credentialsId = args[1];
  const userHandle = args[2];

  await capsule.setUserId(userId);

  const encryptionKeyHash = getSHA256HashHex(userHandle);
  const encryptedSharesRes = await capsule.ctx.capsuleClient.getBiometricKeyshares(userId, credentialsId);
  const { encryptedPrivateKeys } = await capsule.ctx.capsuleClient.getEncryptedWalletPrivateKeys(userId, encryptionKeyHash);
  let decryptedShares;
  if (encryptedPrivateKeys.length === 0) {
    // If this is successful, we can upgrade the user to the new method of passkey schema
    decryptedShares = await getDerivedPrivateKeyAndDecrypt(capsule.ctx, userHandle, encryptedSharesRes.data.keyShares);
    const keyPair = await getAsymmetricKeyPair(capsule.ctx, userHandle);
    const encryptedPrivateKeyHex = await encryptPrivateKey(keyPair, userHandle);
    await capsule.ctx.capsuleClient.uploadEncryptedWalletPrivateKey(
      userId,
      encryptedPrivateKeyHex,
      encryptionKeyHash,
      credentialsId,
    );
  } else {
    decryptedShares = await decryptPrivateKeyAndDecryptShare(
      userHandle,
      encryptedSharesRes.data.keyShares,
      encryptedPrivateKeys[0].encryptedPrivateKey,
    );
  }
  const walletsRes = await capsule.ctx.capsuleClient.getWallets(userId);
  const desiredWallet = walletsRes.data.wallets[0];

  var walletsToInsert: { [id: string]: Wallet } = {};
  walletsToInsert[decryptedShares[0].walletId] = {
    id: decryptedShares[0].walletId,
    signer: decryptedShares[0].signer,
    address: desiredWallet.address,
    publicKey: desiredWallet.publicKey,
    scheme: desiredWallet.scheme as WalletScheme,
  };

  await capsule.setWallets(walletsToInsert);

  return desiredWallet;
}

window['open'] = function (url?: string | URL, target?: string, features?: string) {
  if (target != null || features != null) {
    throw new Error('target and features are not supported');
  }
  window['flutter_inappwebview'].callHandler('open', url);
  return window;
};

export {};
