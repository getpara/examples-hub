import { BrowserContext, Page, FrameLocator, Locator, expect } from '@playwright/test';
import { Protocol } from 'playwright-core/types/protocol';
import { AuthPortalPage } from './portal.page';
import { getRandomPhoneNumber, getRandomEmail } from '../helpers/test-data';
import { applyNetworkThrottling, type NetworkLevel } from '../helpers/network-throttling';

const TIMEOUTS = {
  QUICK: 1000,
  SHORT: 3000,
  DEFAULT: 10000,
  LOADING: 15000,
  EXTENDED: 20000,
  MAXIMUM: 30000,
} as const;
const DELAYS = {
  TYPING: 100,
} as const;

export class ParaModalExamplePage {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private async getParaIframe(): Promise<FrameLocator> {
    await this.page.waitForSelector('iframe', {
      state: 'visible',
      timeout: TIMEOUTS.DEFAULT,
    });

    const frameLocator = this.page.frameLocator('iframe').first();
    return frameLocator;
  }

  private async getIframePasswordInput(): Promise<FrameLocator> {
    const frameLocator = await this.getParaIframe();
    const passwordInputWrapper = frameLocator.locator('cpsl-input[placeholder="Enter password"]');
    await expect(passwordInputWrapper).toBeVisible({ timeout: TIMEOUTS.DEFAULT });
    return frameLocator;
  }

  private async getIframeOTPInput(): Promise<Locator> {
    const frameLocator = await this.getParaIframe();
    const iframeOTPInput = frameLocator.locator('cpsl-code-input');
    await expect(iframeOTPInput).toBeVisible({ timeout: TIMEOUTS.DEFAULT });
    return iframeOTPInput;
  }

  private async clickOptionalButton(
    locatorOrPage: Locator | Page | FrameLocator,
    selector: string,
    timeout: number = TIMEOUTS.DEFAULT,
  ): Promise<boolean> {
    const button = locatorOrPage.locator(selector);
    try {
      await button.click({ timeout });
      return true;
    } catch {
      return false;
    }
  }

  async visit() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
    await expect(this.page.getByTestId('header-connect-button')).toBeVisible({
      timeout: TIMEOUTS.SHORT,
    });
  }

  async waitForUIStability() {
    const accountButton = this.page.getByTestId('account-address-display');
    const connectButton = this.page.getByTestId('header-connect-button');
    let modalButton;
    if (await accountButton.isVisible({ timeout: TIMEOUTS.LOADING })) {
      modalButton = accountButton;
    } else {
      await expect(connectButton).toBeVisible({ timeout: TIMEOUTS.DEFAULT });
      modalButton = connectButton;
    }
    await this.page.waitForTimeout(TIMEOUTS.QUICK);
    await expect(modalButton).toBeVisible();
    await expect(modalButton).toBeEnabled();
  }

  async createUser({
    context,
    isRecoverySecretEnabled,
    password,
    usePhoneNumber = false,
    networkLevel,
  }: {
    context: BrowserContext;
    isRecoverySecretEnabled?: boolean;
    password?: string;
    usePhoneNumber?: boolean;
    networkLevel?: NetworkLevel;
  }) {
    await this.waitForUIStability();
    const accountButton = this.page.getByTestId('account-address-display');
    const connectButton = this.page.getByTestId('header-connect-button');
    const accountVisible = await accountButton.isVisible().catch(() => false);
    if (accountVisible) {
      await accountButton.click();
    } else {
      await connectButton.click();
    }
    const authInputWrapper = this.page.getByTestId('auth-input');
    await expect(authInputWrapper).toBeVisible({ timeout: TIMEOUTS.SHORT });
    const emailOrPhone = usePhoneNumber ? getRandomPhoneNumber() : getRandomEmail();
    const authInput = authInputWrapper.locator('input.native-input').first();
    await authInput.click();
    if (usePhoneNumber) {
      await authInput.pressSequentially(emailOrPhone, { delay: DELAYS.TYPING });
    } else {
      await authInput.fill(emailOrPhone);
    }
    await expect(authInputWrapper).toHaveAttribute('value', emailOrPhone);
    await authInput.press('Enter');
    let credentials: Protocol.WebAuthn.Credential[] = [];
    const codeInputWrapper = this.page.locator('cpsl-code-input');
    await expect(codeInputWrapper).toBeVisible({ timeout: TIMEOUTS.SHORT });
    const firstCodeInput = codeInputWrapper.locator('#code-input-0');
    await expect(firstCodeInput).toBeVisible({ timeout: TIMEOUTS.SHORT });
    for (let i = 0; i < 6; i++) {
      const otpInput = codeInputWrapper.locator(`#code-input-${i}`);
      await expect(otpInput).toBeVisible({ timeout: TIMEOUTS.SHORT });
      await otpInput.click();
      await otpInput.fill((i + 1).toString());
    }

    if (password) {
      const choosePasswordButton = this.page.locator('cpsl-button:has-text("Choose Password") button.button-native');
      await expect(choosePasswordButton).toBeVisible({ timeout: TIMEOUTS.DEFAULT });
      await choosePasswordButton.click();
      const iframeLocator = await this.getIframePasswordInput();
      const passwordInputWrapper = iframeLocator.locator('cpsl-input[placeholder="Enter password"]');
      const passwordInput = passwordInputWrapper.locator('input.native-input');
      await expect(passwordInput).toBeVisible({ timeout: TIMEOUTS.DEFAULT });
      await passwordInput.click();
      await passwordInput.fill(password);
      const confirmPasswordInputWrapper = iframeLocator.locator('cpsl-input[placeholder="Confirm password"]');
      const confirmPasswordInput = confirmPasswordInputWrapper.locator('input.native-input');
      await expect(confirmPasswordInput).toBeVisible({ timeout: TIMEOUTS.DEFAULT });
      await confirmPasswordInput.click();
      await confirmPasswordInput.fill(password);
      const savePasswordButton = iframeLocator.locator('cpsl-button:has-text("Save Password") button.button-native');
      await expect(savePasswordButton).toBeVisible({ timeout: TIMEOUTS.DEFAULT });
      await savePasswordButton.click();
    } else {
      const page1Promise = this.page.waitForEvent('popup');
      const createPasskeyButton = this.page.locator('cpsl-button:has-text("Create Passkey") button.button-native');
      await expect(createPasskeyButton).toBeVisible({ timeout: TIMEOUTS.DEFAULT });
      await createPasskeyButton.click();
      const page1 = await page1Promise;
      if (networkLevel) {
        await applyNetworkThrottling(page1, networkLevel);
      }
      const authPortal = new AuthPortalPage(page1);
      credentials = await authPortal.setup(context);
    }
    let clipboardText = '';
    if (isRecoverySecretEnabled) {
      await this.page.waitForTimeout(TIMEOUTS.SHORT);
      const copyTileButton = this.page.locator('cpsl-tile-button[icon="copy"]:has(cpsl-text:has-text("Copy"))');
      await expect(copyTileButton).toBeVisible({ timeout: TIMEOUTS.EXTENDED });
      await copyTileButton.click({ timeout: TIMEOUTS.DEFAULT });
      await this.page.waitForTimeout(TIMEOUTS.QUICK);
      clipboardText = await this.page.evaluate('navigator.clipboard.readText()');
      const savedSecretButton = this.page
        .locator('cpsl-button')
        .filter({ hasText: /saved.*recovery|recovery.*saved/i })
        .locator('button.button-native');
      await expect(savedSecretButton).toBeVisible({ timeout: TIMEOUTS.SHORT });
      await savedSecretButton.click({ timeout: TIMEOUTS.DEFAULT });
    }
    const doneButton = this.page.locator('cpsl-button:has-text("Done") button.button-native');
    await expect(doneButton).toBeVisible({ timeout: TIMEOUTS.DEFAULT });
    await doneButton.click({ timeout: TIMEOUTS.DEFAULT });
    await expect(this.page.getByTestId('account-address-display')).toBeVisible({ timeout: TIMEOUTS.EXTENDED });
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
    password,
    networkLevel,
  }: {
    context: BrowserContext;
    credential: Protocol.WebAuthn.Credential;
    emailOrPhone: string;
    password?: string;
    networkLevel?: NetworkLevel;
  }) {
    await this.waitForUIStability();
    const connectButton = this.page.getByTestId('header-connect-button');
    await expect(connectButton).toBeVisible({ timeout: TIMEOUTS.DEFAULT });
    await connectButton.click();
    const authInputWrapper = this.page.getByTestId('auth-input');
    await expect(authInputWrapper).toBeVisible({ timeout: TIMEOUTS.SHORT });
    const authInput = authInputWrapper.locator('input.native-input').first();
    await authInput.click();
    await authInput.fill(emailOrPhone);
    await expect(authInputWrapper).toHaveAttribute('value', emailOrPhone);
    await authInput.press('Enter');
    if (password) {
      const iframeLocator = await this.getParaIframe();
      const passwordInputWrapper = iframeLocator.locator('cpsl-input[placeholder="Enter password"]');
      const passwordInput = passwordInputWrapper.locator('input.native-input');
      await expect(passwordInput).toBeVisible({ timeout: TIMEOUTS.DEFAULT });
      await passwordInput.click();
      await passwordInput.fill(password);
      const loginButton = iframeLocator.locator('cpsl-button:has-text("Login") button.button-native');
      await expect(loginButton).toBeVisible({ timeout: TIMEOUTS.DEFAULT });
      await expect(loginButton).toBeEnabled({ timeout: TIMEOUTS.SHORT });
      await loginButton.click();
      await this.clickOptionalButton(iframeLocator, 'cpsl-button:has-text("Keep Using") button.button-native');
    } else {
      const page2Promise = this.page.waitForEvent('popup');
      const passkeyLink = this.page.getByText('Login with passkey');
      await expect(passkeyLink).toBeVisible({ timeout: TIMEOUTS.DEFAULT });
      await passkeyLink.click();
      const page2 = await page2Promise;
      if (networkLevel) {
        await applyNetworkThrottling(page2, networkLevel);
      }
      const authPortal = new AuthPortalPage(page2);
      await authPortal.login(context, credential);
      await this.clickOptionalButton(page2, 'cpsl-button:has-text("Keep Using") button.button-native');
    }

    await expect(this.page.getByTestId('account-address-display')).toBeVisible({
      timeout: TIMEOUTS.EXTENDED,
    });
  }

  async logout() {
    await this.waitForUIStability();
    await this.page.getByTestId('account-address-display').click();

    const modalContent = this.page.getByTestId('modal-content');
    await expect(modalContent).toBeVisible({ timeout: TIMEOUTS.SHORT });
    const profileButton = modalContent.locator('cpsl-tile-button:has-text("Profile") button.button-native');
    await expect(profileButton).toBeVisible({ timeout: TIMEOUTS.SHORT });
    await profileButton.click({ timeout: TIMEOUTS.DEFAULT });
    const disconnectButton = modalContent.locator('cpsl-button:has-text("Disconnect Wallet") button.button-native');
    await expect(disconnectButton).toBeVisible({ timeout: TIMEOUTS.SHORT });
    await disconnectButton.click({ timeout: TIMEOUTS.DEFAULT });
    const accountDisplay = this.page.getByTestId('account-address-display');
    await expect(accountDisplay).toBeHidden({ timeout: TIMEOUTS.DEFAULT });
    const connectButton = this.page.getByTestId('header-connect-button');
    await expect(connectButton).toBeVisible({ timeout: TIMEOUTS.DEFAULT });
  }

  async signMessage(message?: string): Promise<string> {
    const messageInput = this.page.getByTestId('sign-message-input');
    const hasInput = await messageInput.isVisible().catch(() => false);

    if (hasInput && message) {
      await messageInput.click();
      await messageInput.clear();
      await messageInput.fill(message);

      const signButton = this.page.getByTestId('sign-submit-button');
      await expect(signButton).toBeVisible({ timeout: TIMEOUTS.DEFAULT });
      await signButton.click();
    } else {
      const signButton = this.page.getByText('Sign Hello World!');
      await expect(signButton).toBeVisible({ timeout: TIMEOUTS.DEFAULT });
      await signButton.click();
    }
    const signatureDisplay = await this.page.waitForSelector('[data-testid="sign-signature-display"]', {
      state: 'visible',
      timeout: TIMEOUTS.DEFAULT,
    });
    const signature = await signatureDisplay.textContent();
    return signature || '';
  }

  async cleanupTestUser(): Promise<void> {
    try {
      // Check environment, function availability, and userId before deletion
      const cleanupInfo = await this.page.evaluate(() => {
        const win = globalThis as any;
        const deleteFunc = win.__deleteTestUser;
        const para = win.para;
        const environment = win.__paraEnvironment;

        return {
          functionExists: typeof deleteFunc === 'function',
          userId: para?.userId || null,
          environment: environment || 'unknown',
          isProduction: environment === 'production',
        };
      });

      // Skip cleanup entirely in production
      if (cleanupInfo.isProduction) {
        console.log('[Cleanup] Skipping user deletion in production environment');
        return;
      }

      if (!cleanupInfo.functionExists) {
        console.warn('[Cleanup] Cleanup function not available - user deletion skipped');
        return;
      }

      if (!cleanupInfo.userId) {
        console.warn('[Cleanup] No userId found - user may not be logged in or already deleted');
        return;
      }

      console.log(`[Cleanup] Attempting to delete test user in ${cleanupInfo.environment}: ${cleanupInfo.userId}`);

      const result = await this.page.evaluate(() => {
        return (globalThis as any).__deleteTestUser();
      });

      if (result?.success) {
        console.log(`[Cleanup] ✓ Test user deleted successfully in ${result.environment} (userId: ${result.userId})`);
      } else {
        console.warn(
          `[Cleanup] ✗ User deletion failed in ${result?.environment || 'unknown'}: ${result?.error || 'Unknown error'}`,
        );
      }
    } catch (error) {
      // Extra safety net - catch any unexpected errors from page.evaluate
      console.warn(`[Cleanup] Unexpected error during cleanup: ${(error as Error).message}`);
      // Don't throw - cleanup failure shouldn't fail the test
    }
  }
}
