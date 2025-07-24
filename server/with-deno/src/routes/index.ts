import { type Route } from "@std/http";
import { createWallet } from "./createWallet.ts";
import { signWithEthers } from "./signWithEthers.ts";
import { signWithViem } from "./signWithViem.ts";
import { signWithCosmJS } from "./signWithCosmJS.ts";
import { signWithSolanaWeb3 } from "./signWithSolanaWeb3.ts";
import { signWithAlchemy } from "./signWithAlchemy.ts";
import { signWithAlchemyEIP7702 } from "./signWithAlchemyEIP7702.ts";
import { signWithZerodev } from "./signWithZerodev.ts";
import { signWithZerodevEIP7702 } from "./signWithZerodevEIP7702.ts";

export const routes: Route[] = [
  { pattern: new URLPattern({ pathname: "/wallets/pregen/create" }), method: "POST", handler: createWallet },
  { pattern: new URLPattern({ pathname: "/ethers/pregen" }), method: "POST", handler: signWithEthers },
  { pattern: new URLPattern({ pathname: "/viem/pregen" }), method: "POST", handler: signWithViem },
  { pattern: new URLPattern({ pathname: "/cosmjs/pregen" }), method: "POST", handler: signWithCosmJS },
  { pattern: new URLPattern({ pathname: "/solana-web3/pregen" }), method: "POST", handler: signWithSolanaWeb3 },
  { pattern: new URLPattern({ pathname: "/alchemy/pregen" }), method: "POST", handler: signWithAlchemy },
  { pattern: new URLPattern({ pathname: "/alchemy/eip7702" }), method: "POST", handler: signWithAlchemyEIP7702 },
  { pattern: new URLPattern({ pathname: "/zerodev/pregen" }), method: "POST", handler: signWithZerodev },
  { pattern: new URLPattern({ pathname: "/zerodev/eip7702" }), method: "POST", handler: signWithZerodevEIP7702 },
];
