import { BrowserContext, Page, FrameLocator, expect } from '@playwright/test';
import { Protocol } from 'playwright-core/types/protocol';
import { AuthPortalPage } from './portal.page';
import { getRandomPhoneNumber, getRandomEmail } from '../helpers/test-data';
import { applyNetworkThrottling, type NetworkLevel } from '../helpers/network-throttling';

const TIMEOUTS = {
  DEFAULT: 20000,
  SHORT: 10000,
  BRIEF: 4000,
  QUICK: 1000,
  LOADING: 3000,
  LONG: 30000,
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
    await this.page.waitForSelector('iframe', { state: 'visible', timeout: TIMEOUTS.LONG });
    const frameLocator = this.page.frameLocator('iframe').first();
    await frameLocator.locator('body').waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });
    const passwordInputWrapper = frameLocator.locator('cpsl-input[placeholder="Enter password"]');
    await expect(passwordInputWrapper).toBeVisible({ timeout: TIMEOUTS.LONG });
    return frameLocator;
  }

  async visit() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
    await expect(this.page.getByTestId('header-connect-button')).toBeVisible({ timeout: TIMEOUTS.DEFAULT });
  }

  async waitForUIStability() {
    const accountButton = this.page.getByTestId('account-address-display');
    const connectButton = this.page.getByTestId('header-connect-button');
    let modalButton;
    try {
      await accountButton.waitFor({ state: 'visible', timeout: TIMEOUTS.QUICK });
      modalButton = accountButton;
    } catch {
      await connectButton.waitFor({ state: 'visible', timeout: TIMEOUTS.DEFAULT });
      modalButton = connectButton;
    }
    await this.page.waitForTimeout(TIMEOUTS.LOADING);
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
    const codeInputWrapper = this.page.locator('cpsl-code-input');
    await expect(codeInputWrapper).toBeVisible({ timeout: TIMEOUTS.SHORT });
    const firstCodeInput = codeInputWrapper.locator('#code-input-0');
    await expect(firstCodeInput).toBeVisible({ timeout: TIMEOUTS.SHORT });
    for (let i = 0; i < 6; i++) {
      const otpInput = codeInputWrapper.locator(`#code-input-${i}`);
      await otpInput.click();
      await otpInput.fill((i + 1).toString());
    }
    let credentials: Protocol.WebAuthn.Credential[] = [];
    if (password) {
      try {
        const choosePasswordButton = this.page.locator('cpsl-button:has-text("Choose Password") button.button-native');
        await choosePasswordButton.click();
        const iframeLocator = await this.getParaIframe();
        const passwordInputWrapper = iframeLocator.locator('cpsl-input[placeholder="Enter password"]');
        const passwordInput = passwordInputWrapper.locator('input.native-input');
        await passwordInput.click();
        await passwordInput.fill(password);
        const confirmPasswordInputWrapper = iframeLocator.locator('cpsl-input[placeholder="Confirm password"]');
        const confirmPasswordInput = confirmPasswordInputWrapper.locator('input.native-input');
        await confirmPasswordInput.click();
        await confirmPasswordInput.fill(password);
        const savePasswordButton = iframeLocator.locator('cpsl-button:has-text("Save Password") button.button-native');
        await savePasswordButton.click();
      } catch (error) {
        throw error;
      }
    } else {
      try {
        const page1Promise = this.page.waitForEvent('popup');
        const createPasskeyButton = this.page.locator('cpsl-button:has-text("Create Passkey") button.button-native');
        await createPasskeyButton.click();
        const page1 = await page1Promise;
        if (networkLevel) {
          await applyNetworkThrottling(page1, networkLevel);
        }
        const authPortal = new AuthPortalPage(page1);
        credentials = await authPortal.setup(context);
      } catch (error) {
        throw error;
      }
    }
    let clipboardText = '';
    if (isRecoverySecretEnabled) {
      await this.page.waitForTimeout(TIMEOUTS.BRIEF);
      const copyTileButton = this.page.locator('cpsl-tile-button[icon="copy"]:has(cpsl-text:has-text("Copy"))');
      await copyTileButton.waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });
      await copyTileButton.click();
      await this.page.waitForTimeout(TIMEOUTS.QUICK);
      try {
        clipboardText = await this.page.evaluate('navigator.clipboard.readText()');
      } catch (error) {
        throw error;
      }
      const savedSecretButton = this.page
        .locator('cpsl-button')
        .filter({ hasText: /saved.*recovery|recovery.*saved/i })
        .locator('button.button-native');
      await savedSecretButton.waitFor({ state: 'visible', timeout: TIMEOUTS.SHORT });
      await savedSecretButton.click();
    }
    const doneButton = this.page.locator('cpsl-button:has-text("Done") button.button-native');
    await doneButton.click();
    await expect(this.page.getByTestId('account-address-display')).toBeVisible({ timeout: TIMEOUTS.LONG });
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
    await connectButton.click();
    const authInputWrapper = this.page.getByTestId('auth-input');
    await expect(authInputWrapper).toBeVisible({ timeout: TIMEOUTS.SHORT });
    const authInput = authInputWrapper.locator('input.native-input').first();
    await authInput.click();
    await authInput.fill(emailOrPhone);
    await expect(authInputWrapper).toHaveAttribute('value', emailOrPhone);
    await authInput.press('Enter');
    if (password) {
      try {
        const iframeLocator = await this.getParaIframe();
        const passwordInputWrapper = iframeLocator.locator('cpsl-input[placeholder="Enter password"]');
        const passwordInput = passwordInputWrapper.locator('input.native-input');
        await passwordInput.click();
        await passwordInput.fill(password);
        const loginButton = iframeLocator.locator('cpsl-button:has-text("Login") button.button-native');
        await expect(loginButton).toBeEnabled({ timeout: TIMEOUTS.SHORT });
        await loginButton.click();
        await this.page.waitForTimeout(TIMEOUTS.BRIEF);
      } catch (error) {
        throw error;
      }
    } else {
      try {
        const page2Promise = this.page.waitForEvent('popup');
        await this.page.getByText('Login with passkey').click();
        const page2 = await page2Promise;
        if (networkLevel) {
          await applyNetworkThrottling(page2, networkLevel);
        }
        const authPortal = new AuthPortalPage(page2);
        await authPortal.login(context, credential);
      } catch (error) {
        throw error;
      }
    }
    await this.page.waitForTimeout(TIMEOUTS.BRIEF);
    try {
      await this.page.waitForSelector('[data-testid="account-address-display"]', {
        state: 'visible',
        timeout: TIMEOUTS.DEFAULT,
      });
    } catch {
      await this.page.waitForTimeout(TIMEOUTS.BRIEF);
    }
  }

  async logout() {
    await this.page.getByTestId('account-address-display').click();
    await this.page.waitForTimeout(TIMEOUTS.QUICK);
    const modalContent = this.page.getByTestId('modal-content');
    await modalContent.waitFor({ state: 'visible', timeout: TIMEOUTS.SHORT });
    const profileButton = modalContent.locator('cpsl-tile-button:has-text("Profile") button.button-native');
    await profileButton.waitFor({ state: 'visible', timeout: TIMEOUTS.SHORT });
    await profileButton.click();
    await this.page.waitForTimeout(TIMEOUTS.QUICK);
    const disconnectButton = modalContent.locator('cpsl-button:has-text("Disconnect Wallet") button.button-native');
    await disconnectButton.waitFor({ state: 'visible', timeout: TIMEOUTS.SHORT });
    await disconnectButton.click();
    await this.page.waitForTimeout(TIMEOUTS.LOADING);
    const connectButton = this.page.getByTestId('header-connect-button');
    await expect(connectButton).toBeVisible({ timeout: TIMEOUTS.SHORT });
  }

  async signMessage(): Promise<string> {
    const signButton = this.page.getByText('Sign Hello World!');
    await signButton.click();
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
