# Developer Experience & Integration Consistency Check

Ensure changes maintain excellent developer experience and don't introduce breaking changes for SDK consumers.

## What to Check

### 1. Breaking Changes Detection
**API Surface Changes:**
- Removed or renamed exported functions, classes, or types
- Changed function signatures (parameters, return types)
- Modified required vs optional parameters
- Changed default parameter values
- Removed or renamed public properties/methods

**Configuration Changes:**
- Modified config object structure
- Changed environment variable names or formats
- Updated initialization patterns
- Modified event names or data structures

### 2. Integration Pattern Consistency
**Method Signatures:**
- Similar operations should have similar parameter patterns
- Consistent naming across packages (e.g., `connect()` vs `connectWallet()`)
- Parameter order consistency (e.g., always `(options, callback)`)
- Return type consistency (Promise vs callback patterns)

**Error Handling Patterns:**
- Similar functions should throw similar error types
- Consistent error message formats across packages
- Same error handling strategy within feature areas
- Predictable error recovery patterns

### 3. Migration Path Quality
For any potential breaking changes:
- Clear upgrade path provided in documentation
- Deprecation warnings in code before removal
- Backwards compatibility shims when reasonable
- Version strategy aligns with semver principles

### 4. Developer Ergonomics
**Import Patterns:**
- Consistent export structure across packages
- No unexpected deep imports required
- Clear distinction between public and private APIs
- Tree-shaking friendly exports

**TypeScript Experience:**
- IntelliSense-friendly function names and parameters
- Helpful generic constraints and defaults
- Clear type relationships between related functions
- Good auto-completion experience

### 5. Integration Examples Impact
Check if changes affect common integration patterns:
- Authentication flow setup
- Wallet connection patterns
- Transaction signing workflows
- Error handling examples
- React component usage patterns

### 6. Package Boundary Respect
**Cross-Package Consistency:**
- Similar operations work similarly across packages
- No unexpected differences in web vs React vs core SDKs
- Consistent authentication requirements
- Compatible configuration objects

### 7. Onboarding & Discoverability
**First-Time Experience:**
- Clear initialization patterns with minimal required config
- Good default values that work out-of-the-box
- Intuitive function/method names that suggest their purpose
- Logical grouping of related functionality

**IDE Support:**
- Good TypeScript auto-completion experience
- Clear parameter names that explain what they do

### 8. Multi-SDK Coordination
**When Using Multiple Para SDKs:**
- Consistent authentication state sharing
- No conflicting global state or side effects
- Compatible configuration objects across SDKs
- Clear guidance on which SDK to use when

**Version Compatibility:**
- SDKs work together across reasonable version ranges
- Clear compatibility matrix communication
- Graceful degradation when versions mismatch

### 9. Debugging & Troubleshooting Experience
**Error Pattern Consistency:**
- Similar operations should have similar error handling patterns
- Consistent error types and naming across packages
- Predictable error recovery patterns

**Development Experience:**
- Helpful warnings for common misconfigurations
- Clear logging in development mode
- Easy way to enable/disable debug output
- Good error boundaries in React components

### 10. Performance & Production Readiness
**Runtime Performance:**
- No blocking operations on main thread
- Efficient memory usage patterns
- Proper cleanup of resources (workers, connections, timers)
- Lazy loading of heavy dependencies

**Integration Performance:**
- No blocking operations during SDK initialization
- Lazy loading of optional features that customers may not use
- Efficient integration patterns that don't hurt customer app performance

### 11. Common Integration Patterns Protection
**Standard Workflows:**
- Authentication → Wallet Connection → Transaction flow
- Error handling → Retry → Fallback patterns
- Configuration → Initialization → Usage patterns
- Development → Testing → Production deployment

**Framework-Specific Integration Patterns:**
- React: Consistent hook patterns (`const [value, setValue] = useHook()`), Context provider patterns, component composition consistency
- Next.js: API routes integration patterns, configuration consistency
- Node.js: Server-side operation patterns, environment variable handling consistency
- Mobile: React Native integration patterns, platform-specific considerations

### 12. Testing & Validation Support
**Integration Testing Ease:**
- Provide test utilities and mocks for common scenarios
- Clear patterns for testing async operations
- Mock-friendly API design (dependency injection, configurable endpoints)
- Example test cases for common integration patterns

**Validation & Debugging:**
- Built-in validation with helpful error messages
- Development-mode warnings for common mistakes
- Easy way to test connectivity and configuration
- Clear success/failure indicators

## What NOT to Flag
- Internal API changes not exposed to consumers
- Development/testing utilities changes  
- Documentation-only updates
- Non-breaking feature additions

## Output Format
For each issue:
```
**#N** Breaking change - Removed export at [file:line]
```ts
// Before (v1.2.0)
export function connectWallet(options: WalletOptions): Promise<Wallet>

// After (v1.3.0) - ❌ Missing export
// export function connectWallet removed
```
→ This removes a public API. Add deprecation warning first, or use semantic versioning.

**#N** Inconsistent pattern at [file:line]
```ts
// Other SDKs use:
await para.auth.login({ email, password })

// This PR introduces:
await para.signIn(email, password)  // ❌ Different pattern
```
→ Use consistent `auth.login()` pattern or update all packages

**#N** Poor migration experience at [file:line]
```ts
// Changed from string to object without backward compatibility
function setNetwork(network: NetworkConfig) // ❌ Was string before
```
→ Support both string and object, or provide migration guide

**#N** Breaking TypeScript experience at [file:line]
```ts
// Before: Clear types
interface WalletConfig { address: string; chainId: number }

// After: Less clear
interface WalletConfig { config: any }  // ❌ Lost type safety
```
→ Maintain specific types for better developer experience

**#N** Poor onboarding experience at [file:line]
```ts
// Requires too much configuration for basic usage
const client = new ParaClient({
  apiKey: "...", baseUrl: "...", retryConfig: {...}, 
  networkConfig: {...}, authConfig: {...}  // ❌ Too complex
})
```
→ Provide sensible defaults: `new ParaClient({ apiKey })`

**#N** Multi-SDK state conflict at [file:line]
```ts
// Both SDKs try to manage same global state
window.__PARA_AUTH__ = authState1  // web-sdk
window.__PARA_AUTH__ = authState2  // react-sdk ❌ Conflict
```
→ Use shared state management or namespace collision detection

**#N** Inconsistent error patterns at [file:line]
```ts
// Web SDK throws strings
throw "Transaction failed"

// React SDK throws Error objects  
throw new Error("Transaction failed")  // ❌ Inconsistent
```
→ Use consistent error types across all SDKs

**#N** Performance issue at [file:line]
```ts
// Blocks main thread on initialization
const heavyConfig = computeComplexConfig()  // ❌ Synchronous heavy work
```
→ Use async initialization or lazy loading

**#N** Framework pattern inconsistency at [file:line]
```tsx
// Other hooks return [value, setter]
const [auth, setAuth] = useAuth()

// This hook uses different pattern
const auth = useWallet()  // ❌ No setter, different pattern
const setWallet = useWalletSetter()
```
→ Follow consistent hook patterns: `const [wallet, setWallet] = useWallet()`
```

## Priority Levels
- **High**: Breaking changes without deprecation, multi-SDK conflicts, poor onboarding experience
- **Medium**: Migration path issues, debugging experience problems, performance issues  
- **Low**: Minor inconsistencies, non-critical ergonomic improvements, testing utility gaps

## Integration-Specific Checks
Focus on these common customer integration points:
- **Authentication**: Login/logout flows, session management
- **Wallet Operations**: Connect, disconnect, sign transactions
- **React Integration**: Hook usage patterns, component props
- **Error States**: How errors surface to end applications
- **Configuration**: SDK initialization and setup patterns
- **Environment Support**: Sandbox, beta, production deployment scenarios
- **Framework Compatibility**: React, Next.js, Node.js, React Native integration patterns

## Acceptable Pattern Variations
- Different packages can have environment-specific optimizations
- Internal implementation changes that don't affect public APIs
- Additive changes that maintain backward compatibility
- Performance improvements that don't change behavior