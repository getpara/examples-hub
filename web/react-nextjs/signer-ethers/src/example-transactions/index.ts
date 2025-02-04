import MessageSigning from "./message-signing";
import EthTransfer from "./eth-transfer";
import TokenTransfer from "./token-transfer";
import ContractDeployment from "./contract-deployment";
import ContractInteraction from "./contract-interaction";
import BatchTransactions from "./batch-transactions";
import TypedDataSigning from "./typed-data-signing";
import PermitSigning from "./permit-signing";

// Define the possible transaction IDs as a union type
export type TransactionID =
  | "message-signing"
  | "eth-transfer"
  | "token-transfer"
  | "contract-deployment"
  | "contract-interaction"
  | "batch-transactions"
  | "typed-data-signing"
  | "permit-signing";

// Define the structure for each transaction
export type TransactionType = {
  title: string;
  description: string;
  path: string;
  component: React.ComponentType;
};

// Create the object type with TransactionID keys
export type TransactionsConfig = {
  [K in TransactionID]: TransactionType;
};

// The actual configuration object
export const transactionTypes: TransactionsConfig = {
  "message-signing": {
    title: "Message Signing",
    description:
      "Sign a message with your Para account to prove ownership of an address. This is commonly used for authentication and verifying wallet ownership.",
    path: "/example-transactions/message-signing",
    component: MessageSigning,
  },
  "eth-transfer": {
    title: "ETH Transfer",
    description:
      "Send ETH from one address to another. Learn how to handle basic ETH transfers, gas estimation, and transaction confirmation.",
    path: "/example-transactions/eth-transfer",
    component: EthTransfer,
  },
  "contract-deployment": {
    title: "Contract Deployment",
    description:
      "Deploy your own instance of the ParaTestToken contract. Learn about contract bytecode, constructor arguments, and deployment transactions.",
    path: "/example-transactions/contract-deployment",
    component: ContractDeployment,
  },
  "token-transfer": {
    title: "Token Transfer",
    description:
      "Transfer ERC20 tokens between addresses using our ParaTestToken contract. Understand token decimals, allowances, and balances.",
    path: "/example-transactions/token-transfer",
    component: TokenTransfer,
  },
  "contract-interaction": {
    title: "Contract Interaction",
    description:
      "Interact with deployed ParaTestToken contract functions. Explore different types of contract calls, state changes, and error handling.",
    path: "/example-transactions/contract-interaction",
    component: ContractInteraction,
  },
  "batch-transactions": {
    title: "Batch Transactions",
    description:
      "Execute multiple token operations in a single transaction using Multicall. Save gas and ensure atomic execution of related operations.",
    path: "/example-transactions/batch-transactions",
    component: BatchTransactions,
  },
  "typed-data-signing": {
    title: "Typed Data Signing",
    description:
      "Sign structured data using EIP-712. This is commonly used in DEXs and marketplaces for signing orders and permissions.",
    path: "/example-transactions/typed-data-signing",
    component: TypedDataSigning,
  },
  "permit-signing": {
    title: "Permit Signing",
    description:
      "Create permits for token approvals without requiring a separate transaction. Learn about EIP-2612 permit signatures and gasless approvals.",
    path: "/example-transactions/permit-signing",
    component: PermitSigning,
  },
};

export const PARA_TEST_TOKEN_CONTRACT_ADDRESS = "0x83cC70475A0d71EF1F2F61FeDE625c8C7E90C3f2";
export const PARA_TEST_TOKEN_CONTRACT_OWNER = "0x0f35268de976323e06f5aed6f366b490d9b17750";
