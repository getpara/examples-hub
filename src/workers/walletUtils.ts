import { Ctx } from '../definitions';
import { getBaseUrl } from '../external/capsuleClient';

const configBase = (serverUrl: string, walletId: string, id: string) =>
  `{"ServerUrl":"${serverUrl}", "WalletId": "${walletId}", "Id":"${id}", "Ids":["USER","CAPSULE"], "Threshold":1}`;

function getServerUrl(ctx: Ctx, userId: string) {
  const baseUrl = getBaseUrl(ctx.env);
  return `${baseUrl}users/${userId}/mpc-network`;
}

export async function keygen(
  ctx: Ctx,
  userId: string,
  secretKey: string | null,
  callCustomFunction: Function,
): Promise<{ signer: string; walletId: string }> {
  const { walletId, protocolId } = await ctx.capsuleClient.createWallet(
    userId,
    { useTwoSigners: true }
  );
  const serverUrl = getServerUrl(ctx, userId);
  const signerConfigUser = configBase(serverUrl, walletId, 'USER');
  const newSigner = (await new Promise((resolve, reject) =>
    global.createAccountV2(
      signerConfigUser,
      serverUrl,
      protocolId,
      secretKey,
      callCustomFunction,
      (err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      }
    )
  )) as string;
  return { signer: newSigner, walletId };
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
    global.signMessage(
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
  chainId: string,
): Promise<string> {
  const { data: { protocolId, denied } } = await ctx.capsuleClient.sendTransaction(
    userId,
    walletId,
    { transaction: tx, chainId }
  );
  if (denied) {
    return 'TRANSACTION_DENIED';
  }
  const serverUrl = getServerUrl(ctx, userId);

  return new Promise((resolve, reject) =>
    global.sendTransaction(share, serverUrl, tx, chainId, protocolId, (err, result) => {
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

export async function generateBlumPrime(): Promise<string> {
  // secret key is base64 of json of p and q values
  const blumPrime = (await new Promise((resolve, reject) =>
    global.generateBlumPrime(
      (err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      }
    )
  )) as string;
  return blumPrime;
}
