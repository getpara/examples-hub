import { test, expect } from '@playwright/test';

import { WebExamplePage } from '../pages/webExample';

test.describe('web sandbox', () => {
  test('happy path', async ({ browser }) => {
    const context = await browser.newContext({
      permissions: ['clipboard-read'], // grant clipboard read permissions
    });
    const page = await context.newPage();
    const webExamplePage = new WebExamplePage(page);
    await webExamplePage.visit();

    const { email, credential } = await webExamplePage.createUser(context);

    await webExamplePage.switchToWagmiView();
    const { address, recoveredAddress } = await webExamplePage.signWagmiMessage();
    expect(recoveredAddress).toBe(address);

    await webExamplePage.switchToDefaultView();
    await webExamplePage.logout();

    await webExamplePage.login(context, credential, email);

    await webExamplePage.switchToWagmiView(true);
    const { address: address2, recoveredAddress: recoveredAddress2 } = await webExamplePage.signWagmiMessage();
    expect(recoveredAddress2).toBe(address2);
  });
});
