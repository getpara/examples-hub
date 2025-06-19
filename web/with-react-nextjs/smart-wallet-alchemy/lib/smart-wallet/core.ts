import { WalletClientSigner } from "@aa-sdk/core";
import { createModularAccountAlchemyClient } from "@account-kit/smart-contracts";
import { alchemy, sepolia } from "@account-kit/infra";
import { keccak256, toHex, type WalletClient, type LocalAccount, http } from "viem";
import { createParaAccount, createParaViemClient } from "@getpara/viem-v2-integration";
import { customSignMessage } from "./signature-utils";
import type { ParaWeb as Para } from "@getpara/react-sdk";
import { publicClient } from "@/lib/viem-client";
import { MAX_SMART_WALLETS_PER_EOA } from "@/constants/smart-wallet";

const GAS_POLICY_ID = process.env.NEXT_PUBLIC_ALCHEMY_GAS_POLICY_ID || "";
console.log(`[createParaAlchemyClient] Using GAS_POLICY_ID: ${GAS_POLICY_ID}`);
const ALCHEMY_RPC_URL = process.env.NEXT_PUBLIC_ALCHEMY_SEPOLIA_RPC || "";
console.log(`[createParaAlchemyClient] Using ALCHEMY_RPC_URL: ${ALCHEMY_RPC_URL}`);

// In-memory cache for wallet addresses to avoid duplicate RPC calls
const walletAddressCache = new Map<string, string>();

export function generateSalt(walletId: string, index: number): bigint {
  console.log(`[generateSalt] Generating salt for walletId: ${walletId}, index: ${index}`);
  const salt = BigInt(keccak256(toHex(`${walletId}-${index}`)));
  console.log(`[generateSalt] Generated salt: ${salt.toString()}`);
  return salt;
}

export async function createParaAlchemyClient(para: Para, salt: bigint) {
  console.log(`[createParaAlchemyClient] Creating Para account`);
  const viemParaAccount: LocalAccount = createParaAccount(para);
  viemParaAccount.signMessage = async ({ message }) => {
    console.log(`[createParaAlchemyClient] Custom signing message:`, message);
    return customSignMessage(para, message);
  };

  console.log(`[createParaAlchemyClient] Creating Para viem client`);
  const viemClient: WalletClient = createParaViemClient(para, {
    account: viemParaAccount,
    chain: sepolia,
    transport: http(ALCHEMY_RPC_URL),
  });

  console.log(`[createParaAlchemyClient] Creating WalletClientSigner`);
  const walletClientSigner = new WalletClientSigner(viemClient, "para");

  console.log(`[createParaAlchemyClient] Creating ModularAccountAlchemyClient with salt: ${salt.toString()}`);
  const client = await createModularAccountAlchemyClient({
    transport: alchemy({ rpcUrl: ALCHEMY_RPC_URL }),
    chain: sepolia,
    signer: walletClientSigner,
    policyId: GAS_POLICY_ID,
    salt,
  });
  console.log(`[createParaAlchemyClient] ModularAccountAlchemyClient created`);
  return client;
}

export async function getSmartWalletAddress(para: Para, walletId: string, index: number) {
  console.log(`[getSmartWalletAddress] Getting smart wallet address for walletId: ${walletId}, index: ${index}`);

  // Check cache first
  const cacheKey = `${walletId}:${index}`;
  if (walletAddressCache.has(cacheKey)) {
    const cachedAddress = walletAddressCache.get(cacheKey)!;
    console.log(`[getSmartWalletAddress] Using cached address: ${cachedAddress}`);
    return cachedAddress;
  }

  try {
    const salt = generateSalt(walletId, index);
    const client = await createParaAlchemyClient(para, salt);
    const address = client.account.address;

    // Cache the address
    walletAddressCache.set(cacheKey, address);

    console.log(`[getSmartWalletAddress] Smart wallet address: ${address}`);
    return address;
  } catch (error) {
    console.error(`[getSmartWalletAddress] Error getting wallet address:`, error);
    throw error;
  }
}

export async function deploySmartWallet(para: Para, walletId: string, index: number) {
  console.log(`[deploySmartWallet] Deploying smart wallet for walletId: ${walletId}, index: ${index}`);
  const salt = generateSalt(walletId, index);
  const client = await createParaAlchemyClient(para, salt);

  console.log(`[deploySmartWallet] Sending user operation to deploy wallet at address: ${client.account.address}`);
  const result = await client.sendUserOperation({
    uo: {
      target: client.account.address,
      data: "0x",
      value: BigInt(0),
    },
  });

  console.log(`[deploySmartWallet] Waiting for deployment transaction...`);
  const txHash = await client.waitForUserOperationTransaction(result);

  console.log(`[deploySmartWallet] Wallet deployed at address: ${client.account.address}, txHash: ${txHash}`);
  return {
    address: client.account.address,
    deployTxHash: txHash,
  };
}

export async function checkExistingWallets(para: Para, walletId: string) {
  console.log(`[checkExistingWallets] Checking existing wallets for walletId: ${walletId}`);
  const wallets = [];

  try {
    for (let index = 0; index < MAX_SMART_WALLETS_PER_EOA; index++) {
      try {
        console.log(`[checkExistingWallets] Checking wallet at index: ${index}`);
        const address = await getSmartWalletAddress(para, walletId, index);

        const code = await publicClient.getCode({ address: address as `0x${string}` });
        const isDeployed = code && code !== "0x";
        console.log(`[checkExistingWallets] Wallet at index ${index} - address: ${address}, isDeployed: ${isDeployed}`);

        wallets.push({
          address,
          index,
          isDeployed,
        });
      } catch (error) {
        console.error(`[checkExistingWallets] Error checking wallet at index ${index}:`, error);
        // Still add the wallet with error state
        wallets.push({
          address: "",
          index,
          isDeployed: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    console.log(`[checkExistingWallets] Wallets found:`, wallets);
    return wallets;
  } catch (error) {
    console.error(`[checkExistingWallets] Fatal error checking wallets:`, error);
    throw error;
  }
}
