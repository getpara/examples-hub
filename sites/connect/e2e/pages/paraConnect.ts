import { Page } from '@playwright/test';

export class ParaConnect {
  private page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to private key export page once a user is logged in
   */
  private async navigateToPrivateKeyExport() {
    await this.page.getByTestId('SettingsIcon').click();
    await this.page.locator('text="Export Private Key"').click();
    await this.page.waitForTimeout(3000);
  }

  /**
   * Get the wallet address from the Home UI
   */
  async getWalletAddress(): Promise<string> {
    const copyIcon = this.page.locator('svg[data-testid="ContentCopyIcon"]').first();
    await copyIcon.click();

    // check for success toast
    const toast = this.page.locator('text="Address Copied!"');
    await toast.isVisible({ timeout: 2000 });
    // read wallet address from clipboard
    return this.page.evaluate(() => {
      return navigator.clipboard.readText();
    });
  }

  /**
   * Get the private key from the private key export page
   */
  async getExportedPrivateKey(): Promise<string> {
    await this.navigateToPrivateKeyExport();

    const copyButton = this.page.locator('svg[data-testid="ContentCopyIcon"]').first();
    await copyButton.isVisible({ timeout: 3000 });
    await copyButton.click();

    // check for success toast
    const toast = this.page.locator('text="Key Copied!"');
    await toast.isVisible({ timeout: 2000 });
    // read private key from clipboard
    return this.page.evaluate(() => {
      return navigator.clipboard.readText();
    });
  }
}
