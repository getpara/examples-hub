import type { ParaWeb as Para } from "@getpara/react-sdk";
import { generateSalt } from "./generate-salt";
import { createParaAlchemyClient } from "./create-alchemy-client";

export async function deploySmartWallet(para: Para, walletId: string, index: number) {
  const salt = generateSalt(walletId, index);
  const client = await createParaAlchemyClient(para, salt);

  const result = await client.sendUserOperation({
    uo: {
      target: client.account.address,
      data: "0x",
      value: BigInt(0),
    },
  });

  const txHash = await client.waitForUserOperationTransaction(result);

  return {
    address: client.account.address,
    deployTxHash: txHash,
  };
}
