import { test, expect } from "@playwright/test";
import * as crypto from "node:crypto";
import { logger } from "../../../helpers/logger";

const baseURL = process.env.BASE_URL || "http://localhost:4000";

function randomEmail(): string {
  const randomHex = crypto.randomBytes(5).toString("hex");
  return `teste2e+${randomHex}@test.usecapsule.com`;
}

async function pollUntilReady(request: any, walletId: string, maxAttempts = 15): Promise<any> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const getRes = await request.get(`${baseURL}/rest/wallets/${walletId}`);
    expect(getRes.ok()).toBeTruthy();
    const walletData = await getRes.json();
    logger.logStep(`Poll attempt ${i + 1}: status=${walletData.status}`);
    if (walletData.status === "ready") {
      return walletData;
    }
  }
  throw new Error("Wallet did not become ready in time");
}

test.describe("REST API - Partner Wallets", () => {
  test.describe("Happy Path", () => {
    test("EVM wallet - create, poll, sign", async ({ request }) => {
      const userIdentifier = randomEmail();

      // 1. Create wallet
      logger.logStep(`Creating EVM wallet for: ${userIdentifier}`);
      const createRes = await request.post(`${baseURL}/rest/wallets`, {
        data: { type: "EVM", userIdentifier, userIdentifierType: "EMAIL" },
      });

      expect(createRes.status()).toBe(201);
      const { wallet, scheme } = await createRes.json();
      expect(wallet.status).toBe("creating");
      expect(scheme).toBe("DKLS");
      logger.logStep("Wallet created", true);

      // 2. Poll until ready
      logger.logStep("Polling wallet status...");
      const walletData = await pollUntilReady(request, wallet.id);
      expect(walletData.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(walletData.publicKey).toBeDefined();
      logger.logStep(`Wallet ready: ${walletData.address}`, true);

      // 3. Sign raw data
      logger.logStep("Signing raw data...");
      const signRes = await request.post(`${baseURL}/rest/wallets/${wallet.id}/sign-raw`, {
        data: { data: "0xdeadbeef" },
      });

      expect(signRes.status()).toBe(200);
      const { signature } = await signRes.json();
      // Signature is raw hex without 0x prefix - ethers/viem handle both formats
      expect(signature).toMatch(/^[a-fA-F0-9]+$/);
      logger.logStep(`Signature received: ${signature.slice(0, 20)}...`, true);
    });

    test("Solana wallet - create with ED25519", async ({ request }) => {
      const userIdentifier = randomEmail();

      logger.logStep(`Creating Solana wallet for: ${userIdentifier}`);
      const createRes = await request.post(`${baseURL}/rest/wallets`, {
        data: { type: "SOLANA", userIdentifier, userIdentifierType: "EMAIL" },
      });

      expect(createRes.status()).toBe(201);
      const { wallet, scheme } = await createRes.json();
      expect(wallet.type).toBe("SOLANA");
      expect(scheme).toBe("ED25519");
      logger.logStep("Solana wallet created", true);

      // Poll until ready
      const walletData = await pollUntilReady(request, wallet.id);
      expect(walletData.address).toBeDefined();
      expect(walletData.publicKey).toBeDefined();
      logger.logStep(`Solana wallet ready: ${walletData.address}`, true);
    });

    // TODO: Enable once ENG-6212 is fixed (Cosmos returns EVM address instead of bech32)
    // test("Cosmos wallet - create with prefix", async ({ request }) => {
    //   const userIdentifier = randomEmail();
    //
    //   logger.logStep(`Creating Cosmos wallet for: ${userIdentifier}`);
    //   const createRes = await request.post(`${baseURL}/rest/wallets`, {
    //     data: {
    //       type: "COSMOS",
    //       userIdentifier,
    //       userIdentifierType: "EMAIL",
    //       cosmosPrefix: "cosmos",
    //     },
    //   });
    //
    //   expect(createRes.status()).toBe(201);
    //   const { wallet, scheme } = await createRes.json();
    //   expect(wallet.type).toBe("COSMOS");
    //   expect(scheme).toBe("DKLS");
    //   logger.logStep("Cosmos wallet created", true);
    //
    //   // Poll until ready
    //   const walletData = await pollUntilReady(request, wallet.id);
    //   expect(walletData.address).toMatch(/^cosmos1/);
    //   expect(walletData.publicKey).toBeDefined();
    //   logger.logStep(`Cosmos wallet ready: ${walletData.address}`, true);
    // });
  });

  test.describe("Error Cases", () => {
    test("409 Conflict - duplicate wallet creation", async ({ request }) => {
      const userIdentifier = randomEmail();

      // First creation should succeed
      logger.logStep("Creating first wallet...");
      const firstRes = await request.post(`${baseURL}/rest/wallets`, {
        data: { type: "EVM", userIdentifier, userIdentifierType: "EMAIL" },
      });
      expect(firstRes.status()).toBe(201);
      logger.logStep("First wallet created", true);

      // Second creation with same type + userIdentifier should fail
      logger.logStep("Attempting duplicate wallet creation...");
      const secondRes = await request.post(`${baseURL}/rest/wallets`, {
        data: { type: "EVM", userIdentifier, userIdentifierType: "EMAIL" },
      });
      expect(secondRes.status()).toBe(409);
      logger.logStep("Duplicate correctly rejected with 409", true);
    });

    test("400 Bad Request - missing required fields", async ({ request }) => {
      logger.logStep("Testing missing userIdentifier...");
      const res = await request.post(`${baseURL}/rest/wallets`, {
        data: { type: "EVM", userIdentifierType: "EMAIL" },
      });
      expect(res.status()).toBe(400);
      logger.logStep("Missing field correctly rejected with 400", true);
    });

    test("404 Not Found - sign with non-existent wallet", async ({ request }) => {
      const fakeWalletId = "00000000-0000-0000-0000-000000000000";

      logger.logStep("Attempting to sign with non-existent wallet...");
      const signRes = await request.post(`${baseURL}/rest/wallets/${fakeWalletId}/sign-raw`, {
        data: { data: "0xdeadbeef" },
      });
      expect(signRes.status()).toBe(404);
      logger.logStep("Non-existent wallet correctly rejected with 404", true);
    });
  });
});
