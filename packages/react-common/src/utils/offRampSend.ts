import { OnRampPurchaseUpdateParams } from '@getpara/user-management-client';
import Para, { hexStringToBase64, OnRampPurchase, SuccessfulSignatureRes, WalletType } from '@getpara/web-sdk';

export async function offRampSend(
  para: Para,
  { id: purchaseId, provider, walletId, walletType, address, testMode = false }: Partial<OnRampPurchase>,
  setOnRampPurchase: (_: OnRampPurchase) => void,
  {
    assetQuantity,
    fiat,
    fiatQuantity,
    chainId,
    destinationAddress,
    contractAddress,
  }: OnRampPurchaseUpdateParams & {
    chainId?: string;
    destinationAddress: string;
    contractAddress?: string | null;
  },
): Promise<string | undefined> {
  if (!purchaseId || !walletId || !walletType || !provider) {
    throw new Error('Missing required fields');
  }

  try {
    const { tx, message, network, asset } = await para.ctx.client.generateOffRampTx(para.getUserId(), {
      walletId,
      walletType,
      provider,
      chainId,
      destinationAddress,
      sourceAddress: address,
      contractAddress,
      testMode,
      assetQuantity,
    });

    let signature: string | undefined;
    switch (walletType) {
      case WalletType.EVM:
        signature = (
          (await para.signTransaction({
            walletId,
            rlpEncodedTxBase64: hexStringToBase64(tx),
            chainId,
          })) as SuccessfulSignatureRes
        )?.signature;
        break;

      case WalletType.SOLANA:
        signature = ((await para.signMessage({ walletId, messageBase64: message })) as SuccessfulSignatureRes)?.signature;
        break;

      default:
        throw new Error(`Unsupported wallet type: ${walletType}`);
    }

    const { txHash } = await para.ctx.client.sendOffRampTx(para.getUserId(), {
      tx,
      signature: walletType === 'EVM' ? `0x${signature}` : signature,
      sourceAddress: address,
      network,
      walletId,
      walletType,
    });

    const updated = await para.ctx.client.updateOnRampPurchase({
      userId: para.getUserId(),
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
  } catch (e) {
    throw new Error(e.response?.data || e.message);
  }
}
