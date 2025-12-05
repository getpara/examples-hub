import { test } from '@playwright/test';

import { WebExamplePage } from '../pages/sdkSandbox';
import * as webauthn from '../helpers/webAuthn';

test.describe('web sandbox', () => {
  test('happy path', async ({ browser }) => {
    const context = await browser.newContext({
      permissions: ['clipboard-read'], // grant clipboard read permissions
    });
    const page = await context.newPage();
    await webauthn.setIsUserVerifyingPlatformAuthenticatorAvailable(page);
    const webExamplePage = new WebExamplePage(page);
    await webExamplePage.visit();
    await page.getByTestId('environment-select').selectOption('SANDBOX');
    await page.getByTestId('partner-select').selectOption('sandbox_dfb222ff8b602eb492974a6ed68c35b2');

    const { emailOrPhone, credential } = await webExamplePage.createUser({ context, is2FAEnabled: true });

    await webExamplePage.switchToWagmiView();
    await webExamplePage.signWagmiMessage();

    // Test private key export for newly created account
    await webExamplePage.switchToDefaultView();
    await webExamplePage.exportPrivateKey({ context, credential });

    // Test switch wallets for newly created account
    await webExamplePage.switchWallets({ context, credential });

    await webExamplePage.page.getByRole('button', { name: 'Log Out' }).last().click();
    await webExamplePage.page.waitForTimeout(2000);

    await webExamplePage.login({ context, credential, emailOrPhone, is2FAEnabled: true });

    await webExamplePage.switchToWagmiView();
    await webExamplePage.signWagmiMessage();

    // Test private key exportxw
    await webExamplePage.switchToDefaultView();
    await webExamplePage.exportPrivateKey({ context, credential });

    // Test switch wallets for returning account (create more new wallets)
    await webExamplePage.switchWallets({ context, credential });
  });
});
