import { BrowserContext, Page } from '@playwright/test';
import { Protocol } from 'playwright-core/types/protocol';

import * as webAuthn from '../helpers/webAuthn';

export class AuthPortalPage {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async setup(context: BrowserContext) {
    const { authenticator, authenticatorId } = await webAuthn.addVirtualAuthenticator(context, this.page);

    for (let i = 0; i < 25; i++) {
      try {
        const credentials = await webAuthn.getCredentials(authenticator, authenticatorId);
        if (credentials.length > 0) {
          return credentials;
        }
        await this.page.waitForTimeout(500);
      } catch (error) {
        await this.page.waitForTimeout(500);
      }
    }

    throw new Error('Could not get credentials');
  }

  async login(context: BrowserContext, credential: Protocol.WebAuthn.Credential) {
    const { authenticator, authenticatorId } = await webAuthn.addVirtualAuthenticator(context, this.page);
    await webAuthn.addCredential(authenticator, authenticatorId, credential);
  }
}
