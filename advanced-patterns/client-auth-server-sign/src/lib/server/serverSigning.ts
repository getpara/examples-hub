import { createParaEthersSigner } from "@getpara/ethers-v6-integration";
import { ethers } from "ethers";
import { SEPOLIA } from "@/lib/chain";
import type { ServerSignedTransaction, SigningRequestBody } from "@/lib/signingApi";
import { createParaServerClient } from "@/lib/server/paraServerClient";

export async function signAndBroadcastTransaction({
  session,
  transaction,
}: SigningRequestBody): Promise<ServerSignedTransaction> {
  const transactionFields: ethers.TransactionLike<string> = JSON.parse(transaction);
  const unsignedTransaction = ethers.Transaction.from(transactionFields);

  const para = createParaServerClient();
  await para.importSession(session);

  const provider = new ethers.JsonRpcProvider(SEPOLIA.rpcUrl);
  const signer = createParaEthersSigner({ para, provider });

  const signedTransaction = await signer.signTransaction(unsignedTransaction);
  const response = await provider.broadcastTransaction(signedTransaction);

  return { signedTransaction, transactionHash: response.hash };
}
