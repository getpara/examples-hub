# Advanced Patterns

Examples demonstrating advanced architectural patterns for specific use cases.

## Folder Structure

```
advanced-patterns/
├── client-auth-server-sign/   # Client auth + server signing
└── with-bulk-pregen/          # Bulk wallet pre-generation
```

## Examples

| Example | Pattern | Use Case |
|---------|---------|----------|
| `client-auth-server-sign` | Hybrid client/server | User authenticates on client, signing happens on server |
| `with-bulk-pregen` | Bulk operations | Pre-generate wallets in bulk for user onboarding |

## When to Use

### Client Auth + Server Sign
- You need server-side control over transaction signing
- Users authenticate via browser but transactions are signed server-side
- Useful for custodial or semi-custodial setups

### Bulk Pre-generation
- Onboarding many users at once
- Airdrop campaigns requiring pre-generated wallets
- Enterprise wallet provisioning

## Quick Start

```bash
cd client-auth-server-sign
yarn install
cp .env.example .env
# Configure API keys
yarn dev
```

Each example has its own README with detailed architecture explanations.
