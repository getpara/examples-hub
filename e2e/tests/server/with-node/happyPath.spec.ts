import { test, expect } from "@playwright/test";
import * as crypto from "node:crypto";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe("with-node server API", () => {
  const baseURL = process.env.BASE_URL || "http://localhost:8080";
  
  test.beforeAll(async () => {
    const dbPath = path.resolve(__dirname, "../../../../server/with-node/src/keyShares.db");
    try {
      await fs.unlink(dbPath);
      console.log("Cleared keyShares database for clean test run");
    } catch (error) {
      // Ignore if file doesn't exist
    }
  });

  test("happy path - create wallet and test all signing routes", async ({ request }) => {
    // Create a single wallet to use for all signing tests
    const randomHexString = crypto.randomBytes(5).toString("hex");
    const testEmail = `teste2e+${randomHexString}@test.usecapsule.com`;
    
    console.log(`\n🔑 Creating test wallet with email: ${testEmail}`);
    const createResponse = await request.post(`${baseURL}/wallets/pregen/create`, {
      data: { email: testEmail },
    });

    expect(createResponse.ok()).toBeTruthy();
    expect(createResponse.status()).toBe(201);
    console.log("✅ Test wallet created successfully\n");

    const signingRoutes = [
      { path: "/viem/pregen", expectedMessage: "Transaction signed using Viem + Para (pre-generated wallet)" },
      { path: "/ethers/pregen", expectedMessage: "Transaction signed using Ethers + Para (pre-generated wallet)" },
      {
        path: "/cosmjs/pregen",
        expectedMessage: "Transaction signed successfully using CosmJS + Para with pre-generated wallet",
      },
      {
        path: "/solana-web3/pregen",
        expectedMessage: "Transaction signed using Solana-Web3 + Para (pre-generated wallet)",
      },
      {
        path: "/alchemy/pregen",
        expectedMessage: "User operation batch sent successfully using Alchemy + Para with pre-generated wallet",
      },
      {
        path: "/zerodev/pregen",
        expectedMessage: "User operation batch sent using ZeroDev + Para (pregen-based) with viem signer",
      },
      {
        path: "/alchemy/eip7702",
        expectedMessage:
          "User operation batch sent successfully using Alchemy + Para with EIP-7702 (pre-generated wallet)",
      },
      {
        path: "/zerodev/eip7702",
        expectedMessage:
          "User operation batch sent using ZeroDev EIP-7702 + Para (pre-generated wallet) with viem signer",
      },
    ];

    // Test all signing routes with the same wallet
    for (const route of signingRoutes) {
      console.log(`\n🧪 Testing ${route.path}`);
      console.log(`  🔏 Signing with ${route.path} using email: ${testEmail}`);
      
      const signResponse = await request.post(`${baseURL}${route.path}`, {
        data: { email: testEmail },
      });

      if (!signResponse.ok()) {
        const errorBody = await signResponse.text();
        console.error(`  ❌ Sign request failed: ${signResponse.status()} - ${errorBody}`);
      }

      expect(signResponse.ok()).toBeTruthy();
      expect(signResponse.status()).toBe(200);

      const signResult = await signResponse.json();
      expect(signResult).toEqual({
        success: true,
        message: route.expectedMessage,
      });
      console.log("  ✅ Sign operation completed successfully");
    }
  });

  test("error case - wallet already exists", async ({ request }) => {
    console.log("\n🧪 Testing error case: duplicate wallet creation");
    const randomHexString = crypto.randomBytes(5).toString("hex");
    const email = `teste2e+duplicate${randomHexString}@test.usecapsule.com`;

    // First creation should succeed
    console.log("  📝 Creating first wallet...");
    const firstResponse = await request.post(`${baseURL}/wallets/pregen/create`, {
      data: { email },
    });
    expect(firstResponse.status()).toBe(201);
    console.log("  ✅ First wallet created successfully");

    // Second creation should fail with 409
    console.log("  📝 Attempting duplicate wallet creation...");
    const secondResponse = await request.post(`${baseURL}/wallets/pregen/create`, {
      data: { email },
    });
    expect(secondResponse.status()).toBe(409);

    const errorResult = await secondResponse.json();
    expect(errorResult).toEqual({
      success: false,
      message: "A pre-generated wallet already exists for this email",
    });
    console.log("  ✅ Duplicate creation correctly rejected with 409");
  });

  test("error case - missing email", async ({ request }) => {
    console.log("\n🧪 Testing error case: missing email");
    const response = await request.post(`${baseURL}/wallets/pregen/create`, {
      data: {},
    });

    expect(response.status()).toBe(400);

    const result = await response.json();
    expect(result).toEqual({
      success: false,
      message: "Provide email in the request body",
    });
    console.log("  ✅ Missing email correctly rejected with 400");
  });

  test("error case - sign without wallet", async ({ request }) => {
    console.log("\n🧪 Testing error case: sign without wallet");
    const email = "teste2e+nonexistent@test.usecapsule.com";

    console.log("  🔏 Attempting to sign without wallet...");
    const response = await request.post(`${baseURL}/viem/pregen`, {
      data: { email },
    });

    expect(response.status()).toBe(400);

    const result = await response.json();
    expect(result).toEqual({
      success: false,
      message: "No pre-generated wallet found for this email",
    });
    console.log("  ✅ Sign without wallet correctly rejected with 400");
  });
});
