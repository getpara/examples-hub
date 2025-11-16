import { predictSmartAccountAddress } from "thirdweb/wallets/smart";
import { createParaAccount } from "@getpara/viem-v2-integration";
import { CHAIN, ACCOUNT_FACTORY } from "@/config/thirdweb";
import { thirdwebClient } from "@/lib/thirdweb-client";
import type { ParaWeb as Para } from "@getpara/react-sdk";

export function createParaViemAccount(para: Para) {
  return createParaAccount(para);
}

export async function predictSmartWalletAddress(
  viemParaAccount: ReturnType<typeof createParaAccount>,
  index: number
): Promise<string> {
  try {
    const adminAddress = viemParaAccount.address;

    const accountSalt = `0x${BigInt(index).toString(16).padStart(64, "0")}`;

    const address = await predictSmartAccountAddress({
      client: thirdwebClient,
      chain: CHAIN,
      adminAddress,
      factoryAddress: ACCOUNT_FACTORY,
      accountSalt,
    });

    return address;
  } catch (error) {
    console.error(`[predictSmartWalletAddress] Error predicting address for index ${index}:`, error);
    throw error;
  }
}
