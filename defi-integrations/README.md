# DeFi Integrations

Examples integrating Para wallets with DeFi protocols for swaps, bridges, and cross-chain operations.

## Folder Structure

```
defi-integrations/
├── with-jupiter-dex-api/     # Jupiter DEX (Solana)
├── with-squid-router-api/    # Squid Router (cross-chain)
└── with-relay-bridge-api/    # Relay Bridge
```

## Examples

| Example | Protocol | Chain(s) | Use Case |
|---------|----------|----------|----------|
| `with-jupiter-dex-api` | Jupiter | Solana | Token swaps on Solana |
| `with-squid-router-api` | Squid | Multi-chain | Cross-chain swaps and bridging |
| `with-relay-bridge-api` | Relay | Multi-chain | Asset bridging between chains |

## Quick Start

```bash
cd with-jupiter-dex-api
yarn install
cp .env.example .env
# Configure API keys
yarn dev
```

Each example has its own README with protocol-specific setup instructions.
