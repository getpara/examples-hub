import { Router } from "express";
import { createPregenWalletHandler } from "./createWallet.js";
import { ethersPregenSignHandler } from "./signWithEthers.js";
import { viemPregenSignHandler } from "./signWithViem.js";
import { cosmjsPregenSignHandler } from "./signWithCosmJS.js";
import { solanaPregenSignHandler } from "./signWithSolanaWeb3.js";
import { alchemyPregenSignHandler } from "./signWithAlchemy.js";
import { zerodevPregenSignHandler } from "./signWithZerodev.js";
import { alchemyEip7702SignHandler } from "./signWithAlchemyEIP7702.js";
import { zerodevEip7702SignHandler } from "./signWithZerodevEIP7702.js";

const router = Router();

router.post("/wallets/pregen/create", createPregenWalletHandler);
router.post("/ethers/pregen", ethersPregenSignHandler);
router.post("/viem/pregen", viemPregenSignHandler);
router.post("/cosmjs/pregen", cosmjsPregenSignHandler);
router.post("/solana-web3/pregen", solanaPregenSignHandler);
router.post("/alchemy/pregen", alchemyPregenSignHandler);
router.post("/alchemy/eip7702", alchemyEip7702SignHandler);
router.post("/zerodev/pregen", zerodevPregenSignHandler);
router.post("/zerodev/eip7702", zerodevEip7702SignHandler);

export { router };
