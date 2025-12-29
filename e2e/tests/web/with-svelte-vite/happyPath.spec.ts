import { test, expect } from '@playwright/test';

import { CustomAuthExamplePage } from '../../../pages/customAuthExample';
import * as webauthn from '../../../helpers/webAuthn';
import { logger } from '../../../helpers/logger';

test.describe('Svelte custom auth example', () => {
  test('happy path - email authentication flow', async ({ browser }) => {
    logger.logInfo('Starting Svelte E2E test - Email authentication flow');
    
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
    
    const createAuthPage = new CustomAuthExamplePage(createPage);
    await createAuthPage.visit();
    
    // Verify initial state
    await expect(createPage.getByTestId('not-logged-in')).toBeVisible();
    
    // Open auth modal and create user
    await createAuthPage.openAuthModal();
    const { email, credential } = await createAuthPage.createUserWithEmail({ context: createContext });
    
    // Verify logged in state
    await expect(createPage.getByTestId('wallet-connected')).toBeVisible();
    const createAddress = await createAuthPage.getWalletAddress();
    expect(createAddress).toBeTruthy();
    expect(createAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);
    
    // Test message signing
    logger.logStep('Testing message signing...');
    const testMessage = 'Hello Para from Svelte!';
    const signature = await createAuthPage.signMessage(testMessage);
    expect(signature).toBeTruthy();
    expect(signature).toMatch(/^0x[a-fA-F0-9]+$/);
    
    // Test logout
    logger.logStep('Testing logout...');
    await createAuthPage.logout();
    await expect(createPage.getByTestId('not-logged-in')).toBeVisible();
    
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
    
    const loginAuthPage = new CustomAuthExamplePage(loginPage);
    await loginAuthPage.visit();
    
    // Verify fresh initial state
    await expect(loginPage.getByTestId('not-logged-in')).toBeVisible();
    
    // Test login with the same user credentials
    logger.logStep('Testing login with existing account in fresh context...');
    await loginAuthPage.openAuthModal();
    await loginAuthPage.loginWithEmail({ context: loginContext, credential, email });
    
    // Verify same address after login in fresh context
    const loginAddress = await loginAuthPage.getWalletAddress();
    expect(loginAddress).toBe(createAddress);
    
    logger.logStep('Svelte E2E test completed successfully', true);
    
    // Cleanup: ensure login context is properly closed
    await loginContext.close();
  });
});