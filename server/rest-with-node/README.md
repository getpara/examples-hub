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

## Routes

All routes live under `/rest/*` to make them easy to spot:

| Route | Description |
| --- | --- |
| `POST /rest/wallets` | Minimal wrapper around `POST /v1/wallets`. Body: `type`, `userIdentifier`, `userIdentifierType`. |
| `GET /rest/wallets/:walletId` | Reads wallet metadata (status, address, etc). Returns the bare wallet object (no wrapping). |
| `POST /rest/wallets/:walletId/sign-raw` | Signs raw bytes. Body: `{ "data": "0x..." }`. |

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
[docs.getpara.com](https://docs.getpara.com/v2/rest/overview).
