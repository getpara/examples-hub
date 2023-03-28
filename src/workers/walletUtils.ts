import { Chain } from '@capsule/client';
import { Ctx } from '../definitions';
import { getBaseUrl } from '../external/userManagementClient';

const configBase = (serverUrl: string, walletId: string, id: string) =>
  `{"ServerUrl":"${serverUrl}", "WalletId": "${walletId}", "Id":"${id}", "Ids":["USER","CAPSULE"], "Threshold":1}`;

function getServerUrl(ctx: Ctx, userId: string) {
  const baseUrl = getBaseUrl(ctx.env);
  return `${baseUrl}users/${userId}/mpc-network`;
}

export async function keygen(
  ctx: Ctx,
  userId: string
): Promise<{ shares: string[]; walletId: string }> {
  // @osdnk: @Norwood, that's the code form the worker
  // const publicKeysRes = await userManagementClient.getSessionPublicKeys(userId);
  // const encryptedKeyShares = await Promise.all(
  //   publicKeysRes.map(key => {
  //     const signer = keygenRes.shares[0];
  //     if (key.type === 'WEB') {
  //       const encryptedShare = encryptWithDerivedPublicKey(key.derivedPublicKey, signer);
  //       return {
  //         encryptedShare,
  //         type: KeyType.USER,
  //         encryptorType: EncryptorType.BIOMETRICS,
  //         biometricPublicKey: key.derivedPublicKey,
  //       };
  //     } else {
  //       // TODO: also encrypt with biometric public key from mobile and persist in backend
  //       throw new Error('only support type WEB biometrics for web wallets');
  //     }
  //   }),
  // );
  // await userManagementClient.uploadKeyshares(userId, keygenRes.walletId, encryptedKeyShares);

  const { walletId, protocolId } = await ctx.capsuleClient.createWallet(
    userId,
    { useTwoSigners: true }
  );
  const serverUrl = getServerUrl(ctx, userId);
  const signerConfigUser = configBase(serverUrl, walletId, 'USER');
  const newSigner = (await new Promise((resolve, reject) =>
    global.createAccount(
      signerConfigUser,
      serverUrl,
      protocolId,
      (err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      }
    )
  )) as string;
  return { shares: [newSigner], walletId };
}

export async function signMessage(
  ctx: Ctx,
  share: string,
  walletId: string,
  userId: string,
  message: string
): Promise<string> {
  const { protocolId } = await ctx.capsuleClient.preSignMessage(
    userId,
    walletId,
    message
  );
  const serverUrl = getServerUrl(ctx, userId);

  return new Promise((resolve, reject) =>
    global.sendTransaction(
      share,
      serverUrl,
      message,
      protocolId,
      (err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      }
    )
  );
}
export async function sendTransaction(
  ctx: Ctx,
  share: string,
  walletId: string,
  userId: string,
  tx: string,
  chain: Chain,
): Promise<string> {
  const { protocolId } = await ctx.capsuleClient.sendTransaction(
    userId,
    walletId,
    { transaction: tx, chain }
  );
  const serverUrl = getServerUrl(ctx, userId);

  return new Promise((resolve, reject) =>
    global.sendTransaction(share, serverUrl, tx, protocolId, (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(result);
    })
  );
}

export async function refresh(
  ctx: Ctx,
  share: string,
  walletId: string,
  userId: string
): Promise<string> {
  const {
    data: { protocolId },
  } = await ctx.capsuleClient.refreshKeys(userId, walletId);
  const serverUrl = getServerUrl(ctx, userId);
  return new Promise((resolve, reject) =>
    global.refresh(share, serverUrl, protocolId, (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(result);
    })
  );
}
