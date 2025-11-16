import { createWallet } from "./createWallet.js";
import { signWithEthers } from "./signWithEthers.js";
import { signWithViem } from "./signWithViem.js";
import { signWithCosmJS } from "./signWithCosmJS.js";
import { signWithSolanaWeb3 } from "./signWithSolanaWeb3.js";
import { signWithAlchemy } from "./signWithAlchemy.js";
import { signWithZerodev } from "./signWithZerodev.js";
import { signWithAlchemyEIP7702 } from "./signWithAlchemyEIP7702.js";
import { signWithZerodevEIP7702 } from "./signWithZerodevEIP7702.js";

export const routes = [
  { path: "/wallets/pregen/create", method: "POST", handler: createWallet },
  { path: "/ethers/pregen", method: "POST", handler: signWithEthers },
  { path: "/viem/pregen", method: "POST", handler: signWithViem },
  { path: "/cosmjs/pregen", method: "POST", handler: signWithCosmJS },
  { path: "/solana-web3/pregen", method: "POST", handler: signWithSolanaWeb3 },
  { path: "/alchemy/pregen", method: "POST", handler: signWithAlchemy },
  { path: "/alchemy/eip7702", method: "POST", handler: signWithAlchemyEIP7702 },
  { path: "/zerodev/pregen", method: "POST", handler: signWithZerodev },
  { path: "/zerodev/eip7702", method: "POST", handler: signWithZerodevEIP7702 },
];
