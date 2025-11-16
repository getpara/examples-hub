import { createGelatoSmartWalletClient, accounts, type GelatoSmartWalletClient } from "@gelatonetwork/smartwallet";
import { http, createWalletClient, createPublicClient, type LocalAccount, type PublicClient, type Account } from "viem";
import { sepolia } from "viem/chains";
import { createParaAccount } from "@getpara/viem-v2-integration";
import { customSignMessage } from "./custom-sign-message";
import type { ParaWeb as Para } from "@getpara/react-sdk";
import { GELATO_API_KEY } from "@/config/gelato";

// Type for the Gelato client return value
type GelatoClientResult = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: GelatoSmartWalletClient<any, any, any>;
  account: Account;
  address: string;
  publicClient: PublicClient;
};

// Cache for Gelato clients to avoid recreating them
const clientCache = new Map<string, Promise<GelatoClientResult>>();

/**
 * Get a cached Gelato client or create a new one
 * This prevents duplicate client creation for the same wallet and index
 */
export async function getGelatoClient(para: Para, walletIndex: bigint) {
  const wallets = para.getWalletsByType("EVM");
  const walletId = wallets[0]?.id;
  if (!walletId) {
    throw new Error("No EVM wallet found");
  }

  const cacheKey = `${walletId}:${walletIndex}`;
  
  if (!clientCache.has(cacheKey)) {
    clientCache.set(cacheKey, createParaGelatoClient(para, walletIndex));
  }
  
  return clientCache.get(cacheKey)!;
}

export async function createParaGelatoClient(para: Para, walletIndex: bigint) {
  const viemParaAccount: LocalAccount = createParaAccount(para);
  viemParaAccount.signMessage = async ({ message }) => {
    return customSignMessage(para, message);
  };

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(),
  });

  // Create Gelato kernel account with index as salt
  // Disable EIP-7702 to get distinct ERC-4337 addresses instead of EOA address
  const account = await accounts.kernel({
    owner: viemParaAccount,
    client: publicClient,
    index: walletIndex,
    eip7702: false,  // Forces pure ERC-4337 mode for unique counterfactual addresses
  });

  // Create wallet client with the smart account
  const walletClient = createWalletClient({
    account,
    chain: sepolia,
    transport: http(),
  });

  // Create Gelato smart wallet client
  const smartWalletClient = await createGelatoSmartWalletClient(walletClient, {
    apiKey: GELATO_API_KEY,
  });

  return {
    client: smartWalletClient,
    account,
    address: account.address,
    publicClient,
  };
}