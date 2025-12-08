import { createKernelAccount, createKernelAccountClient, createZeroDevPaymasterClient } from "@zerodev/sdk";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { http, createWalletClient, createPublicClient, type LocalAccount } from "viem";
import { createParaAccount } from "@getpara/viem-v2-integration";
import { customSignMessage } from "./custom-sign-message";
import type { ParaWeb as Para } from "@getpara/react-sdk";
import { BUNDLER_RPC, PAYMASTER_RPC, PUBLIC_RPC, ENTRY_POINT, KERNEL_VERSION, CHAIN } from "@/config/zerodev";

export async function createParaZeroDevClient(para: Para, walletIndex: bigint) {
  const viemParaAccount: LocalAccount = createParaAccount(para);
  viemParaAccount.signMessage = async ({ message }) => {
    return customSignMessage(para, message);
  };

  const walletClient = createWalletClient({
    account: viemParaAccount,
    chain: CHAIN,
    transport: http(PUBLIC_RPC),
  });

  const publicClient = createPublicClient({
    chain: CHAIN,
    transport: http(PUBLIC_RPC),
  });

  const ecdsaValidator = await signerToEcdsaValidator(walletClient, {
    signer: viemParaAccount,
    entryPoint: ENTRY_POINT,
    kernelVersion: KERNEL_VERSION,
  });

  const kernelAccount = await createKernelAccount(publicClient, {
    plugins: {
      sudo: ecdsaValidator,
    },
    entryPoint: ENTRY_POINT,
    kernelVersion: KERNEL_VERSION,
    index: walletIndex,
  });

  const paymasterClient = createZeroDevPaymasterClient({
    chain: CHAIN,
    transport: http(PAYMASTER_RPC),
  });

  const kernelClient = createKernelAccountClient({
    account: kernelAccount,
    chain: CHAIN,
    bundlerTransport: http(BUNDLER_RPC),
    paymaster: {
      getPaymasterData: (userOperation) => paymasterClient.sponsorUserOperation({ userOperation }),
    },
  });

  return {
    client: kernelClient,
    account: kernelAccount,
    address: kernelAccount.address,
  };
}
