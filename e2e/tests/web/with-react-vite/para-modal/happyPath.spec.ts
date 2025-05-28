import { test, expect } from '@playwright/test';

import { WebExamplePage } from '../../../../pages/webExample';
import * as webauthn from '../../../../helpers/webAuthn';

const OPEN_MODAL_TEXT = 'Open Para Modal';
const ADDRESS_IDENTIFIER = 'Your first wallet address is: ';
const PASSWORD = 'abc123@-$}"';

test.describe('para modal', () => {
  test('happy path', async ({ browser }) => {
    const context = await browser.newContext({
      permissions: ['clipboard-write', 'clipboard-read'], // grant clipboard read/write permissions
    });
    const page = await context.newPage();
    await webauthn.setIsUserVerifyingPlatformAuthenticatorAvailable(page);
    const webExamplePage = new WebExamplePage(page);
    await webExamplePage.visit();

    const { emailOrPhone, credential, clipboardText } = await webExamplePage.createUser({
      context,
      openModalText: OPEN_MODAL_TEXT,
      isRecoverySecretEnabled: true,
      password: PASSWORD,
      usePhoneNumber: true,
    });

    expect(await webExamplePage.page.getByText('You are logged in!').textContent()).toBeTruthy();
    expect(clipboardText).toHaveLength(64);
    expect(/^[0-9a-f]+$/.test(clipboardText)).toBeTruthy();

    const createAddress = (await webExamplePage.page.getByText(ADDRESS_IDENTIFIER).textContent())
      ?.split(ADDRESS_IDENTIFIER)[1]
      .trim();

    await webExamplePage.logout({ openModalText: OPEN_MODAL_TEXT });
    await webExamplePage.login({
      context,
      credential,
      emailOrPhone,
      openModalText: OPEN_MODAL_TEXT,
      password: PASSWORD,
    });

    const loginAddress = (await webExamplePage.page.getByText(ADDRESS_IDENTIFIER).textContent())
      ?.split(ADDRESS_IDENTIFIER)[1]
      .trim();
    expect(loginAddress).toBe(createAddress);
  });
});
