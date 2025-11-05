import { getBaseMPCNetworkUrl, Ctx, TPregenIdentifierType, SignatureRes, TWalletType } from '@getpara/core-sdk';
import * as uuid from 'uuid';

const configCGGMPBase = (serverUrl: string, walletId: string, id: string) =>
  `{"ServerUrl":"${serverUrl}", "WalletId": "${walletId}", "Id":"${id}", "Ids":["USER","CAPSULE"], "Threshold":1}`;
const configDKLSBase = (walletId: string, id: string, disableWebSockets: boolean) =>
  `{"walletId": "${walletId}", "id":"${id}", "otherId":"CAPSULE", "isReceiver": false, "disableWebSockets": ${disableWebSockets}}`;

async function keygenRequest(ctx: Ctx, userId: string, walletId: string, protocolId: string): Promise<{ signer: string }> {
  const { data } = await ctx.mpcComputationClient!.post('/wallets', {
    userId,
    walletId,
    protocolId,
  });
  return data;
}

async function signMessageRequest(
  ctx: Ctx,
  userId: string,
  walletId: string,
  protocolId: string,
  message: string,
  signer: string,
): Promise<{ signature: string }> {
  const { data } = await ctx.mpcComputationClient!.post(`/wallets/${walletId}/messages/sign`, {
    userId,
    protocolId,
    message,
    signer,
  });
  return data;
}

async function sendTransactionRequest(
  ctx: Ctx,
  userId: string,
  walletId: string,
  protocolId: string,
  transaction: string,
  signer: string,
  chainId: string,
): Promise<{ signature: string }> {
  const { data } = await ctx.mpcComputationClient!.post(`/wallets/${walletId}/transactions/send`, {
    userId,
    protocolId,
    transaction,
    signer,
    chainId,
  });
  return data;
}

export async function ed25519Keygen(ctx: Ctx, userId: string): Promise<{ signer: string; walletId: string }> {
  const { walletId, protocolId } = await ctx.client.createWallet(userId, {
    scheme: 'ED25519',
    type: 'SOLANA',
  });
  const serverUrl = getBaseMPCNetworkUrl(ctx.env, !ctx.disableWebSockets);

  try {
    const newSigner = (await new Promise((resolve, reject) =>
      global.ed25519CreateAccount(serverUrl, walletId, protocolId, (err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      }),
    )) as string;
    return { signer: newSigner, walletId };
  } catch {
    throw new Error(`error creating account of type SOLANA with userId ${userId} and walletId ${walletId}`);
  }
}

export async function ed25519PreKeygen(
  ctx: Ctx,
  pregenIdentifier: string,
  pregenIdentifierType: TPregenIdentifierType,
): Promise<{ signer: string; walletId: string }> {
  const { walletId, protocolId } = await ctx.client.createPregenWallet({
    pregenIdentifier,
    pregenIdentifierType,
    scheme: 'ED25519',
    type: 'SOLANA',
  });

  const serverUrl = getBaseMPCNetworkUrl(ctx.env, !ctx.disableWebSockets);

  try {
    const newSigner = (await new Promise((resolve, reject) =>
      global.ed25519CreateAccount(serverUrl, walletId, protocolId, (err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      }),
    )) as string;
    return { signer: newSigner, walletId };
  } catch {
    throw new Error(`error creating account of type SOLANA with walletId ${walletId}`);
  }
}

export async function ed25519Sign(
  ctx: Ctx,
  share: string,
  userId: string,
  walletId: string,
  base64Bytes: string,
): Promise<SignatureRes> {
  const protocolId = uuid.v4();
  const preSignMessageRes = ctx.client.preSignMessage(userId, walletId, base64Bytes, 'ED25519', undefined, protocolId);

  const signRes = (async function (): Promise<{ signature: string }> {
    try {
      const base64Sig = (await new Promise((resolve, reject) =>
        global.ed25519Sign(share, protocolId, base64Bytes, (err, result) => {
          if (err) {
            reject(err);
          }
          resolve(result);
        }),
      )) as string;
      return { signature: base64Sig };
    } catch {
      throw new Error(`error signing for account of type SOLANA with userId ${userId} and walletId ${walletId}`);
    }
  })();

  const { pendingTransactionId } = await preSignMessageRes;
  if (pendingTransactionId) {
    return { pendingTransactionId };
  }
  return await signRes;
}

export async function keygen(
  ctx: Ctx,
  userId: string,
  type: Exclude<TWalletType, 'SOLANA'>,
  secretKey: string | null,
): Promise<{ signer: string; walletId: string }> {
  const { walletId, protocolId } = await ctx.client.createWallet(userId, {
    useTwoSigners: true,
    scheme: ctx.useDKLS ? 'DKLS' : 'CGGMP',
    type,
    cosmosPrefix: type === 'COSMOS' ? ctx.cosmosPrefix : undefined,
  });

  if (ctx.offloadMPCComputationURL && !ctx.useDKLS) {
    return {
      signer: (await keygenRequest(ctx, userId, walletId, protocolId)).signer,
      walletId,
    };
  }

  const serverUrl = getBaseMPCNetworkUrl(ctx.env, !ctx.disableWebSockets);
  const signerConfigUser = ctx.useDKLS
    ? configDKLSBase(walletId, 'USER', ctx.disableWebSockets)
    : configCGGMPBase(serverUrl, walletId, 'USER');
  const createAccountFn = ctx.useDKLS ? global.dklsCreateAccount : global.createAccountV2;

  try {
    const newSigner = (await new Promise((resolve, reject) =>
      createAccountFn(
        signerConfigUser,
        serverUrl,
        protocolId,
        secretKey,
        () => {}, // no-op for deprecated callback to update progress percentage
        (err, result) => {
          if (err) {
            reject(err);
          }
          resolve(result);
        },
      ),
    )) as string;
    return { signer: newSigner, walletId };
  } catch {
    throw new Error(`error creating account of type ${type} with userId ${userId} and walletId ${walletId}`);
  }
}

export async function preKeygen(
  ctx: Ctx,
  partnerId: string,
  pregenIdentifier: string,
  pregenIdentifierType: TPregenIdentifierType,
  type: Exclude<TWalletType, 'SOLANA'>,
  secretKey: string | null,
): Promise<{ signer: string; walletId: string }> {
  const { walletId, protocolId } = await ctx.client.createPregenWallet({
    pregenIdentifier,
    pregenIdentifierType,
    type,
    cosmosPrefix: type === 'COSMOS' ? ctx.cosmosPrefix : undefined,
  });

  if (ctx.offloadMPCComputationURL && !ctx.useDKLS) {
    return {
      signer: (await keygenRequest(ctx, partnerId, walletId, protocolId)).signer,
      walletId,
    };
  }

  const serverUrl = getBaseMPCNetworkUrl(ctx.env, !ctx.disableWebSockets);
  const signerConfigUser = ctx.useDKLS
    ? configDKLSBase(walletId, 'USER', ctx.disableWebSockets)
    : configCGGMPBase(serverUrl, walletId, 'USER');
  const createAccountFn = ctx.useDKLS ? global.dklsCreateAccount : global.createAccountV2;

  try {
    const newSigner = (await new Promise((resolve, reject) =>
      createAccountFn(
        signerConfigUser,
        serverUrl,
        protocolId,
        secretKey,
        () => {}, // no-op for deprecated callback to update progress percentage
        (err, result) => {
          if (err) {
            reject(err);
          }
          resolve(result);
        },
      ),
    )) as string;
    return { signer: newSigner, walletId };
  } catch {
    throw new Error(`error creating account of type ${type} with walletId ${walletId}`);
  }
}

export async function signMessage(
  ctx: Ctx,
  share: string,
  walletId: string,
  userId: string,
  message: string,
): Promise<SignatureRes> {
  const protocolId = uuid.v4();
  const preSignMessageRes = ctx.client.preSignMessage(userId, walletId, message, null, null, protocolId);

  if (ctx.offloadMPCComputationURL && !ctx.useDKLS) {
    return signMessageRequest(ctx, userId, walletId, protocolId, message, share);
  }

  const serverUrl = getBaseMPCNetworkUrl(ctx.env, !ctx.disableWebSockets);
  const signMessageFn = ctx.useDKLS ? global.dklsSignMessage : global.signMessage;

  const signMessageRes = (async function (): Promise<SignatureRes> {
    try {
      return await new Promise((resolve, reject) =>
        signMessageFn(share, serverUrl, message, protocolId, (err, result) => {
          if (err) {
            reject(err);
          }
          resolve({ signature: result });
        }),
      );
    } catch {
      throw new Error(`error signing for account with userId ${userId} and walletId ${walletId}`);
    }
  })();

  const { pendingTransactionId } = await preSignMessageRes;
  if (pendingTransactionId) {
    return { pendingTransactionId };
  }
  return await signMessageRes;
}

export async function signTransaction(
  ctx: Ctx,
  share: string,
  walletId: string,
  userId: string,
  tx: string,
  chainId: string,
): Promise<SignatureRes> {
  const protocolId = uuid.v4();
  const signTransactionRes = ctx.client.signTransaction(userId, walletId, { transaction: tx, chainId, protocolId });

  if (ctx.offloadMPCComputationURL && !ctx.useDKLS) {
    return sendTransactionRequest(ctx, userId, walletId, protocolId, tx, share, chainId);
  }

  const serverUrl = getBaseMPCNetworkUrl(ctx.env, !ctx.disableWebSockets);
  const signTransactionFn = ctx.useDKLS ? global.dklsSendTransaction : global.sendTransaction;

  const signTxRes = (async function (): Promise<SignatureRes> {
    try {
      return await new Promise((resolve, reject) =>
        signTransactionFn(share, serverUrl, tx, chainId, protocolId, (err, result) => {
          if (err) {
            reject(err);
          }
          resolve({ signature: result });
        }),
      );
    } catch {
      throw new Error(`error signing transaction for account with userId ${userId} and walletId ${walletId}`);
    }
  })();

  const {
    data: { pendingTransactionId },
  } = await signTransactionRes;
  if (pendingTransactionId) {
    return { pendingTransactionId };
  }
  return await signTxRes;
}

export async function sendTransaction(
  ctx: Ctx,
  share: string,
  walletId: string,
  userId: string,
  tx: string,
  chainId: string,
): Promise<SignatureRes> {
  const protocolId = uuid.v4();
  const sendTransactionRes = ctx.client.sendTransaction(userId, walletId, { transaction: tx, chainId, protocolId });

  if (ctx.offloadMPCComputationURL && !ctx.useDKLS) {
    return sendTransactionRequest(ctx, userId, walletId, protocolId, tx, share, chainId);
  }

  const serverUrl = getBaseMPCNetworkUrl(ctx.env, !ctx.disableWebSockets);
  const sendTransactionFn = ctx.useDKLS ? global.dklsSendTransaction : global.sendTransaction;

  const sendTxRes = (async function (): Promise<SignatureRes> {
    try {
      return await new Promise((resolve, reject) =>
        sendTransactionFn(share, serverUrl, tx, chainId, protocolId, (err, result) => {
          if (err) {
            reject(err);
          }
          resolve({ signature: result });
        }),
      );
    } catch {
      throw new Error(`error signing transaction to send for account with userId ${userId} and walletId ${walletId}`);
    }
  })();

  const {
    data: { pendingTransactionId },
  } = await sendTransactionRes;
  if (pendingTransactionId) {
    return { pendingTransactionId };
  }
  return await sendTxRes;
}

export async function refresh(ctx: Ctx, share: string, walletId: string, userId: string): Promise<string> {
  const {
    data: { protocolId },
  } = await ctx.client.refreshKeys(userId, walletId);
  const serverUrl = getBaseMPCNetworkUrl(ctx.env, !ctx.disableWebSockets);
  const refreshFn = ctx.useDKLS ? global.dklsRefresh : global.refresh;

  try {
    return await new Promise((resolve, reject) =>
      refreshFn(share, serverUrl, protocolId, (err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      }),
    );
  } catch {
    throw new Error(`error refreshing keys for account with userId ${userId} and walletId ${walletId}`);
  }
}

export async function getPrivateKey(ctx: Ctx, share: string, walletId: string, userId: string): Promise<string> {
  const paraShare = await ctx.client.getParaShare(userId, walletId);
  if (!paraShare) {
    console.error('unable to retrieve Para share');
    return '';
  }

  try {
    return await new Promise((resolve, reject) =>
      global.getPrivateKey(share, paraShare, (err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      }),
    );
  } catch {
    throw new Error(`error getting private key for account with userId ${userId} and walletId ${walletId}`);
  }
}
