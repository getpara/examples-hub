import { ethers } from 'ethers';
import { test, expect } from '@playwright/test';

import { ParaConnect } from '../pages/paraConnect';
import { ParaModal } from '../pages/paraModal';
import { setIsUserVerifyingPlatformAuthenticatorAvailable } from 'e2e/helpers/webAuthn';

test.describe('Private Key Export Flow', () => {
  test('should complete full modal flow with password and export private key', async ({ browser }) => {
    const context = await browser.newContext({
      permissions: ['clipboard-write', 'clipboard-read'], // grant clipboard read/write permissions
    });
    const page = await context.newPage();
    await setIsUserVerifyingPlatformAuthenticatorAvailable(page);

    const modal = new ParaModal(page);
    await modal.visit();
    await page.waitForTimeout(1000);

    // create user in modal
    await modal.createUser({
      context,
      openModalText: 'Log In',
      is2FAEnabled: false,
      isRecoverySecretEnabled: false,
      password: 'TestPassword123!',
      usePhoneNumber: false,
    });

    const paraConnect = new ParaConnect(page);
    // copy wallet address from ui
    const walletAddress = await paraConnect.getWalletAddress();
    // export private key
    const privateKey = await paraConnect.getExportedPrivateKey();

    // confirm private key corresponds to Para wallet address
    const wallet = new ethers.Wallet(privateKey);
    const derivedAddress = wallet.address;
    expect(derivedAddress.toLowerCase()).toBe(walletAddress.toLowerCase());
  });
});
