import { test, expect } from "@playwright/test";

import { ParaModalExamplePage } from "../../../../pages/paraModalExample";
import * as webauthn from "../../../../helpers/webAuthn";
import { logger } from "../../../../helpers/logger";

test.describe("Para Modal - Phone + Basic Login Authentication", () => {
  test("happy path - create and login with phone and basic login", async ({
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
        isBasicLogin: true,
      });

    // Verify wallet is connected by checking for the address display
    await expect(
      paraModalExamplePage.page.getByTestId("account-address-display")
    ).toBeVisible();
    expect(clipboardText).toHaveLength(0);

    // Get the connected wallet address (displayed in truncated format)
    const addressElement = await paraModalExamplePage.page.getByTestId(
      "account-address-display"
    );
    const createAddressText = await addressElement.textContent();

    await paraModalExamplePage.logout();
    await paraModalExamplePage.login({
      context,
      credential,
      emailOrPhone,
      isBasicLogin: true,
    });

    // Verify same address after login
    const loginAddressElement = await paraModalExamplePage.page.getByTestId(
      "account-address-display"
    );
    const loginAddressText = await loginAddressElement.textContent();
    expect(loginAddressText).toBe(createAddressText);

    // Test message signing
    const testMessage = "Hello Para E2E Test with Phone + Passkey!";
    const signature = await paraModalExamplePage.signMessage(testMessage);

    // Verify signature
    expect(signature).toBeTruthy();
    expect(signature.length).toBeGreaterThan(0);
    expect(signature).toMatch(/^[a-fA-F0-9]+$/); // Should be a hex string (may or may not have 0x prefix)

    logger.logStep('React Vite E2E test completed successfully', true);

    // Cleanup: delete test user
    await paraModalExamplePage.cleanupTestUser();

    // Cleanup: ensure context is properly closed
    await context.close();
  });
});
