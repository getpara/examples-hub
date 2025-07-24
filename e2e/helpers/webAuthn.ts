import { BrowserContext, CDPSession, Page } from '@playwright/test';
import { Protocol } from 'playwright-core/types/protocol';

export async function addVirtualAuthenticator(context: BrowserContext, page: Page) {
  const authenticator = await context.newCDPSession(page);
  await authenticator.send('WebAuthn.enable');
  const { authenticatorId } = await authenticator.send('WebAuthn.addVirtualAuthenticator', {
    options: {
      protocol: 'ctap2',
      transport: 'internal',
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
    },
  });
  return {
    authenticator,
    authenticatorId,
  };
}

export async function addCredential(
  authenticator: CDPSession,
  authenticatorId: string,
  credential: Protocol.WebAuthn.Credential,
) {
  await authenticator.send('WebAuthn.addCredential', {
    authenticatorId,
    credential,
  });
}

export async function getCredentials(authenticator: CDPSession, authenticatorId: string) {
  const { credentials } = await authenticator.send('WebAuthn.getCredentials', {
    authenticatorId,
  });
  return credentials;
}

export async function setIsUserVerifyingPlatformAuthenticatorAvailable(page: Page) {
  await page.addInitScript(() => {
    globalThis.PublicKeyCredential = class {
      static async isUserVerifyingPlatformAuthenticatorAvailable() {
        return true;
      }
    };
  });
}

export async function removeVirtualAuthenticator(
  authenticator: CDPSession,
  authenticatorId: string,
) {
  await authenticator.send('WebAuthn.removeVirtualAuthenticator', {
    authenticatorId,
  });
}

export async function clearCredentials(
  authenticator: CDPSession,
  authenticatorId: string,
) {
  await authenticator.send('WebAuthn.clearCredentials', {
    authenticatorId,
  });
}

export async function disableWebAuthn(authenticator: CDPSession) {
  await authenticator.send('WebAuthn.disable');
}
