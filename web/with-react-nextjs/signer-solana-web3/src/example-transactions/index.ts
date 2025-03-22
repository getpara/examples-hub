import MessageSigning from "./message-signing";
import SolTransfer from "./sol-transfer";

export type TransactionID = "message-signing" | "sol-transfer";

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
};
