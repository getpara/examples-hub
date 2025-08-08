import { test, expect } from '@playwright/test';

import { ParaModalExamplePage } from '../../../pages/paraModalExample';
import * as webauthn from '../../../helpers/webAuthn';
import { logger } from '../../../helpers/logger';

const ADDRESS_IDENTIFIER = 'Address';
const PASSWORD = 'abc123@-$}"';

test.describe('Para Modal - Email + Password Authentication', () => {
  test('happy path - create and login with email and password', async ({ browser }) => {
    
    // ===== PHASE 1: User Creation with Fresh Context =====
    logger.logInfo('Starting React Vite Para Modal E2E test - Email + Password');
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
      isRecoverySecretEnabled: true,
      password: PASSWORD,
      usePhoneNumber: false, // Use email
    });

    // Verify wallet is connected by checking for the address display (with extended timeout)
    await expect(createParaModalPage.page.getByTestId('account-address-display')).toBeVisible({ timeout: 15000 });
    expect(clipboardText).toHaveLength(64);
    expect(/^[0-9a-f]+$/.test(clipboardText)).toBeTruthy();

    // Get the connected wallet address (displayed in truncated format)
    const addressElement = await createParaModalPage.page.getByTestId('account-address-display');
    const createAddressText = await addressElement.textContent();

    // Test message signing in creation context
    logger.logStep('Testing message signing in creation context...');
    const testMessage = 'Hello Para E2E Test with Email + Password!';
    const signature = await createParaModalPage.signMessage(testMessage);
    expect(signature).toBeTruthy();
    expect(signature.length).toBeGreaterThan(0);
    expect(signature).toMatch(/^[a-fA-F0-9]+$/);

    // Logout in creation context
    await createParaModalPage.logout();

    // Close the creation context completely
    logger.logStep('Closing creation context and clearing all state...');
    await createContext.close();

    // Add a pause between user creation and login to ensure complete state cleanup
    logger.logWait('Waiting 3 seconds between user creation and login phases...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // ===== PHASE 2: Login with Completely Fresh Context =====
    logger.logStep('Creating fresh context for login test...');
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

    // Login with fresh context
    await loginParaModalPage.login({
      context: loginContext,
      credential,
      emailOrPhone,
      password: PASSWORD,
    });

    // Verify same address after login
    const loginAddressElement = await loginParaModalPage.page.getByTestId('account-address-display');
    const loginAddressText = await loginAddressElement.textContent();
    expect(loginAddressText).toBe(createAddressText);

    // Test message signing in login context
    logger.logStep('Testing message signing in login context...');
    const loginSignature = await loginParaModalPage.signMessage(testMessage);
    expect(loginSignature).toBeTruthy();
    expect(loginSignature.length).toBeGreaterThan(0);
    expect(loginSignature).toMatch(/^[a-fA-F0-9]+$/);
    
    logger.logStep('React Vite Para Modal E2E test completed successfully', true);
    
    // Clean up
    await loginContext.close();
  });
});
