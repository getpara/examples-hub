import { Router } from "express";

import { createPregenWalletHandler } from "./examples/pregen/pregen-create.js";
import { ethersPregenSignHandler } from "./examples/ethers/pregen.js";
import { ethersSessionSignHandler } from "./examples/ethers/session.js";
import { viemPregenSignHandler } from "./examples/viem/pregen.js";
import { viemSessionSignHandler } from "./examples/viem/session.js";
import { cosmjsPregenSignHandler } from "./examples/cosmjs/pregen.js";
import { cosmjsSessionSignHandler } from "./examples/cosmjs/session.js";
import { solanaPregenSignHandler } from "./examples/solana-web3/pregen.js";
import { solanaSessionSignHandler } from "./examples/solana-web3/session.js";
import { alchemyPregenSignHandler } from "./examples/alchemy-aa/pregen.js";
import { alchemySessionSignHandler } from "./examples/alchemy-aa/session.js";
import { zerodevPregenSignHandler } from "./examples/zerodev/pregen.js";
import { zerodevSessionSignHandler } from "./examples/zerodev/session.js";
import { alchemyEip7702SignHandler } from "./examples/alchemy-aa/eip7702.js";
import { zerodevEip7702SignHandler } from "./examples/zerodev/eip7702.js";

const router = Router();

router.post("/examples/wallets/pregen/create", createPregenWalletHandler);
router.post("/examples/ethers/pregen", ethersPregenSignHandler);
router.post("/examples/ethers/session", ethersSessionSignHandler);
router.post("/examples/viem/pregen", viemPregenSignHandler);
router.post("/examples/viem/session", viemSessionSignHandler);
router.post("/examples/cosmjs/pregen", cosmjsPregenSignHandler);
router.post("/examples/cosmjs/session", cosmjsSessionSignHandler);
router.post("/examples/solana-web3/pregen", solanaPregenSignHandler);
router.post("/examples/solana-web3/session", solanaSessionSignHandler);
router.post("/examples/alchemy/pregen", alchemyPregenSignHandler);
router.post("/examples/alchemy/session", alchemySessionSignHandler);
router.post("/examples/alchemy/eip7702", alchemyEip7702SignHandler);
router.post("/examples/zerodev/pregen", zerodevPregenSignHandler);
router.post("/examples/zerodev/session", zerodevSessionSignHandler);
router.post("/examples/zerodev/eip7702", zerodevEip7702SignHandler);

export default router;
