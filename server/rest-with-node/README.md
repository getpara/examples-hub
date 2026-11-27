# Para REST API with Node

This is a deliberately tiny Express server that shows how to call Para's REST API using nothing more than `fetch`. It
covers the core operations exposed by the REST surface:

1. Create a wallet.
2. Poll a wallet until it becomes `ready` (so it has an address and public key).
3. Ask Para to sign raw bytes for that wallet.
4. Sign a full EVM transaction (EIP-1559) and get a broadcast-ready hex string.

It defaults to the Beta environment (`https://api.beta.getpara.com`) so you can try it safely. For additional REST
endpoints, check the docs—this sample intentionally sticks to the minimal create/read/sign flow.

Use this when you want to learn the HTTP integration without installing any Para SDK packages. For production
TypeScript backends, prefer `@getpara/rest-sdk` unless you specifically want to own the raw HTTP layer.

## Prerequisites

- Node.js 18+ (ships with global `fetch`).
- A Para REST API key from [developer.getpara.com](https://developer.getpara.com).
- The calling machine's IP should be allowlisted if your project has an allowlist.

## Quick start

```bash
cd server/rest-with-node
cp .env.example .env                # Put your API key inside
yarn install                        # Install express + types
yarn dev                            # Starts http://localhost:4000
```

From a second terminal, create a wallet. Replace `your-unique-id@example.com` with a unique identifier each time you run this demo.
Reusing an identifier will return HTTP 409 because a wallet already exists for that user.

```bash
curl -X POST http://localhost:4000/rest/wallets \
  -H "Content-Type: application/json" \
  -d '{
        "userIdentifier": "your-unique-id@example.com",
        "userIdentifierType": "EMAIL",
        "type": "EVM"
      }'
```

You should see a JSON response with a wallet id and status. If the wallet is still `creating`, poll it until it becomes `ready`:

```bash
curl http://localhost:4000/rest/wallets/wal_123  # replace with your wallet id
```

Once the wallet is `ready`, sign some data:

```bash
curl -X POST http://localhost:4000/rest/wallets/wal_123/sign-raw \
  -H "Content-Type: application/json" \
  -d '{ "data": "0xdeadbeef" }'
```

Or sign a full EVM transaction (EIP-1559):

```bash
curl -X POST http://localhost:4000/rest/wallets/wal_123/sign-transaction \
  -H "Content-Type: application/json" \
  -d '{
        "transaction": {
          "to": "0x000000000000000000000000000000000000dEaD",
          "chainId": "11155111",
          "value": "0x2386f26fc10000",
          "type": 2,
          "maxFeePerGas": "0x59682f00",
          "maxPriorityFeePerGas": "0x3b9aca00"
        }
      }'
```

## Gated Solana Devnet sponsored transfer (direct HTTP)

This pilot is not enabled merely by using this example. Wait for Para to confirm compatible Beta deployment,
partner sponsorship enrollment, an allowlisted classic SPL mint, and Stripe test billing readiness. Production and
Solana mainnet are excluded. Use an API-created, unclaimed Solana wallet; both source and recipient associated
token accounts must already exist. Sponsorship pays network fees only, not rent or token-account creation.
Native SOL and Token-2022 are unsupported. Partners with wallet policies enabled need Permissions v2 for this flow.

The example server above intentionally has no transfer proxy route. This standalone Node script calls Para directly.
Export `PARA_API_KEY`, `WALLET_ID`, `RECIPIENT`, `TOKEN_MINT`, `TOKEN_AMOUNT` (positive integer base units), and
`PAYOUT_FILE` (a unique file path for this payment). Never reuse that file for a different payment. It saves the exact
request and idempotency key before sending; rerun with the same file after interruption, not a new key.

```javascript
// Save as sponsored-solana.mjs; run only after pilot activation is confirmed.
import { randomUUID } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

const { PARA_API_KEY, WALLET_ID, RECIPIENT, TOKEN_MINT, TOKEN_AMOUNT, PAYOUT_FILE } = process.env;
if (![PARA_API_KEY, WALLET_ID, RECIPIENT, TOKEN_MINT, TOKEN_AMOUNT, PAYOUT_FILE].every(Boolean)) {
  throw new Error('Set all required environment variables before running');
}
const initial = {
  walletId: WALLET_ID,
  idempotencyKey: randomUUID(),
  body: { sponsoredGas: true, network: 'SOLANA_DEVNET', kind: 'SPL',
    to: RECIPIENT, tokenAddress: TOKEN_MINT, value: TOKEN_AMOUNT },
};
try {
  await writeFile(PAYOUT_FILE, JSON.stringify(initial, null, 2), { flag: 'wx', mode: 0o600 });
} catch (error) {
  if (error.code !== 'EEXIST') throw error;
}
const saved = JSON.parse(await readFile(PAYOUT_FILE, 'utf8'));
const base = 'https://api.beta.getpara.com/v1';
const headers = { 'X-API-Key': PARA_API_KEY, 'Content-Type': 'application/json' };
const response = await fetch(`${base}/wallets/${encodeURIComponent(saved.walletId)}/transfer`, {
  method: 'POST', headers: { ...headers, 'Idempotency-Key': saved.idempotencyKey },
  body: JSON.stringify(saved.body),
});
const result = await response.json();
if (response.status !== 202 || result.sponsoredGas !== true || !result.transactionId) {
  throw new Error(`Inspect response before retrying: ${JSON.stringify(result)}`);
}
console.log('Tracking ID:', result.transactionId);
for (let attempt = 0; attempt < 24; attempt++) {
  const lookup = await fetch(`${base}/wallets/${encodeURIComponent(saved.walletId)}/transactions/${result.transactionId}`, { headers });
  if (!lookup.ok) throw new Error(`Lookup failed (${lookup.status}); retain the saved payment file`);
  const record = await lookup.json();
  console.log(record.status, record.stage, record.hash);
  if (['confirmed', 'reverted', 'failed'].includes(record.status)) break;
  if (record.stage === 'requires_action') {
    console.log('Approve review, then explicitly resume this same transaction:', record.reviewId);
    break;
  }
  await new Promise(resolve => setTimeout(resolve, 5000));
}
// A polling timeout is not failure. Keep tracking the original ID; never automatically create a replacement.
```

Solana uses a separate fee-payer signature, not EIP-7702. Its finalized signature appears in `hash`, not
`userOperationHash`, and `actualGasCost` is in lamports. Reverted transactions still incur their finalized network fee.
The backend retries only the same signed bytes. Missing signature history does not prove failure: unknown signing
outcomes stay tracked until exact-message reconciliation or complete finalized non-inclusion evidence permits expiry.
A replay retrieves the same operation; it does not resume a review. See the [gas sponsorship guide](https://docs.getpara.com/v3/rest/gas-sponsorship#solana-devnet-pilot)
for policy review/resume, billing, and eligibility. Do not send `chainId`, nonce/fee overrides, or `autoRetry` with this pilot request.

## Routes

All routes live under `/rest/*` to make them easy to spot:

| Route | Description |
| --- | --- |
| `POST /rest/wallets` | Minimal wrapper around `POST /v1/wallets`. Body: `type`, `userIdentifier`, `userIdentifierType`. |
| `GET /rest/wallets/:walletId` | Reads wallet metadata (status, address, etc). Returns the bare wallet object (no wrapping). |
| `POST /rest/wallets/:walletId/sign-raw` | Signs raw bytes. Body: `{ "data": "0x..." }`. |
| `POST /rest/wallets/:walletId/sign-transaction` | Signs an EVM transaction. Body: `{ "transaction": { "to", "chainId", ... } }`. Returns `{ "signedTransaction": "0x..." }`. |

Every handler calls the same helper (`callPara`) so you can inspect one tiny function to understand the HTTP wiring
(headers, base URL, JSON parsing, and error handling).

## Configuration

All settings live in `.env`:

| Key | Required | Default | Notes |
| --- | --- | --- | --- |
| `PARA_API_KEY` | ✅ | — | Your REST API key (keep it server-side). |
| `PARA_REST_BASE_URL` | | `https://api.beta.getpara.com` | Use `https://api.getpara.com` for production. |

## Next steps

- Store wallet ids in your database after creation so you can later sign transactions or display addresses.
- Build your own business logic on top of these primitives (e.g., trigger wallet creation from a queue message).

For the full REST reference, read [`docs-mintlify/v2/rest`](../../docs-mintlify/v2/rest/overview.mdx) or visit
[docs.getpara.com](https://docs.getpara.com/v3/rest/overview).
