import { defineWalletSetup } from '@synthetixio/synpress';
import { MetaMask } from '@synthetixio/synpress-metamask/playwright';

/**
 * Basic MetaMask wallet setup for E2E tests.
 * This creates a fresh wallet with the test seed phrase and configures Sepolia network.
 */

// Test wallet credentials - using environment variables for flexibility
const SEED_PHRASE = process.env.TEST_WALLET_SEED_PHRASE || 'test test test test test test test test test test test junk';
const PASSWORD = process.env.TEST_WALLET_PASSWORD || 'Tester@1234';

export default defineWalletSetup(PASSWORD, async (context, walletPage) => {
  const metamask = new MetaMask(context, walletPage, PASSWORD);

  // Import wallet using seed phrase
  await metamask.importWallet(SEED_PHRASE);
});
