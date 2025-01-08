import {
  Ctx,
  getBaseMPCNetworkUrl,
  TPregenIdentifierType,
  SignatureRes,
  WalletScheme,
  WalletType,
} from '@usecapsule/core-sdk';

const configCGGMPBase = (serverUrl: string, walletId: string, id: string) =>
  `{"ServerUrl":"${serverUrl}", "WalletId": "${walletId}", "Id":"${id}", "Ids":["USER","CAPSULE"], "Threshold":1}`;
const configDKLSBase = (walletId: string, id: string, disableWebSockets: boolean) =>
  `{"walletId": "${walletId}", "id":"${id}", "otherId":"CAPSULE", "isReceiver": false, "disableWebSockets": ${disableWebSockets}}`;

async function keygenRequest(ctx: Ctx, userId: string, walletId: string, protocolId: string): Promise<{ signer: string }> {
  const { data } = await ctx.mpcComputationClient.post('/wallets', {
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
  const { data } = await ctx.mpcComputationClient.post(`/wallets/${walletId}/messages/sign`, {
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
  const { data } = await ctx.mpcComputationClient.post(`/wallets/${walletId}/transactions/send`, {
    userId,
    protocolId,
    transaction,
    signer,
    chainId,
  });
  return data;
}

export async function ed25519Keygen(ctx: Ctx, userId: string): Promise<{ signer: string; walletId: string }> {
  const { walletId, protocolId } = await ctx.capsuleClient.createWallet(userId, {
    scheme: WalletScheme.ED25519,
    type: WalletType.SOLANA,
  });
  const serverUrl = getBaseMPCNetworkUrl(ctx.env, !ctx.disableWebSockets);

  const newSigner = (await new Promise((resolve, reject) =>
    global.ed25519CreateAccount(serverUrl, walletId, protocolId, (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(result);
    }),
  )) as string;
  return { signer: newSigner, walletId };
}

export async function ed25519PreKeygen(
  ctx: Ctx,
  pregenIdentifier: string,
  pregenIdentifierType: TPregenIdentifierType,
): Promise<{ signer: string; walletId: string }> {
  const { walletId, protocolId } = await ctx.capsuleClient.createWalletPreGen({
    pregenIdentifier,
    pregenIdentifierType,
    scheme: WalletScheme.ED25519,
    type: WalletType.SOLANA,
  });

  const serverUrl = getBaseMPCNetworkUrl(ctx.env, !ctx.disableWebSockets);
  const newSigner = (await new Promise((resolve, reject) =>
    global.ed25519CreateAccount(serverUrl, walletId, protocolId, (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(result);
    }),
  )) as string;
  return { signer: newSigner, walletId };
}

export async function ed25519Sign(
  ctx: Ctx,
  share: string,
  userId: string,
  walletId: string,
  base64Bytes: string,
): Promise<{ signature: string }> {
  const { protocolId } = await ctx.capsuleClient.preSignMessage(userId, walletId, base64Bytes, WalletScheme.ED25519);

  const base64Sig = (await new Promise((resolve, reject) =>
    global.ed25519Sign(share, protocolId, base64Bytes, (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(result);
    }),
  )) as string;
  return { signature: base64Sig };
}

export async function keygen(
  ctx: Ctx,
  userId: string,
  type: Exclude<WalletType, WalletType.SOLANA>,
  secretKey: string | null,
): Promise<{ signer: string; walletId: string }> {
  const { walletId, protocolId } = await ctx.capsuleClient.createWallet(userId, {
    useTwoSigners: true,
    scheme: ctx.useDKLS ? WalletScheme.DKLS : WalletScheme.CGGMP,
    type,
    cosmosPrefix: type === WalletType.COSMOS ? ctx.cosmosPrefix : undefined,
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
}

export async function preKeygen(
  ctx: Ctx,
  _partnerId: string | undefined,
  pregenIdentifier: string,
  pregenIdentifierType: TPregenIdentifierType,
  type: Exclude<WalletType, WalletType.SOLANA>,
  secretKey: string | null,
): Promise<{ signer: string; walletId: string }> {
  const { walletId, protocolId } = await ctx.capsuleClient.createWalletPreGen({
    pregenIdentifier,
    pregenIdentifierType,
    type,
    cosmosPrefix: type === WalletType.COSMOS ? ctx.cosmosPrefix : undefined,
  });

  const serverUrl = getBaseMPCNetworkUrl(ctx.env, !ctx.disableWebSockets);
  const signerConfigUser = configDKLSBase(walletId, 'USER', ctx.disableWebSockets);
  const newSigner = (await new Promise((resolve, reject) =>
    global.dklsCreateAccount(
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
}

export async function signMessage(
  ctx: Ctx,
  share: string,
  walletId: string,
  userId: string,
  message: string,
  cosmosSignDoc?: string,
): Promise<SignatureRes> {
  const { protocolId, pendingTransactionId } = await ctx.capsuleClient.preSignMessage(
    userId,
    walletId,
    message,
    null,
    cosmosSignDoc,
  );
  if (pendingTransactionId) {
    return { pendingTransactionId };
  }

  if (ctx.offloadMPCComputationURL && !ctx.useDKLS) {
    return signMessageRequest(ctx, userId, walletId, protocolId, message, share);
  }

  const serverUrl = getBaseMPCNetworkUrl(ctx.env, !ctx.disableWebSockets);
  const signMessageFn = ctx.useDKLS ? global.dklsSignMessage : global.signMessage;

  const parsedShare = JSON.parse(share);
  if (!parsedShare.disableWebSockets !== !ctx.disableWebSockets) {
    parsedShare.disableWebSockets = ctx.disableWebSockets;
  }
  share = JSON.stringify(parsedShare);
  return new Promise((resolve, reject) =>
    signMessageFn(share, serverUrl, message, protocolId, (err, result) => {
      if (err) {
        reject(err);
      }
      resolve({ signature: result });
    }),
  );
}

export async function signTransaction(
  ctx: Ctx,
  share: string,
  walletId: string,
  userId: string,
  tx: string,
  chainId: string,
): Promise<SignatureRes> {
  const {
    data: { protocolId, pendingTransactionId },
  } = await ctx.capsuleClient.signTransaction(userId, walletId, { transaction: tx, chainId });
  if (pendingTransactionId) {
    return { pendingTransactionId };
  }

  if (ctx.offloadMPCComputationURL && !ctx.useDKLS) {
    return sendTransactionRequest(ctx, userId, walletId, protocolId, tx, share, chainId);
  }

  const serverUrl = getBaseMPCNetworkUrl(ctx.env, !ctx.disableWebSockets);
  const signTransactionFn = ctx.useDKLS ? global.dklsSendTransaction : global.sendTransaction;

  const parsedShare = JSON.parse(share);
  if (!parsedShare.disableWebSockets !== !ctx.disableWebSockets) {
    parsedShare.disableWebSockets = ctx.disableWebSockets;
  }
  share = JSON.stringify(parsedShare);
  return new Promise((resolve, reject) =>
    signTransactionFn(share, serverUrl, tx, chainId, protocolId, (err, result) => {
      if (err) {
        reject(err);
      }
      resolve({ signature: result });
    }),
  );
}

export async function sendTransaction(
  ctx: Ctx,
  share: string,
  walletId: string,
  userId: string,
  tx: string,
  chainId: string,
): Promise<SignatureRes> {
  const {
    data: { protocolId, pendingTransactionId },
  } = await ctx.capsuleClient.sendTransaction(userId, walletId, { transaction: tx, chainId });
  if (pendingTransactionId) {
    return { pendingTransactionId };
  }

  if (ctx.offloadMPCComputationURL && !ctx.useDKLS) {
    return sendTransactionRequest(ctx, userId, walletId, protocolId, tx, share, chainId);
  }

  const serverUrl = getBaseMPCNetworkUrl(ctx.env, !ctx.disableWebSockets);
  const sendTransactionFn = ctx.useDKLS ? global.dklsSendTransaction : global.sendTransaction;

  const parsedShare = JSON.parse(share);
  if (!parsedShare.disableWebSockets !== !ctx.disableWebSockets) {
    parsedShare.disableWebSockets = ctx.disableWebSockets;
  }
  share = JSON.stringify(parsedShare);
  return new Promise((resolve, reject) =>
    sendTransactionFn(share, serverUrl, tx, chainId, protocolId, (err, result) => {
      if (err) {
        reject(err);
      }
      resolve({ signature: result });
    }),
  );
}

export async function refresh(
  ctx: Ctx,
  share: string,
  walletId: string,
  userId: string,
  oldPartnerId?: string,
  newPartnerId?: string,
  keyShareProtocolId?: string,
): Promise<{ protocolId: string; signer: string }> {
  const {
    data: { protocolId },
  } = await ctx.capsuleClient.refreshKeys(userId, walletId, oldPartnerId, newPartnerId, keyShareProtocolId);
  const serverUrl = getBaseMPCNetworkUrl(ctx.env, !ctx.disableWebSockets);
  const refreshFn = ctx.useDKLS ? global.dklsRefresh : global.refresh;

  const parsedShare = JSON.parse(share);
  if (!parsedShare.disableWebSockets !== !ctx.disableWebSockets) {
    parsedShare.disableWebSockets = ctx.disableWebSockets;
  }
  share = JSON.stringify(parsedShare);
  return new Promise((resolve, reject) =>
    refreshFn(share, serverUrl, protocolId, (err, result) => {
      if (err) {
        reject(err);
      }
      resolve({ protocolId, signer: result });
    }),
  );
}

export async function getPrivateKey(ctx: Ctx, share: string, walletId: string, userId: string): Promise<string> {
  const capsuleShare = await ctx.capsuleClient.getCapsuleShare(userId, walletId);
  if (!capsuleShare) {
    return '';
  }

  return new Promise((resolve, reject) =>
    global.getPrivateKey(share, capsuleShare, (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(result);
    }),
  );
}
