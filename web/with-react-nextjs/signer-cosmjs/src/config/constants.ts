import { Environment } from "@getpara/react-sdk";

export const API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY;
export const ENVIRONMENT = Environment.BETA;

// Cosmos chain configuration
export const COSMOS_CHAIN_ID = "cosmoshub-4";
export const COSMOS_RPC_URL = "https://cosmos-rpc.polkachu.com";
export const COSMOS_REST_URL = "https://cosmos-rest.polkachu.com";

// Testnet configuration (for demo purposes)
export const TESTNET_CHAIN_ID = "theta-testnet-001";
export const TESTNET_RPC_URL = "https://rpc.sentry-01.theta-testnet.polypore.xyz";
export const TESTNET_REST_URL = "https://rest.sentry-01.theta-testnet.polypore.xyz";

// Default gas prices
export const DEFAULT_GAS_PRICE = "0.025uatom";
export const DEFAULT_GAS_LIMIT = 200000;

// IBC configuration
export const IBC_TRANSFER_PORT = "transfer";
export const IBC_TRANSFER_CHANNEL = "channel-0"; // Example channel

// Staking configuration
export const MIN_STAKING_AMOUNT = "1000000"; // 1 ATOM in uatom
export const UNBONDING_TIME_DAYS = 21;