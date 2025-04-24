# Welcome to the Para Web SDK

This Site contains function level auto-generated docs. For a complete integration guide and other documentation, please check out the [Para Docs Site](https://docs.getpara.com)

## Development Setup

This is a monorepo project using Yarn workspaces and Lerna for package management. To get started with development:

1. Install dependencies:
```bash
yarn install
```

2. Build all packages:
```bash
yarn build
```

## Running Tests

### End-to-End Tests

The project uses Playwright for end-to-end testing. To run the e2e tests:

1. Install Playwright browsers:
```bash
yarn playwright install
```

2. Run the e2e tests:
```bash
yarn e2e
```

The tests will run in headed mode (with a visible browser) and will automatically start the required development servers.

### Other Available Scripts

- `yarn dev` - Start development servers for capsule-legacy-example and capsule-portal
- `yarn start-server` - Start the capsule-server-example
- `yarn start-bridge` - Start the capsule-js-bridge
- `yarn start-demo` - Start the modal-builder demo
- `yarn start-dev-portal` - Start the developer portal
- `yarn test` - Run all tests across packages
- `yarn lint` - Run ESLint across all packages
- `yarn lint-fix` - Fix ESLint issues across all packages
