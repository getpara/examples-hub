import { BrowserContext, Page } from '@playwright/test';
import { Protocol } from 'playwright-core/types/protocol';

import * as webAuthn from '../helpers/webAuthn';

export class AuthPortalPage {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async visit() {
    await this.page.goto('http://localhost:3003');
  }

  async recoverAccount({
    context,
    email,
    recoverySecret,
  }: {
    context: BrowserContext;
    email: string;
    recoverySecret: string;
  }) {
    await this.page.getByRole('button', { name: 'Manage Recovery' }).click();
    const enterEmailInput = await this.page.getByRole('textbox', { name: 'Enter your email' }).elementHandle();
    await enterEmailInput.click();
    await this.page.waitForTimeout(300);
    for (let i = 0; i < email.length; i++) {
      await enterEmailInput.press(email[i]);
    }
    await this.page.waitForTimeout(250);
    await this.page.locator('.primary > .hydrated > div > svg').first().click();

    const codeInput = await this.page.getByRole('textbox', { name: 'Enter code' }).elementHandle();
    await codeInput.click();
    await this.page.waitForTimeout(300);
    for (let i = 0; i < 6; i++) {
      await codeInput.press(`${i}`);
    }
    await this.page.waitForTimeout(250);
    await this.page.getByRole('button', { name: 'Continue' }).click();
    await this.page.getByRole('button', { name: 'Close' }).click();

    await this.page.waitForTimeout(3000);
    await this.page.getByRole('button', { name: 'Recover Wallet' }).click();
    const secretInput = await this.page.getByRole('textbox', { name: 'Enter secret' }).elementHandle();
    await secretInput.click();
    secretInput.fill(recoverySecret);
    await this.page.waitForTimeout(500);
    await this.page.getByRole('button', { name: 'Continue' }).click();

    const page1Promise = this.page.waitForEvent('popup');
    await this.page.waitForTimeout(500);

    await this.page.getByTestId('qr-code').click();
    const page1 = await page1Promise;
    const authPortal = new AuthPortalPage(page1);
    const credentials = await authPortal.setup(context);
    await this.page.getByRole('button', { name: 'Close' }).click();
    return credentials[0];
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
