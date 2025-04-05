import type { NextFunction, Request, Response } from "express";
import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { createParaAccount, createParaViemClient } from "@getpara/viem-v2-integration";
import { http, parseEther, parseGwei } from "viem";
import { sepolia } from "viem/chains";

export async function viemSessionSignHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const session = req.body.session as string | undefined;

    if (!session) {
      res.status(400).send("Provide `session` in the request body.");
      return;
    }

    const paraApiKey = process.env.PARA_API_KEY;
    if (!paraApiKey) {
      res.status(500).send("PARA_API_KEY is not set.");
      return;
    }

    const para = new ParaServer(Environment.BETA, paraApiKey);
    await para.importSession(session);

    const viemParaAccount = createParaAccount(para);
    const viemClient = createParaViemClient(para, {
      account: viemParaAccount,
      chain: sepolia,
      transport: http("https://ethereum-sepolia-rpc.publicnode.com"),
    });

    const request = await viemClient.prepareTransactionRequest({
      account: viemParaAccount,
      to: viemParaAccount.address,
      value: parseEther("0.0001"),
      gas: 21000n,
      maxFeePerGas: parseGwei("20"),
      maxPriorityFeePerGas: parseGwei("3"),
      chain: sepolia,
    });

    const signedTxRlp = await viemClient.signTransaction(request);

    res.status(200).json({
      message: "Transaction signed using Viem + Para (session-based wallet).",
      signedTxRlp: signedTxRlp,
    });
  } catch (error) {
    console.error("Error in viemSessionSignHandler:", error);
    next(error);
  }
}
