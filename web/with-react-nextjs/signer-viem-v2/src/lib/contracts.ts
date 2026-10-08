import type { Abi } from "viem";
import ParaTestToken from "@/contracts/artifacts/src/contracts/ParaTestToken.sol/ParaTestToken.json";

export const PARA_TEST_TOKEN = {
  address: "0xeea2b6fa12842ba9b7bb18e86af73a2d3f5f9c57",
  abi: ParaTestToken.abi as Abi,
  bytecode: ParaTestToken.bytecode as `0x${string}`,
  symbol: "CTT",
} as const;

export const DEFAULT_TRANSFER_TOKEN_ADDRESS = "0x83cC70475A0d71EF1F2F61FeDE625c8C7E90C3f2";

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
