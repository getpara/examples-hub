import * as crypto from 'node:crypto';
import { BrowserContext, Page, FrameLocator } from '@playwright/test';
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

export class ParaModalExamplePage {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Helper function to reliably find and return an iframe locator
   * Tries multiple selectors and waits for content to be ready
   */
  private async getParaIframe(): Promise<FrameLocator> {
    // Wait for any iframe to appear
    await this.page.waitForSelector('iframe', { state: 'visible', timeout: 5000 });
    
    // Get the iframe locator
    const frameLocator = this.page.frameLocator('iframe').first();
    
    // Try to find password input in the iframe
    try {
      // First attempt - wait a short time for content
      await frameLocator.getByRole('textbox', { name: 'Enter password' }).waitFor({ 
        state: 'visible', 
        timeout: 3000 
      });
      console.log('Found password input in iframe on first attempt');
      return frameLocator;
    } catch (error) {
      console.log('Password input not found in iframe, attempting to refresh iframe');
      
      // Get the iframe element to refresh it
      const iframeElement = await this.page.locator('iframe').first().elementHandle();
      if (iframeElement) {
        const src = await iframeElement.getAttribute('src');
        if (src) {
          console.log('Refreshing iframe by resetting src attribute');
          // Force refresh by setting src to empty then back to original
          await iframeElement.evaluate((iframe) => {
            const originalSrc = (iframe as HTMLIFrameElement).src;
            (iframe as HTMLIFrameElement).src = 'about:blank';
            setTimeout(() => {
              (iframe as HTMLIFrameElement).src = originalSrc;
            }, 100);
          });
          
          // Wait for iframe to reload
          await this.page.waitForTimeout(2000);
          
          // Try again to find the password input
          try {
            await frameLocator.getByRole('textbox', { name: 'Enter password' }).waitFor({ 
              state: 'visible', 
              timeout: 5000 
            });
            console.log('Found password input in iframe after refresh');
          } catch {
            console.log('Warning: Could not find password input even after refresh');
          }
        }
      }
    }
    
    return frameLocator;
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
    if (!enterEmailOrPhoneInput) {
      throw new Error('Could not find email/phone input');
    }
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
      
      // Wait for iframe to appear and load
      await this.page.waitForTimeout(2000);
      
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

    // Wait for modal to close and app state to update
    console.log('🔄 Waiting for Para Modal to close and connection state to update...');
    await this.page.waitForTimeout(3000);
    
    // Verify that the modal has closed by checking that the page is back to main content
    try {
      // Wait for the account address display to appear (indicates successful connection)
      await this.page.waitForSelector('[data-testid="account-address-display"]', { 
        state: 'visible', 
        timeout: 10000 
      });
      console.log('✅ Para Modal connection confirmed - account address display visible');
    } catch (error) {
      console.log('⚠️ Account address display not found after modal close, may need more time');
      // Try waiting a bit more
      await this.page.waitForTimeout(2000);
    }
    
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
    console.log('Starting login flow...');
    await this.page.reload();
    await this.page.waitForTimeout(500);
    console.log(`Looking for button with text: ${openModalText}`);
    await this.page.getByRole('button', { name: openModalText }).click();
    console.log('Modal opened');
    await this.page.waitForTimeout(750);

    const enterEmailOrPhoneInput = await this.page.getByRole('textbox', { name: 'Enter email or phone' }).elementHandle();
    if (!enterEmailOrPhoneInput) {
      throw new Error('Could not find email/phone input');
    }
    console.log('Found email/phone input');
    await enterEmailOrPhoneInput.click();
    await this.page.waitForTimeout(300);
    for (let i = 0; i < emailOrPhone.length; i++) {
      await enterEmailOrPhoneInput.press(emailOrPhone[i]);
    }
    console.log(`Entered email/phone: ${emailOrPhone}`);
    await this.page.waitForTimeout(250);
    await this.page.locator('.primary > .hydrated > div > svg').first().click();
    console.log('Clicked arrow button to proceed');

    await this.page.waitForTimeout(750);
    if (password) {
      console.log('Password login flow - looking for password input in iframe...');
      try {
        // Wait a bit for iframe to appear
        await this.page.waitForTimeout(1000);
        
        // Use helper function to get iframe
        const iframeLocator = await this.getParaIframe();
        
        // Enter password in iframe
        const passwordInput = await iframeLocator.getByRole('textbox', { name: 'Enter password' });
        console.log('Found password input in iframe');
        await passwordInput.click();
        await passwordInput.fill(password);
        console.log('Entered password');
        
        // Now the Login button should be enabled
        await this.page.waitForTimeout(500); // Wait for button to enable
        const loginButton = await iframeLocator.getByRole('button', { name: 'Login' });
        console.log('Found Login button in iframe, clicking...');
        
        // Click login button - no popup needed for password login with iframe
        await loginButton.click();
        console.log('Clicked Login button, login should complete');
        
        // Wait for modal to close and user to be logged in
        await this.page.waitForTimeout(2000);
        console.log('Login completed');
      } catch (error) {
        console.error('Error in password login flow:', error);
        throw error;
      }
    } else {
      console.log('Passkey login flow');
      const page2Promise = this.page.waitForEvent('popup');
      await this.page.getByText('Login with passkey').click();
      const page2 = await page2Promise;
      const authPortal = new AuthPortalPage(page2);
      await authPortal.login(context, credential);
    }

    // Wait for login to complete and connection state to update
    console.log('🔄 Waiting for login completion and connection state update...');
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
      console.log('✅ Para Modal login confirmed - account address display visible');
    } catch (error) {
      console.log('⚠️ Account address display not found after login, may need more time');
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
    console.log(`Signing message: ${message}`);
    
    // Find and fill the message input
    const messageInput = await this.page.getByTestId('sign-message-input');
    await messageInput.click();
    await messageInput.clear();
    await messageInput.fill(message);
    console.log('Filled message input');
    
    // Click the sign button
    const signButton = await this.page.getByTestId('sign-submit-button');
    await signButton.click();
    console.log('Clicked sign button');
    
    // Wait for signature to appear
    const signatureDisplay = await this.page.waitForSelector('[data-testid="sign-signature-display"]', {
      state: 'visible',
      timeout: 10000
    });
    console.log('Signature appeared');
    
    // Get the signature text
    const signature = await signatureDisplay.textContent();
    console.log(`Got signature: ${signature}`);
    
    return signature || '';
  }
}
