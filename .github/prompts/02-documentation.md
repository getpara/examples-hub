# Documentation & API Quality Check

Ensure all exported methods have proper JSDoc and types are consumer-friendly.

## What to Check

### 1. Missing JSDoc on Exports
Every exported function, class, or method needs JSDoc with:
- Description of what it does
- `@param` for each parameter with type and description
- `@returns` describing the return value
- `@example` showing basic usage
- `@throws` documenting possible errors

### 2. API Naming Quality
- Type names should be descriptive and reveal purpose
- Avoid generic names like `Config` or `Options` (prefer `WalletConfig`, `AuthOptions`)
- Function names should clearly indicate their purpose
- Consistent terminology across related APIs

### 3. Error Documentation
For functions that can throw errors:
- Document what errors can occur
- Provide error handling examples
- Ensure error messages are user-friendly

### 4. API Surface Consistency
- Similar functions should have similar signatures
- Consistent naming patterns across packages
- Optional parameters should have sensible defaults

## What NOT to Flag
- Internal/private functions (not exported)
- Type definitions that are purely internal
- Test files and examples
- Auto-generated documentation

## Output Format
For each issue:
```
**Issue N:** Missing JSDoc - `functionName()` at [file:line]
→ Add JSDoc with usage example and error cases

**Issue N:** Poor API name - `Config` at [file:line]
→ Rename to `WalletConfig` or similar descriptive name
```

## Priority
- **High**: Missing JSDoc on public APIs
- **Medium**: Poor API naming, inconsistent terminology
- **Low**: Missing examples in existing JSDoc