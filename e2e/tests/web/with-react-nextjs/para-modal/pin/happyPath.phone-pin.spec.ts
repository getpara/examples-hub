import { test, expect } from "@playwright/test";

import { ParaModalExamplePage } from "../../../../../pages/paraModalExample";
import * as webauthn from "../../../../../helpers/webAuthn";

const PIN = "1234";

test.describe("Para Modal - Phone + PIN Authentication", () => {
  test("happy path - create and login with phone and pin", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      permissions: ["clipboard-write", "clipboard-read"], // grant clipboard read/write permissions
    });
    const page = await context.newPage();
    await webauthn.setIsUserVerifyingPlatformAuthenticatorAvailable(page);
    const paraModalExamplePage = new ParaModalExamplePage(page);
    await paraModalExamplePage.visit();

    const { emailOrPhone, credential, clipboardText } =
      await paraModalExamplePage.createUser({
        context,
        isRecoverySecretEnabled: true,
        usePhoneNumber: true, // Use phone number
        pin: PIN,
      });

    // Verify wallet is connected by checking for the address display
    await expect(
      paraModalExamplePage.page.getByTestId("account-address-display")
    ).toBeVisible();
    expect(clipboardText).toHaveLength(64);
    expect(/^[0-9a-f]+$/.test(clipboardText)).toBeTruthy();

    // Get the connected wallet address (displayed in truncated format)
    const addressElement = await paraModalExamplePage.page.getByTestId(
      "account-address-display"
    );
    const createAddressText = await addressElement.textContent();

    // Test message signing before logout to ensure connection is stable
    const testMessage = "Hello Para E2E Test with Phone + PIN!";
    const signature = await paraModalExamplePage.signMessage(testMessage);
    expect(signature).toBeTruthy();
    expect(signature.length).toBeGreaterThan(0);
    expect(signature).toMatch(/^[a-fA-F0-9]+$/);

    await paraModalExamplePage.logout();
    await paraModalExamplePage.login({
      context,
      credential,
      emailOrPhone,
      pin: PIN,
    });

    // Verify same address after login
    const loginAddressElement = await paraModalExamplePage.page.getByTestId(
      "account-address-display"
    );
    const loginAddressText = await loginAddressElement.textContent();
    expect(loginAddressText).toBe(createAddressText);

    // Cleanup: delete test user
    await paraModalExamplePage.cleanupTestUser();

    // Cleanup: ensure context is properly closed
    await context.close();
  });
});
