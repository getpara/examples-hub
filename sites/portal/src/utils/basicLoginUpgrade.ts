import { decryptWithPrivateKey, ShareData } from '@getpara/web-sdk';
import { ParaPortal } from '../classes/ParaPortal';

export type BasicLoginUpgradeParams = {
  userId: string;
};

export async function basicLoginUpgrade(para: ParaPortal, { userId }: BasicLoginUpgradeParams): Promise<void> {
  const temporaryShares = (await para.getTransmissionKeyShares({ isForNewDevice: true })).data.temporaryShares;
  const shares = temporaryShares.map(share => {
    const userShare = decryptWithPrivateKey(
      para.loginEncryptionKeyPair.privateKey,
      share.encryptedShare,
      share.encryptedKey,
    );

    const shareData: ShareData = {
      userId,
      walletId: share.walletId,
      walletScheme: share.wallet?.scheme!,
      partnerId: share.partnerId,
      signer: userShare,
      protocolId: share.protocolId,
    };

    return shareData;
  });

  await para.ctx.enclaveClient.persistSharesWithRetry(shares);
}
