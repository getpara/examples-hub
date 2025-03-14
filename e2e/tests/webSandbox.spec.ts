import { test, expect } from '@playwright/test';

import { WebExamplePage } from '../pages/webExample';
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

    const { email, credential } = await webExamplePage.createUser({ context, is2FAEnabled: true });

    await webExamplePage.switchToWagmiView();
    const { address, recoveredAddress } = await webExamplePage.signWagmiMessage();
    expect(recoveredAddress).toBe(address);

    await webExamplePage.switchToDefaultView();
    await webExamplePage.logout({});

    await webExamplePage.login({ context, credential, email, is2FAEnabled: true });

    await webExamplePage.switchToWagmiView();
    const { address: address2, recoveredAddress: recoveredAddress2 } = await webExamplePage.signWagmiMessage();
    expect(recoveredAddress2).toBe(address2);
  });
});
