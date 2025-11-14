import { BrowserContext, Page } from '@playwright/test';
import { Protocol } from 'playwright-core/types/protocol';
import * as webAuthn from '../helpers/web-authn';

export class AuthPortalPage {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async setup(context: BrowserContext): Promise<Protocol.WebAuthn.Credential[]> {
    if (context.browser()?.browserType().name() !== 'chromium') {
      throw new Error('WebAuthn virtual authenticator is only supported in Chromium-based browsers');
    }

    const { authenticator, authenticatorId } = await webAuthn.addVirtualAuthenticator(context, this.page);

    const credentialsPromise = new Promise<Protocol.WebAuthn.Credential[]>(resolve => {
      const handler = async () => {
        authenticator.off('WebAuthn.credentialAdded', handler);
        try {
          const credentials = await webAuthn.getCredentials(authenticator, authenticatorId);
          resolve(credentials);
        } catch {
          resolve([]);
        }
      };
      authenticator.on('WebAuthn.credentialAdded', handler);

      // Fallback timeout (increased for slow network conditions)
      setTimeout(() => {
        authenticator.off('WebAuthn.credentialAdded', handler);
        webAuthn
          .getCredentials(authenticator, authenticatorId)
          .then(resolve)
          .catch(() => resolve([]));
      }, 60000);
    });

    const credentials = await credentialsPromise;
    if (credentials.length === 0) {
      throw new Error('No credential added within timeout');
    }

    return credentials;
  }

  async login(
    context: BrowserContext,
    credential: Protocol.WebAuthn.Credential,
  ): Promise<{ authenticator: import('playwright-core').CDPSession; authenticatorId: string }> {
    if (context.browser()?.browserType().name() !== 'chromium') {
      throw new Error('WebAuthn virtual authenticator is only supported in Chromium-based browsers');
    }

    const { authenticator, authenticatorId } = await webAuthn.addVirtualAuthenticator(context, this.page);
    await webAuthn.addCredential(authenticator, authenticatorId, credential);

    const credentials = await webAuthn.getCredentials(authenticator, authenticatorId);
    if (credentials.length === 0) {
      throw new Error('Failed to add credential to virtual authenticator');
    }

    return { authenticator, authenticatorId };
  }

  async teardown(authenticator: import('playwright-core').CDPSession, authenticatorId: string): Promise<void> {
    await webAuthn.removeVirtualAuthenticator(authenticator, authenticatorId);
    await webAuthn.disableWebAuthn(authenticator);
  }
}
