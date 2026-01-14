# Server Examples

Server-side examples using `@getpara/server-sdk`.

## Folder Structure

```
server/
├── rest-with-node/    # REST API with Express.js
├── with-node/         # Node.js runtime
├── with-bun/          # Bun runtime
└── with-deno/         # Deno runtime
```

## Examples

| Example | Runtime | Description |
|---------|---------|-------------|
| `rest-with-node` | Node.js | REST API endpoints with Express |
| `with-node` | Node.js | Basic Node.js server integration |
| `with-bun` | Bun | Bun runtime integration |
| `with-deno` | Deno | Deno runtime integration |

## Use Cases

Server SDK is used for:
- Pre-generating wallets for users
- Server-side transaction signing
- Session validation and management
- Backend wallet operations

## Quick Start

```bash
cd rest-with-node
yarn install
cp .env.example .env
# Add your PARA_API_KEY to .env
yarn dev
```

Each example has its own README with specific setup instructions.
