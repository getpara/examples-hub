import ParaTestToken from "@/contracts/artifacts/src/contracts/ParaTestToken.sol/ParaTestToken.json";
import type { Abi } from "viem";

export const PARA_TEST_TOKEN_ADDRESS = "0xeea2b6fa12842ba9b7bb18e86af73a2d3f5f9c57" as const;
export const PARA_TEST_TOKEN_ABI = ParaTestToken.abi as Abi;
export const PARA_TEST_TOKEN_BYTECODE = ParaTestToken.bytecode as `0x${string}`;

// Standard ERC20 ABI for basic token interactions
export const ERC20_ABI = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
