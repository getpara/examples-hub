# Flutter E2E Test Foundation - Deep Implementation

## 🎯 **Architecture Overview**

This foundation provides **robust, isolated test contexts** for Flutter wallet E2E tests, matching Swift patterns while addressing Flutter-specific challenges.

### **Key Components:**

1. **WalletTestFactory** - Creates isolated test contexts
2. **WalletTestContext** - Represents complete test state
3. **WalletTestHelper** - Robust wallet operations
4. **TestConstants** - Centralized test data generation

## 🧠 **Deep Design Decisions**

### **Test Isolation Strategy**
```dart
setUp(() async {
  // Fresh context for EACH test
  context = await WalletTestFactory.createIsolatedContext(
    driver: driver,
    walletType: WalletType.evm,
  );
});

tearDown(() async {
  // Clean destruction
  await WalletTestFactory.destroyContext(driver, context);
});
```

**Why this pattern:**
- Each test gets a **fresh account** and **clean state**
- No test interdependencies or cascading failures
- Robust cleanup prevents orphaned test data
- Matches Swift's class-level isolation principle

### **Retry and Error Handling**
```dart
// Authentication with retry logic
for (int attempt = 1; attempt <= 3; attempt++) {
  try {
    await helper.performEmailAuthWithPasskey(context.email);
    return; // Success
  } catch (e) {
    if (attempt == 3) throw e; // Final failure
    await Future.delayed(Duration(seconds: 2)); // Retry
  }
}
```

**Why this pattern:**
- Network operations are inherently flaky
- Graceful degradation for temporary failures
- Comprehensive error context for debugging

### **Wallet State Management**
```dart
Future<void> ensureEVMWalletExists() async {
  // Idempotent operation
  if (await walletExists()) return;
  
  // Create only if needed
  await createWallet();
}
```

**Why this pattern:**
- Idempotent operations prevent duplicate creation
- Handles app state variations gracefully
- Reduces test setup time when possible

## 📁 **File Structure**

```
test_e2e/
├── lib/
│   ├── wallet_test_foundation.dart    # Core foundation
│   └── test_constants.dart            # Test data generation
├── authentication_test.dart           # Auth tests (matches Swift)
├── evm_wallet_test.dart              # EVM wallet operations
├── solana_wallet_test.dart           # Solana wallet operations (TODO)
├── cosmos_wallet_test.dart           # Cosmos wallet operations (TODO)
└── tool/
    └── run_tests.dart                 # Test runner
```

## 🚀 **Usage Examples**

### **Running Individual Tests:**
```bash
# Authentication tests only
dart authentication_test.dart

# EVM wallet tests only  
dart evm_wallet_test.dart

# All tests
dart run tool/run_tests.dart
```

### **Creating New Test Files:**
```dart
group('New Wallet Type Tests', () {
  late AppiumWebDriver driver;
  late WalletTestContext context;
  
  setUp(() async {
    context = await WalletTestFactory.createIsolatedContext(
      driver: driver,
      walletType: WalletType.newType,
    );
  });
  
  tearDown(() async {
    await WalletTestFactory.destroyContext(driver, context);
  });
  
  test('New Operation', () async {
    // Test implementation
  });
});
```

## 🔧 **Implementation Status**

### **✅ Completed (Phase 1):**
- Robust test foundation with isolation
- Authentication tests (email/phone passkey flows)
- EVM wallet tests (basic operations, signing, refresh)
- Comprehensive error handling and retry logic
- Test context management and cleanup

### **🔄 Next Steps (Phase 2):**
- [ ] Solana wallet tests
- [ ] Cosmos wallet tests  
- [ ] Transaction flow tests
- [ ] Error scenario tests
- [ ] Performance optimization

## 🎯 **Key Benefits Over Previous Approach**

### **Before (12 fragmented tests):**
- ❌ Brittle `quickLogin()` helpers
- ❌ Shared state causing cascading failures
- ❌ Complex setup/tearDown logic
- ❌ No systematic error handling

### **After (Foundation approach):**
- ✅ Isolated test contexts
- ✅ Robust error handling with retries
- ✅ Swift-matching patterns
- ✅ Systematic cleanup
- ✅ Maintainable, extensible architecture

## 📊 **Test Execution Strategy**

### **Test Timing:**
- **Authentication tests**: ~2-3 minutes each
- **Wallet operation tests**: ~1-2 minutes each  
- **Full suite**: ~15-20 minutes

### **Reliability Targets:**
- **>95% success rate** for individual tests
- **No cascading failures** between tests
- **Clean state** guaranteed between tests
- **Comprehensive error reporting**

## 🛠️ **Debugging Guide**

### **Common Issues:**
1. **Context creation fails**: Check app state, biometric enrollment
2. **OTP verification hangs**: Verify "Resend code" button detection
3. **Wallet operations fail**: Check navigation state, button labels
4. **Cleanup failures**: Non-fatal, logged but doesn't fail tests

### **Debug Logging:**
Every operation includes detailed logging:
```
🏗️ Creating isolated context: ctx_1234567890
📧 Test email: test123@test.usecapsule.com
🔗 Wallet type: evm
🔐 Performing email authentication...
✅ Context created successfully
```

## 🎉 **Success Metrics**

The foundation is successful when:
- [ ] Tests pass consistently (>95% success rate)
- [ ] No manual cleanup required between runs
- [ ] New test files can be created in <30 minutes
- [ ] Debugging is straightforward with clear error messages
- [ ] Swift pattern compliance maintained

This foundation provides the **robust, scalable base** needed for comprehensive Flutter wallet E2E testing.