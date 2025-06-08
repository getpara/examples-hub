import * as crypto from 'node:crypto';
import { BrowserContext, Page } from '@playwright/test';
import { Protocol } from 'playwright-core/types/protocol';

import { AuthPortalPage } from './authPortal';

function getRandomPhoneNumber() {
  const last4 = `${Math.floor(Math.random() * 10000)}`.padStart(4, '0');
  return `415555${last4}`;
}

function getRandomEmail() {
  const randomHexString = crypto.randomBytes(5).toString('hex');
  return `teste2e+${randomHexString}@test.usecapsule.com`;
}

export class WebExamplePage {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async visit() {
    await this.page.goto('/');
  }

  async createUser({
    context,
    openModalText = 'Open Modal',
    is2FAEnabled,
    isRecoverySecretEnabled,
    password,
    usePhoneNumber = false,
  }: {
    context: BrowserContext;
    openModalText?: string;
    is2FAEnabled?: boolean;
    isRecoverySecretEnabled?: boolean;
    password?: string;
    usePhoneNumber?: boolean;
  }) {
    await this.page.waitForTimeout(700);
    await this.page.getByRole('button', { name: openModalText }).click();
    await this.page.waitForTimeout(1000);

    const emailOrPhone = usePhoneNumber ? getRandomPhoneNumber() : getRandomEmail();
    const enterEmailOrPhoneInput = await this.page.getByRole('textbox', { name: 'Enter email or phone' }).elementHandle();
    await enterEmailOrPhoneInput.click();

    await this.page.waitForTimeout(300);
    for (let i = 0; i < emailOrPhone.length; i++) {
      await enterEmailOrPhoneInput.press(emailOrPhone[i]);
      await this.page.waitForTimeout(50);
    }
    await this.page.waitForTimeout(500);
    await this.page.locator('.primary > .hydrated > div > svg').first().click();
    await this.page.waitForTimeout(3000);

    for (let i = 0; i < 6; i++) {
      await this.page.locator(`#code-input-${i}`).click();
      await this.page.locator(`#code-input-${i}`).fill((i + 1).toString());
    }

    let credentials: Protocol.WebAuthn.Credential[] = [];
    if (password) {
      await this.page.getByRole('button', { name: 'Choose Password' }).click();
      await this.page.frameLocator('#root iframe').getByRole('textbox', { name: 'Enter password' }).click();
      await this.page.frameLocator('#root iframe').getByRole('textbox', { name: 'Enter password' }).fill(password);
      await this.page.frameLocator('#root iframe').getByRole('textbox', { name: 'Confirm password' }).click();
      await this.page.frameLocator('#root iframe').getByRole('textbox', { name: 'Confirm password' }).fill(password);
      await this.page.frameLocator('#root iframe').getByRole('button', { name: 'Save Password' }).click();
    } else {
      const page1Promise = this.page.waitForEvent('popup');
      await this.page.waitForTimeout(500);
      await this.page.getByTestId('modal-content').getByRole('button', { name: 'Create' }).click();

      const page1 = await page1Promise;
      const authPortal = new AuthPortalPage(page1);
      await this.page.waitForTimeout(500);
      credentials = await authPortal.setup(context);
    }

    let clipboardText = '';
    if (isRecoverySecretEnabled) {
      await this.page.getByTestId('modal-content').getByRole('button', { name: 'Copy' }).click();
      clipboardText = await this.page.evaluate('navigator.clipboard.readText()');
      await this.page.getByRole('button', { name: 'I’ve saved my recovery secret' }).click();
    }

    if (is2FAEnabled) {
      await this.page.getByRole('button', { name: 'Continue' }).click();
      await this.page.getByRole('button', { name: 'Skip' }).click();
    } else {
      await this.page.getByRole('button', { name: 'Done' }).click();
    }

    await this.page.waitForTimeout(2000);
    return {
      emailOrPhone,
      credential: credentials[0],
      clipboardText,
    };
  }

  async login({
    context,
    credential,
    emailOrPhone,
    openModalText = 'Open Modal',
    is2FAEnabled,
    password,
  }: {
    context: BrowserContext;
    credential: Protocol.WebAuthn.Credential;
    emailOrPhone: string;
    openModalText?: string;
    is2FAEnabled?: boolean;
    password?: string;
  }) {
    await this.page.reload();
    await this.page.waitForTimeout(500);
    await this.page.getByRole('button', { name: openModalText }).click();
    await this.page.waitForTimeout(750);

    const enterEmailOrPhoneInput = await this.page.getByRole('textbox', { name: 'Enter email or phone' }).elementHandle();
    await enterEmailOrPhoneInput.click();
    await this.page.waitForTimeout(300);
    for (let i = 0; i < emailOrPhone.length; i++) {
      await enterEmailOrPhoneInput.press(emailOrPhone[i]);
    }
    await this.page.waitForTimeout(250);
    await this.page.locator('.primary > .hydrated > div > svg').first().click();

    const page2Promise = this.page.waitForEvent('popup');
    await this.page.waitForTimeout(750);
    if (password) {
      await this.page.getByRole('button', { name: 'Login' }).click();
      const page2 = await page2Promise;
      const authPortal = new AuthPortalPage(page2);
      await authPortal.page.getByRole('textbox', { name: 'Enter a password' }).click();
      await authPortal.page.getByRole('textbox', { name: 'Enter a password' }).fill(password);
      await authPortal.page.getByRole('button', { name: 'Continue' }).click();
    } else {
      await this.page.getByText('Login with passkey').click();
      const page2 = await page2Promise;
      const authPortal = new AuthPortalPage(page2);
      await authPortal.login(context, credential);
    }

    await this.page.waitForTimeout(1000);
    if (is2FAEnabled) {
      await this.page.getByRole('button', { name: 'Skip' }).click();
      await this.page.waitForTimeout(2100);
    }
  }

  async logout({ openModalText = 'Open Modal' }: { openModalText?: string }) {
    await this.page.getByRole('button', { name: openModalText }).click();
    await this.page.getByRole('button', { name: 'Disconnect Wallet' }).click();
    await this.page.waitForTimeout(250);
  }
}
