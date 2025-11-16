import { BrowserContext, CDPSession, Page } from '@playwright/test';
import { Protocol } from 'playwright-core/types/protocol';
import { logger } from './logger';

export async function addVirtualAuthenticator(context: BrowserContext, page: Page) {
  try {
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
  } catch (error) {
    logger.logError('WebAuthn error in addVirtualAuthenticator:', error);
    throw error;
  }
}

export async function addCredential(
  authenticator: CDPSession,
  authenticatorId: string,
  credential: Protocol.WebAuthn.Credential,
) {
  try {
    await authenticator.send('WebAuthn.addCredential', {
      authenticatorId,
      credential,
    });
  } catch (error) {
    logger.logError('WebAuthn error in addCredential:', error);
    throw error;
  }
}

export async function getCredentials(authenticator: CDPSession, authenticatorId: string) {
  try {
    const { credentials } = await authenticator.send('WebAuthn.getCredentials', {
      authenticatorId,
    });
    return credentials;
  } catch (error) {
    logger.logError('WebAuthn error in getCredentials:', error);
    throw error;
  }
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
  try {
    await authenticator.send('WebAuthn.removeVirtualAuthenticator', {
      authenticatorId,
    });
  } catch (error) {
    logger.logError('WebAuthn error in removeVirtualAuthenticator:', error);
    throw error;
  }
}

export async function clearCredentials(
  authenticator: CDPSession,
  authenticatorId: string,
) {
  try {
    await authenticator.send('WebAuthn.clearCredentials', {
      authenticatorId,
    });
  } catch (error) {
    logger.logError('WebAuthn error in clearCredentials:', error);
    throw error;
  }
}

export async function disableWebAuthn(authenticator: CDPSession) {
  try {
    await authenticator.send('WebAuthn.disable');
  } catch (error) {
    logger.logError('WebAuthn error in disableWebAuthn:', error);
    throw error;
  }
}
