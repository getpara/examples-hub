import * as crypto from 'node:crypto';
import { BrowserContext, Page, expect } from '@playwright/test';
import { Protocol } from 'playwright-core/types/protocol';
import { verifyMessage } from 'ethers';

import { AuthPortalPage } from './authPortal';

const MESSAGE_TO_SIGN = 'hello world';

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

  async clickProfileButton() {
    // Wait for the modal content to fully load (onRampConfig needs to load first)
    await this.page.waitForTimeout(500);

    // Use getByText which works better with web components
    const profileButton = this.page.locator('#para-modal').getByText('Profile', { exact: true });
    await profileButton.waitFor({ state: 'visible', timeout: 10000 });
    await profileButton.click();
    await this.page.waitForTimeout(250);
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
    await this.page.waitForTimeout(3000);
    await this.page.getByRole('button', { name: openModalText }).click();
    await this.page.waitForTimeout(1000);

    const emailOrPhone = usePhoneNumber ? getRandomPhoneNumber() : getRandomEmail();
    const enterEmailOrPhoneInput = await this.page.getByRole('textbox', { name: /Enter/ }).elementHandle();
    await enterEmailOrPhoneInput?.click();

    await this.page.waitForTimeout(300);
    for (let i = 0; i < emailOrPhone.length; i++) {
      await enterEmailOrPhoneInput?.press(emailOrPhone[i]);
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
    await this.page.waitForTimeout(3000);
    await this.page.getByRole('button', { name: openModalText }).click();
    await this.page.waitForTimeout(1000);

    const enterEmailOrPhoneInput = await this.page.getByRole('textbox', { name: /Enter/ }).elementHandle();
    await enterEmailOrPhoneInput?.click();
    await this.page.waitForTimeout(300);
    for (let i = 0; i < emailOrPhone.length; i++) {
      await enterEmailOrPhoneInput?.press(emailOrPhone[i]);
    }
    await this.page.waitForTimeout(250);
    await this.page.locator('.primary > .hydrated > div > svg').first().click();

    if (password) {
      await this.page.frameLocator('#root iframe').getByRole('textbox', { name: 'Enter password' }).click();
      await this.page.frameLocator('#root iframe').getByRole('textbox', { name: 'Enter password' }).fill(password);
      await this.page.frameLocator('#root iframe').getByRole('button', { name: 'Login' }).click();
      await this.page.waitForTimeout(750);
      await this.page.frameLocator('#root iframe').getByRole('button', { name: 'Keep Using Password' }).click();
    } else {
      const page2Promise = this.page.waitForEvent('popup');
      await this.page.waitForTimeout(750);
      await this.page.getByText('Login with passkey').click();
      const page2 = await page2Promise;
      const authPortal = new AuthPortalPage(page2);
      await authPortal.login(context, credential);

      await page2.waitForTimeout(750);
      await page2.getByRole('button', { name: 'Keep Using Passkey' }).click();
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
    await this.page.waitForTimeout(6000);
    try {
      const paraButton = this.page.locator('button:text("Para")');

      await paraButton.waitFor({ timeout: 3000 });
      await paraButton.click();
    } catch {}
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
    expect(recoveredAddress).toBe(address);
  }

  async logout({ openModalText = 'Open Modal' }: { openModalText?: string }) {
    await this.page.getByRole('button', { name: openModalText }).click();
    await this.clickProfileButton();

    await this.page.getByRole('button', { name: 'Disconnect' }).last().click();
    await this.page.waitForTimeout(2000);
  }

  async exportPrivateKey({
    context,
    credential,
    openModalText = 'Open Modal',
  }: {
    context: BrowserContext;
    credential: Protocol.WebAuthn.Credential;
    openModalText?: string;
  }) {
    // Open modal
    await this.page.getByRole('button', { name: openModalText }).click();
    await this.page.waitForTimeout(5000);

    // Click Profile button to go to account profile page
    await this.clickProfileButton();
    await this.page.waitForTimeout(750);

    // Click the first embedded wallet entry (EVM or COSMOS)
    const walletEntry = this.page.locator('[data-testid^="wallet-entry-EVM"], [data-testid^="wallet-entry-COSMOS"]').first();
    await walletEntry.waitFor({ state: 'visible', timeout: 10000 });
    await walletEntry.click();
    await this.page.waitForTimeout(500);

    // Click Export Private Key button
    const exportButton = this.page.locator('[data-testid="export-private-key-button"]').first();

    // Wait for popup to open (authentication + private key export in same popup)
    const popupPromise = this.page.waitForEvent('popup');
    await exportButton.click();
    const popup = await popupPromise;

    // Handle authentication in the popup
    const authPortal = new AuthPortalPage(popup);
    await authPortal.login(context, credential);

    // After authentication, wait for the private key export screen to load
    // Wait for the private key display element to be present (indicates page is ready)
    const privateKeyDisplay = popup.locator('[data-testid="private-key-display"]');
    await privateKeyDisplay.waitFor({ state: 'attached', timeout: 30000 });
    await this.page.waitForTimeout(1000);

    // Click to reveal the private key (remove blur overlay)
    const overlay = popup.locator('[data-testid="private-key-overlay"]');
    const isOverlayVisible = await overlay.isVisible().catch(() => false);
    if (isOverlayVisible) {
      await overlay.click();
      await this.page.waitForTimeout(500);
    }

    // Get the private key
    const privateKey = await privateKeyDisplay.textContent();

    // Verify private key is present and starts with 0x
    expect(privateKey).toBeTruthy();
    expect(privateKey).toMatch(/^0x[a-fA-F0-9]+/);
    expect(privateKey?.length).toBeGreaterThan(60); // Private keys are typically 64+ hex chars plus 0x prefix

    // Close the export private key popup
    await popup.close();
    await this.page.waitForTimeout(500);

    await this.page.getByTestId('modal-back-button').click();
  }

  async switchWallets({ context, credential }: { context: BrowserContext; credential: Protocol.WebAuthn.Credential }) {
    // // Open modal
    // await this.page.getByRole('button', { name: openModalText }).click();
    // await this.page.waitForTimeout(1000);

    // Click Profile button to go to account profile page
    await this.clickProfileButton();
    await this.page.waitForTimeout(750);

    // Click Switch Wallets button (text can be either 'Switch Wallets' or 'Switch Wallet')
    const switchWalletsButton = this.page.locator('#para-modal').getByText('Switch Wallet');
    await switchWalletsButton.waitFor({ state: 'visible', timeout: 10000 });

    // Wait for popup to open
    const popupPromise = this.page.waitForEvent('popup');
    await switchWalletsButton.click();
    const popup = await popupPromise;

    // Handle authentication in the popup
    const authPortal = new AuthPortalPage(popup);
    await authPortal.login(context, credential);

    // After authentication, wait for the switch wallets page to load
    await popup.waitForURL(/wallets/, { timeout: 30000 });
    await popup.waitForTimeout(8000);

    // Click Create New Wallet buttons for EVM and COSMOS
    const createNewWalletButtons = popup.getByText('Create New Wallet');
    const count = await createNewWalletButtons.count();
    for (let i = 0; i < count; i++) {
      const button = createNewWalletButtons.nth(i);
      if (await button.isVisible()) {
        await button.click();
        await popup.waitForTimeout(300);
      }
    }

    // Click Connect button
    const connectButton = popup.locator('[data-testid="connect-wallet-button"]');
    await connectButton.waitFor({ state: 'visible', timeout: 5000 });
    await connectButton.click();

    // Wait for the popup to close
    await popup.waitForEvent('close', { timeout: 30000 });
    await this.page.waitForTimeout(2000);

    // Wait for wallet entries to appear in the modal
    const walletEntries = this.page.locator('[data-testid^="wallet-entry-"]');
    await walletEntries.first().waitFor({ state: 'visible', timeout: 10000 });

    // Count the wallet entries
    const walletCount = await walletEntries.count();
    expect(walletCount).toBeGreaterThan(0);

    // Wait for wallets to fully sync
    await this.page.waitForTimeout(6000);

    // Close modal
    await this.page.getByTestId('modal-close-button').click();
    await this.page.waitForTimeout(1000);

    // Verify new wallets were created
    expect(walletCount).toBeGreaterThan(0);

    // Test signing with the newly created wallets in Wagmi view
    await this.switchToWagmiView();
    await this.signWagmiMessage();

    await this.switchToDefaultView();
  }
}
