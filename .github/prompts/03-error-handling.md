# Error Handling & Reliability Check

Ensure robust error handling patterns throughout the SDK.

## What to Check

### 1. Missing Try/Catch Blocks
Any client-reachable call should be wrapped in try/catch:
- Async operations (network requests, crypto operations)
- External library calls that might throw
- User input processing
- File system operations
- Worker communications

### 2. Error Message Quality
- Error messages should be user-friendly, not technical stack traces
- Include context about what operation failed
- Provide actionable guidance when possible
- Avoid exposing internal implementation details

### 3. Error Handling Strategy
For each error scenario, code should decide:
- **Fail fast**: If state is broken and recovery impossible
- **Graceful fallback**: If user experience matters more than correctness
- **Retry logic**: For transient network/service failures
- **User notification**: How errors surface to the application

### 4. Promise Handling
- All promises should have `.catch()` or be in try/catch
- Avoid unhandled promise rejections
- Don't swallow errors silently

### 5. Async Operation Patterns
- Proper cleanup in finally blocks
- Resource disposal (workers, connections)
- Timeout handling for long operations

## What NOT to Flag
- Test files deliberately testing error conditions
- Internal utility functions with documented error expectations
- Error re-throwing that adds context

## Output Format
For each issue:
```
**#N** Missing error handling at [file:line]
```ts
const result = await provider.request(...)  // ❌ Unhandled rejection
```
→ Add try/catch with user-friendly error message

**#N** Poor error message at [file:line]
```ts
throw new Error('Invalid params')  // ❌ Too generic
```
→ Include context: "Invalid wallet parameters: address must be provided"

**#N** Unhandled promise at [file:line]
```ts
someAsyncOperation().then(...)  // ❌ No catch
```
→ Add .catch() or wrap in try/catch
```

## Priority
- **High**: Unhandled promises, missing try/catch on user-facing APIs
- **Medium**: Poor error messages, missing cleanup
- **Low**: Error message improvements for internal functions