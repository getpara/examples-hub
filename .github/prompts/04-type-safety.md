# Type Safety & TypeScript Quality Check

Ensure strong typing and proper TypeScript usage across the SDK.

## What to Check

### 1. Any Type Usage
- Flag `any` types that could be more specific
- Check for implicit `any` from missing type annotations
- Suggest specific types or generic constraints
- Allow `any` only when truly dynamic (like external API responses)

### 2. Type Exports
- Any type that consumers might reference must be exported
- Ensure consumer-facing types are properly exported from package index
- No "hidden" constants that break TypeScript inference
- Verify generic type parameters are meaningful
- No orphaned types that aren't used
- Clear distinction between public and private type APIs

### 3. Null/Undefined Safety
- Look for missing null checks where values could be undefined
- Check for proper optional chaining usage
- Ensure function parameters have appropriate nullability
- Flag dangerous assertions (`!` operator) without justification

### 4. Generic Usage
- Proper generic constraints where needed
- Meaningful generic parameter names (not just `T`)
- Avoid over-constraining generics
- Ensure generics are actually generic (not fixed types)

### 5. Interface vs Type Usage
- Consistent patterns across the codebase
- Prefer interfaces for object shapes that might be extended
- Use type aliases for unions, primitives, computed types

### 6. Type Assertions
- Flag unnecessary type assertions
- Ensure type assertions are safe and justified
- Suggest type guards instead of assertions where possible

## What NOT to Flag
- Test files with intentional type testing
- External library type compatibility shims
- Temporary `any` with TODO comments for future improvement

## Output Format
For each issue:
```
**#N** `any` usage at [file:line]
```ts
function process(data: any) {  // ❌ Too broad
```
→ Use specific type or generic: `function process<T>(data: T)`

**#N** Unexported type at [file:line]  
```ts
type WalletConfig = { ... }  // ❌ Consumers need this
```
→ Export from package index

**#N** Missing null check at [file:line]
```ts
user.wallet.address  // ❌ wallet could be undefined
```
→ Use optional chaining: `user.wallet?.address`

**#N** Dangerous assertion at [file:line]
```ts
const wallet = getWallet()!  // ❌ Could throw
```
→ Add null check or use type guard
```

## Priority
- **High**: `any` types in public APIs, missing null checks
- **Medium**: Unexported types, dangerous assertions
- **Low**: Type naming improvements, interface vs type consistency