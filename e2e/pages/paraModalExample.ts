import * as crypto from "node:crypto";
import {
  BrowserContext,
  Page,
  FrameLocator,
  expect,
  Locator,
} from "@playwright/test";
import { Protocol } from "playwright-core/types/protocol";

import { AuthPortalPage } from "./authPortal";
import { Logger } from "../helpers/logger";

function getRandomPhoneNumber() {
  // Valid US area codes (sampling of common ones to avoid invalid ranges)
  const validAreaCodes = [
    201, 202, 203, 205, 206, 207, 208, 209, 210, 212, 213, 214, 215, 216, 217,
    218, 219, 224, 225, 228, 229, 231, 234, 239, 240, 248, 251, 252, 253, 254,
    256, 260, 262, 267, 269, 270, 276, 281, 301, 302, 303, 304, 305, 307, 308,
    309, 310, 312, 313, 314, 315, 316, 317, 318, 319, 320, 321, 323, 325, 330,
    331, 334, 336, 337, 339, 347, 351, 352, 360, 361, 386, 401, 402, 404, 405,
    406, 407, 408, 409, 410, 412, 413, 414, 415, 417, 419, 423, 424, 425, 430,
    432, 434, 435, 440, 443, 458, 469, 470, 475, 478, 479, 480, 484, 501, 502,
    503, 504, 505, 507, 508, 509, 510, 512, 513, 515, 516, 517, 518, 520, 530,
    540, 541, 551, 559, 561, 562, 563, 564, 567, 570, 571, 573, 574, 575, 580,
    585, 586, 601, 602, 603, 605, 606, 607, 608, 609, 610, 612, 614, 615, 616,
    617, 618, 619, 620, 623, 626, 630, 631, 636, 641, 646, 650, 651, 660, 661,
    662, 667, 678, 682, 701, 702, 703, 704, 706, 707, 708, 712, 713, 714, 715,
    716, 717, 718, 719, 720, 724, 727, 730, 731, 732, 734, 737, 740, 754, 757,
    760, 763, 765, 770, 772, 773, 774, 775, 781, 785, 786, 787, 801, 802, 803,
    804, 805, 806, 808, 810, 812, 813, 814, 815, 816, 817, 818, 828, 830, 831,
    832, 843, 845, 847, 848, 850, 856, 857, 858, 859, 860, 862, 863, 864, 865,
    870, 872, 878, 901, 903, 904, 906, 907, 908, 909, 910, 912, 913, 914, 915,
    916, 917, 918, 919, 920, 925, 928, 929, 931, 934, 936, 937, 940, 941, 947,
    949, 951, 952, 954, 956, 959, 970, 971, 972, 973, 978, 979, 980, 984, 985,
    989,
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
    // Wait for iframe to appear and be visible
    await this.page.waitForSelector("iframe", {
      state: "visible",
      timeout: 10000,
    });

    // Get the iframe locator
    const frameLocator = this.page.frameLocator("iframe").first();

    // Wait for the frame to be loaded and visible
    await frameLocator
      .locator("body")
      .waitFor({ state: "visible", timeout: 10000 });

    return frameLocator;
  }

  private async getIframePasswordInput(): Promise<FrameLocator> {
    const frameLocator = await this.getParaIframe();

    // Ensure password input is visible in the iframe - check for the wrapper element
    const passwordInputWrapper = frameLocator.locator(
      'cpsl-input[placeholder="Enter password"]'
    );
    await expect(passwordInputWrapper).toBeVisible({ timeout: 10000 });
    this.logger.logInfo("Found password input in iframe");

    return frameLocator;
  }

  private async getIframeOTPInput(): Promise<Locator> {
    const frameLocator = await this.getParaIframe();

    // Wait for OTP code input to be visible
    const iframeOTPInput = frameLocator.locator("cpsl-code-input");
    await expect(iframeOTPInput).toBeVisible({ timeout: 10000 });
    this.logger.logInfo("Found OTP input in iframe");

    return iframeOTPInput;
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
    // The button changes based on connection state
    const accountButton = this.page.getByTestId("account-address-display");
    const connectButton = this.page.getByTestId("header-connect-button");

    // Wait for either button to be visible
    let modalButton;
    try {
      // First check if we're in connected state
      await accountButton.waitFor({ state: "visible", timeout: 2000 });
      modalButton = accountButton;
      this.logger.logInfo("Found account button (connected state)");
    } catch {
      // Otherwise we should be in disconnected state
      await connectButton.waitFor({ state: "visible", timeout: 10000 });
      modalButton = connectButton;
      this.logger.logInfo("Found connect button (disconnected state)");
    }

    // Additional wait to ensure any animations or async operations complete
    await this.page.waitForTimeout(1500);

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

    const emailOrPhone = usePhoneNumber
      ? getRandomPhoneNumber()
      : getRandomEmail();

    this.logger.logInfo(
      `Creating user with ${
        usePhoneNumber ? "phone" : "email"
      }: ${emailOrPhone}`
    );

    // Fill the auth input - target the native input inside the shadow DOM
    // The input starts with placeholder "Enter email or phone" and changes dynamically
    // For phone numbers, it will change to "Enter phone" after detecting numeric input
    const authInput = authInputWrapper.locator("input.native-input").first();
    console.log(
      "🚀 ~ ParaModalExamplePage ~ createUser ~ authInput:",
      authInput
    );

    await authInput.click();

    if (usePhoneNumber) {
      // For phone numbers, type slowly to allow the UI to detect it's a phone number
      // and switch to phone mode with the country dropdown
      await authInput.pressSequentially(emailOrPhone, { delay: 100 });
    } else {
      await authInput.fill(emailOrPhone);
    }

    await expect(authInputWrapper).toHaveAttribute("value", emailOrPhone);
    console.log(
      "🚀 ~ ParaModalExamplePage ~ createUser ~ authInputWrapper:",
      authInputWrapper
    );

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
          await otpInput.click();
          await otpInput.fill(pin[i].toString());
        }

        // Click Continue button - target native button in shadow DOM
        const continueButton = iframeLocator.locator(
          'cpsl-button:has-text("Continue") button.button-native'
        );
        await continueButton.click();

        // Use helper function to get iframe OTP input
        const secondPINInputLocator = await this.getIframeOTPInput();

        // Get second PIN input
        const secondCodeInput = secondPINInputLocator.locator("#code-input-1");
        await expect(secondCodeInput).toBeVisible({ timeout: 5000 });

        for (let i = 0; i < 4; i++) {
          const otpInput = secondPINInputLocator.locator(`#code-input-${i}`);
          await otpInput.click();
          await otpInput.fill(pin[i].toString());
        }

        // Click Set PIN button - target native button in shadow DOM
        const setPINButton = iframeLocator.locator(
          'cpsl-button:has-text("Set PIN") button.button-native'
        );
        await setPINButton.click();
      } else if (password) {
        // Click the "Choose Password" button - target native button in shadow DOM
        const choosePasswordButton = this.page.locator(
          'cpsl-button:has-text("Choose Password") button.button-native'
        );
        await choosePasswordButton.click();

        // Use helper function to get iframe password input
        const iframeLocator = await this.getIframePasswordInput();

        // Enter password in iframe - target native inputs in shadow DOM
        const passwordInputWrapper = iframeLocator.locator(
          'cpsl-input[placeholder="Enter password"]'
        );
        const passwordInput =
          passwordInputWrapper.locator("input.native-input");
        await passwordInput.click();
        await passwordInput.fill(password);

        const confirmPasswordInputWrapper = iframeLocator.locator(
          'cpsl-input[placeholder="Confirm password"]'
        );
        const confirmPasswordInput =
          confirmPasswordInputWrapper.locator("input.native-input");
        await confirmPasswordInput.click();
        await confirmPasswordInput.fill(password);

        // Click Save Password button - target native button in shadow DOM
        const savePasswordButton = iframeLocator.locator(
          'cpsl-button:has-text("Save Password") button.button-native'
        );
        await savePasswordButton.click();
      } else {
        const page1Promise = this.page.waitForEvent("popup");
        // Click the "Create Passkey" button - target native button in shadow DOM
        const createPasskeyButton = this.page.locator(
          'cpsl-button:has-text("Create Passkey") button.button-native'
        );
        await createPasskeyButton.click();

        const page1 = await page1Promise;
        const authPortal = new AuthPortalPage(page1);
        credentials = await authPortal.setup(context);
      }
    }

    let clipboardText = "";
    if (!isBasicLogin && isRecoverySecretEnabled) {
      // Wait for the recovery secret screen to be visible
      await this.page.waitForTimeout(2000);

      // Look for the copy tile button with the correct structure
      // The tile button has icon="copy" and contains "Copy" text
      const copyTileButton = this.page.locator(
        'cpsl-tile-button[icon="copy"]:has(cpsl-text:has-text("Copy"))'
      );

      // Wait for the tile button to be visible
      await copyTileButton.waitFor({ state: "visible", timeout: 10000 });

      // Click the tile button directly - Playwright should handle the shadow DOM
      await copyTileButton.click();

      // Wait for clipboard operation to complete
      await this.page.waitForTimeout(500);
      clipboardText = await this.page.evaluate(
        "navigator.clipboard.readText()"
      );

      // Click "I've saved my recovery secret" button - try multiple selectors
      // The text might vary slightly, so let's be more flexible
      const savedSecretButton = this.page
        .locator("cpsl-button")
        .filter({ hasText: /saved.*recovery|recovery.*saved/i })
        .locator("button.button-native");
      await savedSecretButton.waitFor({ state: "visible", timeout: 5000 });
      await savedSecretButton.click();
    }

    if (is2FAEnabled) {
      const continueButton = this.page.locator(
        'cpsl-button:has-text("Continue") button.button-native'
      );
      await continueButton.click();
      const skipButton = this.page.locator(
        'cpsl-button:has-text("Skip") button.button-native'
      );
      await skipButton.click();
    } else {
      // Click the Done button - target native button in shadow DOM
      const doneButton = this.page.locator(
        'cpsl-button:has-text("Done") button.button-native'
      );
      await doneButton.click();
    }

    // Wait for modal to close and app state to update
    this.logger.logStep(
      "Waiting for Para Modal to close and connection state to update..."
    );

    // Wait for the account address display to appear (indicates successful connection)
    await expect(this.page.getByTestId("account-address-display")).toBeVisible({
      timeout: 15000,
    });
    this.logger.logStep(
      "Para Modal connection confirmed - account address display visible",
      true
    );

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
    await connectButton.click();
    this.logger.logInfo("Modal opened");

    // Wait for auth input to be visible using data-testid
    const authInputWrapper = this.page.getByTestId("auth-input");
    await expect(authInputWrapper).toBeVisible({ timeout: 5000 });
    this.logger.logInfo("Found auth input");

    // Fill the auth input - target the native input inside the shadow DOM
    // Use .first() to avoid conflicts with country search input when using phone
    const authInput = authInputWrapper.locator("input.native-input").first();
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
        await otpInput.click();
        await otpInput.fill((i + 1).toString());
      }
    } else if (pin) {
      this.logger.logInfo(
        "PIN login flow - looking for verification code input in iframe..."
      );

      try {
        // Use helper function to get iframe
        const iframeLocator = await this.getParaIframe();

        // Use helper function to get iframe OTP input
        const iframeVerificationInputLocator = await this.getIframeOTPInput();

        // The OTP inputs are already native inputs with IDs in the shadow DOM
        // Wait for first OTP input to be ready
        const verificationCodeInput =
          iframeVerificationInputLocator.locator("#code-input-0");
        await expect(verificationCodeInput).toBeVisible({ timeout: 5000 });

        for (let i = 0; i < 6; i++) {
          const otpInput = iframeVerificationInputLocator.locator(
            `#code-input-${i}`
          );
          await otpInput.click();
          await otpInput.fill((i + 1).toString());
        }

        // Now the Login button should be visible - target native button in shadow DOM
        const loginButton = iframeLocator.locator(
          'cpsl-button:has-text("Login") button.button-native'
        );
        await expect(loginButton).toBeVisible({ timeout: 3000 });

        // Use helper function to get iframe OTP input
        const iframePINInputLocator = await this.getIframeOTPInput();

        // Get first PIN input
        const pinInput = iframePINInputLocator.locator("#code-input-0");
        await expect(pinInput).toBeVisible({ timeout: 5000 });

        for (let i = 0; i < 4; i++) {
          const otpInput = iframePINInputLocator.locator(`#code-input-${i}`);
          await otpInput.click();
          await otpInput.fill(pin[i].toString());
        }

        // Now the Login button should be enabled - target native button in shadow DOM
        await expect(loginButton).toBeEnabled({ timeout: 5000 });
        this.logger.logInfo("Found Login button in iframe, clicking...");

        // Click login button - no popup needed for password login with iframe
        await loginButton.click();
        this.logger.logInfo("Clicked Login button, login should complete");

        // Wait for modal to close and user to be logged in
        await this.page.waitForTimeout(2000);
        this.logger.logInfo("Login completed");
      } catch (error) {
        this.logger.logError("Error in password login flow:", error);
        throw error;
      }
    } else if (password) {
      this.logger.logInfo(
        "Password login flow - looking for password input in iframe..."
      );
      try {
        // Use helper function to get iframe
        const iframeLocator = await this.getParaIframe();

        // Enter password in iframe - target native input in shadow DOM
        const passwordInputWrapper = iframeLocator.locator(
          'cpsl-input[placeholder="Enter password"]'
        );
        const passwordInput =
          passwordInputWrapper.locator("input.native-input");
        this.logger.logInfo("Found password input in iframe");
        await passwordInput.click();
        await passwordInput.fill(password);
        this.logger.logInfo("Entered password");

        // Now the Login button should be enabled - target native button in shadow DOM
        const loginButton = iframeLocator.locator(
          'cpsl-button:has-text("Login") button.button-native'
        );
        await expect(loginButton).toBeEnabled({ timeout: 5000 });
        this.logger.logInfo("Found Login button in iframe, clicking...");

        // Click login button - no popup needed for password login with iframe
        await loginButton.click();
        this.logger.logInfo("Clicked Login button, login should complete");

        // Wait for modal to close and user to be logged in
        await this.page.waitForTimeout(2000);
        this.logger.logInfo("Login completed");
      } catch (error) {
        this.logger.logError("Error in password login flow:", error);
        throw error;
      }
    } else {
      this.logger.logInfo("Passkey login flow");
      const page2Promise = this.page.waitForEvent("popup");
      await this.page.getByText("Login with passkey").click();
      const page2 = await page2Promise;
      const authPortal = new AuthPortalPage(page2);
      await authPortal.login(context, credential);
    }

    // Wait for login to complete and connection state to update
    this.logger.logStep(
      "Waiting for login completion and connection state update..."
    );
    await this.page.waitForTimeout(2000);

    if (is2FAEnabled) {
      const skipButton = this.page.locator(
        'cpsl-button:has-text("Skip") button.button-native'
      );
      await skipButton.click();
      await this.page.waitForTimeout(2100);
    }

    // Verify login completion by checking for account address display
    try {
      await this.page.waitForSelector(
        '[data-testid="account-address-display"]',
        {
          state: "visible",
          timeout: 10000,
        }
      );
      this.logger.logStep(
        "Para Modal login confirmed - account address display visible",
        true
      );
    } catch (error) {
      this.logger.logWarning(
        "Account address display not found after login, may need more time"
      );
      await this.page.waitForTimeout(2000);
    }
  }

  async logout() {
    // Click on the connected address button to open modal
    await this.page.getByTestId("account-address-display").click();
    await this.page.waitForTimeout(500);

    // Wait for modal content to be visible
    const modalContent = this.page.getByTestId("modal-content");
    await modalContent.waitFor({ state: "visible", timeout: 5000 });

    // Click the Profile button first (new UI flow) - target native button in shadow DOM
    const profileButton = modalContent.locator(
      'cpsl-tile-button:has-text("Profile") button.button-native'
    );
    await profileButton.waitFor({ state: "visible", timeout: 5000 });
    await profileButton.click();
    await this.page.waitForTimeout(500);

    // Now click the Disconnect Wallet button - target native button in shadow DOM
    const disconnectButton = modalContent.locator(
      'cpsl-button:has-text("Disconnect Wallet") button.button-native'
    );
    await disconnectButton.waitFor({ state: "visible", timeout: 5000 });
    await disconnectButton.click();

    // Wait for logout to complete - header should show connect button again
    this.logger.logInfo("Waiting for logout to complete...");
    await this.page.waitForTimeout(1000);
    const connectButton = this.page.getByTestId("header-connect-button");
    await expect(connectButton).toBeVisible({ timeout: 5000 });
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
      await signButton.click();
      this.logger.logInfo("Clicked sign button");
    } else {
      // Hardcoded "Hello World!" implementation (Next.js para-modal)
      this.logger.logInfo('Signing hardcoded "Hello World!" message');

      const signButton = this.page.getByText("Sign Hello World!");
      await signButton.click();
      this.logger.logInfo("Clicked sign button");
    }

    // Wait for signature to appear
    const signatureDisplay = await this.page.waitForSelector(
      '[data-testid="sign-signature-display"]',
      {
        state: "visible",
        timeout: 10000,
      }
    );
    this.logger.logInfo("Signature appeared");

    // Get the signature text
    const signature = await signatureDisplay.textContent();
    this.logger.logInfo(`Got signature: ${signature}`);

    return signature || "";
  }
}
