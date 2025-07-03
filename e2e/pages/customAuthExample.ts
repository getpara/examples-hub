import * as crypto from 'node:crypto';
import { BrowserContext, Page, expect } from '@playwright/test';
import { Protocol } from 'playwright-core/types/protocol';

import { AuthPortalPage } from './authPortal';

function getRandomEmail() {
  const randomHexString = crypto.randomBytes(5).toString('hex');
  return `teste2e+${randomHexString}@test.usecapsule.com`;
}

export class CustomAuthExamplePage {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async visit() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async openAuthModal() {
    await this.page.waitForTimeout(500);
    await this.page.getByTestId('open-modal-button').click();
    await this.page.waitForTimeout(1000);
  }

  async createUserWithEmail({
    context,
    email,
  }: {
    context: BrowserContext;
    email?: string;
  }) {
    const userEmail = email || getRandomEmail();
    
    // Switch to email tab if needed
    await this.page.getByTestId('email-tab').click();
    await this.page.waitForTimeout(300);

    // Enter email
    await this.page.getByTestId('email-input').fill(userEmail);
    await this.page.getByTestId('continue-email-button').click();
    
    // Wait for OTP screen
    await this.page.waitForTimeout(3000);
    
    // Enter OTP code (123456 for test environment)
    for (let i = 0; i < 6; i++) {
      await this.page.getByTestId(`otp-input-${i}`).fill((i + 1).toString());
    }
    
    // Handle passkey creation popup
    const popupPromise = this.page.waitForEvent('popup');
    await this.page.getByTestId('verify-wallet-button').click();
    
    const popup = await popupPromise;
    const authPortal = new AuthPortalPage(popup);
    const credentials = await authPortal.setup(context);
    
    // Wait for modal to close and wallet to be connected
    await this.page.waitForTimeout(2000);
    await expect(this.page.getByTestId('wallet-connected')).toBeVisible();
    
    return {
      email: userEmail,
      credential: credentials[0],
    };
  }

  async loginWithEmail({
    context,
    credential,
    email,
  }: {
    context: BrowserContext;
    credential: Protocol.WebAuthn.Credential;
    email: string;
  }) {
    // Enter email
    await this.page.getByTestId('email-tab').click();
    await this.page.waitForTimeout(300);
    await this.page.getByTestId('email-input').fill(email);
    await this.page.getByTestId('continue-email-button').click();
    
    // Handle passkey login popup
    const popupPromise = this.page.waitForEvent('popup');
    await this.page.waitForTimeout(1000);
    
    const popup = await popupPromise;
    const authPortal = new AuthPortalPage(popup);
    await authPortal.login(context, credential);
    
    // Wait for login to complete
    await this.page.waitForTimeout(2000);
    await expect(this.page.getByTestId('wallet-connected')).toBeVisible();
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
    const walletAddressElement = await this.page.getByTestId('wallet-address');
    const text = await walletAddressElement.textContent();
    if (!text) return null;
    
    // Extract address from "Your first wallet address is: 0x..."
    const match = text.match(/0x[a-fA-F0-9]{40}/);
    return match ? match[0] : null;
  }

  async signMessage(message: string): Promise<string | null> {
    // Fill in the message
    await this.page.locator('#message').fill(message);
    
    // Click sign button
    await this.page.getByTestId('sign-message-button').click();
    
    // Wait for signature
    await this.page.waitForTimeout(2000);
    
    // Get signature from the page
    const signatureElement = await this.page.locator('.font-mono').first();
    const signature = await signatureElement.textContent();
    
    return signature;
  }

  async logout() {
    await this.openAuthModal();
    await this.page.getByTestId('logout-button').click();
    await this.page.waitForTimeout(500);
    
    // Verify logout
    await expect(this.page.getByTestId('not-logged-in')).toBeVisible();
  }
}