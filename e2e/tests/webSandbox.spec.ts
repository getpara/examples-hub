import { test, expect } from '@playwright/test';

import { WebExamplePage } from '../pages/webExample';

import * as webauthn from '../helpers/webAuthn';
import { AuthPortalPage } from '../pages/authPortal';

test.describe('web sandbox', () => {
  test('happy path', async ({ browser }) => {
    const context = await browser.newContext({
      permissions: ['clipboard-read'], // grant clipboard read permissions
    });
    const page = await context.newPage();
    await webauthn.setIsUserVerifyingPlatformAuthenticatorAvailable(page);
    const webExamplePage = new WebExamplePage(page);
    await webExamplePage.visit();
    await page.waitForTimeout(1000);
    await page
      .locator('div:nth-child(3) > .chakra-select__wrapper > .chakra-select')
      .selectOption('dfb222ff8b602eb492974a6ed68c35b2');
    await page.waitForTimeout(1000);
    await page.reload();

    const { emailOrPhone, credential } = await webExamplePage.createUser({ context, is2FAEnabled: true });

    await webExamplePage.switchToWagmiView();
    const { address, recoveredAddress } = await webExamplePage.signWagmiMessage();
    expect(recoveredAddress).toBe(address);

    await webExamplePage.switchToDefaultView();
    await webExamplePage.logout({});

    await webExamplePage.login({ context, credential, emailOrPhone, is2FAEnabled: true });

    await webExamplePage.switchToWagmiView();
    const { address: address2, recoveredAddress: recoveredAddress2 } = await webExamplePage.signWagmiMessage();
    expect(recoveredAddress2).toBe(address2);
  });

  test('recovery secret', async ({ browser }) => {
    const context = await browser.newContext({
      permissions: ['clipboard-read', 'clipboard-write'], // grant clipboard read/write permissions
    });
    const page = await context.newPage();
    await webauthn.setIsUserVerifyingPlatformAuthenticatorAvailable(page);
    const webExamplePage = new WebExamplePage(page);
    await webExamplePage.visit();
    await page.waitForTimeout(1000);
    await page
      .locator('div:nth-child(3) > .chakra-select__wrapper > .chakra-select')
      .selectOption('dfb222ff8b602eb492974a6ed68c35b2');
    await webExamplePage.enableRecoverySecret();
    await page.waitForTimeout(1000);
    await page.reload();

    const { emailOrPhone, clipboardText } = await webExamplePage.createUser({
      password: 'abc123$&**==',
      context,
      is2FAEnabled: true,
      isRecoverySecretEnabled: true,
    });

    await webExamplePage.switchToWagmiView();
    const { address, recoveredAddress } = await webExamplePage.signWagmiMessage();
    expect(recoveredAddress).toBe(address);

    await webExamplePage.switchToDefaultView();
    await webExamplePage.logout({});

    const authPortalPage = new AuthPortalPage(page);
    await authPortalPage.visit();
    const credential = await authPortalPage.recoverAccount({
      context,
      email: emailOrPhone,
      recoverySecret: clipboardText,
    });

    await webExamplePage.visit();
    await page.waitForTimeout(1000);
    await webExamplePage.login({ context, credential, emailOrPhone, is2FAEnabled: true });

    await webExamplePage.switchToWagmiView();
    const { address: address2, recoveredAddress: recoveredAddress2 } = await webExamplePage.signWagmiMessage();
    expect(recoveredAddress2).toBe(address2);
    expect(recoveredAddress2).toBe(address);
  });
});
