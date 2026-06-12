import { createSmartAccountClient } from "permissionless";
import { toSafeSmartAccount } from "permissionless/accounts";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import { createPublicClient, http, type Address, type Chain, type Hex, type LocalAccount, type PublicClient, type TransactionReceipt } from "viem";
import { entryPoint07Address } from "viem/account-abstraction";

interface CreateSafe4337ClientOptions {
  owner: LocalAccount;
  chain: Chain;
  rpcUrl: string;
  pimlicoApiKey: string;
  safeAddress?: Address;
}

interface SafeCall {
  to: Address;
  value?: bigint;
  data?: Hex;
}

export interface Safe4337Client {
  address: Address;
  publicClient: PublicClient;
  sendTransaction: (call: SafeCall) => Promise<TransactionReceipt>;
  sendBatchTransaction: (calls: SafeCall[]) => Promise<TransactionReceipt>;
}

function buildPimlicoRpcUrl(chain: Chain, apiKey: string) {
  const chainSlug = chain.name.toLowerCase().replace(/\s+/g, "-");
  return `https://api.pimlico.io/v2/${chainSlug}/rpc?apikey=${apiKey}`;
}

export async function createSafe4337Client({
  owner,
  chain,
  rpcUrl,
  pimlicoApiKey,
  safeAddress,
}: CreateSafe4337ClientOptions): Promise<Safe4337Client> {
  const pimlicoRpcUrl = buildPimlicoRpcUrl(chain, pimlicoApiKey);
  const publicClient = createPublicClient({ chain, transport: http(rpcUrl) });
  const paymasterClient = createPimlicoClient({
    entryPoint: {
      address: entryPoint07Address,
      version: "0.7",
    },
    transport: http(pimlicoRpcUrl),
  });

  const safeAccount = await toSafeSmartAccount({
    client: publicClient,
    owners: [owner],
    entryPoint: {
      address: entryPoint07Address,
      version: "0.7",
    },
    version: "1.4.1",
    ...(safeAddress ? { address: safeAddress } : {}),
  });

  const client = createSmartAccountClient({
    account: safeAccount,
    chain,
    paymaster: paymasterClient,
    bundlerTransport: http(pimlicoRpcUrl),
    userOperation: {
      estimateFeesPerGas: async () => (await paymasterClient.getUserOperationGasPrice()).fast,
    },
  });

  const waitForReceipt = async (hash: Hex) => {
    if ("waitForTransactionReceipt" in client && typeof client.waitForTransactionReceipt === "function") {
      return client.waitForTransactionReceipt({ hash });
    }

    return publicClient.waitForTransactionReceipt({ hash });
  };

  const sendBatchTransaction = async (calls: SafeCall[]) => {
    const hash = await client.sendTransaction({
      account: client.account,
      chain: client.chain,
      calls,
    });

    return waitForReceipt(hash);
  };

  return {
    address: safeAccount.address,
    publicClient,
    sendTransaction: (call) => sendBatchTransaction([call]),
    sendBatchTransaction,
  };
}
