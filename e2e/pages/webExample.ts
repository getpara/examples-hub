import * as crypto from 'node:crypto';
import { BrowserContext, Page } from '@playwright/test';
import { Protocol } from 'playwright-core/types/protocol';
import { verifyMessage } from 'ethers';

import { AuthPortalPage } from './authPortal';

const MESSAGE_TO_SIGN = 'hello world';

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
  }: {
    context: BrowserContext;
    openModalText?: string;
    is2FAEnabled?: boolean;
    isRecoverySecretEnabled?: boolean;
    password?: string;
  }) {
    await this.page.waitForTimeout(700);
    await this.page.getByRole('button', { name: openModalText }).click();
    await this.page.waitForTimeout(1000);

    const randomHexString = crypto.randomBytes(5).toString('hex');
    const email = `teste2e+${randomHexString}@test.usecapsule.com`;
    await this.page.getByRole('textbox', { name: /^Enter email/ }).click();
    await this.page.waitForTimeout(300);
    await this.page.getByRole('textbox', { name: /^Enter email/ }).fill(email);
    await this.page.waitForTimeout(500);
    await this.page.locator('.primary > .hydrated > div > svg').first().click();
    await this.page.waitForTimeout(3000);

    await this.page.locator('#code-input-0').fill('1');
    await this.page.locator('#code-input-1').click();
    await this.page.locator('#code-input-1').fill('2');
    await this.page.locator('#code-input-2').click();
    await this.page.locator('#code-input-2').fill('3');
    await this.page.locator('#code-input-3').click();
    await this.page.locator('#code-input-3').fill('4');
    await this.page.locator('#code-input-4').click();
    await this.page.locator('#code-input-4').fill('5');
    await this.page.locator('#code-input-5').click();
    await this.page.locator('#code-input-5').fill('6');

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
      email,
      credential: credentials[0],
      clipboardText,
    };
  }

  async login({
    context,
    credential,
    email,
    openModalText = 'Open Modal',
    is2FAEnabled,
    password,
  }: {
    context: BrowserContext;
    credential: Protocol.WebAuthn.Credential;
    email: string;
    openModalText?: string;
    is2FAEnabled?: boolean;
    password?: string;
  }) {
    await this.page.reload();
    await this.page.waitForTimeout(500);
    await this.page.getByRole('button', { name: openModalText }).click();
    await this.page.waitForTimeout(750);
    await this.page.getByRole('textbox', { name: /^Enter email/ }).click();
    await this.page.getByRole('textbox', { name: /^Enter email/ }).fill(email);
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

  async switchToWagmiView() {
    await this.page.waitForTimeout(1000);
    await this.page
      .locator('div')
      .filter({ hasText: /^Old ViewWagmi View$/ })
      .getByRole('combobox')
      .selectOption('WAGMI');
    await this.page.waitForTimeout(1000);
    await this.page.reload();
    await this.page.waitForTimeout(1000);
  }

  async switchToDefaultView() {
    await this.page
      .locator('div')
      .filter({ hasText: /^Old ViewWagmi View$/ })
      .getByRole('combobox')
      .selectOption('OLD_VIEW');
  }

  async signWagmiMessage() {
    await this.page.getByPlaceholder('message to sign').click();
    await this.page.getByPlaceholder('message to sign').fill(MESSAGE_TO_SIGN);
    await this.page.waitForTimeout(250);
    await this.page.getByRole('button', { name: 'Sign Message' }).click();
    const address = (await this.page.getByText('Address is:').textContent())?.split('Address is:')[1].trim();
    const signature = (await this.page.getByText('Message Signature:').textContent())?.split('Message Signature:')[1].trim();
    const recoveredAddress = verifyMessage(MESSAGE_TO_SIGN, signature!);
    return {
      address,
      recoveredAddress,
    };
  }

  async logout({ openModalText = 'Open Modal' }: { openModalText?: string }) {
    await this.page.getByRole('button', { name: openModalText }).click();
    await this.page.getByRole('button', { name: 'Disconnect Wallet' }).last().click();
    await this.page.waitForTimeout(250);
  }
}
