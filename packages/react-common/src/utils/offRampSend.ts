import { OnRampPurchaseUpdateParams } from '@usecapsule/user-management-client';
import Capsule, { hexStringToBase64, OnRampPurchase, SuccessfulSignatureRes, WalletType } from '@usecapsule/web-sdk';

export async function offRampSend(
  capsule: Capsule,
  { id: purchaseId, provider, walletId, walletType }: Partial<OnRampPurchase>,
  setOnRampPurchase: (_: OnRampPurchase) => void,
  {
    assetQuantity,
    fiat,
    fiatQuantity,
    chainId,
    destinationAddress,
    contractAddress,
    testMode = false,
  }: OnRampPurchaseUpdateParams & {
    chainId?: string;
    destinationAddress: string;
    contractAddress?: string | null;
  },
): Promise<string | undefined> {
  if (!purchaseId || !walletId || !walletType || !provider) {
    throw new Error('missing required fields');
  }

  const { tx, network, asset } = await capsule.ctx.capsuleClient.generateOffRampTx(capsule.getUserId(), {
    walletId,
    walletType,
    provider,
    chainId,
    destinationAddress,
    contractAddress,
    testMode,
    assetQuantity,
  });

  let signature: string | undefined;
  switch (walletType) {
    case WalletType.EVM:
      signature = ((await capsule.signTransaction(walletId, hexStringToBase64(tx), chainId)) as SuccessfulSignatureRes)
        ?.signature;
      break;

    default:
      throw new Error(`unsupported wallet type: ${walletType}`);
  }

  const { txHash } = await capsule.ctx.capsuleClient.sendOffRampTx(capsule.getUserId(), {
    tx,
    signature: walletType === 'EVM' ? `0x${signature}` : signature,
    network,
    walletId,
    walletType,
  });

  const updated = await capsule.ctx.capsuleClient.updateOnRampPurchase({
    userId: capsule.getUserId(),
    walletId,
    purchaseId,
    updates: {
      fiat,
      fiatQuantity,
      assetQuantity,
      network,
      asset,
    },
  });

  setOnRampPurchase(updated);

  return txHash;
}
