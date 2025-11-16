import { WalletClientSigner } from "@aa-sdk/core";
import { createModularAccountAlchemyClient } from "@account-kit/smart-contracts";
import { alchemy, sepolia } from "@account-kit/infra";
import { type WalletClient, type LocalAccount, http, createWalletClient } from "viem";
import { createParaAccount } from "@getpara/viem-v2-integration";
import { customSignMessage } from "./custom-sign-message";
import type { ParaWeb as Para } from "@getpara/react-sdk";
import { ALCHEMY_RPC_URL, GAS_POLICY_ID } from "@/config/alchemy";

export async function createParaAlchemyClient(para: Para, salt: bigint) {
  const viemParaAccount: LocalAccount = createParaAccount(para);
  viemParaAccount.signMessage = async ({ message }) => {
    return customSignMessage(para, message);
  };

  const walletClient: WalletClient = createWalletClient({ account: viemParaAccount, transport: http(ALCHEMY_RPC_URL) });

  const walletClientSigner = new WalletClientSigner(walletClient, "wallet");

  const client = await createModularAccountAlchemyClient({
    transport: alchemy({ rpcUrl: ALCHEMY_RPC_URL }),
    chain: sepolia,
    signer: walletClientSigner,
    policyId: GAS_POLICY_ID,
    salt,
  });
  return client;
}
