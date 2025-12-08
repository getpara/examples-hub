import { BrowserContext, Page, expect } from '@playwright/test';
import { Protocol } from 'playwright-core/types/protocol';

import * as webAuthn from '../helpers/webAuthn';
import { Logger } from '../helpers/logger';

export class AuthPortalPage {
  page: Page;
  private logger: Logger;

  constructor(page: Page) {
    this.page = page;
    this.logger = new Logger('AuthPortal');
  }

  async setup(context: BrowserContext) {
    const { authenticator, authenticatorId } = await webAuthn.addVirtualAuthenticator(context, this.page);

    await expect.poll(
      async () => {
        try {
          const credentials = await webAuthn.getCredentials(authenticator, authenticatorId);
          return credentials;
        } catch (error) {
          return [];
        }
      },
      {
        timeout: 15000,
        message: 'Waiting for credentials to be available'
      }
    ).toHaveLength(1);

    const credentials = await webAuthn.getCredentials(authenticator, authenticatorId);
    return credentials;
  }

  async login(context: BrowserContext, credential: Protocol.WebAuthn.Credential) {
    const { authenticator, authenticatorId } = await webAuthn.addVirtualAuthenticator(context, this.page);
    await webAuthn.addCredential(authenticator, authenticatorId, credential);
    
    // Verify credential was added successfully
    const credentials = await webAuthn.getCredentials(authenticator, authenticatorId);
    if (credentials.length === 0) {
      throw new Error('Failed to add credential to virtual authenticator');
    }
    this.logger.logStep('Credential added successfully', true);
  }
}
