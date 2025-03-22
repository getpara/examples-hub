import ProgramCreateToken from "./program-create-token";
import ProgramMintToken from "./program-mint-token";
import { PublicKey } from "@solana/web3.js";

export type TransactionID = "program-create-token" | "program-mint-token";

export type TransactionType = {
  title: string;
  description: string;
  path: string;
  component: React.ComponentType;
};

export type TransactionsConfig = {
  [K in TransactionID]: TransactionType;
};

export const transactionTypes: TransactionsConfig = {
  "program-create-token": {
    title: "Program Create Token",
    description:
      "Deploy your own instance of a token program and mint tokens. Understand how to deploy programs and interact with them.",
    path: "/example-transactions/program-create-token",
    component: ProgramCreateToken,
  },
  "program-mint-token": {
    title: "Program Mint Token",
    description:
      "Interact with deployed programs to mint tokens. Learn how to call program methods and handle the responses.",
    path: "/example-transactions/program-mint-token",
    component: ProgramMintToken,
  },
};

export const PROGRAM_ID = new PublicKey("7aZTQdMeajFATgMKS7h7mGWVqh1UaRnWt1Pf8mnvBDkk");
