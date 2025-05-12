import { type Route } from "@std/http";
import { createWallet } from "./handlers/createWallet.ts";
import { signWithEthers } from "./handlers/signWithEthers.ts";
import { signWithViem } from "./handlers/signWithViem.ts";
import { signWithCosmJS } from "./handlers/signWithCosmJS.ts";
import { signWithSolanaWeb3 } from "./handlers/signWithSolanaWeb3.ts";
import { signWithAlchemy } from "./handlers/signWithAlchemy.ts";

export const routes: Route[] = [
  { pattern: new URLPattern({ pathname: "/examples/wallets/pregen/create" }), method: "POST", handler: createWallet },
  { pattern: new URLPattern({ pathname: "/examples/ethers/pregen" }), method: "POST", handler: signWithEthers },
  { pattern: new URLPattern({ pathname: "/examples/viem/pregen" }), method: "POST", handler: signWithViem },
  { pattern: new URLPattern({ pathname: "/examples/cosmjs/pregen" }), method: "POST", handler: signWithCosmJS },
  {
    pattern: new URLPattern({ pathname: "/examples/solana-web3/pregen" }),
    method: "POST",
    handler: signWithSolanaWeb3,
  },
  { pattern: new URLPattern({ pathname: "/examples/alchemy/pregen" }), method: "POST", handler: signWithAlchemy },
];
