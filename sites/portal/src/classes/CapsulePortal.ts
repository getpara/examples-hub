import { PregenIds } from '@usecapsule/user-management-client';
import CapsuleWeb from '@usecapsule/web-sdk';

export class CapsulePortal extends CapsuleWeb {
  #pregenIds: PregenIds;

  get pregenIds(): PregenIds {
    return Object.keys({ ...super.pregenIds, ...this.#pregenIds }).reduce(
      (acc, pregenIdentifierType) => {
        return {
          ...acc,
          [pregenIdentifierType]: [
            ...new Set([...(super.pregenIds[pregenIdentifierType] || []), ...(this.#pregenIds[pregenIdentifierType] || [])]),
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
    this.#pregenIds = pregenIds;
  }
}
