import { test, expect } from '@playwright/test';

import { ParaModalExamplePage } from '../../../../pages/paraModalExample';
import * as webauthn from '../../../../helpers/webAuthn';

const OPEN_MODAL_TEXT = 'Connect with Para';
const PASSWORD = 'abc123@-$}"';

test.describe('Para Modal - Email + Password Authentication', () => {
  test('happy path - create and login with email and password', async ({ browser }) => {
    console.log('🚀 Starting React Next.js Para Modal E2E test - Email + Password');
    const context = await browser.newContext({
      permissions: ['clipboard-write', 'clipboard-read'], // grant clipboard read/write permissions
    });
    const page = await context.newPage();
    await webauthn.setIsUserVerifyingPlatformAuthenticatorAvailable(page);
    const paraModalExamplePage = new ParaModalExamplePage(page);
    await paraModalExamplePage.visit();

    const { emailOrPhone, credential, clipboardText } = await paraModalExamplePage.createUser({
      context,
      openModalText: OPEN_MODAL_TEXT,
      isRecoverySecretEnabled: true,
      password: PASSWORD, // Password authentication
      usePhoneNumber: false, // Use email
    });

    // Verify wallet is connected by checking for the address display
    await expect(paraModalExamplePage.page.getByTestId('account-address-display')).toBeVisible();
    expect(clipboardText).toHaveLength(64);
    expect(/^[0-9a-f]+$/.test(clipboardText)).toBeTruthy();

    // Get the connected wallet address (displayed in truncated format)
    const addressElement = await paraModalExamplePage.page.getByTestId('account-address-display');
    const createAddressText = await addressElement.textContent();

    await paraModalExamplePage.logout({ openModalText: OPEN_MODAL_TEXT });
    await paraModalExamplePage.login({ 
      context, 
      credential, 
      emailOrPhone, 
      openModalText: OPEN_MODAL_TEXT,
      password: PASSWORD // Password login
    });

    // Verify same address after login
    const loginAddressElement = await paraModalExamplePage.page.getByTestId('account-address-display');
    const loginAddressText = await loginAddressElement.textContent();
    expect(loginAddressText).toBe(createAddressText);

    // Test message signing
    console.log('🔄 Testing message signing...');
    const testMessage = 'Hello Para E2E Test with Email + Password!';
    const signature = await paraModalExamplePage.signMessage(testMessage);
    
    // Verify signature
    expect(signature).toBeTruthy();
    expect(signature.length).toBeGreaterThan(0);
    expect(signature).toMatch(/^[a-fA-F0-9]+$/); // Should be a hex string (may or may not have 0x prefix)
    
    console.log('✅ React Next.js Para Modal E2E test completed successfully');
  });
});