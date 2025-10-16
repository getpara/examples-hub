import { PregenIds } from '@getpara/user-management-client';
import { ParaInternal } from '@getpara/react-common';
import { LOCAL_STORAGE_CURRENT_WALLET_IDS, LOCAL_STORAGE_WALLETS } from '@getpara/web-sdk';

export class ParaPortal extends ParaInternal {
  _pregenIds: PregenIds;
  isPartnerOptional: boolean = true;

  protected nonPersistedStorageKeys: string[] = [LOCAL_STORAGE_CURRENT_WALLET_IDS, LOCAL_STORAGE_WALLETS];

  getPrivateKey = super.getPrivateKey;

  get pregenIds(): PregenIds {
    return Object.keys({ ...super.pregenIds, ...this._pregenIds }).reduce(
      (acc, pregenIdentifierType) => {
        return {
          ...acc,
          [pregenIdentifierType]: [
            ...new Set([...(super.pregenIds[pregenIdentifierType] || []), ...(this._pregenIds[pregenIdentifierType] || [])]),
          ],
        };
      },
      {
        ...(this.getEmail() ? { EMAIL: [this.getEmail()] } : {}),
        ...(this.getPhoneNumber() ? { PHONE: [this.getPhoneNumber()] } : {}),
        ...(this.getFarcasterUsername() ? { FARCASTER: [this.getFarcasterUsername()] } : {}),
        ...(this.telegramUserId ? { TELEGRAM: [this.telegramUserId] } : {}),
      },
    );
  }

  set pregenIds(pregenIds: PregenIds) {
    this._pregenIds = pregenIds;
  }
}
