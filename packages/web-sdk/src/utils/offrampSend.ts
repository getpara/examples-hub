import Para, { hexStringToBase64, OnRampPurchase, SuccessfulSignatureRes } from '@getpara/core-sdk';
import { OfframpDepositRequest } from '../types/index.js';

export async function offRampSend(
  para: Para,
  { id: purchaseId, provider, walletId, walletType, address, testMode = false }: Partial<OnRampPurchase>,
  { assetQuantity, fiat, fiatQuantity, chainId, destinationAddress, contractAddress }: OfframpDepositRequest,
): Promise<{
  txHash: string;
  updatedOnRampPurchase: OnRampPurchase;
}> {
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
      case 'EVM':
        signature = (
          (await para.signTransaction({
            walletId,
            rlpEncodedTxBase64: hexStringToBase64(tx),
            chainId,
          })) as SuccessfulSignatureRes
        )?.signature;
        break;

      case 'SOLANA':
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

    const updatedOnRampPurchase = await para.ctx.client.updateOnRampPurchase({
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

    return { txHash, updatedOnRampPurchase };
  } catch (e) {
    throw new Error(e.response?.data || e.message);
  }
}
