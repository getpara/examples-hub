import { test, expect } from '@playwright/test';

import { CustomAuthExamplePage } from '../../../pages/customAuthExample';
import * as webauthn from '../../../helpers/webAuthn';

test.describe('Vue custom auth example', () => {
  test('happy path - email authentication flow', async ({ browser }) => {
    const context = await browser.newContext({
      permissions: ['clipboard-write', 'clipboard-read'],
    });
    const page = await context.newPage();
    await webauthn.setIsUserVerifyingPlatformAuthenticatorAvailable(page);
    
    const customAuthPage = new CustomAuthExamplePage(page);
    await customAuthPage.visit();
    
    // Verify initial state
    await expect(page.getByTestId('not-logged-in')).toBeVisible();
    
    // Open auth modal and create user
    await customAuthPage.openAuthModal();
    const { email, credential } = await customAuthPage.createUserWithEmail({ context });
    
    // Verify logged in state
    await expect(page.getByTestId('wallet-connected')).toBeVisible();
    const createAddress = await customAuthPage.getWalletAddress();
    expect(createAddress).toBeTruthy();
    expect(createAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);
    
    // Test message signing
    const testMessage = 'Hello Para from Vue!';
    const signature = await customAuthPage.signMessage(testMessage);
    expect(signature).toBeTruthy();
    expect(signature).toMatch(/^[a-fA-F0-9]+$/); // Should be a hex string (may or may not have 0x prefix)
    
    // Test logout
    await customAuthPage.logout();
    await expect(page.getByTestId('not-logged-in')).toBeVisible();
    
    // Test login with existing account
    await page.reload();
    await customAuthPage.openAuthModal();
    await customAuthPage.loginWithEmail({ context, credential, email });
    
    // Verify same address after login
    const loginAddress = await customAuthPage.getWalletAddress();
    expect(loginAddress).toBe(createAddress);
    
    await context.close();
  });
});