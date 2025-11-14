import { test, expect } from '@playwright/test';
import { ParaModalExamplePage } from '../pages/para-modal.page';
import { applyNetworkThrottling, getNetworkLevel } from '../helpers/network-throttling';
import { TIMEOUTS } from '../helpers/test-data';
import * as webAuthn from '../helpers/web-authn';

const PASSWORD = 'abc123@-$}"';

test.describe('Para Modal - Email + Password Authentication', () => {
  test('stress iteration: create and login with email and password @stress', async ({ browser }) => {
    const contextOptions = {
      storageState: { cookies: [], origins: [] },
      locale: 'en-US',
      timezoneId: 'America/New_York',
      httpCredentials: undefined,
      extraHTTPHeaders: {},
      permissions: ['clipboard-write', 'clipboard-read'],
    };
    const sharedContext = await browser.newContext(contextOptions);
    const sharedPage = await sharedContext.newPage();
    await webAuthn.setIsUserVerifyingPlatformAuthenticatorAvailable(sharedPage);

    const paraModalPage = new ParaModalExamplePage(sharedPage);
    await paraModalPage.visit();

    // Apply env-driven throttling
    const level = getNetworkLevel(process.env.STRESS_TEST_NETWORK || 'none');
    await applyNetworkThrottling(sharedPage, level);
    test.info().annotations.push({
      type: 'network-throttling',
      description: `Level: ${level} (Profile: ${process.env.STRESS_TEST_NETWORK || 'none'}, Iteration: ${process.env.ITERATION_ID || 'default'})`,
    });

    const { emailOrPhone, credential, clipboardText } = await paraModalPage.createUser({
      context: sharedContext,
      isRecoverySecretEnabled: true,
      password: PASSWORD,
      usePhoneNumber: false,
      networkLevel: level,
    });
    await expect(paraModalPage.page.getByTestId('account-address-display')).toBeVisible({ timeout: TIMEOUTS.LONG });
    expect(clipboardText).toHaveLength(64);
    expect(/^[0-9a-f]+$/.test(clipboardText)).toBeTruthy();
    const addressElement = await paraModalPage.page.getByTestId('account-address-display');
    const createAddressText = await addressElement.textContent();
    const signature = await paraModalPage.signMessage();
    expect(signature).toBeTruthy();
    expect(signature.length).toBeGreaterThan(0);
    expect(signature).toMatch(/^[a-fA-F0-9]+$/);
    await paraModalPage.logout();
    await paraModalPage.login({
      context: sharedContext,
      credential,
      emailOrPhone,
      password: PASSWORD,
      networkLevel: level,
    });
    await expect(paraModalPage.page.getByTestId('account-address-display')).toBeVisible({ timeout: TIMEOUTS.LONG });
    const loginAddressElement = await paraModalPage.page.getByTestId('account-address-display');
    const loginAddressText = await loginAddressElement.textContent();
    expect(loginAddressText).toBe(createAddressText);
    await paraModalPage.logout();

    // Clean up test user before closing context
    await paraModalPage.cleanupTestUser();

    await sharedContext.close();
  });
});
