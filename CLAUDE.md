# CLAUDE.md

## Build Commands
- `yarn install` - Install dependencies
- `yarn build` - Build all packages  
- `yarn dev` - Start development servers
- `yarn e2e` - Run Playwright e2e tests
- `yarn test` - Run all unit tests
- `yarn lint` - ESLint all packages
- `yarn lint-fix` - Fix ESLint issues
- `yarn check-bundle-size` - Check bundle sizes against thresholds
- `cd /web-sdk/sites/developer-portal && yarn legacy-deploy-sandbox` - Deploy dev portal to sandbox
- `cd /web-sdk/sites/bridge-v2 && yarn deploy-sandbox` - Deploy bridge to sandbox

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

## Security & Supply Chain Protection

### Dependency Management
- **Always use `--frozen-lockfile`** in CI and production deployments
- Never run `yarn install` without `--frozen-lockfile` in automated environments
- Lockfile ensures only vetted dependencies are installed

### Protection Against Supply Chain Attacks
This repo implements multiple layers of defense against npm supply chain attacks (e.g., Shai-Hulud worm):

1. **Frozen Lockfile Policy:**
   - All CI workflows use `yarn install --frozen-lockfile`
   - Prevents installation of packages not in committed `yarn.lock`
   - See: `.github/workflows/tests.yml`, `bundle-size-check.yml`, `para-modal-stress-test.yml`

2. **Automated Vulnerability Checking:**
   - `.github/workflows/vulnerability-check.yml` runs on all PRs
   - Compares vulnerability counts against main branch
   - Blocks PRs that introduce new high/critical vulnerabilities
   - Override with comment: `INCREASED VULNERABILITIES ACCEPTED`

3. **Postinstall Scripts:**
   - Current postinstall: `yarn graz -g && patch-package && bash scripts/setup-examples-hub.sh`
   - **Security Note:** Postinstall scripts run automatically and can be exploited
   - All scripts in this repo are audited and safe:
     - `graz -g`: Generates Cosmos chain definitions (benign)
     - `patch-package`: Applies local patches to dependencies
     - `setup-examples-hub.sh`: Adds examples-hub git remote (idempotent)

4. **Dependency Resolution Overrides:**
   - Security patches defined in `resolutions` field in package.json
   - Forces specific secure versions of transitive dependencies

### Best Practices for Developers

**When adding dependencies:**
1. Research package reputation and maintainer history
2. Check recent npm publish activity for suspicious patterns
3. Review the package's postinstall scripts (if any)
4. Use `yarn audit` to check for known vulnerabilities
5. Always commit yarn.lock changes with dependency updates

**When running yarn install locally:**
- Use `yarn install --frozen-lockfile` when you want exact versions from lockfile
- If adding new packages, review what postinstall scripts will run
- Check for unexpected files created in your home directory after install

**Warning Signs of Compromised Packages:**
- Unexpected postinstall/preinstall scripts
- Packages requesting network access during install
- Newly created files outside node_modules
- Unusual environment variable access
- Git repositories created in your home directory

### Incident Response
If you suspect a compromised package was installed:
1. **Isolate:** Stop using the affected environment
2. **Audit:** Check `~/.npm`, `~/.config/yarn`, and `~/.local` for suspicious files
3. **Rotate credentials:** GitHub tokens, npm tokens, API keys, SSH keys
4. **Report:** Notify the security team immediately
5. **Scan:** Run `git log` to check for unauthorized commits

### Additional Resources
- Vulnerability database: https://github.com/advisories
- npm security best practices: https://docs.npmjs.com/about-security
- Yarn security: https://yarnpkg.com/features/security

## MetaMask E2E Testing with Synpress

### Overview
Synpress enables automated MetaMask wallet testing in E2E tests using Playwright.

### Setup & Commands
1. **Install dependencies:** `yarn install`
2. **Generate wallet cache:** `yarn e2e:cache-wallets`
   - Creates `.cache-synpress` directory (gitignored)
   - Required before running MetaMask tests
   - Only needs to be regenerated if wallet setup files change

3. **Run MetaMask tests:**
   - `yarn e2e:metamask` - Run all MetaMask tests (headed mode)
   - `yarn e2e:metamask-headed` - Run with visible browser
   - `yarn e2e:metamask-ui` - Run with Playwright UI mode

### Wallet Setup
- **Location:** `e2e/wallet-setup/`
- **Files:**
  - `basic-metamask.setup.ts` - Standard wallet configuration
  - `connected-metamask.setup.ts` - Pre-connected wallet setup
- **Credentials:** Use environment variables:
  - `TEST_WALLET_SEED_PHRASE` - Custom seed phrase (default: test phrase)
  - `TEST_WALLET_PASSWORD` - Wallet password (default: Tester@1234)
  - `E2E_APP_URL` - App URL (default: http://127.0.0.1:3003)

### Cache Management
- **Hash-based caching:** Synpress generates unique cache IDs from setup function contents
- **Regenerate cache when:**
  - Changing seed phrase or wallet password
  - Modifying wallet setup logic (networks, accounts, etc.)
  - Cache corruption or errors
- **Cache location:** `.cache-synpress` (automatically created)

### Known Issues & Limitations
1. **Headless Mode:** MetaMask doesn't work reliably in headless mode
   - Tests run in headed mode by default
   - On CI, use `xvfb-run` for virtual display

2. **Trace/UI Mode:** MetaMask popups appear blank in Playwright traces
   - Due to MetaMask's LavaMoat security policy
   - Use headed mode for debugging instead

3. **Windows:** Synpress doesn't officially support Windows
   - Use WSL (Windows Subsystem for Linux) instead

### Test Structure
- **Config:** `e2e/configs/synpress.playwright.config.ts`
- **Page Objects:** `e2e/stress-test/page-objects/para-modal-metamask.page.ts`
- **Test Specs:** `e2e/stress-test/specs/metamask-*.spec.ts`
- **Tag:** All MetaMask tests tagged with `@metamask`

### Writing MetaMask Tests
```typescript
import { testWithSynpress } from '@synthetixio/synpress';
import { MetaMask, metaMaskFixtures } from '@synthetixio/synpress/metamask';
import basicMetaMaskSetup from '../../wallet-setup/basic-metamask.setup';

const test = testWithSynpress(metaMaskFixtures(basicMetaMaskSetup));

test('example @metamask', async ({ context, metamaskPage, extensionId }) => {
  const page = await context.newPage();
  const metamask = new MetaMask(context, metamaskPage, basicMetaMaskSetup.walletPassword, extensionId);
  // ... test logic
});
```

### Troubleshooting
- **"Cache not found" errors:** Run `yarn e2e:cache-wallets`
- **Extension not loading:** Ensure Synpress version is compatible with Playwright
- **MetaMask popup not appearing:** Check headed mode is enabled
- **Network errors:** Verify Sepolia RPC is accessible
- **Type errors:** Ensure `e2e/tsconfig.json` extends Synpress tsconfig base
