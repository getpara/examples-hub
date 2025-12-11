# Para REST API with Node

This is a deliberately tiny Express server that shows how to call Para's REST API using nothing more than `fetch`. It
covers the three core operations exposed by the REST surface:

1. Create a wallet.
2. Poll a wallet until it becomes `ready` (so it has an address and public key).
3. Ask Para to sign raw bytes for that wallet.

It defaults to the Beta environment (`https://api.beta.getpara.com`) so you can try it safely. For additional REST
endpoints, check the docs—this sample intentionally sticks to the minimal create/read/sign flow.

Use this when you want to learn the HTTP integration without installing any Para SDK packages.

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

You should see a JSON response with a wallet id and status. If the wallet is still `creating`, you can poll it with
`GET /rest/wallets/:walletId` until it becomes `ready`.

Want to see the full create → poll → sign demo in one call? Try:

```bash
curl -X POST http://localhost:4000/rest/example-flow \
  -H "Content-Type: application/json" \
  -d '{
        "userIdentifier": "your-unique-id-02@example.com",
        "userIdentifierType": "EMAIL",
        "type": "EVM",
        "dataToSign": "0xdeadbeef"
      }'
```

## Routes

All routes live under `/rest/*` to make them easy to spot:

| Route | Description |
| --- | --- |
| `POST /rest/wallets` | Minimal wrapper around `POST /v1/wallets`. Body: `type`, `userIdentifier`, `userIdentifierType`. |
| `GET /rest/wallets/:walletId` | Reads wallet metadata (status, address, etc). Returns the bare wallet object (no wrapping). |
| `POST /rest/wallets/:walletId/sign-raw` | Signs raw bytes. Body: `{ "data": "0x..." }`. |
| `POST /rest/example-flow` | Helper that chains the other routes: create → poll until `ready` → sign demo data. |

Every handler calls the same helper (`callPara`) so you can inspect one tiny function to understand the HTTP wiring
(headers, base URL, JSON parsing, and error handling).

## Configuration

All settings live in `.env`:

| Key | Required | Default | Notes |
| --- | --- | --- | --- |
| `PARA_API_KEY` | ✅ | — | Your REST API key (keep it server-side). |
| `PARA_REST_BASE_URL` | | `https://api.beta.getpara.com` | Use `https://api.getpara.com` for production. |
| `PARA_POLL_INTERVAL_MS` | | `2000` | How often `example-flow` polls `GET /v1/wallets/:walletId`. |
| `PARA_POLL_TIMEOUT_MS` | | `20000` | Max time (ms) before the poll aborts. |

## Example requests

Replace identifiers and wallet ids with your own values. The responses shown are illustrative.

Create a wallet:

```bash
curl -X POST http://localhost:4000/rest/wallets \
  -H "Content-Type: application/json" \
  -d '{
        "userIdentifier": "rest-demo@example.com",
        "userIdentifierType": "EMAIL",
        "type": "EVM"
      }'
```

```json
{
  "wallet": {
    "id": "wal_123",
    "type": "EVM",
    "status": "creating",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "scheme": "DKLS"
}
```

Read a wallet (returns the bare wallet object, not wrapped in `{ wallet: ... }`):

```bash
curl http://localhost:4000/rest/wallets/wal_123
```

```json
{
  "id": "wal_123",
  "type": "EVM",
  "status": "ready",
  "address": "0xabc...",
  "publicKey": "0x123...",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

Sign raw bytes:

```bash
curl -X POST http://localhost:4000/rest/wallets/wal_123/sign-raw \
  -H "Content-Type: application/json" \
  -d '{ "data": "0xdeadbeef" }'
```

```json
{ "signature": "0xpara..." }
```

Run the full flow (create → poll → sign):

```bash
curl -X POST http://localhost:4000/rest/example-flow \
  -H "Content-Type: application/json" \
  -d '{
        "userIdentifier": "rest-demo-02@example.com",
        "userIdentifierType": "EMAIL",
        "type": "EVM",
        "dataToSign": "0xdeadbeef"
      }'
```

```json
{
  "walletId": "wal_456",
  "address": "0xdef...",
  "status": "ready",
  "signature": "0xpara...",
  "scheme": "DKLS"
}
```

If you reuse the same identifier and type, Para returns HTTP 409 with:

```json
{ "error": "A wallet for this identifier and type already exists.", "details": { "...": "..." } }
```

## Next steps

- Replace the `example-flow` route with your own business logic (maybe trigger wallet creation from a queue message).
- Store wallet ids in your database after creation so you can later sign transactions or display addresses.
- Wire this into your monitoring/observability stack if you intend to run it in production.

For the full REST reference, read [`docs-mintlify/v2/rest`](../../docs-mintlify/v2/rest/overview.mdx) or visit
[docs.getpara.com](https://docs.getpara.com/v2/rest/overview).
