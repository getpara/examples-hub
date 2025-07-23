import { test, expect } from '@playwright/test';
import * as crypto from 'node:crypto';

test.describe('with-node server API', () => {
  const baseURL = process.env.BASE_URL || 'http://localhost:8080';

  test('happy path - create wallet and sign with viem', async ({ request }) => {
    const randomHexString = crypto.randomBytes(5).toString('hex');
    const email = `teste2e+${randomHexString}@test.usecapsule.com`;

    // Step 1: Create wallet
    const createResponse = await request.post(`${baseURL}/wallets/pregen/create`, {
      data: { email }
    });

    expect(createResponse.ok()).toBeTruthy();
    expect(createResponse.status()).toBe(201);
    
    const createResult = await createResponse.json();
    expect(createResult).toEqual({
      success: true,
      message: 'Pre-generated wallets created successfully'
    });

    // Step 2: Sign transaction with Viem
    const signResponse = await request.post(`${baseURL}/viem/pregen`, {
      data: { email }
    });

    expect(signResponse.ok()).toBeTruthy();
    expect(signResponse.status()).toBe(200);
    
    const signResult = await signResponse.json();
    expect(signResult).toEqual({
      success: true,
      message: 'Transaction signed using Viem + Para (pre-generated wallet)'
    });
  });

  test('error case - wallet already exists', async ({ request }) => {
    const email = 'teste2e+duplicate@test.usecapsule.com';

    // First creation should succeed
    const firstResponse = await request.post(`${baseURL}/wallets/pregen/create`, {
      data: { email }
    });
    expect(firstResponse.status()).toBe(201);

    // Second creation should fail with 409
    const secondResponse = await request.post(`${baseURL}/wallets/pregen/create`, {
      data: { email }
    });
    expect(secondResponse.status()).toBe(409);
    
    const errorResult = await secondResponse.json();
    expect(errorResult).toEqual({
      success: false,
      message: 'A pre-generated wallet already exists for this email'
    });
  });

  test('error case - missing email', async ({ request }) => {
    const response = await request.post(`${baseURL}/wallets/pregen/create`, {
      data: {}
    });

    expect(response.status()).toBe(400);
    
    const result = await response.json();
    expect(result).toEqual({
      success: false,
      message: 'Provide email in the request body'
    });
  });

  test('error case - sign without wallet', async ({ request }) => {
    const email = 'teste2e+nonexistent@test.usecapsule.com';

    const response = await request.post(`${baseURL}/viem/pregen`, {
      data: { email }
    });

    expect(response.status()).toBe(400);
    
    const result = await response.json();
    expect(result).toEqual({
      success: false,
      message: 'No pre-generated wallet found for this email'
    });
  });
});