# E2E Testing Guide

This guide explains how to run end-to-end tests for the examples-hub repository.

## Prerequisites

1. Install dependencies:
   ```bash
   yarn install
   yarn playwright install chromium
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and add your Para API keys:
   ```bash
   PARA_API_KEY_BETA=your_beta_api_key_here
   PARA_API_KEY_SANDBOX=your_sandbox_api_key_here
   ```

## Running Tests

### Run All Tests
```bash
yarn test:all
```

### Run Tests by Framework

```bash
yarn test:react-vite      # All React Vite tests
yarn test:react-nextjs    # All React Next.js tests
yarn test:vue            # All Vue tests
yarn test:svelte         # All Svelte tests
yarn test:node           # Node.js server tests
```

### Run Specific Authentication Tests

For React examples, you can test specific authentication combinations:

```bash
# React Vite
yarn test:react-vite:email-password
yarn test:react-vite:email-passkey
yarn test:react-vite:phone-password
yarn test:react-vite:phone-passkey

# React Next.js
yarn test:react-nextjs:email-password
yarn test:react-nextjs:email-passkey
yarn test:react-nextjs:phone-password
yarn test:react-nextjs:phone-passkey
```

## Configuration Options

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Para API Configuration
PARA_API_KEY_BETA=        # Your Beta environment API key
PARA_API_KEY_SANDBOX=     # Your Sandbox environment API key (optional)
PARA_ENVIRONMENT=BETA     # Which environment to use (BETA or SANDBOX)

# Test Configuration
E2E_SEQUENTIAL=true       # Run tests sequentially (recommended)
E2E_HEADED=false         # Run in headless mode
E2E_TIMEOUT=120000       # Test timeout in milliseconds
E2E_WORKERS=1            # Number of parallel workers

# Port Configuration (optional)
VITE_PORT=5173           # Port for Vite-based apps
NEXTJS_PORT=3000         # Port for Next.js apps
NODE_PORT=3000           # Port for Node.js server
```

### Running in Headed Mode

To see the browser while tests run:

```bash
E2E_HEADED=true yarn test:react-vite
```

### Parallel Execution

By default, tests run sequentially to avoid port conflicts. To run in parallel:

```bash
E2E_WORKERS=auto yarn test:react-vite
```

## CI/CD Integration

For GitHub Actions or other CI/CD systems:

1. Set API keys as secrets:
   - `PARA_API_KEY_BETA`
   - `PARA_API_KEY_SANDBOX` (optional)

2. The existing scripts will automatically use these environment variables.

3. Tests run in headless mode by default in CI environments.

## Test Structure

```
e2e/
├── scripts/              # Test runner scripts
│   ├── testConfig.ts    # Central configuration
│   ├── runTest.ts       # Individual test runner
│   └── runAllTests.ts   # Batch test runner
├── tests/               # Test files
│   └── web/
│       ├── with-react-vite/
│       │   ├── happyPath.email.password.spec.ts
│       │   ├── happyPath.email.passkey.spec.ts
│       │   ├── happyPath.phone.password.spec.ts
│       │   └── happyPath.phone.passkey.spec.ts
│       └── with-react-nextjs/
└── pages/               # Page objects
    └── paraModalExample.ts
```

## Troubleshooting

### Missing API Keys
If you see "Missing PARA_API_KEY_BETA environment variable", ensure your `.env` file contains valid API keys.

### Port Conflicts
If tests fail due to port conflicts, ensure no other services are running on ports 3000 or 5173.

### Iframe Issues
Some tests use iframes for password entry. If these fail, the test will automatically attempt to refresh the iframe.

### Test Timeouts
Increase the timeout by setting:
```bash
E2E_TIMEOUT=180000 yarn test:react-vite
```

## Writing New Tests

1. Add test files following the naming pattern: `happyPath.[auth-type].spec.ts`
2. Update `testConfig.ts` to add new frameworks or configurations
3. Use the existing page objects in `e2e/pages/` for common interactions

## Legacy Scripts

- `e2e-examples-hub-script`: Original test runner (still works but uses new env vars)
- `single-example-hub-e2e`: Base Playwright command (requires manual env setup)