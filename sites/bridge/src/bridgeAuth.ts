import { ParaWeb } from '@getpara/web-sdk';
import { parseCredentialCreationRes } from '@getpara/web-sdk';
import {
  getAsymmetricKeyPair,
  getPublicKeyHex,
  getSHA256HashHex,
  encryptPrivateKey,
  decryptPrivateKeyAndDecryptShare,
  getDerivedPrivateKeyAndDecrypt,
  getPublicKeyFromSignature,
  Wallet,
} from '@getpara/core-sdk';
import { PublicKeyStatus } from '@getpara/user-management-client';
import { logger, formatError } from './logging';

export async function generatePasskey(para: ParaWeb, args: any[]) {
  try {
    const attestationObject = args[0];
    const clientDataJson = args[1];
    const credentialsId = args[2];
    const userHandle = args[3] as Uint8Array;
    const biometricsId = args[4];

    logger.info('generatePasskey called with credentialsId:', credentialsId, 'and biometricsId:', biometricsId);

    const credentials = {
      response: {
        attestationObject,
        clientDataJSON: clientDataJson,
      },
    };

    let cosePublicKey;
    let clientDataJSON;

    try {
      const parsedRes = parseCredentialCreationRes(credentials, -7);
      cosePublicKey = parsedRes.cosePublicKey;
      clientDataJSON = parsedRes.clientDataJSON;
    } catch (parseErr) {
      logger.error('Error parsing credential creation response:', formatError(parseErr));
      throw parseErr;
    }

    let publicKeyHex: string;

    try {
      publicKeyHex = await getPublicKeyFromSignature(para.ctx, userHandle);
    } catch (signErr) {
      logger.error('Error getting public key from signature:', formatError(signErr));
      throw signErr;
    }

    logger.info('generatePasskey - publicKeyHex obtained:', publicKeyHex);

    let session;

    try {
      session = await para.ctx.client.touchSession();
    } catch (sessionErr) {
      logger.error('Error touching session:', formatError(sessionErr));
      throw sessionErr;
    }

    try {
      await para.ctx.client.patchSessionPublicKey(session.partnerId, para.getUserId(), biometricsId, {
        publicKey: credentialsId,
        sigDerivedPublicKey: publicKeyHex,
        cosePublicKey,
        clientDataJSON,
        status: PublicKeyStatus.COMPLETE,
      });
    } catch (patchErr) {
      logger.error('Error patching session public key:', formatError(patchErr));
      throw patchErr;
    }

    logger.info('generatePasskey completed successfully for user:', para.getUserId());
    return true;
  } catch (err) {
    logger.error('generatePasskey - Error:', formatError(err));
    throw err;
  }
}

export async function generatePasskeyV2(para: ParaWeb, args: any[]) {
  try {
    const attestationObject = args[0];
    const clientDataJson = args[1];
    const credentialsId = args[2] as string;
    const userHandle = args[3] as string;
    const biometricsId = args[4] as string;

    logger.info('generatePasskeyV2 called with credentialsId:', credentialsId, 'and biometricsId:', biometricsId);

    const credentials = {
      response: {
        attestationObject,
        clientDataJSON: clientDataJson,
      },
    };

    let cosePublicKey;
    let clientDataJSON;
    try {
      const parsedRes = parseCredentialCreationRes(credentials, -7);
      cosePublicKey = parsedRes.cosePublicKey;
      clientDataJSON = parsedRes.clientDataJSON;
    } catch (parseErr) {
      logger.error('Error parsing credential creation response in generatePasskeyV2:', formatError(parseErr));
      throw parseErr;
    }

    let keyPair;
    try {
      keyPair = await getAsymmetricKeyPair(para.ctx);
    } catch (keyPairErr) {
      logger.error('Error generating key pair in generatePasskeyV2:', formatError(keyPairErr));
      throw keyPairErr;
    }

    const publicKeyHex = getPublicKeyHex(keyPair);
    logger.info('generatePasskeyV2 - publicKeyHex obtained:', publicKeyHex);

    const encryptionKeyHash = getSHA256HashHex(userHandle);

    let encryptedPrivateKeyHex: string;
    try {
      encryptedPrivateKeyHex = await encryptPrivateKey(keyPair, userHandle);
    } catch (encryptErr) {
      logger.error('Error encrypting private key in generatePasskeyV2:', formatError(encryptErr));
      throw encryptErr;
    }

    logger.info('generatePasskeyV2 - encryptedPrivateKeyHex created for user:', para.getUserId());

    let session;
    try {
      session = await para.ctx.client.touchSession();
    } catch (sessionErr) {
      logger.error('Error touching session in generatePasskeyV2:', formatError(sessionErr));
      throw sessionErr;
    }

    try {
      await para.ctx.client.patchSessionPublicKey(session.partnerId, para.getUserId(), biometricsId, {
        publicKey: credentialsId,
        sigDerivedPublicKey: publicKeyHex,
        cosePublicKey,
        clientDataJSON,
        status: PublicKeyStatus.COMPLETE,
      });
    } catch (patchErr) {
      logger.error('Error patching session public key in generatePasskeyV2:', formatError(patchErr));
      throw patchErr;
    }

    try {
      await para.ctx.client.uploadEncryptedWalletPrivateKey(
        para.getUserId(),
        encryptedPrivateKeyHex,
        encryptionKeyHash,
        credentialsId,
      );
    } catch (uploadErr) {
      logger.error('Error uploading encrypted wallet private key in generatePasskeyV2:', formatError(uploadErr));
      throw uploadErr;
    }

    logger.info('generatePasskeyV2 completed successfully for user:', para.getUserId());
    return true;
  } catch (err) {
    logger.error('generatePasskeyV2 - Error:', formatError(err));
    throw err;
  }
}

export async function verifyWebChallenge(para: ParaWeb, args: any[]) {
  try {
    const publicKey = args[0];
    const authenticatorData = args[1];
    const clientDataJSON = args[2];
    const signature = args[3];

    logger.info('verifyWebChallenge called with publicKey:', publicKey);

    let session;
    try {
      session = await para.ctx.client.touchSession();
    } catch (sessionErr) {
      logger.error('Error touching session in verifyWebChallenge:', formatError(sessionErr));
      throw sessionErr;
    }

    const result = await para.ctx.client.verifyWebChallenge(session.partnerId, {
      publicKey,
      signature: {
        clientDataJSON,
        authenticatorData,
        signature,
      },
    });

    logger.info('verifyWebChallenge completed successfully for user:', para.getUserId());
    return result;
  } catch (err) {
    logger.error('verifyWebChallenge - Error:', formatError(err));
    throw err;
  }
}

export async function login(para: ParaWeb, args: any[]) {
  try {
    const userId = args[0];
    const signatureId = args[1];
    const userHandle = args[2];

    logger.info('login called with userId:', userId, 'signatureId:', signatureId);

    try {
      await para.setUserId(userId);
    } catch (setIdErr) {
      logger.error('Error setting userId in login:', formatError(setIdErr));
      throw setIdErr;
    }

    if (!para.getEmail()) {
      logger.info('Email not set, retrieving from session...');
      try {
        const session = await para.ctx.client.touchSession();
        if (session.email) {
          await para.setEmail(session.email);
          logger.info('Email set from session for user:', userId);
        }
      } catch (touchErr) {
        logger.error('Error touching session in login:', formatError(touchErr));
        throw touchErr;
      }
    }

    let encryptedSharesRes;
    try {
      encryptedSharesRes = await para.ctx.client.getBiometricKeyshares(userId, signatureId);
    } catch (sharesErr) {
      logger.error('Error getting biometric keyshares in login:', formatError(sharesErr));
      throw sharesErr;
    }

    let decryptedShares;
    try {
      decryptedShares = await getDerivedPrivateKeyAndDecrypt(para.ctx, userHandle, encryptedSharesRes.data.keyShares);
    } catch (decryptErr) {
      logger.error('Error decrypting user shares in login:', formatError(decryptErr));
      throw decryptErr;
    }

    let walletsRes;
    try {
      walletsRes = await para.ctx.client.getWallets(userId);
    } catch (walletErr) {
      logger.error('Error fetching wallets in login:', formatError(walletErr));
      throw walletErr;
    }

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
          scheme: desiredWallet.scheme as any,
        };
      }
      try {
        await para.setWallets(walletsToInsert);
      } catch (setWalletErr) {
        logger.error('Error setting wallets in login:', formatError(setWalletErr));
        throw setWalletErr;
      }

      logger.info('login completed successfully for user:', userId);
      return desiredWallets[0];
    }

    logger.warn('No desiredWallet found in login for user:', userId);
    return null;
  } catch (err) {
    logger.error('login - Error:', formatError(err));
    throw err;
  }
}

export async function loginV2(para: ParaWeb, args: any[]) {
  try {
    const userId = args[0];
    const credentialsId = args[1];
    const userHandle = args[2];

    logger.info('loginV2 called with userId:', userId, 'credentialsId:', credentialsId);

    try {
      await para.setUserId(userId);
    } catch (setIdErr) {
      logger.error('Error setting userId in loginV2:', formatError(setIdErr));
      throw setIdErr;
    }

    if (!para.getEmail()) {
      logger.info('Email not set, retrieving from session in loginV2...');
      try {
        const session = await para.ctx.client.touchSession();
        if (session.email) {
          await para.setEmail(session.email);
          logger.info('Email set from session for user:', userId);
        }
      } catch (touchErr) {
        logger.error('Error touching session in loginV2:', formatError(touchErr));
        throw touchErr;
      }
    }

    const encryptionKeyHash = getSHA256HashHex(userHandle);

    let encryptedSharesRes;
    try {
      encryptedSharesRes = await para.ctx.client.getBiometricKeyshares(userId, credentialsId);
    } catch (sharesErr) {
      logger.error('Error getting biometric keyshares in loginV2:', formatError(sharesErr));
      throw sharesErr;
    }

    let encryptedPrivateKeys;
    try {
      const res = await para.ctx.client.getEncryptedWalletPrivateKeys(userId, encryptionKeyHash);
      encryptedPrivateKeys = res.encryptedPrivateKeys;
    } catch (privateKeysErr) {
      logger.error('Error getting encrypted wallet private keys in loginV2:', formatError(privateKeysErr));
      throw privateKeysErr;
    }

    let decryptedShares;
    if (encryptedPrivateKeys.length === 0) {
      logger.info('No encrypted private keys found, deriving new one in loginV2...');
      try {
        decryptedShares = await getDerivedPrivateKeyAndDecrypt(para.ctx, userHandle, encryptedSharesRes.data.keyShares);
      } catch (derivedErr) {
        logger.error('Error deriving private key in loginV2:', formatError(derivedErr));
        throw derivedErr;
      }

      try {
        const keyPair = await getAsymmetricKeyPair(para.ctx, userHandle);
        const encryptedPrivateKeyHex = await encryptPrivateKey(keyPair, userHandle);
        await para.ctx.client.uploadEncryptedWalletPrivateKey(
          userId,
          encryptedPrivateKeyHex,
          encryptionKeyHash,
          credentialsId,
        );
      } catch (uploadErr) {
        logger.error('Error uploading new encrypted private key in loginV2:', formatError(uploadErr));
        throw uploadErr;
      }
    } else {
      logger.info('Encrypted private keys exist, decrypting in loginV2...');
      try {
        decryptedShares = await decryptPrivateKeyAndDecryptShare(
          userHandle,
          encryptedSharesRes.data.keyShares,
          encryptedPrivateKeys[0].encryptedPrivateKey,
        );
      } catch (decryptShareErr) {
        logger.error('Error decrypting share in loginV2:', formatError(decryptShareErr));
        throw decryptShareErr;
      }
    }

    let walletsRes;
    try {
      walletsRes = await para.ctx.client.getWallets(userId);
    } catch (walletErr) {
      logger.error('Error fetching wallets in loginV2:', formatError(walletErr));
      throw walletErr;
    }

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
          scheme: desiredWallet.scheme as any,
          type: desiredWallet.type || undefined,
          isExternal: false,
        };
      }
    }

    try {
      await para.setWallets(walletsToInsert);
    } catch (setWalletErr) {
      logger.error('Error setting wallets in loginV2:', formatError(setWalletErr));
      throw setWalletErr;
    }

    logger.info('loginV2 completed successfully for user:', userId);
    return desiredWallets[0];
  } catch (err) {
    logger.error('loginV2 - Error:', formatError(err));
    throw err;
  }
}
