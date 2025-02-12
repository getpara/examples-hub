import { type Route } from "@std/http";
import { createWallet } from "./handlers/createWallet.ts";
import { signWithEthers } from "./handlers/signWithEthers.ts";
import { signWithViem } from "./handlers/signWithViem.ts";
import { signWithCosmJS } from "./handlers/signWithCosmJS.ts";
import { signWithSolanaWeb3 } from "./handlers/signWithSolanaWeb3.ts";
import { signWithAlchemy } from "./handlers/signWithAlchemy.ts";
import { signWithParaPreGen } from "./handlers/signWithParaClient.ts";
import { signWithParaSession } from "./handlers/signWithParaSession.ts";

export const routes: Route[] = [
  { pattern: new URLPattern({ pathname: "/wallets/create" }), method: "POST", handler: createWallet },
  {
    pattern: new URLPattern({ pathname: "/wallets/sign/paraPreGen" }),
    method: "POST",
    handler: signWithParaPreGen,
  },
  {
    pattern: new URLPattern({ pathname: "/wallets/sign/paraSession" }),
    method: "POST",
    handler: signWithParaSession,
  },
  { pattern: new URLPattern({ pathname: "/wallets/sign/ethers" }), method: "POST", handler: signWithEthers },
  { pattern: new URLPattern({ pathname: "/wallets/sign/viem" }), method: "POST", handler: signWithViem },
  { pattern: new URLPattern({ pathname: "/wallets/sign/cosmjs" }), method: "POST", handler: signWithCosmJS },
  { pattern: new URLPattern({ pathname: "/wallets/sign/solana-web3" }), method: "POST", handler: signWithSolanaWeb3 },
  { pattern: new URLPattern({ pathname: "/wallets/sign/alchemy" }), method: "POST", handler: signWithAlchemy },
];
