export interface CosmosChain {
  chainId: string;
  chainName: string;
  rpc: string;
  rest: string;
  bech32Prefix: string;
  coinDenom: string;
  coinMinimalDenom: string;
  coinDecimals: number;
  gasPrice: string;
}

export const COSMOS_MAINNET: CosmosChain = {
  chainId: "cosmoshub-4",
  chainName: "Cosmos Hub",
  rpc: "https://cosmos-rpc.polkachu.com",
  rest: "https://cosmos-rest.polkachu.com",
  bech32Prefix: "cosmos",
  coinDenom: "ATOM",
  coinMinimalDenom: "uatom",
  coinDecimals: 6,
  gasPrice: "0.025uatom",
};

export const COSMOS_TESTNET: CosmosChain = {
  chainId: "theta-testnet-001",
  chainName: "Cosmos Testnet",
  rpc: "https://rpc.sentry-01.theta-testnet.polypore.xyz",
  rest: "https://rest.sentry-01.theta-testnet.polypore.xyz",
  bech32Prefix: "cosmos",
  coinDenom: "ATOM",
  coinMinimalDenom: "uatom",
  coinDecimals: 6,
  gasPrice: "0.025uatom",
};

// Default to testnet for demo purposes
export const DEFAULT_CHAIN = COSMOS_TESTNET;