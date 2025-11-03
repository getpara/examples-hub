import { decryptWithPrivateKey, ShareData } from '@getpara/web-sdk';
import { ParaPortal } from '../classes/ParaPortal';

export async function basicLoginUpgrade(para: ParaPortal): Promise<void> {
  const temporaryShares = (await para.getTransmissionKeyShares({ isForNewDevice: true })).data.temporaryShares;

  // If the user has no shares to persist, try to upgrade them anyway
  if (temporaryShares.length === 0) {
    await para.ctx.client.persistEnclaveShares({ hasNoShares: true });
    return;
  }

  const shares = temporaryShares.map(share => {
    const userShare = decryptWithPrivateKey(
      para.loginEncryptionKeyPair.privateKey,
      share.encryptedShare,
      share.encryptedKey,
    );

    const shareData: ShareData = {
      userId: share.userId,
      walletId: share.walletId,
      walletScheme: share.wallet?.scheme!,
      partnerId: share.partnerId,
      signer: userShare,
      protocolId: share.protocolId,
    };

    return shareData;
  });

  const missing = shares
    .map((s, i) => {
      const missingFields: string[] = [];
      if (!s.userId) missingFields.push('userId');
      if (!s.walletId) missingFields.push('walletId');
      if (!s.signer) missingFields.push('signer');
      if (!s.walletScheme) missingFields.push('walletScheme');
      return missingFields.length ? { index: i, missingFields } : null;
    })
    .filter(Boolean) as Array<{ index: number; missingFields: string[] }>;

  if (missing.length) {
    const details = missing.map(m => `share[${m.index}]: missing ${m.missingFields.join(', ')};`).join('; ');
    throw new Error(`Missing required fields for basic login upgrade: ${details}`);
  }

  await para.ctx.enclaveClient.persistSharesWithRetry(shares);
}
