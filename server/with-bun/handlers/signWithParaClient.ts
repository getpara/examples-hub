import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { getKeyShareInDB } from "../db/keySharesDB";
import { decrypt } from "../utils/encryption-utils";
import { RLP } from "@ethereumjs/rlp";
import { Buffer } from "buffer";

function toHexString(value: bigint | number): string {
  if (typeof value === "number") {
    if (!Number.isInteger(value) || value < 0) {
      throw new Error("Input must be a non-negative integer or bigint.");
    }
    value = BigInt(value);
  }
  if (value < 0n) {
    throw new Error("Input must be a non-negative integer or bigint.");
  }
  if (value === 0n) {
    return "0x0";
  }
  return `0x${value.toString(16)}`;
}

export const signWithParaPreGen = async (req: Request): Promise<Response> => {
  const { email }: { email: string } = await req.json();

  if (!email) {
    return new Response("Email is required in the request body", { status: 400 });
  }

  const PARA_API_KEY = Bun.env.PARA_API_KEY;

  if (!PARA_API_KEY) {
    console.error("Server configuration error: PARA_API_KEY not set");
    return new Response("Server configuration error", { status: 500 });
  }

  const para = new ParaServer(Environment.BETA, PARA_API_KEY, { disableWebSockets: true, disableWorkers: true });

  try {
    const hasPregenWallet = await para.hasPregenWallet({ pregenIdentifier: email, pregenIdentifierType: "EMAIL" });
    if (!hasPregenWallet) {
      return new Response(`Pregenerated wallet does not exist for ${email}`, { status: 404 });
    }

    const keyShare = getKeyShareInDB(email);
    if (!keyShare) {
      return new Response(`Key share not found in DB for ${email}`, { status: 404 });
    }

    let decryptedKeyShare: string;
    try {
      decryptedKeyShare = await decrypt(keyShare);
    } catch (decryptionError) {
      console.error(`Failed to decrypt key share for ${email}:`, decryptionError);
      return new Response("Failed to process key share", { status: 500 });
    }

    await para.setUserShare(decryptedKeyShare);

    const wallets = await para.getWallets();
    if (!wallets || Object.keys(wallets).length === 0) {
      throw new Error("Failed to load wallet details after setting user share.");
    }

    const wallet = Object.values(wallets)[0];
    const walletId = wallet.id;
    const walletAddress = wallet.address;

    if (!walletId || !walletAddress) {
      throw new Error("Failed to retrieve wallet ID or address.");
    }

    const chainId = "11155111";

    const nonce = 0n;
    const gasLimit = 21000n;
    const gasPriceInGwei = 20n;
    const valueInEth = 0n;

    const gasPriceInWei = gasPriceInGwei * 10n ** 9n;
    const valueInWei = valueInEth * 10n ** 18n;

    const demoRawTxData = {
      nonce: toHexString(nonce),
      gasPrice: toHexString(gasPriceInWei),
      gasLimit: toHexString(gasLimit),
      to: walletAddress,
      value: toHexString(valueInWei),
      data: "0x",
    };

    const txFields = [
      demoRawTxData.nonce,
      demoRawTxData.gasPrice,
      demoRawTxData.gasLimit,
      demoRawTxData.to,
      demoRawTxData.value,
      demoRawTxData.data,
      toHexString(BigInt(chainId)),
      "0x",
      "0x",
      "0x",
    ];

    const rlpEncodedTx = RLP.encode(txFields);
    const rlpEncodedTxBase64 = Buffer.from(rlpEncodedTx).toString("base64");

    const signTransactionResult = await para.signTransaction({ walletId, rlpEncodedTxBase64, chainId });

    if ("error" in signTransactionResult) {
      throw new Error(`Para signTransaction failed: ${signTransactionResult.error}`);
    }

    return new Response(JSON.stringify({ route: "signWithParaPreGen", signTransactionResult }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error(`Error during signWithParaPreGen process for ${email}:`, error);
    return new Response(
      `Failed to sign with Para client: ${error instanceof Error ? error.message : "Unknown error"}`,
      {
        status: 500,
      }
    );
  }
};
