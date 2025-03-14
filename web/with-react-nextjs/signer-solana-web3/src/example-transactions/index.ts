import MessageSigning from "./message-signing";
import SolTransfer from "./sol-transfer";
import TokenTransfer from "./token-transfer";
import ProgramDeployment from "./program-deployment";
import ProgramInteraction from "./program-interaction";
import BatchInstructions from "./batch-instructions";

export type TransactionID = "message-signing" | "sol-transfer";
// | "token-transfer"
// | "program-deployment"
// | "program-interaction"
// | "batch-instructions";

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
  // "program-deployment": {
  //   title: "Program Deployment",
  //   description:
  //     "Deploy your own instance of the ParaTestToken program written with Anchor. Understand the deployment process, program ID generation, and error handling.",
  //   path: "/example-transactions/program-deployment",
  //   component: ProgramDeployment,
  // },
  // "token-transfer": {
  //   title: "Token Transfer",
  //   description:
  //     "Transfer tokens between addresses using our ParaTestToken program. Understand token decimals, allowances, and balances.",
  //   path: "/example-transactions/token-transfer",
  //   component: TokenTransfer,
  // },
  // "program-interaction": {
  //   title: "Program Interaction",
  //   description:
  //     "Interact with deployed ParaTestToken program functions. Explore different types of program calls, state changes, and error handling.",
  //   path: "/example-transactions/program-interaction",
  //   component: ProgramInteraction,
  // },
  // "batch-instructions": {
  //   title: "Batch Instructions",
  //   description:
  //     "Execute multiple instructions in a single transaction. Save gas and ensure atomic execution of related operations.",
  //   path: "/example-transactions/batch-instructions",
  //   component: BatchInstructions,
  // },
};

export const PARA_TEST_TOKEN_CONTRACT_OWNER = "0x0f35268de976323e06f5aed6f366b490d9b17750";
export const PARA_TEST_TOKEN_CONTRACT_ADDRESS = "0x83cC70475A0d71EF1F2F61FeDE625c8C7E90C3f2";
