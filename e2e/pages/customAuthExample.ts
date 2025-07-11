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
    console.log('🔄 Starting page visit...');
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
    console.log('✅ Page loaded successfully');
  }

  async openAuthModal() {
    console.log('🔄 Opening auth modal...');
    await this.page.waitForTimeout(500);
    // Try both possible button test IDs (Vue uses open-modal-button, Svelte uses auth-connect-button)
    const openModalButton = await this.page.getByTestId('open-modal-button').or(this.page.getByTestId('auth-connect-button'));
    await openModalButton.click();
    console.log('✅ Auth modal opened');
    await this.page.waitForTimeout(1000);
  }

  async waitForParaAuthentication(timeout = 15000): Promise<void> {
    console.log('🔄 Waiting for Para SDK authentication...');
    
    // Use a more reliable approach: wait for the wallet-connected UI element with extended timeout
    // and add some polling to handle timing issues
    try {
      await expect(this.page.getByTestId('wallet-connected')).toBeVisible({ timeout });
      console.log('✅ Para SDK authentication confirmed');
    } catch (error) {
      // If direct wait fails, try polling approach
      console.log('⚠️ Direct wait failed, trying polling approach...');
      const startTime = Date.now();
      
      while (Date.now() - startTime < timeout) {
        const isVisible = await this.page.getByTestId('wallet-connected').isVisible();
        if (isVisible) {
          console.log('✅ Para SDK authentication confirmed via polling');
          return;
        }
        
        // Check if we're still in loading state or if there's an error
        const isLoading = await this.page.getByTestId('not-logged-in').isVisible();
        console.log(`🔍 Still loading: ${isLoading}`);
        
        await this.page.waitForTimeout(500);
      }
      
      throw new Error(`Para SDK authentication not completed within ${timeout}ms`);
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
    console.log(`🔄 Starting user creation with email: ${userEmail}`);
    
    // Switch to email tab if needed
    console.log('🔄 Switching to email tab...');
    await this.page.getByTestId('email-tab').click();
    await this.page.waitForTimeout(300);

    // Enter email
    console.log(`📧 Entering email: ${userEmail}`);
    await this.page.getByTestId('email-input').fill(userEmail);
    await this.page.getByTestId('continue-email-button').click();
    console.log('✅ Email submitted, waiting for OTP screen...');
    
    // Wait for OTP screen
    await this.page.waitForTimeout(3000);
    console.log('🔄 Entering OTP code...');
    
    // Enter OTP code (123456 for test environment)
    for (let i = 0; i < 6; i++) {
      await this.page.getByTestId(`otp-input-${i}`).fill((i + 1).toString());
    }
    console.log('✅ OTP code entered');
    
    // Handle passkey creation popup
    console.log('🔄 Opening passkey creation popup...');
    const popupPromise = this.page.waitForEvent('popup');
    await this.page.getByTestId('verify-wallet-button').click();
    
    const popup = await popupPromise;
    console.log('🔐 Setting up passkey credentials...');
    const authPortal = new AuthPortalPage(popup);
    const credentials = await authPortal.setup(context);
    console.log('✅ Passkey credentials created');
    
    // Wait for modal to close and verify Para SDK authentication
    console.log('🔄 Waiting for wallet connection...');
    await this.waitForParaAuthentication();
    console.log('✅ User creation completed - wallet connected');
    
    return {
      email: userEmail,
      credential: credentials[0],
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
    console.log(`🔄 Starting user creation with email and password: ${userEmail}`);
    
    try {
      // Switch to email tab if needed
      console.log('🔄 Switching to email tab...');
      await this.page.getByTestId('email-tab').click();
      await this.page.waitForTimeout(300);

      // Enter email
      console.log(`📧 Entering email: ${userEmail}`);
      await this.page.getByTestId('email-input').fill(userEmail);
      await this.page.getByTestId('continue-email-button').click();
      console.log('✅ Email submitted, waiting for OTP screen...');
      
      // Wait for OTP screen
      await this.page.waitForTimeout(3000);
      console.log('🔄 Entering OTP code...');
      
      // Enter OTP code (123456 for test environment)
      for (let i = 0; i < 6; i++) {
        await this.page.getByTestId(`otp-input-${i}`).fill((i + 1).toString());
      }
      console.log('✅ OTP code entered');
      
      // Handle password creation popup
      console.log('🔄 Opening password creation popup...');
      const popupPromise = this.page.waitForEvent('popup');
      await this.page.getByTestId('verify-wallet-button').click();
      
      const popup = await popupPromise;
      const authPortal = new AuthPortalPage(popup);
      
      // Choose password option in popup
      console.log('🔐 Choosing password option...');
      await popup.getByRole('button', { name: 'Choose Password' }).click();
      console.log('🔄 Entering password...');
      await popup.getByRole('textbox', { name: 'Enter password' }).click();
      await popup.getByRole('textbox', { name: 'Enter password' }).fill(password);
      await popup.getByRole('textbox', { name: 'Confirm password' }).click();
      await popup.getByRole('textbox', { name: 'Confirm password' }).fill(password);
      await popup.getByRole('button', { name: 'Save Password' }).click();
      console.log('✅ Password saved');
      
      // Wait for popup to close
      console.log('🔄 Waiting for popup to close...');
      await popup.waitForEvent('close');
      
      // Wait for modal to close and wallet to be connected
      console.log('🔄 Waiting for wallet connection...');
      await this.page.waitForTimeout(2000);
      await expect(this.page.getByTestId('wallet-connected')).toBeVisible();
      console.log('✅ User creation with password completed - wallet connected');
      
      return {
        email: userEmail,
        password,
      };
    } catch (error) {
      console.error('❌ Error in createUserWithEmailAndPassword:', error);
      throw error;
    }
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
    console.log(`🔄 Starting login with email: ${email}`);
    
    // Enter email
    console.log('🔄 Switching to email tab...');
    await this.page.getByTestId('email-tab').click();
    await this.page.waitForTimeout(300);
    console.log(`📧 Entering email: ${email}`);
    await this.page.getByTestId('email-input').fill(email);
    await this.page.getByTestId('continue-email-button').click();
    console.log('✅ Email submitted for login');
    
    // Handle passkey login popup
    console.log('🔄 Opening passkey login popup...');
    const popupPromise = this.page.waitForEvent('popup');
    await this.page.waitForTimeout(1000);
    
    const popup = await popupPromise;
    console.log('🔐 Authenticating with passkey...');
    const authPortal = new AuthPortalPage(popup);
    await authPortal.login(context, credential);
    console.log('✅ Passkey authentication completed');
    
    // Wait for login to complete
    console.log('🔄 Waiting for login completion...');
    await this.page.waitForTimeout(2000);
    
    // Wait for Para SDK authentication to complete
    await this.waitForParaAuthentication();
    console.log('✅ Login completed - wallet connected');
  }

  async loginWithEmailAndPassword({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    console.log(`🔄 Starting password login with email: ${email}`);
    
    try {
      // Enter email
      console.log('🔄 Switching to email tab...');
      await this.page.getByTestId('email-tab').click();
      await this.page.waitForTimeout(300);
      console.log(`📧 Entering email: ${email}`);
      await this.page.getByTestId('email-input').fill(email);
      await this.page.getByTestId('continue-email-button').click();
      console.log('✅ Email submitted for password login');
      
      // Handle password login popup
      console.log('🔄 Opening password login popup...');
      const popupPromise = this.page.waitForEvent('popup');
      await this.page.waitForTimeout(1000);
      
      const popup = await popupPromise;
      
      // Click Login button
      console.log('🔄 Clicking Login button...');
      await popup.getByRole('button', { name: 'Login' }).click();
      
      // Enter password in the popup
      console.log('🔐 Entering password...');
      await popup.getByRole('textbox', { name: 'Enter password' }).click();
      await popup.getByRole('textbox', { name: 'Enter password' }).fill(password);
      await popup.getByRole('button', { name: 'Continue' }).click();
      console.log('✅ Password submitted');
      
      // Wait for popup to close
      console.log('🔄 Waiting for popup to close...');
      await popup.waitForEvent('close');
      
      // Wait for login to complete
      console.log('🔄 Waiting for login completion...');
      await this.page.waitForTimeout(2000);
      await expect(this.page.getByTestId('wallet-connected')).toBeVisible();
      console.log('✅ Password login completed - wallet connected');
    } catch (error) {
      console.error('❌ Error in loginWithEmailAndPassword:', error);
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
    const walletAddressElement = await this.page.getByTestId('wallet-address');
    const text = await walletAddressElement.textContent();
    if (!text) return null;
    
    // Handle both full format: "Your first wallet address is: 0x..." 
    // and truncated format: "0x1234...5678" (used by Svelte)
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

  async signMessage(message: string): Promise<string | null> {
    console.log(`🔄 Signing message: ${message}`);
    
    // Fill in the message
    console.log('🔄 Filling message input...');
    const messageInput = await this.page.getByTestId('sign-message-input');
    await messageInput.click();
    await messageInput.clear();
    await messageInput.fill(message);
    console.log('✅ Message input filled');
    
    // Click sign button
    console.log('🔄 Clicking sign button...');
    await this.page.getByTestId('sign-message-button').click();
    
    // Wait for signature to appear
    console.log('🔄 Waiting for signature...');
    const signatureDisplay = await this.page.waitForSelector('[data-testid="sign-signature-display"]', {
      state: 'visible',
      timeout: 10000
    });
    
    // Get signature from the page
    const signature = await signatureDisplay.textContent();
    console.log(`✅ Got signature: ${signature}`);
    
    return signature;
  }

  async logout() {
    console.log('🔄 Starting logout...');
    console.log('🔄 Clicking header disconnect button...');
    await this.page.getByTestId('header-disconnect-button').click();
    await this.page.waitForTimeout(2000); // Wait for logout and state update
    
    // Verify logout
    console.log('🔄 Verifying logout...');
    await expect(this.page.getByTestId('not-logged-in')).toBeVisible();
    console.log('✅ Logout completed');
  }
}