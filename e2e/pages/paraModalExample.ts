import * as crypto from "node:crypto";
import { BrowserContext, Page, FrameLocator, expect, Locator } from "@playwright/test";
import { Protocol } from "playwright-core/types/protocol";

import { AuthPortalPage } from "./authPortal";
import { Logger } from "../helpers/logger";

function getRandomPhoneNumber() {
  // Valid US area codes (sampling of common ones to avoid invalid ranges)
  const validAreaCodes = [
    201, 202, 203, 205, 206, 207, 208, 209, 210, 212, 213, 214, 215, 216, 217, 218, 219, 224, 225, 228, 229, 231, 234,
    239, 240, 248, 251, 252, 253, 254, 256, 260, 262, 267, 269, 270, 276, 281, 301, 302, 303, 304, 305, 307, 308, 309,
    310, 312, 313, 314, 315, 316, 317, 318, 319, 320, 321, 323, 325, 330, 331, 334, 336, 337, 339, 347, 351, 352, 360,
    361, 386, 401, 402, 404, 405, 406, 407, 408, 409, 410, 412, 413, 414, 415, 417, 419, 423, 424, 425, 430, 432, 434,
    435, 440, 443, 458, 469, 470, 475, 478, 479, 480, 484, 501, 502, 503, 504, 505, 507, 508, 509, 510, 512, 513, 515,
    516, 517, 518, 520, 530, 540, 541, 551, 559, 561, 562, 563, 564, 567, 570, 571, 573, 574, 575, 580, 585, 586, 601,
    602, 603, 605, 606, 607, 608, 609, 610, 612, 614, 615, 616, 617, 618, 619, 620, 623, 626, 630, 631, 636, 641, 646,
    650, 651, 660, 661, 662, 667, 678, 682, 701, 702, 703, 704, 706, 707, 708, 712, 713, 714, 715, 716, 717, 718, 719,
    720, 724, 727, 730, 731, 732, 734, 737, 740, 754, 757, 760, 763, 765, 770, 772, 773, 774, 775, 781, 785, 786, 787,
    801, 802, 803, 804, 805, 806, 808, 810, 812, 813, 814, 815, 816, 817, 818, 828, 830, 831, 832, 843, 845, 847, 848,
    850, 856, 857, 858, 859, 860, 862, 863, 864, 865, 870, 872, 878, 901, 903, 904, 906, 907, 908, 909, 910, 912, 913,
    914, 915, 916, 917, 918, 919, 920, 925, 928, 929, 931, 934, 936, 937, 940, 941, 947, 949, 951, 952, 954, 956, 959,
    970, 971, 972, 973, 978, 979, 980, 984, 985, 989,
  ];

  const areaCode = validAreaCodes[crypto.randomInt(0, validAreaCodes.length)];
  const last4 = crypto.randomInt(0, 10000).toString().padStart(4, "0");
  return `${areaCode}555${last4}`;
}

function getRandomEmail() {
  const randomHexString = crypto.randomBytes(5).toString("hex");
  return `teste2e+${randomHexString}@test.usecapsule.com`;
}

export class ParaModalExamplePage {
  page: Page;
  private logger: Logger;

  constructor(page: Page) {
    this.page = page;
    this.logger = new Logger("ParaModalExample");
  }

  /**
   * Helper function to reliably find and return an iframe locator
   * Tries multiple selectors and waits for content to be ready
   */
  private async getParaIframe(): Promise<FrameLocator> {
    // Wait for iframe to appear and be visible - increased timeout for slower loads
    await this.page.waitForSelector("iframe", {
      state: "visible",
      timeout: 20000,
    });

    // Get the iframe locator - content readiness will be validated by subsequent element checks
    const frameLocator = this.page.frameLocator("iframe").first();

    return frameLocator;
  }

  private async getIframePasswordInput(): Promise<FrameLocator> {
    const frameLocator = await this.getParaIframe();

    // Ensure password input is visible in the iframe - check for the wrapper element
    const passwordInputWrapper = frameLocator.locator('cpsl-input[placeholder="Enter password"]');
    await expect(passwordInputWrapper).toBeVisible({ timeout: 15000 });
    this.logger.logInfo("Found password input in iframe");

    return frameLocator;
  }

  private async getIframeOTPInput(): Promise<Locator> {
    const frameLocator = await this.getParaIframe();

    // Wait for OTP code input to be visible
    const iframeOTPInput = frameLocator.locator("cpsl-code-input");
    await expect(iframeOTPInput).toBeVisible({ timeout: 15000 });
    this.logger.logInfo("Found OTP input in iframe");

    return iframeOTPInput;
  }

  /**
   * Helper method to click an optional button (e.g., "Keep Using" buttons)
   * Returns true if button was found and clicked, false otherwise
   */
  private async clickOptionalButton(
    locatorOrPage: Locator | Page | FrameLocator,
    selector: string,
    buttonName: string,
    timeout: number = 10000
  ): Promise<boolean> {
    const button = locatorOrPage.locator(selector);
    try {
      // Try to click the button with a timeout - this will wait for it to be visible and clickable
      await button.click({ timeout });
      this.logger.logInfo(`Found '${buttonName}' button, clicked`);
      return true;
    } catch (error) {
      this.logger.logInfo(`'${buttonName}' button not found, proceeding`);
      return false;
    }
  }

  async visit() {
    await this.page.goto("/");
    // Wait for page to be fully loaded and interactive
    await this.page.waitForLoadState("networkidle");
    // Wait for the main UI to be ready
    await expect(this.page.getByTestId("header-connect-button")).toBeVisible({
      timeout: 10000,
    });
  }

  /**
   * Ensures the UI is stable and ready before opening the Para modal
   * This helps prevent issues where the modal backdrop appears but the modal itself fails to open
   */
  async waitForUIStability() {
    this.logger.logStep("Waiting for UI stability before modal interaction...");

    // Check which button is present (connected or disconnected state)
    const accountButton = this.page.getByTestId("account-address-display");
    const connectButton = this.page.getByTestId("header-connect-button");

    // Wait for either button to be visible
    let modalButton;
    if (await accountButton.isVisible({ timeout: 2000 })) {
      modalButton = accountButton;
      this.logger.logInfo("Found account button (connected state)");
    } else {
      await expect(connectButton).toBeVisible({ timeout: 10000 });
      modalButton = connectButton;
      this.logger.logInfo("Found connect button (disconnected state)");
    }

    // Brief wait to ensure animations complete (necessary for reliable modal opening)
    await this.page.waitForTimeout(1000);

    // Verify button is still visible and clickable
    await expect(modalButton).toBeVisible();
    await expect(modalButton).toBeEnabled();

    this.logger.logStep("UI is stable and ready for modal interaction", true);
  }

  async createUser({
    context,
    is2FAEnabled,
    isRecoverySecretEnabled,
    password,
    usePhoneNumber = false,
    isBasicLogin,
    pin,
  }: {
    context: BrowserContext;
    is2FAEnabled?: boolean;
    isRecoverySecretEnabled?: boolean;
    password?: string;
    usePhoneNumber?: boolean;
    isBasicLogin?: boolean;
    pin?: string;
  }) {
    // Ensure UI is stable before opening modal
    await this.waitForUIStability();

    // Click whichever button is present to open modal
    const accountButton = this.page.getByTestId("account-address-display");
    const connectButton = this.page.getByTestId("header-connect-button");

    const accountVisible = await accountButton.isVisible().catch(() => false);
    if (accountVisible) {
      await accountButton.click();
    } else {
      await connectButton.click();
    }

    // Wait for auth input to be visible using data-testid
    const authInputWrapper = this.page.getByTestId("auth-input");
    await expect(authInputWrapper).toBeVisible({ timeout: 5000 });

    const emailOrPhone = usePhoneNumber ? getRandomPhoneNumber() : getRandomEmail();

    this.logger.logInfo(`Creating user with ${usePhoneNumber ? "phone" : "email"}: ${emailOrPhone}`);

    // Fill the auth input - target the native input inside the shadow DOM
    // The input starts with placeholder "Enter email or phone" and changes dynamically
    // For phone numbers, it will change to "Enter phone" after detecting numeric input
    const authInput = authInputWrapper.locator("input.native-input").first();
    console.log("🚀 ~ ParaModalExamplePage ~ createUser ~ authInput:", authInput);

    await expect(authInput).toBeVisible({ timeout: 10000 });
    await authInput.click();

    if (usePhoneNumber) {
      // For phone numbers, type slowly to allow the UI to detect it's a phone number
      // and switch to phone mode with the country dropdown
      await authInput.pressSequentially(emailOrPhone, { delay: 100 });
    } else {
      await authInput.fill(emailOrPhone);
    }

    await expect(authInputWrapper).toHaveAttribute("value", emailOrPhone);
    console.log("🚀 ~ ParaModalExamplePage ~ createUser ~ authInputWrapper:", authInputWrapper);

    // Press Enter to continue (or click the continue arrow button)
    // The button is: cpsl-button[slot="end"] > shadow root > button.button-native
    // Pressing Enter is more reliable for this flow
    await authInput.press("Enter");

    let credentials: Protocol.WebAuthn.Credential[] = [];
    if (isBasicLogin) {
      // Use helper function to get iframe OTP input
      const iframeOTPInputLocator = await this.getIframeOTPInput();

      // The OTP inputs are already native inputs with IDs in the shadow DOM
      // Wait for first OTP input to be ready
      const firstCodeInput = iframeOTPInputLocator.locator("#code-input-0");
      await expect(firstCodeInput).toBeVisible({ timeout: 5000 });

      for (let i = 0; i < 6; i++) {
        const otpInput = iframeOTPInputLocator.locator(`#code-input-${i}`);
        await expect(otpInput).toBeVisible({ timeout: 5000 });
        await otpInput.click();
        await otpInput.fill((i + 1).toString());
      }
    } else {
      // Wait for OTP code input to be visible
      const codeInputWrapper = this.page.locator("cpsl-code-input");
      await expect(codeInputWrapper).toBeVisible({ timeout: 5000 });

      // The OTP inputs are already native inputs with IDs in the shadow DOM
      // Wait for first OTP input to be ready
      const firstCodeInput = codeInputWrapper.locator("#code-input-0");
      await expect(firstCodeInput).toBeVisible({ timeout: 5000 });

      for (let i = 0; i < 6; i++) {
        const otpInput = codeInputWrapper.locator(`#code-input-${i}`);
        await expect(otpInput).toBeVisible({ timeout: 5000 });
        await otpInput.click();
        await otpInput.fill((i + 1).toString());
      }

      if (pin) {
        // Use helper function to get iframe
        const iframeLocator = await this.getParaIframe();

        // Use helper function to get iframe OTP input
        const firstPINInputLocator = await this.getIframeOTPInput();

        // Get first PIN input
        const firstCodeInput = firstPINInputLocator.locator("#code-input-0");
        await expect(firstCodeInput).toBeVisible({ timeout: 5000 });

        for (let i = 0; i < 4; i++) {
          const otpInput = firstPINInputLocator.locator(`#code-input-${i}`);
          await expect(otpInput).toBeVisible({ timeout: 5000 });
          await otpInput.click();
          await otpInput.fill(pin[i].toString());
        }

        // Click Continue button - target native button in shadow DOM
        const continueButton = iframeLocator.locator('cpsl-button:has-text("Continue") button.button-native');
        await expect(continueButton).toBeVisible({ timeout: 10000 });
        await continueButton.click();

        // Use helper function to get iframe OTP input
        const secondPINInputLocator = await this.getIframeOTPInput();

        // Get second PIN input
        const secondCodeInput = secondPINInputLocator.locator("#code-input-1");
        await expect(secondCodeInput).toBeVisible({ timeout: 5000 });

        for (let i = 0; i < 4; i++) {
          const otpInput = secondPINInputLocator.locator(`#code-input-${i}`);
          await expect(otpInput).toBeVisible({ timeout: 5000 });
          await otpInput.click();
          await otpInput.fill(pin[i].toString());
        }

        // Click Set PIN button - target native button in shadow DOM
        const setPINButton = iframeLocator.locator('cpsl-button:has-text("Set PIN") button.button-native');
        await expect(setPINButton).toBeVisible({ timeout: 10000 });
        await setPINButton.click();
      } else if (password) {
        // Click the "Choose Password" button - target native button in shadow DOM
        const choosePasswordButton = this.page.locator('cpsl-button:has-text("Choose Password") button.button-native');
        await expect(choosePasswordButton).toBeVisible({ timeout: 10000 });
        await choosePasswordButton.click();

        // Use helper function to get iframe password input
        const iframeLocator = await this.getIframePasswordInput();

        // Enter password in iframe - target native inputs in shadow DOM
        const passwordInputWrapper = iframeLocator.locator('cpsl-input[placeholder="Enter password"]');
        const passwordInput = passwordInputWrapper.locator("input.native-input");
        await expect(passwordInput).toBeVisible({ timeout: 10000 });
        await passwordInput.click();
        await passwordInput.fill(password);

        const confirmPasswordInputWrapper = iframeLocator.locator('cpsl-input[placeholder="Confirm password"]');
        const confirmPasswordInput = confirmPasswordInputWrapper.locator("input.native-input");
        await expect(confirmPasswordInput).toBeVisible({ timeout: 10000 });
        await confirmPasswordInput.click();
        await confirmPasswordInput.fill(password);

        // Click Save Password button - target native button in shadow DOM
        const savePasswordButton = iframeLocator.locator('cpsl-button:has-text("Save Password") button.button-native');
        await expect(savePasswordButton).toBeVisible({ timeout: 10000 });
        await savePasswordButton.click();
      } else {
        const page1Promise = this.page.waitForEvent("popup");
        // Click the "Create Passkey" button - target native button in shadow DOM
        const createPasskeyButton = this.page.locator('cpsl-button:has-text("Create Passkey") button.button-native');
        await expect(createPasskeyButton).toBeVisible({ timeout: 10000 });
        await createPasskeyButton.click();

        const page1 = await page1Promise;
        const authPortal = new AuthPortalPage(page1);
        credentials = await authPortal.setup(context);
      }
    }

    let clipboardText = "";
    if (!isBasicLogin && isRecoverySecretEnabled) {
      // Look for the copy tile button - auto-wait for visibility
      const copyTileButton = this.page.locator('cpsl-tile-button[icon="copy"]:has(cpsl-text:has-text("Copy"))');
      await expect(copyTileButton).toBeVisible({ timeout: 10000 });
      await copyTileButton.click({ timeout: 10000 });

      // Read clipboard contents
      clipboardText = await this.page.evaluate("navigator.clipboard.readText()");

      // Click "I've saved my recovery secret" button - auto-wait with click timeout
      const savedSecretButton = this.page
        .locator("cpsl-button")
        .filter({ hasText: /saved.*recovery|recovery.*saved/i })
        .locator("button.button-native");
      await expect(savedSecretButton).toBeVisible({ timeout: 10000 });
      await savedSecretButton.click({ timeout: 10000 });
    }

    if (is2FAEnabled) {
      const continueButton = this.page.locator('cpsl-button:has-text("Continue") button.button-native');
      await expect(continueButton).toBeVisible({ timeout: 10000 });
      await continueButton.click();
      const skipButton = this.page.locator('cpsl-button:has-text("Skip") button.button-native');
      await expect(skipButton).toBeVisible({ timeout: 10000 });
      await skipButton.click();
    } else {
      // Click the Done button - auto-wait for visibility
      const doneButton = this.page.locator('cpsl-button:has-text("Done") button.button-native');
      await expect(doneButton).toBeVisible({ timeout: 10000 });
      await doneButton.click({ timeout: 10000 });
    }

    // Wait for modal to close and app state to update
    this.logger.logStep("Waiting for Para Modal to close and connection state to update...");

    // Wait for the account address display to appear (indicates successful connection)
    await expect(this.page.getByTestId("account-address-display")).toBeVisible({
      timeout: 15000,
    });
    this.logger.logStep("Para Modal connection confirmed - account address display visible", true);

    return {
      emailOrPhone,
      credential: credentials[0],
      clipboardText,
    };
  }

  async login({
    context,
    credential,
    emailOrPhone,
    is2FAEnabled,
    password,
    isBasicLogin,
    pin,
  }: {
    context: BrowserContext;
    credential: Protocol.WebAuthn.Credential;
    emailOrPhone: string;
    is2FAEnabled?: boolean;
    password?: string;
    isBasicLogin?: boolean;
    pin?: string;
  }) {
    this.logger.logInfo("Starting login flow...");

    // With fresh context, we start in disconnected state
    // Ensure UI is stable before opening modal
    await this.waitForUIStability();

    // Click the connect button (will always be disconnected with fresh context)
    this.logger.logInfo("Looking for connect button");
    const connectButton = this.page.getByTestId("header-connect-button");
    await expect(connectButton).toBeVisible({ timeout: 10000 });
    await connectButton.click();
    this.logger.logInfo("Modal opened");

    // Wait for auth input to be visible using data-testid
    const authInputWrapper = this.page.getByTestId("auth-input");
    await expect(authInputWrapper).toBeVisible({ timeout: 5000 });
    this.logger.logInfo("Found auth input");

    // Fill the auth input - target the native input inside the shadow DOM
    // Use .first() to avoid conflicts with country search input when using phone
    const authInput = authInputWrapper.locator("input.native-input").first();
    await expect(authInput).toBeVisible({ timeout: 10000 });
    await authInput.click();
    await authInput.fill(emailOrPhone);
    await expect(authInputWrapper).toHaveAttribute("value", emailOrPhone);
    this.logger.logInfo(`Entered email/phone: ${emailOrPhone}`);

    // Press Enter to continue (or click the continue arrow button)
    // The button is: cpsl-button[slot="end"] > shadow root > button.button-native
    // Pressing Enter is more reliable for this flow
    await authInput.press("Enter");
    this.logger.logInfo("Pressed Enter to proceed");

    if (isBasicLogin) {
      // Use helper function to get iframe OTP input
      const iframeOTPInputLocator = await this.getIframeOTPInput();

      // The OTP inputs are already native inputs with IDs in the shadow DOM
      // Wait for first OTP input to be ready
      const firstCodeInput = iframeOTPInputLocator.locator("#code-input-0");
      await expect(firstCodeInput).toBeVisible({ timeout: 5000 });

      for (let i = 0; i < 6; i++) {
        const otpInput = iframeOTPInputLocator.locator(`#code-input-${i}`);
        await expect(otpInput).toBeVisible({ timeout: 5000 });
        await otpInput.click();
        await otpInput.fill((i + 1).toString());
      }
    } else if (pin) {
      this.logger.logInfo("PIN login flow - looking for verification code input in iframe...");

      try {
        // Use helper function to get iframe
        const iframeLocator = await this.getParaIframe();

        // Use helper function to get iframe OTP input
        const iframeVerificationInputLocator = await this.getIframeOTPInput();

        // The OTP inputs are already native inputs with IDs in the shadow DOM
        // Wait for first OTP input to be ready
        const verificationCodeInput = iframeVerificationInputLocator.locator("#code-input-0");
        await expect(verificationCodeInput).toBeVisible({ timeout: 5000 });

        for (let i = 0; i < 6; i++) {
          const otpInput = iframeVerificationInputLocator.locator(`#code-input-${i}`);
          await expect(otpInput).toBeVisible({ timeout: 5000 });
          await otpInput.click();
          await otpInput.fill((i + 1).toString());
        }

        // Now the Login button should be visible - target native button in shadow DOM
        const loginButton = iframeLocator.locator('cpsl-button:has-text("Login") button.button-native');
        await expect(loginButton).toBeVisible({ timeout: 3000 });

        // Use helper function to get iframe OTP input
        const iframePINInputLocator = await this.getIframeOTPInput();

        // Get first PIN input
        const pinInput = iframePINInputLocator.locator("#code-input-0");
        await expect(pinInput).toBeVisible({ timeout: 5000 });

        for (let i = 0; i < 4; i++) {
          const otpInput = iframePINInputLocator.locator(`#code-input-${i}`);
          await expect(otpInput).toBeVisible({ timeout: 5000 });
          await otpInput.click();
          await otpInput.fill(pin[i].toString());
        }

        // Now the Login button should be enabled - target native button in shadow DOM
        await expect(loginButton).toBeEnabled({ timeout: 5000 });
        this.logger.logInfo("Found Login button in iframe, clicking...");

        // Click login button
        await loginButton.click();
        this.logger.logInfo("Clicked Login button");

        // Check for optional "Keep Using PIN" button
        this.logger.logInfo("Checking for 'Keep Using PIN' button in iframe after login...");
        await this.clickOptionalButton(
          iframeLocator,
          'cpsl-button:has-text("Keep Using") button.button-native',
          "Keep Using PIN"
        );

        this.logger.logInfo("PIN login completed");
      } catch (error) {
        this.logger.logError("Error in PIN login flow:", error);
        throw error;
      }
    } else if (password) {
      this.logger.logInfo("Password login flow - looking for password input in iframe...");
      try {
        // Use helper function to get iframe
        const iframeLocator = await this.getParaIframe();

        // Enter password in iframe - target native input in shadow DOM
        const passwordInputWrapper = iframeLocator.locator('cpsl-input[placeholder="Enter password"]');
        const passwordInput = passwordInputWrapper.locator("input.native-input");
        this.logger.logInfo("Found password input in iframe");
        await expect(passwordInput).toBeVisible({ timeout: 10000 });
        await passwordInput.click();
        await passwordInput.fill(password);
        this.logger.logInfo("Entered password");

        // Now the Login button should be visible and enabled - target native button in shadow DOM
        const loginButton = iframeLocator.locator('cpsl-button:has-text("Login") button.button-native');
        await expect(loginButton).toBeVisible({ timeout: 10000 });
        await expect(loginButton).toBeEnabled({ timeout: 5000 });
        this.logger.logInfo("Found Login button in iframe, clicking...");

        // Click login button - no popup needed for password login with iframe
        await loginButton.click();
        this.logger.logInfo("Clicked Login button");

        // Check for optional "Keep Using Password" button
        this.logger.logInfo("Checking for 'Keep Using Password' button in iframe after login...");
        await this.clickOptionalButton(
          iframeLocator,
          'cpsl-button:has-text("Keep Using") button.button-native',
          "Keep Using Password"
        );

        this.logger.logInfo("Password login completed");
      } catch (error) {
        this.logger.logError("Error in password login flow:", error);
        throw error;
      }
    } else {
      this.logger.logInfo("Passkey login flow");
      const page2Promise = this.page.waitForEvent("popup");
      const passkeyLink = this.page.getByText("Login with passkey");
      await expect(passkeyLink).toBeVisible({ timeout: 10000 });
      await passkeyLink.click();
      const page2 = await page2Promise;

      const authPortal = new AuthPortalPage(page2);
      await authPortal.login(context, credential);

      // Check for optional "Keep Using Passkey" button in popup
      this.logger.logInfo("Checking for 'Keep Using Passkey' button in popup after authentication...");
      await this.clickOptionalButton(
        page2,
        'cpsl-button:has-text("Keep Using") button.button-native',
        "Keep Using Passkey"
      );

      this.logger.logInfo("Passkey login completed");
    }

    if (is2FAEnabled) {
      const skipButton = this.page.locator('cpsl-button:has-text("Skip") button.button-native');
      await expect(skipButton).toBeVisible({ timeout: 10000 });
      await skipButton.click();
    }

    // Wait for login to complete - account address display should appear for all flows
    await expect(this.page.getByTestId("account-address-display")).toBeVisible({
      timeout: 15000,
    });
    this.logger.logStep("Para Modal login confirmed - account address display visible", true);
  }

  async logout() {
    // Ensure UI is stable after previous modal close before reopening
    await this.waitForUIStability();

    // Click on the connected address button to open modal
    await this.page.getByTestId("account-address-display").click();

    // Wait for modal content to be visible and click Profile button
    const modalContent = this.page.getByTestId("modal-content");
    await expect(modalContent).toBeVisible({ timeout: 10000 });

    // Wait for Profile button to be visible before clicking
    const profileButton = modalContent.locator('cpsl-tile-button:has-text("Profile") button.button-native');
    await expect(profileButton).toBeVisible({ timeout: 10000 });
    await profileButton.click({ timeout: 10000 });

    // Wait for Disconnect Wallet button to be visible before clicking
    const disconnectButton = modalContent.locator('cpsl-button:has-text("Disconnect Wallet") button.button-native');
    await expect(disconnectButton).toBeVisible({ timeout: 10000 });
    await disconnectButton.click({ timeout: 10000 });

    // Wait for logout to complete - header should show connect button again
    this.logger.logInfo("Waiting for logout to complete...");

    // First wait for the account display to disappear (logout in progress)
    const accountDisplay = this.page.getByTestId("account-address-display");
    await expect(accountDisplay).toBeHidden({ timeout: 10000 });

    // Then wait for the connect button to appear (logout complete)
    const connectButton = this.page.getByTestId("header-connect-button");
    await expect(connectButton).toBeVisible({ timeout: 10000 });
    this.logger.logInfo("Logout completed - connect button visible");
  }

  async signMessage(message?: string): Promise<string> {
    // Check if we have the input-based implementation (React Vite) or hardcoded implementation (Next.js para-modal)
    const messageInput = this.page.getByTestId("sign-message-input");
    const hasInput = await messageInput.isVisible().catch(() => false);

    if (hasInput && message) {
      // Input-based implementation (React Vite and others)
      this.logger.logInfo(`Signing message: ${message}`);

      await messageInput.click();
      await messageInput.clear();
      await messageInput.fill(message);
      this.logger.logInfo("Filled message input");

      // Click the sign button
      const signButton = this.page.getByTestId("sign-submit-button");
      await expect(signButton).toBeVisible({ timeout: 10000 });
      await signButton.click();
      this.logger.logInfo("Clicked sign button");
    } else {
      // Hardcoded "Hello World!" implementation (Next.js para-modal)
      this.logger.logInfo('Signing hardcoded "Hello World!" message');

      const signButton = this.page.getByText("Sign Hello World!");
      await expect(signButton).toBeVisible({ timeout: 10000 });
      await signButton.click();
      this.logger.logInfo("Clicked sign button");
    }

    // Wait for signature to appear
    const signatureDisplay = await this.page.waitForSelector('[data-testid="sign-signature-display"]', {
      state: "visible",
      timeout: 10000,
    });
    this.logger.logInfo("Signature appeared");

    // Get the signature text
    const signature = await signatureDisplay.textContent();
    this.logger.logInfo(`Got signature: ${signature}`);

    return signature || "";
  }

  async cleanupTestUser(): Promise<void> {
    try {
      this.logger.logInfo("Checking if cleanup function is available...");

      // Check if the function exists and get userId before deletion
      const cleanupInfo = await this.page.evaluate(() => {
        const deleteFunc = (window as any).__deleteTestUser;
        const para = (window as any).para;

        return {
          functionExists: typeof deleteFunc === "function",
          userId: para?.userId || null,
        };
      });

      if (!cleanupInfo.functionExists) {
        this.logger.logWarning("Cleanup function not available - user deletion skipped");
        return;
      }

      if (!cleanupInfo.userId) {
        this.logger.logWarning("No userId found - user may not be logged in or already deleted");
        return;
      }

      this.logger.logInfo(`Deleting test user: ${cleanupInfo.userId}`);

      await this.page.evaluate(() => {
        return (window as any).__deleteTestUser();
      });

      this.logger.logStep(`Test user deleted successfully (userId: ${cleanupInfo.userId})`, true);
    } catch (error) {
      this.logger.logWarning(`Failed to delete test user: ${(error as Error).message}`);
      // Don't throw - cleanup failure shouldn't fail the test
    }
  }
}
