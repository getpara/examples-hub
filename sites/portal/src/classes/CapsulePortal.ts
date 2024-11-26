import { PregenIds } from '@usecapsule/user-management-client';
import CapsuleWeb from '@usecapsule/web-sdk';

export class CapsulePortal extends CapsuleWeb {
  #pregenIds: PregenIds;

  get pregenIds(): PregenIds {
    return Object.entries(super.pregenIds).reduce(
      (acc, [pregenIdentifierType, pregenIdentifiers]) => {
        return {
          ...acc,
          [pregenIdentifierType]: [...new Set([...pregenIdentifiers, ...(this.#pregenIds[pregenIdentifierType] ?? [])])],
        };
      },
      {
        ...(this.getEmail() ? { EMAIL: [this.getEmail()] } : {}),
        ...(this.getPhoneNumber() ? { PHONE: [this.getPhoneNumber()] } : {}),
      },
    );
  }

  set pregenIds(pregenIds: PregenIds) {
    this.#pregenIds = pregenIds;
  }
}
