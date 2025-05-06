import AtomTransfer from "./atom-transfer";

export type TransactionID = "atom-transfer";

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
  "atom-transfer": {
    title: "ATOM Transfer",
    description:
      "Send ATOM from one address to another. Learn how to handle basic ATOM transfers, gas estimation, and transaction confirmation.",
    path: "/example-transactions/atom-transfer",
    component: AtomTransfer,
  },
};
