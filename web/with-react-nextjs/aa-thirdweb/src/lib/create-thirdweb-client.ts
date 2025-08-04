import { smartWallet } from "thirdweb/wallets";
import { createWalletClient, http, type LocalAccount } from "viem";
import { sepolia } from "viem/chains";
import { createParaAccount } from "@getpara/viem-v2-integration";
import { customSignMessage } from "./custom-sign-message";
import type { ParaWeb as Para } from "@getpara/react-sdk";
import { CHAIN, ACCOUNT_FACTORY } from "@/config/thirdweb";
import { thirdwebClient } from "@/lib/thirdweb-client";
import { viemAdapter } from "thirdweb/adapters/viem";

export async function createParaThirdwebClient(para: Para, walletIndex: bigint) {
  console.log("Creating Para account...");
  const viemParaAccount: LocalAccount = createParaAccount(para);
  console.log("Para account created:", viemParaAccount);

  viemParaAccount.signMessage = async ({ message }) => {
    console.log("Signing message with Para account:", message);
    return customSignMessage(para, message);
  };

  console.log("Creating Para viem client...");
  const viemWalletClient = createWalletClient({
    account: viemParaAccount,
    chain: sepolia,
    transport: http("https://ethereum-sepolia-rpc.publicnode.com"),
  });

  console.log("Viem wallet client created:", viemWalletClient);

  console.log("Adapting viem wallet...");
  const paraWallet = viemAdapter.walletClient.fromViem({
    walletClient: viemWalletClient,
  });

  console.log("Viem wallet adapted to thirdweb wallet:", paraWallet);

  console.log("Getting personal account from Para wallet...");
  // const personalAccount = await paraWallet.getAccount();

  if (!paraWallet) {
    console.error("Failed to get personal account from paraWallet.");
    throw new Error("Failed to get personal account from paraWallet.");
  }

  const salt = `0x${walletIndex.toString(16).padStart(64, "0")}`;
  console.log("Generated salt for smart wallet:", salt);

  console.log("Creating smart wallet...");
  const wallet = smartWallet({
    chain: CHAIN,
    sponsorGas: true,
    factoryAddress: ACCOUNT_FACTORY,
    overrides: {
      accountSalt: salt,
    },
  });

  console.log("Connecting smart wallet...");
  const smartAccount = await wallet.connect({
    client: thirdwebClient,
    personalAccount: paraWallet,
  });

  console.log("Smart account created:", smartAccount.address);

  return {
    account: smartAccount,
    address: smartAccount.address,
    personalAccount: viemParaAccount,
  };
}
