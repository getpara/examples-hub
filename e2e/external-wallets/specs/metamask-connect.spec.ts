import { testWithSynpress } from '@synthetixio/synpress';
import { MetaMask, metaMaskFixtures } from '@synthetixio/synpress-metamask/playwright';
import basicMetaMaskSetup from '../wallet-setup/basic-metamask.setup';
import { ParaModalMetaMaskPage } from '../pages/para-modal-metamask.page';

const test = testWithSynpress(metaMaskFixtures(basicMetaMaskSetup));

const { beforeEach, describe } = test;

describe('Para Modal - MetaMask External Wallet', () => {
  let metamask: MetaMask;
  let paraPage: ParaModalMetaMaskPage;

  beforeEach(async ({ context, metamaskPage, extensionId }) => {
    const page = await context.newPage();
    metamask = new MetaMask(context, metamaskPage, basicMetaMaskSetup.walletPassword, extensionId);
    paraPage = new ParaModalMetaMaskPage(page, metamask);
  });

  test('complete wallet flow: connect → verify → disconnect @metamask', async () => {
    await paraPage.visit();
    await paraPage.connectMetaMask();
    await paraPage.page.waitForTimeout(1000);
    await paraPage.disconnect();
  });
});
