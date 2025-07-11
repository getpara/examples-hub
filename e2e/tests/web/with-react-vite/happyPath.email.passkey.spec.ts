import { test, expect } from '@playwright/test';

import { ParaModalExamplePage } from '../../../pages/paraModalExample';
import * as webauthn from '../../../helpers/webAuthn';

const OPEN_MODAL_TEXT = 'Connect with Para';

test.describe('Para Modal - Email + Passkey Authentication', () => {
  test('happy path - create and login with email and passkey', async ({ browser }) => {
    
    // ===== PHASE 1: User Creation with Fresh Context =====
    const createContext = await browser.newContext({
      permissions: ['clipboard-write', 'clipboard-read'],
      storageState: { cookies: [], origins: [] },
      locale: 'en-US',
      timezoneId: 'America/New_York',
      httpCredentials: undefined,
      extraHTTPHeaders: {},
    });
    const createPage = await createContext.newPage();
    await webauthn.setIsUserVerifyingPlatformAuthenticatorAvailable(createPage);
    const createParaModalPage = new ParaModalExamplePage(createPage);
    await createParaModalPage.visit();

    const { emailOrPhone, credential, clipboardText } = await createParaModalPage.createUser({
      context: createContext,
      openModalText: OPEN_MODAL_TEXT,
      isRecoverySecretEnabled: true,
      usePhoneNumber: false, // Use email
      // No password parameter = passkey authentication
    });

    // Verify wallet is connected by checking for the address display (with extended timeout)
    await expect(createParaModalPage.page.getByTestId('account-address-display')).toBeVisible({ timeout: 15000 });
    expect(clipboardText).toHaveLength(64);
    expect(/^[0-9a-f]+$/.test(clipboardText)).toBeTruthy();

    // Get the connected wallet address (displayed in truncated format)
    const addressElement = await createParaModalPage.page.getByTestId('account-address-display');
    const createAddressText = await addressElement.textContent();

    // Test message signing in creation context
    console.log('🔄 Testing message signing...');
    const testMessage = 'Hello Para E2E Test with Email + Passkey!';
    const signature = await createParaModalPage.signMessage(testMessage);
    expect(signature).toBeTruthy();
    expect(signature.length).toBeGreaterThan(0);
    expect(signature).toMatch(/^[a-fA-F0-9]+$/);

    // Logout in creation context
    await createParaModalPage.logout({ openModalText: OPEN_MODAL_TEXT });

    // Close the creation context completely
    console.log('🔄 Closing creation context and clearing all state...');
    await createContext.close();

    // ===== PHASE 2: Login with Completely Fresh Context =====
    console.log('🔄 Creating fresh context for login test...');
    const loginContext = await browser.newContext({
      permissions: ['clipboard-write', 'clipboard-read'],
      storageState: { cookies: [], origins: [] },
      locale: 'en-US',
      timezoneId: 'America/New_York',
      httpCredentials: undefined,
      extraHTTPHeaders: {},
    });
    const loginPage = await loginContext.newPage();
    await webauthn.setIsUserVerifyingPlatformAuthenticatorAvailable(loginPage);
    const loginParaModalPage = new ParaModalExamplePage(loginPage);
    await loginParaModalPage.visit();

    // Test login with the same user credentials in fresh context
    console.log('🔄 Testing login with existing account in fresh context...');
    await loginParaModalPage.login({
      context: loginContext,
      credential,
      emailOrPhone,
      openModalText: OPEN_MODAL_TEXT,
      // No password = passkey login
    });

    // Verify same address after login in fresh context (with extended timeout)
    await expect(loginParaModalPage.page.getByTestId('account-address-display')).toBeVisible({ timeout: 15000 });
    const loginAddressElement = await loginParaModalPage.page.getByTestId('account-address-display');
    const loginAddressText = await loginAddressElement.textContent();
    expect(loginAddressText).toBe(createAddressText);

    console.log('✅ React Vite E2E test completed successfully');

    // Cleanup: ensure login context is properly closed
    await loginContext.close();
  });
});