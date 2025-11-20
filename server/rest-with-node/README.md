# Para REST API with Node

This is a deliberately tiny Express server that shows how to call Para's REST API using nothing more than `fetch`. It
covers the three core operations exposed by the REST surface:

1. Create a wallet.
2. Poll a wallet until it becomes `ready` (so it has an address and public key).
3. Ask Para to sign raw bytes for that wallet.

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

Now try the example flow from a second terminal (replace the email with any identifier you like):

```bash
curl -X POST http://localhost:4000/rest/example-flow \
  -H "Content-Type: application/json" \
  -d '{
        "userIdentifier": "rest-demo@example.com",
        "userIdentifierType": "EMAIL",
        "type": "EVM",
        "dataToSign": "0xdeadbeef"
      }'
```

You should see a JSON response that includes the wallet id, address, and the signature returned by Para. If you reuse
the same identifier and type, Para will return a 409 conflict — pick a fresh identifier or handle the error in your
app.

## Routes

All routes live under `/rest/*` to make them easy to spot:

| Route | Description |
| --- | --- |
| `POST /rest/wallets` | Minimal wrapper around `POST /v1/wallets`. Body: `type`, `userIdentifier`, `userIdentifierType`. |
| `GET /rest/wallets/:walletId` | Reads wallet metadata (status, address, etc). Returns the bare wallet object. |
| `POST /rest/wallets/:walletId/sign-raw` | Signs raw bytes. Body: `{ "data": "0x..." }`. |
| `POST /rest/example-flow` | Helper that chains the other routes: create → poll until `ready` → sign demo data. |

Every handler calls the same helper (`callPara`) so you can inspect one tiny function to understand the HTTP wiring
(headers, base URL, JSON parsing, and error handling).

## Configuration

All settings live in `.env`:

| Key | Required | Default | Notes |
| --- | --- | --- | --- |
| `PARA_API_KEY` | ✅ | — | Your REST API key (keep it server-side). |
| `PARA_REST_BASE_URL` | | `https://api.beta.getpara.com` | Point to production by changing to `https://api.getpara.com`. |
| `PARA_POLL_INTERVAL_MS` | | `2000` | How often `example-flow` polls `GET /v1/wallets/:walletId`. |
| `PARA_POLL_TIMEOUT_MS` | | `20000` | Max time (ms) before the poll aborts. |

## Next steps

- Replace the `example-flow` route with your own business logic (maybe trigger wallet creation from a queue message).
- Store wallet ids in your database after creation so you can later sign transactions or display addresses.
- Wire this into your monitoring/observability stack if you intend to run it in production.

For the full REST reference, read [`docs-mintlify/v2/rest`](../../docs-mintlify/v2/rest/overview.mdx) or visit
[docs.getpara.com](https://docs.getpara.com/v2/rest/overview).
