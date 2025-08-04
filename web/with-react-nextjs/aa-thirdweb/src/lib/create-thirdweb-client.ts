import { smartWallet } from "thirdweb/wallets";
import { createWalletClient, http, type LocalAccount } from "viem";
import { createParaAccount } from "@getpara/viem-v2-integration";
import { customSignMessage } from "./custom-sign-message";
import type { ParaWeb as Para } from "@getpara/react-sdk";
import { thirdwebClient, CHAIN } from "@/config/thirdweb";
import { viemAdapter } from "thirdweb/adapters/viem";
import { sepolia } from "viem/chains";

export async function createParaThirdwebClient(para: Para, walletIndex: bigint) {
  const viemParaAccount: LocalAccount = createParaAccount(para);

  viemParaAccount.signMessage = async ({ message }) => {
    return customSignMessage(para, message);
  };

  const viemWalletClient = createWalletClient({
    account: viemParaAccount,
    chain: sepolia,
    transport: http(),
  });

  const paraWallet = viemAdapter.wallet.fromViem({
    walletClient: viemWalletClient,
  });

  const personalAccount = await paraWallet.connect({
    client: thirdwebClient,
  });

  const wallet = smartWallet({
    chain: CHAIN,
    sponsorGas: true,
    overrides: {
      accountSalt: walletIndex.toString(),
    },
  });

  const smartAccount = await wallet.connect({
    client: thirdwebClient,
    personalAccount,
  });

  return {
    account: smartAccount,
    address: smartAccount.address,
    personalAccount: viemParaAccount,
  };
}
