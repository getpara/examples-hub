import { BackupKitEmailProps } from '@usecapsule/user-management-client';
import { Ctx, SignatureRes, PlatformUtils } from './core';
import { ServerLocalStorage } from './ServerLocalStorage';
import { ServerSessionStorage } from './ServerSessionStorage';
import { keygen } from './wallet/keygen';
import {
  signMessage,
  sendTransaction,
  signTransaction,
} from './wallet/signing';

export class ServerUtils implements PlatformUtils {
  keygen(
    ctx: Ctx,
    userId: string,
    secretKey: string | null,
    sessionCookie: string,
    emailProps?: BackupKitEmailProps
  ): Promise<{
    signer: string;
    walletId: string;
  }> {
    return keygen(ctx, userId, secretKey, true, sessionCookie, emailProps);
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
    return signMessage(
      ctx,
      userId,
      walletId,
      share,
      message,
      sessionCookie,
      isDKLS,
    );
  }

  signTransaction(
    ctx: Ctx,
    userId: string,
    walletId: string,
    share: string,
    message: string,
    chainId: string,
    sessionCookie: string,
    isDKLS?: boolean,
  ): Promise<SignatureRes> {
    return signTransaction(
      ctx,
      userId,
      walletId,
      share,
      message,
      chainId,
      sessionCookie,
      isDKLS,
    );
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
    return sendTransaction(
      ctx,
      userId,
      walletId,
      share,
      tx,
      chainId,
      sessionCookie,
      isDKLS,
    );
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

  generateBlumPrimes = async (ctx: Ctx): Promise<{ p: string; q: string }> => {
    throw new Error('not implemented');
  };

  localStorage = new ServerLocalStorage();

  sessionStorage = new ServerSessionStorage();

  secureStorage = undefined;

  isSyncStorage = true;

  disableProviderModal = true;

  openPopup(popupUrl: string): void {
    throw new Error('not implemented');
  }
}
