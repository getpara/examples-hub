import ParaTestToken from "@/contracts/artifacts/src/contracts/ParaTestToken.sol/ParaTestToken.json";

export const PARA_TEST_TOKEN = {
  address: "0x83cC70475A0d71EF1F2F61FeDE625c8C7E90C3f2",
  abi: ParaTestToken.abi,
  bytecode: ParaTestToken.bytecode,
  owner: "0x0f35268de976323e06f5aed6f366b490d9b17750",
  symbol: "CTT",
} as const;

export const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];
