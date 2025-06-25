# Dependencies & Bundle Impact Check

Monitor dependency health and bundle size impact.

## What to Check

### 1. Dependency Classification
Verify correct placement in package.json:
- **dependencies**: Runtime libraries, cross-platform utils
- **peerDependencies**: React, viem, wagmi (user provides)
- **devDependencies**: Build tools, test utilities

### 2. Version Alignment
Check for version mismatches across packages:
- Same library with different versions in different packages
- Peer dependency version conflicts
- Breaking changes between versions

### 3. Bundle Size Impact
- Flag new dependencies that significantly increase bundle size
- Identify heavy libraries that could be dynamically imported
- Check for duplicate dependencies being bundled
- Suggest lighter alternatives for common utilities

### 4. Environment Compatibility
- Browser-only packages in server contexts
- Node.js packages in browser bundles
- React Native compatibility issues
- Missing polyfills for cross-platform usage

### 5. Unused Dependencies
- Dependencies declared but never imported
- Development dependencies in production builds
- Outdated dependencies with security issues

### 6. Circular Dependencies
- Detect circular dependencies between packages
- Flag import cycles that could cause build issues

## What NOT to Flag
- Development and testing dependencies
- Intentional version pinning for stability
- Polyfills required for cross-environment support

## Output Format
For each issue:
```
**#N** Peer dependency mismatch
```
core-sdk: wagmi@1.4.0
react-sdk: wagmi@1.5.0  // ❌ Type conflicts
```
→ Align to wagmi@1.5.0 in both packages

**#N** Bundle size impact: +12KB from ethers
→ Consider dynamic import for crypto operations

**#N** Wrong dependency type at [package]/package.json
```json
"dependencies": { "react": "^18.0.0" }  // ❌ Should be peer
```
→ Move to peerDependencies

**#N** Browser package in server context
```ts
import { localStorage } from 'browser-storage'  // ❌ Server incompatible
```
→ Use environment-agnostic storage solution
```

## Priority
- **High**: Version conflicts, wrong environment packages
- **Medium**: Bundle size impact >10KB, dependency type misplacement
- **Low**: Unused dependencies, minor version updates