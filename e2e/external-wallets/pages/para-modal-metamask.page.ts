import { Page, expect } from '@playwright/test';
import { MetaMask } from '@synthetixio/synpress-metamask';

/**
 * Page object for Para Modal + MetaMask E2E testing.
 * Handles interactions with the Para modal and MetaMask extension.
 *
 * Covers the complete external wallet lifecycle:
 * - Connecting MetaMask (with all prompts: connect, permissions, sign)
 * - Opening/closing the Para modal
 * - Verifying wallet address display
 * - Disconnecting the wallet
 *
 * NOTE: This page object focuses on connection/disconnection flows.
 * Transaction signing tests are not included because MetaMask is an external wallet,
 * not Para's internal MPC wallet.
 */

const TIMEOUTS = {
  QUICK: 1000,
  SHORT: 3000,
  DEFAULT: 10000,
  EXTENDED: 20000,
  MAXIMUM: 30000,
} as const;

export class ParaModalMetaMaskPage {
  page: Page;
  metamask: MetaMask;

  constructor(page: Page, metamask: MetaMask) {
    this.page = page;
    this.metamask = metamask;
  }

  async visit() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async waitForUIStability() {
    console.log('Waiting for UI stability...');
    const locator = this.page.locator('[data-testid="account-address-display"], [data-testid="header-connect-button"]');
    await expect(locator).toBeVisible();
    await expect(locator).toBeEnabled();
  }

  async connectMetaMask() {
    await this.waitForUIStability();
    const modalContent = await this.openParaModal();
    await modalContent.getByRole('button', { name: /MetaMask/i }).click();
    await expect(modalContent.locator('#header').first()).toContainText('Connect Wallet');
    await this.metamask.connectToDapp();
    await expect(modalContent.locator('#header').first()).toContainText('Verify Wallet');
    await this.metamask.confirmSignature();
    await expect(modalContent).toContainText(/Done|Connected/);
    await this.ensureParaModalClosed();
    const addressElement = this.page.getByTestId('account-address-display');
    await expect(addressElement).toBeVisible();
    const addressText = await addressElement.textContent();
    if (!addressText) {
      throw new Error('Could not verify connected address');
    }
  }

  async openParaModal() {
    await this.page.locator('[data-testid="account-address-display"], [data-testid="header-connect-button"]').click();
    const modalContent = this.page.getByTestId('modal-content');
    await expect(modalContent).toBeVisible({ timeout: TIMEOUTS.DEFAULT });
    return modalContent;
  }

  async ensureParaModalClosed() {
    const modalContent = this.page.getByTestId('modal-content');
    if (await modalContent.isVisible().catch(() => false)) {
      await modalContent.locator('cpsl-icon[icon="close"]').click();
    }
    await expect(modalContent).toBeHidden();
  }

  async disconnect() {
    await this.waitForUIStability();
    const modalContent = await this.openParaModal();
    await modalContent.getByRole('button', { name: /settings/i }).click();
    await modalContent.getByRole('button', { name: /disconnect/i }).click();
    await this.page.waitForTimeout(1000);
    await this.ensureParaModalClosed();
    const connectButton = this.page.getByTestId('header-connect-button');
    await expect(connectButton).toBeVisible();
  }

  async cleanupTestUser(): Promise<void> {
    try {
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
      console.warn(`[Cleanup] Unexpected error during cleanup: ${(error as Error).message}`);
    }
  }
}
