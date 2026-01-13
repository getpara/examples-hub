import * as crypto from 'node:crypto';
import { BrowserContext, Page, FrameLocator, Locator, expect } from '@playwright/test';
import { Protocol } from 'playwright-core/types/protocol';

import { AuthPortalPage } from './authPortal';
import { Logger } from '../helpers/logger';

function getRandomEmail() {
  const randomHexString = crypto.randomBytes(5).toString('hex');
  return `teste2e+${randomHexString}@test.usecapsule.com`;
}

export class CustomAuthExamplePage {
  page: Page;
  private logger: Logger;

  constructor(page: Page) {
    this.page = page;
    this.logger = new Logger('CustomAuthExample');
  }

  /**
   * Helper function to reliably find and return an iframe locator
   * Used for OTP verification which happens in Para portal iframe
   */
  private async getParaIframe(): Promise<FrameLocator> {
    await this.page.waitForSelector("iframe", {
      state: "visible",
      timeout: 20000,
    });
    return this.page.frameLocator("iframe").first();
  }

  /**
   * Helper function to get the OTP input locator inside the iframe
   */
  private async getIframeOTPInput(): Promise<Locator> {
    const frameLocator = await this.getParaIframe();
    const iframeOTPInput = frameLocator.locator("cpsl-code-input");
    await expect(iframeOTPInput).toBeVisible({ timeout: 15000 });
    this.logger.logInfo("Found OTP input in iframe");
    return iframeOTPInput;
  }

  async visit() {
    this.logger.logStep('Starting page visit...');
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
    this.logger.logStep('Page loaded successfully', true);
  }

  async openAuthModal() {
    this.logger.logStep('Ensuring auth form is visible (inline auth)...');
    // Auth is now inline, just ensure email tab is visible
    await expect(this.page.getByTestId('email-tab')).toBeVisible({ timeout: 5000 });
    this.logger.logStep('Auth form visible', true);
  }

  async waitForParaAuthentication(timeout = 15000): Promise<void> {
    this.logger.logStep('Waiting for Para SDK authentication...');
    
    // Use a more reliable approach: wait for the wallet-connected UI element with extended timeout
    // and add some polling to handle timing issues
    try {
      await expect(this.page.getByTestId('wallet-connected')).toBeVisible({ timeout });
      this.logger.logStep('Para SDK authentication confirmed', true);
    } catch (error) {
      // If direct wait fails, try polling approach
      this.logger.logWarning('Direct wait failed, trying polling approach...');
      
      await expect.poll(
        async () => {
          const isVisible = await this.page.getByTestId('wallet-connected').isVisible();
          if (!isVisible) {
            // Check if we're still in loading state or if there's an error
            const isLoading = await this.page.getByTestId('not-logged-in').isVisible();
            this.logger.logDebug(`Still loading: ${isLoading}`);
          }
          return isVisible;
        },
        {
          timeout,
          message: 'Para SDK authentication not completed'
        }
      ).toBe(true);
      
      this.logger.logStep('Para SDK authentication confirmed via polling', true);
    }
  }

  async createUserWithEmail({
    context,
    email,
  }: {
    context: BrowserContext;
    email?: string;
  }) {
    const userEmail = email || getRandomEmail();
    this.logger.logStep(`Starting user creation with email: ${userEmail}`);

    // Switch to email tab if needed
    this.logger.logStep('Switching to email tab...');
    await this.page.getByTestId('email-tab').click();
    await expect(this.page.getByTestId('email-input')).toBeVisible({ timeout: 5000 });

    // Enter email
    this.logger.log('📧', `Entering email: ${userEmail}`);
    await this.page.getByTestId('email-input').fill(userEmail);
    await this.page.getByTestId('continue-email-button').click();
    this.logger.logStep('Email submitted, waiting for OTP iframe...', true);

    // Wait for OTP input in iframe (Para portal handles verification)
    const iframeOTPInputLocator = await this.getIframeOTPInput();
    this.logger.logStep('Entering OTP code in iframe...');

    // Enter OTP code (123456 for test environment)
    for (let i = 0; i < 6; i++) {
      const otpInput = iframeOTPInputLocator.locator(`#code-input-${i}`);
      await expect(otpInput).toBeVisible({ timeout: 5000 });
      await otpInput.click();
      await otpInput.fill((i + 1).toString());
    }
    this.logger.logStep('OTP code entered', true);

    // Basic login flow - no passkey popup, just wait for authentication to complete
    this.logger.logStep('Waiting for wallet connection...');
    await this.waitForParaAuthentication();
    this.logger.logStep('User creation completed - wallet connected', true);

    return {
      email: userEmail,
      credential: null as any, // No credential in basic login flow
    };
  }

  async createUserWithEmailAndPassword({
    context,
    email,
    password = 'abc123@-$}"',
  }: {
    context: BrowserContext;
    email?: string;
    password?: string;
  }) {
    const userEmail = email || getRandomEmail();
    this.logger.logStep(`Starting user creation with email and password: ${userEmail}`);

    try {
      // Switch to email tab if needed
      this.logger.logStep('Switching to email tab...');
      await this.page.getByTestId('email-tab').click();
      await expect(this.page.getByTestId('email-input')).toBeVisible({ timeout: 5000 });

      // Enter email
      this.logger.log('📧', `Entering email: ${userEmail}`);
      await this.page.getByTestId('email-input').fill(userEmail);
      await this.page.getByTestId('continue-email-button').click();
      this.logger.logStep('Email submitted, waiting for OTP iframe...', true);

      // Wait for OTP input in iframe (Para portal handles verification)
      const iframeOTPInputLocator = await this.getIframeOTPInput();
      this.logger.logStep('Entering OTP code in iframe...');

      // Enter OTP code (123456 for test environment)
      for (let i = 0; i < 6; i++) {
        const otpInput = iframeOTPInputLocator.locator(`#code-input-${i}`);
        await expect(otpInput).toBeVisible({ timeout: 5000 });
        await otpInput.click();
        await otpInput.fill((i + 1).toString());
      }
      this.logger.logStep('OTP code entered', true);

      // Handle password creation popup - this should be triggered by the iframe
      this.logger.logStep('Waiting for password creation popup...');
      const popupPromise = this.page.waitForEvent('popup');

      const popup = await popupPromise;

      // Choose password option in popup
      this.logger.log('🔐', 'Choosing password option...');
      await expect(popup.getByRole('button', { name: 'Choose Password' })).toBeVisible({ timeout: 5000 });
      await popup.getByRole('button', { name: 'Choose Password' }).click();
      this.logger.logStep('Entering password...');
      await popup.getByRole('textbox', { name: 'Enter password' }).click();
      await popup.getByRole('textbox', { name: 'Enter password' }).fill(password);
      await popup.getByRole('textbox', { name: 'Confirm password' }).click();
      await popup.getByRole('textbox', { name: 'Confirm password' }).fill(password);
      await popup.getByRole('button', { name: 'Save Password' }).click();
      this.logger.logStep('Password saved', true);

      // Wait for popup to close
      this.logger.logStep('Waiting for popup to close...');
      await popup.waitForEvent('close');

      // Wait for wallet to be connected
      this.logger.logStep('Waiting for wallet connection...');
      await expect(this.page.getByTestId('wallet-connected')).toBeVisible({ timeout: 10000 });
      this.logger.logStep('User creation with password completed - wallet connected', true);

      return {
        email: userEmail,
        password,
      };
    } catch (error) {
      this.logger.logError('Error in createUserWithEmailAndPassword:', error);
      throw error;
    }
  }

  async loginWithEmail({
    context,
    credential,
    email,
  }: {
    context: BrowserContext;
    credential?: Protocol.WebAuthn.Credential;
    email: string;
  }) {
    this.logger.logStep(`Starting login with email: ${email}`);

    // Enter email
    this.logger.logStep('Switching to email tab...');
    await this.page.getByTestId('email-tab').click();
    await expect(this.page.getByTestId('email-input')).toBeVisible({ timeout: 5000 });
    this.logger.log('📧', `Entering email: ${email}`);
    await this.page.getByTestId('email-input').fill(email);
    await this.page.getByTestId('continue-email-button').click();
    this.logger.logStep('Email submitted for login', true);

    // Basic login flow - use OTP in iframe (no passkey popup)
    const iframeOTPInputLocator = await this.getIframeOTPInput();
    this.logger.logStep('Entering OTP code in iframe...');

    // Enter OTP code (123456 for test environment)
    for (let i = 0; i < 6; i++) {
      const otpInput = iframeOTPInputLocator.locator(`#code-input-${i}`);
      await expect(otpInput).toBeVisible({ timeout: 5000 });
      await otpInput.click();
      await otpInput.fill((i + 1).toString());
    }
    this.logger.logStep('OTP code entered', true);

    // Wait for Para SDK authentication to complete
    this.logger.logStep('Waiting for login completion...');
    await this.waitForParaAuthentication();
    this.logger.logStep('Login completed - wallet connected', true);
  }

  async loginWithEmailAndPassword({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    this.logger.logStep(`Starting password login with email: ${email}`);
    
    try {
      // Enter email
      this.logger.logStep('Switching to email tab...');
      await this.page.getByTestId('email-tab').click();
      await this.page.waitForTimeout(300);
      this.logger.log('📧', `Entering email: ${email}`);
      await this.page.getByTestId('email-input').fill(email);
      await this.page.getByTestId('continue-email-button').click();
      this.logger.logStep('Email submitted for password login', true);
      
      // Handle password login popup
      this.logger.logStep('Opening password login popup...');
      const popupPromise = this.page.waitForEvent('popup');
      await this.page.waitForTimeout(1000);
      
      const popup = await popupPromise;
      
      // Click Login button
      this.logger.logStep('Clicking Login button...');
      await popup.getByRole('button', { name: 'Login' }).click();
      
      // Enter password in the popup
      this.logger.log('🔐', 'Entering password...');
      await popup.getByRole('textbox', { name: 'Enter password' }).click();
      await popup.getByRole('textbox', { name: 'Enter password' }).fill(password);
      await popup.getByRole('button', { name: 'Continue' }).click();
      this.logger.logStep('Password submitted', true);
      
      // Wait for popup to close
      this.logger.logStep('Waiting for popup to close...');
      await popup.waitForEvent('close');
      
      // Wait for login to complete
      this.logger.logStep('Waiting for login completion...');
      await this.page.waitForTimeout(2000);
      await expect(this.page.getByTestId('wallet-connected')).toBeVisible();
      this.logger.logStep('Password login completed - wallet connected', true);
    } catch (error) {
      this.logger.logError('Error in loginWithEmailAndPassword:', error);
      throw error;
    }
  }

  async loginWithSocial({
    context,
    method = 'GOOGLE',
  }: {
    context: BrowserContext;
    method?: string;
  }) {
    const socialButtonTestId = `social-auth-${method.toLowerCase()}`;
    
    // Click social auth button
    await this.page.getByTestId(socialButtonTestId).click();
    
    // Handle OAuth popup
    const popupPromise = this.page.waitForEvent('popup');
    await this.page.waitForTimeout(1000);
    
    const popup = await popupPromise;
    // In a real test, you would handle the OAuth provider login
    // For now, we'll just close the popup to simulate completion
    await popup.close();
    
    // Handle passkey creation if needed
    const passkeyPopupPromise = this.page.waitForEvent('popup');
    await this.page.waitForTimeout(1000);
    
    const passkeyPopup = await passkeyPopupPromise;
    const authPortal = new AuthPortalPage(passkeyPopup);
    const credentials = await authPortal.setup(context);
    
    // Wait for login to complete
    await this.page.waitForTimeout(2000);
    await expect(this.page.getByTestId('wallet-connected')).toBeVisible();
    
    return {
      credential: credentials[0],
    };
  }

  async getWalletAddress(): Promise<string | null> {
    // Try both possible test IDs (old: wallet-address, new: account-address-display)
    let walletAddressElement = this.page.getByTestId('wallet-address');
    let isVisible = await walletAddressElement.isVisible().catch(() => false);

    if (!isVisible) {
      walletAddressElement = this.page.getByTestId('account-address-display');
      isVisible = await walletAddressElement.isVisible().catch(() => false);
    }

    if (!isVisible) return null;

    const text = await walletAddressElement.textContent();
    if (!text) return null;

    // Handle both full format: "Your first wallet address is: 0x..."
    // and truncated format: "0x1234...5678" (used by Vue/Svelte)
    const fullMatch = text.match(/0x[a-fA-F0-9]{40}/);
    if (fullMatch) return fullMatch[0];

    // Handle truncated format by extracting the prefix and suffix
    const truncatedMatch = text.match(/0x([a-fA-F0-9]{4,6})\.\.\.([a-fA-F0-9]{4})/);
    if (truncatedMatch) {
      // Return a mock full address since we can't reconstruct the full address from truncated format
      // For testing purposes, this indicates the address element exists and contains valid format
      return `0x${truncatedMatch[1].padEnd(36, '0')}${truncatedMatch[2]}`;
    }

    return null;
  }

  async signMessage(message?: string): Promise<string | null> {
    // Check if we have the input-based implementation or hardcoded message implementation
    const messageInput = this.page.getByTestId('sign-message-input');
    const hasInput = await messageInput.isVisible().catch(() => false);

    if (hasInput && message) {
      // Input-based implementation
      this.logger.logStep(`Signing message: ${message}`);
      this.logger.logStep('Filling message input...');
      await messageInput.click();
      await messageInput.clear();
      await messageInput.fill(message);
      this.logger.logStep('Message input filled', true);
    } else {
      // Hardcoded "Hello World!" implementation (Vue/Svelte custom auth)
      this.logger.logStep('Signing hardcoded "Hello World!" message');
    }

    // Click sign button
    this.logger.logStep('Clicking sign button...');
    await this.page.getByTestId('sign-message-button').click();

    // Wait for signature to appear
    this.logger.logStep('Waiting for signature...');
    const signatureDisplay = await this.page.waitForSelector('[data-testid="sign-signature-display"]', {
      state: 'visible',
      timeout: 10000
    });

    // Get signature from the page
    const signature = await signatureDisplay.textContent();
    this.logger.logStep(`Got signature: ${signature}`, true);

    return signature;
  }

  async logout() {
    this.logger.logStep('Starting logout...');
    this.logger.logStep('Clicking header disconnect button...');
    await this.page.getByTestId('header-disconnect-button').click();
    await this.page.waitForTimeout(2000); // Wait for logout and state update
    
    // Verify logout
    this.logger.logStep('Verifying logout...');
    await expect(this.page.getByTestId('not-logged-in')).toBeVisible();
    this.logger.logStep('Logout completed', true);
  }
}