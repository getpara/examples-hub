import { PregenIds } from '@getpara/user-management-client';
import { ParaInternal } from '@getpara/react-common';

export class ParaPortal extends ParaInternal {
  _pregenIds: PregenIds;
  isPartnerOptional: boolean = true;

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
