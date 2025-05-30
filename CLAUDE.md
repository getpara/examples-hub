# CLAUDE.md

## Build Commands
- `./scripts/install-dependencies.sh` - Install deps for all examples
- `yarn install` - Install deps in specific example directory
- `yarn dev` or `yarn start` - Start development server (varies by example)
- `yarn build` - Build example application

## Example Structure
- **Web (`/web/`):** React (Next.js/Vite), Vue, Svelte examples
- **Mobile (`/mobile/`):** React Native, Expo, Flutter, Swift examples  
- **Server (`/server/`):** Node.js, Bun, Deno backend examples
- **Specialized (`/specialized/`):** Chrome extension, Electron, Telegram

## Navigation Patterns
- Each example has its own README with specific setup
- Examples grouped by integration type (modal, custom auth, signers)
- Platform-specific subdirectories (react-nextjs, react-vite, etc.)

## Common Example Types
- **para-modal:** Basic Para modal integration
- **custom-[auth]:** Custom UI for email/phone/oauth
- **signer-[library]:** Blockchain signer integrations
- **connector-[library]:** Wallet connector integrations

## Development Workflow
- IMPORTANT: Start with the README in each example directory
- Copy example structure for new integrations
- Test with your own API keys (check example .env files)
- Use examples as reference, not production code

## Key Files to Check
- `package.json` - Dependencies and scripts
- `.env.example` - Required environment variables
- `src/App.*` or `pages/` - Main integration code
- README.md - Setup and usage instructions