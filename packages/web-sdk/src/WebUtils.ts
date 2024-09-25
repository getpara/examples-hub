import { Ctx, PlatformUtils, SignatureRes, PopupType } from '@usecapsule/core-sdk';

import { LocalStorage } from './LocalStorage.js';
import { SessionStorage } from './SessionStorage.js';
import { keygen, preKeygen, ed25519Keygen, ed25519PreKeygen, refresh } from './wallet/keygen.js';
import { signMessage, sendTransaction, signTransaction, ed25519Sign } from './wallet/signing.js';
import { BackupKitEmailProps, WalletType } from '@usecapsule/user-management-client';
import { getPrivateKey } from './wallet/privateKey.js';
import { PregenIdentifierType } from '@usecapsule/core-sdk';

export class WebUtils implements PlatformUtils {
  getPrivateKey(ctx: Ctx, userId: string, walletId: string, share: string, sessionCookie: string): Promise<string> {
    return getPrivateKey(ctx, userId, walletId, share, sessionCookie);
  }

  keygen(
    ctx: Ctx,
    userId: string,
    type: Exclude<WalletType, WalletType.SOLANA>,
    secretKey: string | null, // should be acceptable as null in RN as we don't pre-gen them
    sessionCookie: string,
    emailProps: BackupKitEmailProps = {},
  ): Promise<{
    signer: string;
    walletId: string;
  }> {
    return keygen(ctx, userId, type, secretKey, true, sessionCookie, emailProps);
  }

  refresh(
    ctx: Ctx,
    sessionCookie: string,
    userId: string,
    walletId: string,
    share: string,
    oldPartnerId?: string,
    newPartnerId?: string,
  ): Promise<{
    signer: string;
  }> {
    return refresh(ctx, sessionCookie, userId, walletId, share, oldPartnerId, newPartnerId);
  }

  preKeygen(
    ctx: Ctx,
    partnerId: string | undefined,
    pregenIdentifier: string,
    pregenIdentifierType: PregenIdentifierType,
    type: Exclude<WalletType, WalletType.SOLANA>,
    secretKey: string | null, // should be acceptable as null in RN as we don't pre-gen them
    sessionCookie: string,
  ): Promise<{
    signer: string;
    walletId: string;
  }> {
    return preKeygen(ctx, pregenIdentifier, pregenIdentifierType, type, secretKey, false, partnerId, sessionCookie);
  }

  signMessage(
    ctx: Ctx,
    userId: string,
    walletId: string,
    share: string,
    message: string,
    sessionCookie: string,
    isDKLS?: boolean,
  ): Promise<SignatureRes> {
    return signMessage(ctx, userId, walletId, share, message, sessionCookie, isDKLS);
  }

  signTransaction(
    ctx: Ctx,
    userId: string,
    walletId: string,
    share: string,
    tx: string,
    chainId: string,
    sessionCookie: string,
    isDKLS?: boolean,
  ): Promise<SignatureRes> {
    return signTransaction(ctx, userId, walletId, share, tx, chainId, sessionCookie, isDKLS);
  }

  sendTransaction(
    ctx: Ctx,
    userId: string,
    walletId: string,
    share: string,
    tx: string,
    chainId: string,
    sessionCookie: string,
    isDKLS?: boolean,
  ): Promise<SignatureRes> {
    return sendTransaction(ctx, userId, walletId, share, tx, chainId, sessionCookie, isDKLS);
  }

  signHash(
    _address: string,
    _hash: string,
  ): Promise<{
    v: number;
    r: Buffer;
    s: Buffer;
  }> {
    throw new Error('not implemented');
  }

  ed25519Keygen(
    ctx: Ctx,
    userId: string,
    sessionCookie: string,
    emailProps?: BackupKitEmailProps,
  ): Promise<{
    signer: string;
    walletId: string;
  }> {
    return ed25519Keygen(ctx, userId, sessionCookie, emailProps);
  }

  ed25519PreKeygen(
    ctx: Ctx,
    pregenIdentifier: string,
    pregenIdentifierType: PregenIdentifierType,
    sessionCookie: string,
  ): Promise<{
    signer: string;
    walletId: string;
  }> {
    return ed25519PreKeygen(ctx, pregenIdentifier, pregenIdentifierType, sessionCookie);
  }

  ed25519Sign(
    ctx: Ctx,
    userId: string,
    walletId: string,
    share: string,
    base64Bytes: string,
    sessionCookie: string,
  ): Promise<SignatureRes> {
    return ed25519Sign(ctx, userId, walletId, share, base64Bytes, sessionCookie);
  }

  localStorage = new LocalStorage();

  sessionStorage = new SessionStorage();

  secureStorage = null;

  isSyncStorage = true;

  disableProviderModal = false;

  openPopup(popupUrl: string, opts: { type: PopupType }): void {
    if (opts) {
      const { type } = opts;
      const popUpWidth = 550;
      let popUpHeight: number;

      switch (type) {
        case PopupType.LOGIN_PASSKEY: {
          popUpHeight = 798;
          break;
        }
        case PopupType.CREATE_PASSKEY: {
          popUpHeight = 464;
          break;
        }
        case PopupType.SIGN_MESSAGE_REVIEW: {
          popUpHeight = 585;
          break;
        }
        case PopupType.SIGN_TRANSACTION_REVIEW: {
          popUpHeight = 750;
          break;
        }
        case PopupType.OAUTH:
        default: {
          popUpHeight = 768;
          break;
        }
      }

      // Fixes position when using multiple monitors
      const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
      const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;

      const width = window.innerWidth
        ? window.innerWidth
        : document.documentElement.clientWidth
          ? document.documentElement.clientWidth
          : screen.width;
      const height = window.innerHeight
        ? window.innerHeight
        : document.documentElement.clientHeight
          ? document.documentElement.clientHeight
          : screen.height;

      const left = (width - popUpWidth) / 2 + dualScreenLeft;
      const top = (height - popUpHeight) / 2 + dualScreenTop;

      const windowFeatures = `toolbar=no, menubar=no, width=${popUpWidth}, 
    height=${popUpHeight}, top=${top}, left=${left}`;

      let popupWindow = window.open(popupUrl, type.toString(), windowFeatures);
      if (!popupWindow) {
        setTimeout(() => {
          popupWindow = window.open(popupUrl, '_blank');
        }, 0);
      }
    } else {
      const popupWindow = window.open(popupUrl, 'popup', 'popup=true,width=400,height=500');
      if (!popupWindow) {
        setTimeout(() => {
          window.open(popupUrl, '_blank');
        }, 0);
      }
    }
  }
}
