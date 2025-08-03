import * as crypto from 'node:crypto';
import { BrowserContext, Page, FrameLocator, expect } from '@playwright/test';
import { Protocol } from 'playwright-core/types/protocol';

import { AuthPortalPage } from './authPortal';
import { Logger } from '../helpers/logger';

function getRandomPhoneNumber() {
  const last4 = `${Math.floor(Math.random() * 10000)}`.padStart(4, '0');
  return `415555${last4}`;
}

function getRandomEmail() {
  const randomHexString = crypto.randomBytes(5).toString('hex');
  return `teste2e+${randomHexString}@test.usecapsule.com`;
}

export class ParaModalExamplePage {
  page: Page;
  private logger: Logger;

  constructor(page: Page) {
    this.page = page;
    this.logger = new Logger('ParaModalExample');
  }

  /**
   * Helper function to reliably find and return an iframe locator
   * Tries multiple selectors and waits for content to be ready
   */
  private async getParaIframe(): Promise<FrameLocator> {
    // Wait for iframe to appear and be visible
    await this.page.waitForSelector('iframe', { state: 'visible', timeout: 10000 });
    
    // Get the iframe locator
    const frameLocator = this.page.frameLocator('iframe').first();
    
    // Wait for the frame to be loaded and visible
    await frameLocator.locator('body').waitFor({ state: 'visible', timeout: 10000 });
    
    // Ensure password input is visible in the iframe
    await expect(frameLocator.getByRole('textbox', { name: 'Enter password' })).toBeVisible({ timeout: 10000 });
    this.logger.logInfo('Found password input in iframe');
    
    return frameLocator;
  }

  async visit() {
    await this.page.goto('/');
    // Wait for page to be fully loaded and interactive
    await this.page.waitForLoadState('networkidle');
    // Wait for the main UI to be ready
    await expect(this.page.getByRole('button', { name: 'Open Modal' })).toBeVisible({ timeout: 10000 });
  }

  /**
   * Ensures the UI is stable and ready before opening the Para modal
   * This helps prevent issues where the modal backdrop appears but the modal itself fails to open
   */
  async waitForUIStability(openModalText: string = 'Open Modal') {
    this.logger.logStep('Waiting for UI stability before modal interaction...');
    
    // Wait for the modal button to be visible and stable
    const modalButton = this.page.getByRole('button', { name: openModalText });
    await modalButton.waitFor({ state: 'visible', timeout: 10000 });
    
    // Additional wait to ensure any animations or async operations complete
    await this.page.waitForTimeout(1500);
    
    // Verify button is still visible and clickable
    await expect(modalButton).toBeVisible();
    await expect(modalButton).toBeEnabled();
    
    this.logger.logStep('UI is stable and ready for modal interaction', true);
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
    // Ensure UI is stable before opening modal
    await this.waitForUIStability(openModalText);
    
    await this.page.getByRole('button', { name: openModalText }).click();
    // Wait for modal to be visible
    await expect(this.page.getByRole('textbox', { name: 'Enter email or phone' })).toBeVisible({ timeout: 5000 });

    const emailOrPhone = usePhoneNumber ? getRandomPhoneNumber() : getRandomEmail();
    const enterEmailOrPhoneInput = this.page.getByRole('textbox', { name: 'Enter email or phone' });
    await enterEmailOrPhoneInput.click();
    await enterEmailOrPhoneInput.fill(emailOrPhone);
    await expect(enterEmailOrPhoneInput).toHaveValue(emailOrPhone);
    await this.page.locator('.primary > .hydrated > div > svg').first().click();
    // Wait for OTP inputs to be visible
    await expect(this.page.locator('#code-input-0')).toBeVisible({ timeout: 5000 });

    for (let i = 0; i < 6; i++) {
      await this.page.locator(`#code-input-${i}`).click();
      await this.page.locator(`#code-input-${i}`).fill((i + 1).toString());
    }

    let credentials: Protocol.WebAuthn.Credential[] = [];
    if (password) {
      await this.page.getByRole('button', { name: 'Choose Password' }).click();
      
      // Use helper function to get iframe
      const iframeLocator = await this.getParaIframe();
      
      // Enter password in iframe
      await iframeLocator.getByRole('textbox', { name: 'Enter password' }).click();
      await iframeLocator.getByRole('textbox', { name: 'Enter password' }).fill(password);
      await iframeLocator.getByRole('textbox', { name: 'Confirm password' }).click();
      await iframeLocator.getByRole('textbox', { name: 'Confirm password' }).fill(password);
      await iframeLocator.getByRole('button', { name: 'Save Password' }).click();
    } else {
      const page1Promise = this.page.waitForEvent('popup');
      await this.page.getByTestId('modal-content').getByRole('button', { name: 'Create' }).click();

      const page1 = await page1Promise;
      const authPortal = new AuthPortalPage(page1);
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

    // Wait for modal to close and app state to update
    this.logger.logStep('Waiting for Para Modal to close and connection state to update...');
    
    // Wait for the account address display to appear (indicates successful connection)
    await expect(this.page.getByTestId('account-address-display')).toBeVisible({ timeout: 15000 });
    this.logger.logStep('Para Modal connection confirmed - account address display visible', true);
    
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
    this.logger.logInfo('Starting login flow...');
    await this.page.reload();
    await this.page.waitForLoadState('networkidle'); // Wait for reload to complete
    
    // Ensure UI is stable before opening modal
    await this.waitForUIStability(openModalText);
    
    this.logger.logInfo(`Looking for button with text: ${openModalText}`);
    await this.page.getByRole('button', { name: openModalText }).click();
    this.logger.logInfo('Modal opened');
    // Wait for modal to be visible
    await expect(this.page.getByRole('textbox', { name: 'Enter email or phone' })).toBeVisible({ timeout: 5000 });

    const enterEmailOrPhoneInput = this.page.getByRole('textbox', { name: 'Enter email or phone' });
    this.logger.logInfo('Found email/phone input');
    await enterEmailOrPhoneInput.click();
    await enterEmailOrPhoneInput.fill(emailOrPhone);
    await expect(enterEmailOrPhoneInput).toHaveValue(emailOrPhone);
    this.logger.logInfo(`Entered email/phone: ${emailOrPhone}`);
    await this.page.locator('.primary > .hydrated > div > svg').first().click();
    this.logger.logInfo('Clicked arrow button to proceed');
    if (password) {
      this.logger.logInfo('Password login flow - looking for password input in iframe...');
      try {
        
        // Use helper function to get iframe
        const iframeLocator = await this.getParaIframe();
        
        // Enter password in iframe
        const passwordInput = await iframeLocator.getByRole('textbox', { name: 'Enter password' });
        this.logger.logInfo('Found password input in iframe');
        await passwordInput.click();
        await passwordInput.fill(password);
        this.logger.logInfo('Entered password');
        
        // Now the Login button should be enabled
        const loginButton = iframeLocator.getByRole('button', { name: 'Login' });
        await expect(loginButton).toBeEnabled({ timeout: 5000 });
        this.logger.logInfo('Found Login button in iframe, clicking...');
        
        // Click login button - no popup needed for password login with iframe
        await loginButton.click();
        this.logger.logInfo('Clicked Login button, login should complete');
        
        // Wait for modal to close and user to be logged in
        await this.page.waitForTimeout(2000);
        this.logger.logInfo('Login completed');
      } catch (error) {
        this.logger.logError('Error in password login flow:', error);
        throw error;
      }
    } else {
      this.logger.logInfo('Passkey login flow');
      const page2Promise = this.page.waitForEvent('popup');
      await this.page.getByText('Login with passkey').click();
      const page2 = await page2Promise;
      const authPortal = new AuthPortalPage(page2);
      await authPortal.login(context, credential);
    }

    // Wait for login to complete and connection state to update
    this.logger.logStep('Waiting for login completion and connection state update...');
    await this.page.waitForTimeout(2000);
    
    if (is2FAEnabled) {
      await this.page.getByRole('button', { name: 'Skip' }).click();
      await this.page.waitForTimeout(2100);
    }
    
    // Verify login completion by checking for account address display
    try {
      await this.page.waitForSelector('[data-testid="account-address-display"]', { 
        state: 'visible', 
        timeout: 10000 
      });
      this.logger.logStep('Para Modal login confirmed - account address display visible', true);
    } catch (error) {
      this.logger.logWarning('Account address display not found after login, may need more time');
      await this.page.waitForTimeout(2000);
    }
  }

  async logout({ openModalText = 'Open Modal' }: { openModalText?: string }) {
    // Click on the connected address button to open modal
    await this.page.getByTestId('account-address-display').click();
    await this.page.waitForTimeout(500);
    await this.page.getByRole('button', { name: 'Disconnect Wallet' }).click();
    await this.page.waitForTimeout(250);
  }

  async signMessage(message: string): Promise<string> {
    this.logger.logInfo(`Signing message: ${message}`);
    
    // Find and fill the message input
    const messageInput = await this.page.getByTestId('sign-message-input');
    await messageInput.click();
    await messageInput.clear();
    await messageInput.fill(message);
    this.logger.logInfo('Filled message input');
    
    // Click the sign button
    const signButton = await this.page.getByTestId('sign-submit-button');
    await signButton.click();
    this.logger.logInfo('Clicked sign button');
    
    // Wait for signature to appear
    const signatureDisplay = await this.page.waitForSelector('[data-testid="sign-signature-display"]', {
      state: 'visible',
      timeout: 10000
    });
    this.logger.logInfo('Signature appeared');
    
    // Get the signature text
    const signature = await signatureDisplay.textContent();
    this.logger.logInfo(`Got signature: ${signature}`);
    
    return signature || '';
  }
}
