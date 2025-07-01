# CLAUDE.md

## Build Commands
- `yarn install` - Install dependencies
- `yarn build` - Build all packages  
- `yarn dev` - Start development servers
- `yarn e2e` - Run Playwright e2e tests
- `yarn test` - Run all unit tests
- `yarn lint` - ESLint all packages
- `yarn lint-fix` - Fix ESLint issues
- `cd /sites/developer-portal && yarn legacy-deploy-sandbox` - Deploy dev portal to sandbox

## Key Architecture
- **Monorepo:** Lerna-managed packages in `/packages/`
- **Core SDK:** `/packages/core-sdk/` - Base Para functionality
- **Web SDK:** `/packages/web-sdk/` - Browser-specific Para client
- **React SDK:** `/packages/react-sdk/` - Main React integration
- **Portal:** `/sites/portal/` - Authentication UI
- **Bridge:** `/sites/bridge/` - Cross-frame communication

## Code Style
- TypeScript strict mode with explicit types
- ES modules (import/export), not CommonJS
- Destructure imports: `import { foo } from 'bar'`
- 2-space indentation, trailing commas

## Workflow
- IMPORTANT: Run `yarn typecheck` after code changes
- Use single test files for performance: `yarn test path/to/file.test.ts`
- E2E tests require `yarn playwright install` first
- Build before testing integrations

## Common Patterns
- MPC operations use Web Workers (`/workers/`)
- Cross-frame auth uses bridge pattern (`/sites/bridge/`)
- External wallets via connector packages (`/*-wallet-connectors/`)
- Blockchain signers in integration packages (`/*-integration/`)

## Debugging
- Portal: Check bridge communication in browser DevTools
- MPC issues: Verify worker thread execution
- Auth failures: Confirm API keys in environment
