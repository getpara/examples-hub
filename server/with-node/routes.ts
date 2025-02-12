import { Router } from "express";

import { createPregenWalletHandler } from "./examples/wallets/pregen-create.js";
import { paraPregenSignHandler } from "./examples/para/pregen.js";
import { paraSessionSignHandler } from "./examples/para/session.js";
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

const router = Router();

/**
 * Use these routes to demonstrate various workflows with Para and different integrations (Ethers, Viem, CosmJS, Solana-Web3, Alchemy-AA).
 * Each endpoint focuses on a specific scenario (pre-generated wallets vs session-based wallets) and technology stack.
 *
 * Before calling these routes, ensure you meet any prerequisites mentioned in their comments (e.g., having a pre-generated wallet, setting environment variables, or exporting a session).
 */

// Wallet creation route for pre-generated wallets.
router.post("/examples/wallets/pregen/create", createPregenWalletHandler);

// Para-only signing examples
router.post("/examples/para/pregen", paraPregenSignHandler);
router.post("/examples/para/session", paraSessionSignHandler);

// Ethers signing examples
router.post("/examples/ethers/pregen", ethersPregenSignHandler);
router.post("/examples/ethers/session", ethersSessionSignHandler);

// Viem signing examples
router.post("/examples/viem/pregen", viemPregenSignHandler);
router.post("/examples/viem/session", viemSessionSignHandler);

// CosmJS signing examples
router.post("/examples/cosmjs/pregen", cosmjsPregenSignHandler);
router.post("/examples/cosmjs/session", cosmjsSessionSignHandler);

// Solana-Web3 signing examples
router.post("/examples/solana-web3/pregen", solanaPregenSignHandler);
router.post("/examples/solana-web3/session", solanaSessionSignHandler);

// Alchemy-AA signing examples
router.post("/examples/alchemy/pregen", alchemyPregenSignHandler);
router.post("/examples/alchemy/session", alchemySessionSignHandler);

export default router;
