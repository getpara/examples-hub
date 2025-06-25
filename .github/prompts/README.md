# Para Web SDK PR Review Prompts

This directory contains the modular prompt system for automated PR reviews using Claude.

## System Overview

Every PR automatically triggers a comprehensive review that checks for:
- Module safety (SSR compatibility, side effects)
- Documentation quality (JSDoc, type exports)
- Error handling patterns
- TypeScript type safety
- Dependency health
- Package structure consistency
- Developer experience (breaking changes, integration patterns)

## Files

### Main Prompt
- `comprehensive-pr-review.md` - Master prompt that orchestrates all checks

### Individual Check Modules
- `01-module-safety.md` - SSR compatibility, import side effects, package boundaries
- `02-documentation.md` - JSDoc requirements, API documentation
- `03-error-handling.md` - Try/catch patterns, error message quality
- `04-type-safety.md` - TypeScript usage, any types, null safety
- `05-dependencies.md` - Bundle size, peer deps, version conflicts
- `06-package-structure.md` - CJS/ESM config, exports, build output
- `07-developer-experience.md` - Breaking changes, integration consistency, migration paths

## How It Works

1. PR opened/updated → Triggers `.github/workflows/claude-pr-review.yml`
2. **Phase 1**: Only HIGH severity issues reported (gradual rollout per SDK initiatives)
3. Claude analyzes changed files and posts numbered issues
4. Developers can reply with `@claude fix #N` for specific fixes

## Developer Controls

- **Skip review**: Add `[@claude skip-review]` to PR description or comment
- **Manual trigger**: Comment `@claude review-pr` for on-demand review  
- **Fix specific issue**: Reply with `@claude fix issue N` for targeted help

## Output Format

```markdown
## 🔍 PR Review Summary
Found **3 issues** across 2 files

### ✅ Checks Performed
- **Module Safety:** ⚠️ 1 issue found - SSR compatibility, side effects, package boundaries
- **Documentation:** ⚠️ 1 issue found - JSDoc coverage, type exports  
- **Error Handling:** ✅ No issues - Try/catch, error messages
- **Type Safety:** ✅ No issues - Any usage, null checks
- **Dependencies:** ⚠️ 1 issue found - Bundle size, version conflicts
- **Package Structure:** ✅ No issues - CJS/ESM config, build output
- **Developer Experience:** ✅ No issues - Breaking changes, integration patterns

### 🚨 High Priority (1)
**Issue 1:** Browser API without SSR guard at auth.ts:45
→ Add typeof window check

### ⚠️ Medium Priority (2)  
**Issue 2:** Missing JSDoc on signMessage()
**Issue 3:** Bundle +12KB from new dependency

💡 Reply with `@claude fix issue 1` for specific help
```

## Maintaining the System

- **Adding new checks**: Create new module in this directory, reference in `comprehensive-pr-review.md`
- **Tuning sensitivity**: Adjust severity thresholds in individual modules
- **Custom checks**: Add package-specific rules to relevant modules

## Integration with SDK Initiatives
- ✅ Catches side effects and SSR issues (module safety)
- ✅ Enforces JSDoc on exports (documentation)  
- ✅ Monitors bundle size (dependencies)
- ✅ Ensures type exports (type safety)
- ✅ Validates package structure (build config)
- ✅ Prevents breaking changes (developer experience)

## Future Integration Ideas

- **Size-limit integration**: Automatic bundle size monitoring with CI comments
- **Tool integration**: `publint`, `are-the-types-wrong`, `eslint-plugin-compat`
- **Runtime testing**: Import/require tests in Node 18/20 and Chrome headless
- **BOM management**: Workspace-level dependency version pinning
- **Lint coordination**: Avoid duplicating ESLint rule coverage
