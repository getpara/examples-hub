import MessageSigning from "./message-signing";
import SolTransfer from "./sol-transfer";
import ProgramCreateToken from "./program-create-token";
import ProgramMintToken from "./program-mint-token";
import { PublicKey } from "@solana/web3.js";

export type TransactionID = "message-signing" | "sol-transfer" | "program-create-token" | "program-mint-token";

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
  "message-signing": {
    title: "Message Signing",
    description:
      "Sign a message with your Para account. This is used for signing arbitrary data and off-chain messages.",
    path: "/example-transactions/message-signing",
    component: MessageSigning,
  },
  "sol-transfer": {
    title: "SOL Transfer",
    description:
      "Send SOL from one address to another. Learn how to handle basic SOL transfers, gas estimation, and transaction confirmation.",
    path: "/example-transactions/sol-transfer",
    component: SolTransfer,
  },
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
export const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
