import type { NextFunction, Request, Response } from "express";
import { Para as ParaServer, Environment, SuccessfulSignatureRes, hexStringToBase64 } from "@getpara/server-sdk";
import { getKeyShareInDB } from "../../db/keySharesDB.js";
import { decrypt } from "../../utils/encryption-utils.js";
import { createParaAccount, createParaViemClient } from "@getpara/viem-v2-integration";
import { hashMessage, http } from "viem";
import type { WalletClient, LocalAccount, SignableMessage, Hash } from "viem";
import { createModularAccountAlchemyClient } from "@alchemy/aa-alchemy";
import { BatchUserOperationCallData, WalletClientSigner, arbitrumSepolia } from "@alchemy/aa-core";
import { encodeFunctionData } from "viem";
import Example from "../../artifacts/Example.json" assert { type: "json" };

const EXAMPLE_CONTRACT_ADDRESS = "0x7920b6d8b07f0b9a3b96f238c64e022278db1419";

/**
 * Use this handler when you want to sign and send transactions using a pre-generated Para wallet integrated with Alchemy's AA.
 *
 * Steps for developers:
 * 1. Ensure the user's pre-generated wallet and key share are already created and stored (see `pregen-create.ts`).
 * 2. Retrieve the user's email from `req.body` and confirm their pre-generated wallet exists in Para.
 * 3. Decrypt the user's key share and provide it to Para so that message signing is enabled.
 * 4. Create a Viem WalletClient that uses Para for signing, and integrate it with the Alchemy AA client.
 * 5. Construct your user operations (e.g., calls to a contract function) and submit them via the Alchemy AA client.
 *
 * Note: This is a minimal example focusing on the integration with Para and Alchemy.
 * You should implement proper authentication, authorization, error handling, and environment variable management as needed.
 */
export async function alchemyPregenSignHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // The developer should ensure that 'email' is provided by the client.
    // This email is used to look up the user's pre-generated wallet and key share.
    const { email } = req.body as { email?: string };
    if (!email) {
      res.status(400).send("Email is required.");
      return;
    }

    // Make sure the necessary environment variables are set:
    // PARA_API_KEY: Your Para API key.
    // ALCHEMY_API_KEY & ALCHEMY_GAS_POLICY_ID: Used by the Alchemy client.
    const PARA_API_KEY = process.env.PARA_API_KEY;
    const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
    const ALCHEMY_GAS_POLICY_ID = process.env.ALCHEMY_GAS_POLICY_ID;

    if (!PARA_API_KEY) {
      res.status(500).send("PARA_API_KEY is not set.");
      return;
    }

    if (!ALCHEMY_API_KEY || !ALCHEMY_GAS_POLICY_ID) {
      res.status(500).send("ALCHEMY_API_KEY or ALCHEMY_GAS_POLICY_ID is not set.");
      return;
    }

    // Initialize the Para client. By default, we're using the BETA environment here.
    const para = new ParaServer(Environment.BETA, PARA_API_KEY);

    // Confirm that a pre-generated wallet exists for the provided email.
    // If not, prompt the user to create one (e.g., using the `pregen-create.ts` example).
    const hasPregenWallet = await para.hasPregenWallet({ pregenIdentifier: email, pregenIdentifierType: "EMAIL" });
    if (!hasPregenWallet) {
      res.status(400).send("No pre-generated wallet found for this email. Ask the user to create one first.");
      return;
    }

    // Retrieve the user's key share from your database. This share, combined with Para's share, enables signing.
    const keyShare = await getKeyShareInDB(email);
    if (!keyShare) {
      res.status(400).send("Key share not found. Ensure the wallet initialization process was completed.");
      return;
    }

    // Decrypt the key share before providing it to Para.
    const decryptedKeyShare = decrypt(keyShare);
    await para.setUserShare(decryptedKeyShare);

    // Create a Viem account and WalletClient that leverages Para for signing.
    // Use a suitable RPC endpoint for your chain—in this example, Arbitrum Sepolia.
    const viemParaAccount: LocalAccount = createParaAccount(para);
    const viemClient: WalletClient = createParaViemClient(para, {
      account: viemParaAccount,
      chain: arbitrumSepolia,
      transport: http("https://arbitrum-sepolia-rpc.publicnode.com"),
    });

    // Override the signMessage method to adjust the `v` parameter of the signature.
    // This is needed because Para's MPC-based signatures may produce a `v` not aligned with standard expectations.
    viemClient.signMessage = async ({ message }: { message: SignableMessage }): Promise<Hash> => {
      return customSignMessage(para, message);
    };

    // Wrap the viem client in a WalletClientSigner to integrate with Alchemy's AA client.
    const walletClientSigner = new WalletClientSigner(viemClient, "para");

    // Initialize the Alchemy AA client using the Para-backed signer.
    // Configure your chain, apiKey, and gas policy as needed.
    const alchemyClient = await createModularAccountAlchemyClient({
      apiKey: ALCHEMY_API_KEY,
      chain: arbitrumSepolia,
      signer: walletClientSigner,
      gasManagerConfig: {
        policyId: ALCHEMY_GAS_POLICY_ID,
      },
    });

    // Prepare the calls you want to batch into a single user operation.
    // Here, we're calling `changeX` on the Example contract multiple times to demonstrate batch operations.
    const demoUserOperations: BatchUserOperationCallData = [1, 2, 3, 4, 5].map((x) => ({
      target: EXAMPLE_CONTRACT_ADDRESS,
      data: encodeFunctionData({
        abi: Example["contracts"]["contracts/Example.sol:Example"]["abi"],
        functionName: "changeX",
        args: [x],
      }),
    }));

    // Send the user operation to Alchemy's AA service.
    // The result includes details you can use to track transaction execution on-chain.
    const userOperationResult = await alchemyClient.sendUserOperation({ uo: demoUserOperations });

    res.status(200).json({
      message: "User operation sent using Alchemy + Para with a pre-generated wallet (Viem-based).",
      userOperationResult,
    });
  } catch (error) {
    console.error("Error in alchemyPregenSignHandler:", error);
    next(error);
  }
}

/**
 * Use this custom signMessage function to adjust the `v` value in Para-generated signatures.
 * Para's MPC signatures may produce a `v` that is not in the standard Ethereum signature format.
 * To ensure compatibility with AA clients and other Ethereum tools, you need to adjust the `v` value to be either 27 * * or 28.
 */
async function customSignMessage(para: ParaServer, message: SignableMessage): Promise<Hash> {
  // Hash the message according to Ethereum's signed message specification.
  const hashedMessage = hashMessage(message);

  // Request the signature from the Para client.
  // This assumes that the pre-generated wallet has been set on the Para client and is ready to sign.
  const res = await para.signMessage({
    walletId: Object.values(para.wallets!)[0]!.id,
    messageBase64: hexStringToBase64(hashedMessage),
  });
  let signature = (res as SuccessfulSignatureRes).signature;

  // Adjust the `v` portion of the signature if it is below 27.
  const lastByte = parseInt(signature.slice(-2), 16);
  if (lastByte < 27) {
    const adjustedV = (lastByte + 27).toString(16).padStart(2, "0");
    signature = signature.slice(0, -2) + adjustedV;
  }

  // Return the updated signature. This ensures that the `v` value is correctly aligned with Ethereum standards.
  return `0x${signature}`;
}
