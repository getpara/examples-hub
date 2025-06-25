# Module Safety Check

Check for import-time side effects, SSR compatibility issues, and global mutations in the Para Web SDK.

## What to Check

**Test files (*.test.ts, *.spec.ts) are EXEMPT from these checks.**

### 1. Import-Time Side-Effects
Look for top-level code that executes when module loads:
- Network/database calls
- Timers (`setTimeout`, `setInterval`)
- File system access
- Global mutations (`global.foo = ...`)
- Worker instantiation (immediate, not lazy)
- WASM module loading at top level
- Event listener registration outside functions
- Analytics initialization at import time
- Database connections at module level

### 2. SSR Compatibility
Flag browser-only APIs:
- `window`, `document`, `localStorage`, `sessionStorage`, `navigator`
- `WebAuthn`, `PublicKeyCredential` (Passkey APIs)
- `Worker`, `SharedWorker`, `ServiceWorker`
- `crypto.subtle` (suggest Node.js crypto for SSR)
- IndexedDB, WebSQL, browser storage APIs
- Missing polyfills for Node.js (`fetch`, `FormData`, `WebSocket`)

For React components/hooks (SSR compatibility only):
- `Math.random()` or `Date.now()` in render without stable IDs
- Conditional rendering based on `window` without hydration handling
- `useLayoutEffect` usage (suggest `useEffect` for SSR)

### 3. Global State Mutations
- Mutations to `process.env`, `globalThis`, prototype chains
- Global wallet state modifications
- Event emitter subscriptions that could leak
- Worker instance management issues

### 4. Package Boundaries & Architecture
- **@getpara/core-sdk**: NEVER browser-specific code (except guarded polyfills), NEVER UI framework dependencies
- **@getpara/server-sdk**: NEVER browser APIs (except type definitions), NEVER browser dependencies
- **@getpara/web-sdk**: Browser APIs expected but should be lazy-loaded
- **@getpara/react-sdk**: Must be SSR-safe for Next.js
- Core packages shouldn't depend on UI frameworks
- Server packages shouldn't include browser dependencies

## Output Format
For each issue found:
```
**Issue N:** [Issue Type] at [file:line]
```ts
// problematic code snippet
```
→ [Specific fix suggestion]
```

## Acceptable Patterns (Don't Flag)
- Polyfills with environment checks in entry files
- Lazy Worker instantiation within functions
- Browser API usage behind `typeof window !== 'undefined'` checks
- Dynamic imports with error handling
- Type definitions referencing browser types