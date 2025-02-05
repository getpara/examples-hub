import type { Request, Response, NextFunction } from "express";
import { Capsule as CapsuleServer, Environment } from "@usecapsule/server-sdk";
import { createCapsuleAccount, createCapsuleViemClient } from "@usecapsule/viem-v2-integration";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";

import { WalletClientSigner } from "@alchemy/aa-core";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { createKernelAccount, createKernelAccountClient, createZeroDevPaymasterClient } from "@zerodev/sdk";
import { getEntryPoint, KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { zeroAddress } from "viem";
import { Signer } from "@zerodev/sdk/types";

export async function zerodevSessionSignHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { session } = req.body as { session?: string };
    if (!session) {
      res.status(400).send("Provide `session` in the request body.");
      return;
    }

    const CAPSULE_API_KEY = process.env.CAPSULE_API_KEY;
    const PROJECT_ID = process.env.ZERODEV_PROJECT_ID;
    const BUNDLER_RPC = process.env.ZERODEV_BUNDLER_RPC;
    const PAYMASTER_RPC = process.env.ZERODEV_PAYMASTER_RPC;
    const RPC_URL = process.env.ZERODEV_RPC_URL;

    if (!CAPSULE_API_KEY || !PROJECT_ID || !BUNDLER_RPC || !PAYMASTER_RPC || !RPC_URL) {
      res
        .status(500)
        .send(
          "Check CAPSULE_API_KEY, ZERODEV_PROJECT_ID, ZERODEV_BUNDLER_RPC, ZERODEV_PAYMASTER_RPC, ZERODEV_RPC_URL."
        );
      return;
    }

    // 1. Import the session into Capsule.
    const capsuleClient = new CapsuleServer(Environment.BETA, CAPSULE_API_KEY);
    await capsuleClient.importSession(session);

    // 2. Extract the user’s wallet from Capsule’s session.
    const wallets = await capsuleClient.getWallets();
    const wallet = Object.values(wallets)[0];
    if (!wallet) {
      res.status(500).send("No wallet found for this session.");
      return;
    }

    // 3. Create a viem account & wallet client from the Capsule session.
    const viemCapsuleAccount = createCapsuleAccount(capsuleClient);
    const viemClient = createCapsuleViemClient(capsuleClient, {
      account: viemCapsuleAccount,
      chain: sepolia,
      transport: http(RPC_URL),
    });

    

    // 5. Use the viem-based signer with signerToEcdsaValidator.
    const entryPoint = getEntryPoint("0.7");
    const kernelVersion = KERNEL_V3_1;
    const publicClient = createCapsuleViemClient(capsuleClient, {
      chain: sepolia,
      transport: http("https://rpc-amoy.polygon.technology"),
    });

    const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
      signer: viemClient as Signer,
      entryPoint,
      kernelVersion,
    });

    // 6. Create a Kernel account using the ECDSA validator.
    const account = await createKernelAccount(publicClient, {
      plugins: { sudo: ecdsaValidator },
      entryPoint,
      kernelVersion,
    });

    // 7. Optionally set up paymaster for gas sponsorship.
    const zerodevPaymaster = createZeroDevPaymasterClient({
      chain: sepolia,
      transport: http(PAYMASTER_RPC),
    });

    // 8. Create the Kernel account client.
    const kernelClient = createKernelAccountClient({
      account,
      chain: sepolia,
      bundlerTransport: http(BUNDLER_RPC),
      paymaster: {
        getPaymasterData: (userOperation) => zerodevPaymaster.sponsorUserOperation({ userOperation }),
      },
    });

    // 9. Send a sample UserOp.
    const userOpHash = await kernelClient.sendUserOperation({
      callData: await kernelClient.account.encodeCalls([
        {
          to: zeroAddress,
          value: 0n,
          data: "0x",
        },
      ]),
    });

    // Wait for the UserOp to be included.
    await kernelClient.waitForUserOperationReceipt({
      hash: userOpHash,
      timeout: 1000 * 30,
    });

    res.status(200).json({
      message: "User operation sent using ZeroDev + Capsule (session-based) with viem signer.",
      accountAddress: kernelClient.account.address,
      userOpHash,
    });
  } catch (error) {
    console.error("Error in zerodevSessionSignHandler:", error);
    next(error);
  }
}
