import { test, expect, Page } from '@playwright/test';
import * as crypto from 'node:crypto';

import * as webauthn from '../../../helpers/webAuthn';
import { AuthPortalPage } from '../../../pages/authPortal';

const MOCK_EMAIL = 'teste2e+node@test.getpara.com';
const MOCK_CREDENTIAL = {
  credentialId: '3IObcR06qEP2aLNik33r+Wxi75yJuYuV2B5/AjYcyFI=',
  isResidentCredential: true,
  rpId: 'localhost',
  privateKey:
    'MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgOG6YXvNzsqeJ+rs/C4W4lFOsN5Fen7XrEXvra+yRAtihRANCAAR+fA+MAG9iGVubgUub+CqojrSTXX+g5uqA3u02GsJum2YAxJAl7qhd+h88MgMBzo64lvqNjarJvms+iVSatjF5',
  userHandle: 'e5XeO+i1zARiVXLp/WHo7a5P7LxVW7BgqO8a5pjFPhU=',
  signCount: 1,
  backupEligibility: false,
  backupState: false,
};
const MOCK_API_KEY = 'dfb222ff8b602eb492974a6ed68c35b2';
const MOCK_PARTNER_ID = '1ec9da3d-0974-4b44-bf4b-56c6c8ecec87';

async function testSigning(page: Page, isPregen?: boolean): Promise<void> {
  const walletText = isPregen ? 'pre-generated' : 'session-based';
  await page.getByRole('button', { name: 'Viem' }).click();
  await page.getByRole('button', { name: 'Call Viem API' }).click();
  const viemSignature = await page.getByText('{ "message": "Transaction').textContent();
  expect(viemSignature).toContain(`"message": "Transaction signed using Viem + Para (${walletText} wallet).",`);
  expect(viemSignature).toContain('"signedTxRlp": "0x');

  await page.getByRole('button', { name: 'Choose different API' }).click();
  await page.getByRole('button', { name: 'Ethers.js' }).click();
  await page.getByRole('button', { name: 'Call Ethers.js API' }).click();
  const ethersSignature = await page.getByText('{ "message": "Transaction').textContent();
  expect(ethersSignature).toContain(`"message": "Transaction signed using Ethers + Para (${walletText} wallet).`);
  expect(ethersSignature).toContain('"signedTransaction": "0x');
}

test.describe('para modal', () => {
  test('happy path', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await webauthn.setIsUserVerifyingPlatformAuthenticatorAvailable(page);
    await page.goto('/');
    await page.getByRole('button', { name: 'Pre-Generated Wallet Flow' }).click();

    const randomHexString = crypto.randomBytes(5).toString('hex');
    const email = `teste2e+${randomHexString}@test.usecapsule.com`;
    await page.getByPlaceholder("Enter user's email").click();
    await page.getByPlaceholder("Enter user's email").fill(email);
    await page.getByRole('button', { name: 'Create/Verify Wallet' }).click();

    await testSigning(page, true);

    await page.getByRole('button', { name: 'Choose different API' }).click();
    await page.getByRole('button', { name: 'Start Over' }).click();
    await page.getByRole('button', { name: 'Session Flow Client' }).click();

    await page.getByPlaceholder("Enter user's email").click();
    await page.getByPlaceholder("Enter user's email").fill(MOCK_EMAIL);
    const page1Promise = page.waitForEvent('popup');
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Authenticate' }).click();

    const page1 = await page1Promise;
    const page1Url = page1.url();
    const newUrlWithApiKey = page1Url.replace(/apiKey=[a-fA-F0-9]+/, `apiKey=${MOCK_API_KEY}`);
    const newUrlWithPartnerId = newUrlWithApiKey.replace(/partnerId=[a-fA-F0-9-]+/, `partnerId=${MOCK_PARTNER_ID}`);
    await page1.goto(newUrlWithPartnerId);

    const authPortal = new AuthPortalPage(page1);
    await page.waitForTimeout(500);
    await authPortal.login(context, MOCK_CREDENTIAL);

    await testSigning(page);
  });
});
