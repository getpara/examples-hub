# Package Structure & Build Configuration Check

Ensure consistent package structure and proper CJS/ESM configuration.

## What to Check

### 1. Package.json Exports
- Correct `main`, `module`, `types` field configuration
- Proper `exports` map for dual CJS/ESM packages
- Consistent file extensions (`.js`, `.cjs`, `.mjs`)
- `sideEffects` field properly set

### 2. Build Output Structure
- No source files (`.ts`, `.tsx`) in `dist/` folder
- Consistent directory structure across packages
- Both CJS and ESM builds present when needed
- TypeScript declaration files (`.d.ts`) in correct location

### 3. File Extensions & Module Format
- `.cjs` files for CommonJS modules
- `.mjs` files for ES modules  
- Consistent usage across all packages
- Proper `package.json` in subdirectories

### 4. Bundle Configuration
- Similar esbuild configuration across packages
- Consistent external dependencies marking
- Proper tree-shaking configuration
- Minification settings appropriate for package type

### 5. Entry Points
- All public entry points properly exported
- No broken import paths in `exports` map
- Conditional exports for different environments
- Backwards compatibility maintained

### 6. Package Metadata
- Proper `files` field to exclude development files
- Version consistency across related packages
- License and repository information
- Keywords for discoverability

## What NOT to Flag
- Development-only packages with different structure
- Intentional differences for specific use cases
- Legacy compatibility configurations

## Output Format
For each issue:
```
**#N** Missing exports path at [package]/package.json
```json
"exports": {
  ".": "./dist/index.js"
  // ❌ Missing "./utils" path
}
```
→ Add "./utils": "./dist/utils/index.js"

**#N** Source files in dist at [package]/dist/src/
→ Update build script to exclude source files

**#N** Inconsistent CJS/ESM setup in [package]
```json
"main": "./dist/index.js",     // ❌ No module field
"types": "./dist/index.d.ts"
```
→ Add "module": "./dist/esm/index.js"

**#N** Wrong sideEffects flag at [package]/package.json
```json
"sideEffects": true  // ❌ Should be false for pure modules
```
→ Set to false if package has no side effects
```

## Priority
- **High**: Broken exports, missing builds, source files in dist
- **Medium**: Inconsistent module format, wrong sideEffects
- **Low**: Missing metadata, optimization opportunities