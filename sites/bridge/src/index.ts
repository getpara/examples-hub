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
import { getPublicKeyFromSignature, getDerivedPrivateKeyAndDecrypt } from '@usecapsule/core-sdk';
import { PublicKeyStatus } from '@usecapsule/user-management-client';
import { Wallet } from '@usecapsule/core-sdk';

const div = document.createElement('div');
document.getElementsByTagName('body')[0].appendChild(div);
div.innerHTML = "<center><h1 id='message'></h1></center>";
document.getElementById('message').innerHTML = 'Errors will appear here';

window.addEventListener('message', function (event) {
  const data = event.data;
  switch (data['messageType']) {
    case 'Capsule#init':
      initCapsule(data['arguments']['environment'], data['arguments']['apiKey']);
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
  const capsule = window['capsule'] as CapsuleWeb;
  switch (methodName) {
    case 'createWallet':
      const [wallet, recoveryShare] = await capsule.createWallet(args[0], args[1]);
      window['flutter_inappwebview'].callHandler('asyncResult', [
        {
          wallet: { id: wallet.id, signer: wallet.signer, address: wallet.address, publicKey: wallet.publicKey },
          recoveryShare: recoveryShare,
        },
      ]);
      break;
    case 'getUserId':
      // @ts-ignore
      const userId = capsule.userId;
      window['flutter_inappwebview'].callHandler('asyncResult', userId);
      break;
    case 'signTypedData': {
      const signMessageResult = await signTypedData(capsule, args);
      window['flutter_inappwebview'].callHandler('asyncResult', signMessageResult);
      break;
    }
    case 'recoverTypedSignature':
      const data = args[0];
      const signature = args[1];
      const version = args[2];
      const prefixedSignature = signature.startsWith('0x') ? signature : `0x${signature}`;
      const address = recoverTypedSignature({ data, signature: prefixedSignature, version: version });
      window['flutter_inappwebview'].callHandler('asyncResult', address);
      break;
    case 'generatePasskey':
      await generatePasskey(capsule, args);
      window['flutter_inappwebview'].callHandler('asyncResult');
      break;
    case 'getWebChallenge':
      const getWebChallengeResult = await capsule.ctx.capsuleClient.getWebChallenge('');
      window['flutter_inappwebview'].callHandler('asyncResult', getWebChallengeResult);
      break;
    case 'verifyWebChallenge':
      const verifyWebChallengeResult = await verifyWebChallenge(capsule, args);
      window['flutter_inappwebview'].callHandler('asyncResult', verifyWebChallengeResult);
      break;
    case 'login':
      const desiredWallet = await login(capsule, args);
      window['flutter_inappwebview'].callHandler('asyncResult', desiredWallet);
      break;
    default:
      const result = capsule[methodName](...args);
      const resolvedResult = result instanceof Promise ? await result : result;
      window['flutter_inappwebview'].callHandler('asyncResult', resolvedResult);
      break;
  }
}

async function signTypedData(capsule: CapsuleWeb, args: any[]) {
  // https://github.com/MetaMask/eth-sig-util/blob/3f135714c1bf4ccc4ad41346a66005d5492c5be1/src/sign-typed-data.ts#L815
  const from: string = args[0];
  const data = args[1];
  const opts = args[2];
  const currentWallet = Object.values(capsule.getWallets()).find((wallet) => wallet.address === from);
  const walletId = currentWallet!.id;
  const hashedTypedData =
    opts['version'] === SignTypedDataVersion.V1
      ? Buffer.from(typedSignatureHash(data as TypedDataV1).substring(2), 'hex')
      : TypedDataUtils.eip712Hash(data as unknown as TypedMessage<any>, opts['version']);
  const message = Buffer.from(hashedTypedData).toString('base64');
  const signMessageResult = await capsule.signMessage(walletId, message);

  return signMessageResult;
}

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

  await capsule.ctx.capsuleClient.patchSessionPublicKey(capsule.getUserId(), biometricsId, {
    publicKey: credentialsId,
    sigDerivedPublicKey: publicKeyHex,
    cosePublicKey,
    clientDataJSON,
    status: PublicKeyStatus.COMPLETE,
  });
}

async function verifyWebChallenge(capsule: CapsuleWeb, args: any[]) {
  const publicKeyId = args[0];
  const authenticatorData = args[1];
  const clientDataJSON = args[2];
  const signature = args[3];

  const webSignature = {
    clientDataJSON: clientDataJSON,
    authenticatorData: authenticatorData,
    signature: signature,
  };

  const verifyWebChallengeResult = await capsule.ctx.capsuleClient.verifyWebChallenge({
    publicKey: publicKeyId,
    signature: webSignature,
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
    scheme: desiredWallet.scheme,
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
