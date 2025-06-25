# Para Web SDK PR Review Guidelines

This prompt implements an automated PR review system focused on high-severity issues in the Para Web SDK.

## Repository Context
- Multi-package SDK: @getpara/core-sdk, @getpara/web-sdk, @getpara/react-sdk, @getpara/server-sdk
- Targeting browser, server, React, React Native environments
- Priority: developer experience, security, bundle size, SSR compatibility

## Phased Approach (Per SDK Initiatives)
- **Phase 1 (Current)**: Focus on HIGH severity issues only to reduce noise
- **Future phases**: Gradually expand to medium/low priority as system is tuned

## Review Checks to Run

### 1. Module Safety Check
Look for import-time side effects, SSR compatibility issues, and global mutations:
- Import-time side effects (network calls, timers, global mutations at top level)
- Browser-only APIs without SSR guards (`window`, `document`, WebAuthn, Workers)
- React hydration issues (`useLayoutEffect`, `Math.random()` in render)
- Package boundary violations (browser code in server packages)

### 2. Documentation & API Quality
Check for proper JSDoc and type exports:
- Missing JSDoc on exported functions (need usage, params, returns, examples)
- Unexported types that consumers need
- Poor type names (generic vs descriptive)
- Missing error documentation

### 3. Error Handling & Reliability
Ensure robust error handling:
- Missing try/catch on async operations
- Poor error messages (too technical or generic)
- Unhandled promise rejections
- Missing cleanup in finally blocks

### 4. Type Safety & TypeScript Quality
Check TypeScript usage:
- `any` types that could be more specific
- Missing null checks where needed
- Unexported consumer-facing types
- Dangerous type assertions without justification

### 5. Dependencies & Bundle Impact
Monitor dependency health:
- Peer vs regular dependency misplacement
- Version mismatches across packages
- Bundle size impact from new dependencies
- Environment compatibility issues

### 6. Package Structure & Build Config
Verify package configuration:
- Correct `exports` map in package.json
- No source files in dist folder
- Consistent CJS/ESM configuration
- Proper `sideEffects` flags

## Output Format

Provide a single consolidated comment using this EXACT format and NOTHING ELSE:

```markdown
## 🔍 PR Review Summary

Found **X issues** across Y files

### ✅ Checks Performed

- **Module Safety:** [✅ No issues | ⚠️ N issues found] - SSR compatibility, side effects, package boundaries
- **Documentation:** [✅ No issues | ⚠️ N issues found] - JSDoc coverage, type exports
- **Error Handling:** [✅ No issues | ⚠️ N issues found] - Try/catch, error messages
- **Type Safety:** [✅ No issues | ⚠️ N issues found] - Any usage, null checks
- **Dependencies:** [✅ No issues | ⚠️ N issues found] - Bundle size, version conflicts
- **Package Structure:** [✅ No issues | ⚠️ N issues found] - CJS/ESM config, build output

### 🚨 High Priority (N)

**Issue 1:** [Issue Type] at [file:line]
```ts
// problematic code snippet
```
→ [Specific fix suggestion]

**Issue 2:** [Issue Type] at [file:line]
```json
// problematic config/package.json
```
→ [Specific fix suggestion]

### ⚠️ Medium Priority (N)

**Issue N:** [Brief description] at [file:line]
**Issue N+1:** [Brief description] at [file:line]

### 📝 Low Priority (N)

**Issue N:** [Brief description] at [file:line]

---
💡 **Quick fixes available:** Reply with `@claude fix issue 1` or `@claude fix all`
```

## Important Rules

1. **Use the EXACT format above** - include "Checks Performed" section always
2. **Always show all 6 check categories** with ✅ or ⚠️ status in "Checks Performed"
3. **Number every issue** starting from "Issue 1:" for easy reference (avoid # syntax)
4. **Show code snippets** for high priority issues
5. **Provide specific fixes**, not general advice
6. **Group by severity**: High (blocks/breaks), Medium (should fix), Low (nice to have)
7. **Skip test files** (*.test.ts, *.spec.ts) unless they have critical issues
8. **Be concise** - developers want quick scanning
9. **If no issues found anywhere**, show all ✅ in checks and omit issue sections
10. **Always include the tip** about using `@claude fix` at the bottom

## File Exclusions
- Test files (*.test.ts, *.spec.ts)
- Generated files (dist/, build/)
- Configuration files that are intentionally different

Start your review now by analyzing all changed files in this PR.