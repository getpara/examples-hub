import { createWallet } from "./handlers/createWallet";
import { signWithEthers } from "./handlers/signWithEthers";
import { signWithViem } from "./handlers/signWithViem";
import { signWithCosmJS } from "./handlers/signWithCosmJS";
import { signWithSolanaWeb3 } from "./handlers/signWithSolanaWeb3";
import { signWithAlchemy } from "./handlers/signWithAlchemy";

export const routes = [
  { path: "/examples/wallets/pregen/create", method: "POST", handler: createWallet },
  { path: "/examples/ethers/pregen", method: "POST", handler: signWithEthers },
  { path: "/examples/viem/pregen", method: "POST", handler: signWithViem },
  { path: "/examples/cosmjs/pregen", method: "POST", handler: signWithCosmJS },
  { path: "/examples/solana-web3/pregen", method: "POST", handler: signWithSolanaWeb3 },
  { path: "/examples/alchemy/pregen", method: "POST", handler: signWithAlchemy },
];
