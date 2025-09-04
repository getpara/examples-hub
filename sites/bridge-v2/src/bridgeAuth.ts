import { ParaWeb } from '@getpara/web-sdk';
import { parseCredentialCreationRes } from '@getpara/web-sdk';
import {
  AuthMethodStatus,
  getAsymmetricKeyPair,
  getPublicKeyHex,
  getSHA256HashHex,
  encryptPrivateKey,
  decryptPrivateKeyAndDecryptShare,
  getDerivedPrivateKeyAndDecrypt,
  Wallet,
} from '@getpara/core-sdk';
import { logger, formatError } from './logging';
import { GeneratePasskeyArgs, VerifyWebChallengeArgs, LoginWithPasskeyArgs } from './types';

export async function generatePasskey(para: ParaWeb, args: GeneratePasskeyArgs) {
  try {
    const { attestationObject, clientDataJson, credentialsId, userHandle, biometricsId } = args;

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
      logger.error('Error parsing credential creation response in generatePasskey:', formatError(parseErr));
      throw parseErr;
    }

    let keyPair;
    try {
      keyPair = await getAsymmetricKeyPair(para.ctx);
    } catch (keyPairErr) {
      logger.error('Error generating key pair in generatePasskey:', formatError(keyPairErr));
      throw keyPairErr;
    }

    const publicKeyHex = getPublicKeyHex(keyPair);
    logger.info('generatePasskey - publicKeyHex obtained:', publicKeyHex);

    const encryptionKeyHash = getSHA256HashHex(userHandle);

    let encryptedPrivateKeyHex: string;
    try {
      encryptedPrivateKeyHex = await encryptPrivateKey(keyPair, userHandle);
    } catch (encryptErr) {
      logger.error('Error encrypting private key in generatePasskey:', formatError(encryptErr));
      throw encryptErr;
    }

    logger.info('generatePasskey - encryptedPrivateKeyHex created for user:', para.getUserId());

    let session;
    try {
      session = await para.ctx.client.touchSession();
    } catch (sessionErr) {
      logger.error('Error touching session in generatePasskey:', formatError(sessionErr));
      throw sessionErr;
    }

    try {
      await para.ctx.client.patchSessionPublicKey(session.partnerId, para.getUserId(), biometricsId, {
        publicKey: credentialsId,
        sigDerivedPublicKey: publicKeyHex,
        cosePublicKey,
        clientDataJSON,
        status: AuthMethodStatus.COMPLETE,
      });
    } catch (patchErr) {
      logger.error('Error patching session public key in generatePasskey:', formatError(patchErr));
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
      logger.error('Error uploading encrypted wallet private key in generatePasskey:', formatError(uploadErr));
      throw uploadErr;
    }

    logger.info('generatePasskey completed successfully for user:', para.getUserId());
    return true;
  } catch (err) {
    logger.error('generatePasskey - Error:', formatError(err));
    throw err;
  }
}

export async function verifyWebChallenge(para: ParaWeb, args: VerifyWebChallengeArgs) {
  try {
    const { publicKey, authenticatorData, clientDataJSON, signature } = args;

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

export async function loginWithPasskey(para: ParaWeb, args: LoginWithPasskeyArgs) {
  try {
    const { userId, credentialsId, userHandle } = args;

    logger.info('loginWithPasskey called with userId:', userId, 'credentialsId:', credentialsId);

    try {
      await para.setUserId(userId);
    } catch (setIdErr) {
      logger.error('Error setting userId in loginWithPasskey:', formatError(setIdErr));
      throw setIdErr;
    }

    if (!para.getEmail()) {
      logger.info('Email not set, retrieving from session in loginWithPasskey...');
      try {
        const session = await para.ctx.client.touchSession();
        if (session.email) {
          await para.setEmail(session.email);
          logger.info('Email set from session for user:', userId);
        }
      } catch (touchErr) {
        logger.error('Error touching session in loginWithPasskey:', formatError(touchErr));
        throw touchErr;
      }
    }

    const encryptionKeyHash = getSHA256HashHex(userHandle);

    let encryptedSharesRes;
    try {
      encryptedSharesRes = await para.ctx.client.getBiometricKeyshares(userId, credentialsId);
    } catch (sharesErr) {
      logger.error('Error getting biometric keyshares in loginWithPasskey:', formatError(sharesErr));
      throw sharesErr;
    }

    let encryptedPrivateKeys;
    try {
      const res = await para.ctx.client.getEncryptedWalletPrivateKeys(userId, encryptionKeyHash);
      encryptedPrivateKeys = res.encryptedPrivateKeys;
    } catch (privateKeysErr) {
      logger.error('Error getting encrypted wallet private keys in loginWithPasskey:', formatError(privateKeysErr));
      throw privateKeysErr;
    }

    let decryptedShares;
    if (encryptedPrivateKeys.length === 0) {
      logger.info('No encrypted private keys found, deriving new one in loginWithPasskey...');
      try {
        decryptedShares = await getDerivedPrivateKeyAndDecrypt(para.ctx, userHandle, encryptedSharesRes.data.keyShares);
      } catch (derivedErr) {
        logger.error('Error deriving private key in loginWithPasskey:', formatError(derivedErr));
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
        logger.error('Error uploading new encrypted private key in loginWithPasskey:', formatError(uploadErr));
        throw uploadErr;
      }
    } else {
      logger.info('Encrypted private keys exist, decrypting in loginWithPasskey...');
      try {
        decryptedShares = await decryptPrivateKeyAndDecryptShare(
          userHandle,
          encryptedSharesRes.data.keyShares,
          encryptedPrivateKeys[0].encryptedPrivateKey,
        );
      } catch (decryptShareErr) {
        logger.error('Error decrypting share in loginWithPasskey:', formatError(decryptShareErr));
        throw decryptShareErr;
      }
    }

    let walletsRes;
    try {
      walletsRes = await para.ctx.client.getWallets(userId);
    } catch (walletErr) {
      logger.error('Error fetching wallets in loginWithPasskey:', formatError(walletErr));
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
      logger.error('Error setting wallets in loginWithPasskey:', formatError(setWalletErr));
      throw setWalletErr;
    }

    logger.info('loginWithPasskey completed successfully for user:', userId);
    return desiredWallets[0];
  } catch (err) {
    logger.error('loginWithPasskey - Error:', formatError(err));
    throw err;
  }
}
