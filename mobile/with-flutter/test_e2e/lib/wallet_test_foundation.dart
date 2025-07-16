// Wallet Test Foundation - Deep Implementation
// Provides robust, isolated test contexts for wallet operations

import 'package:appium_driver/async_io.dart';
import 'test_constants.dart';

/// Wallet types supported in tests
enum WalletType {
  evm,
  solana, 
  cosmos
}

/// Represents the complete state of a test wallet context
class WalletTestContext {
  final String email;
  final WalletType walletType;
  final DateTime createdAt;
  final String contextId;
  
  WalletTestContext({
    required this.email,
    required this.walletType,
    required this.createdAt,
    required this.contextId,
  });
  
  @override
  String toString() => 'WalletTestContext(id: $contextId, email: $email, type: $walletType)';
}

/// Factory for creating isolated wallet test contexts
class WalletTestFactory {
  static final List<WalletTestContext> _activeContexts = [];
  
  /// Creates a completely isolated test context for wallet operations
  static Future<WalletTestContext> createIsolatedContext({
    required AppiumWebDriver driver,
    required WalletType walletType,
  }) async {
    final contextId = 'ctx_${DateTime.now().millisecondsSinceEpoch}';
    final email = TestConstants.generateUniqueEmail();
    
    print('🏗️ Creating isolated context: $contextId');
    print('📧 Test email: $email');
    print('🔗 Wallet type: $walletType');
    
    final context = WalletTestContext(
      email: email,
      walletType: walletType,
      createdAt: DateTime.now(),
      contextId: contextId,
    );
    
    _activeContexts.add(context);
    
    try {
      // Step 1: Ensure clean starting state
      await _ensureCleanState(driver);
      
      // Step 2: Create authenticated session
      await _createAuthenticatedSession(driver, context);
      
      // Step 3: Set up wallet-specific state
      await _setupWalletContext(driver, context);
      
      print('✅ Context created successfully: $contextId');
      return context;
      
    } catch (e) {
      print('❌ Context creation failed: $e');
      await destroyContext(driver, context);
      rethrow;
    }
  }
  
  /// Destroys a test context and cleans up all associated state
  static Future<void> destroyContext(AppiumWebDriver driver, WalletTestContext context) async {
    print('🧹 Destroying context: ${context.contextId}');
    
    try {
      // Step 1: Logout if possible
      await _attemptLogout(driver);
      
      // Step 2: Clear any alerts/modals
      await _clearUIState(driver);
      
      // Step 3: Return to main screen
      await _returnToMainScreen(driver);
      
      print('✅ Context destroyed: ${context.contextId}');
      
    } catch (e) {
      print('⚠️ Context destruction had issues: $e');
      // Don't fail the test for cleanup issues
    } finally {
      _activeContexts.remove(context);
    }
  }
  
  /// Destroys all active contexts (for emergency cleanup)
  static Future<void> destroyAllContexts(AppiumWebDriver driver) async {
    print('🚨 Emergency cleanup: destroying ${_activeContexts.length} contexts');
    
    for (final context in List.from(_activeContexts)) {
      await destroyContext(driver, context);
    }
  }
  
  // Private implementation methods
  
  static Future<void> _ensureCleanState(AppiumWebDriver driver) async {
    print('🧼 Ensuring clean starting state...');
    
    // Check if we're already on main screen
    try {
      final elements = await driver.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
      for (final element in elements) {
        final text = await element.text;
        if (text.contains('Sign Up or Log In')) {
          print('✅ Already on main screen');
          return;
        }
      }
    } catch (e) {
      // Continue with cleanup
    }
    
    // Try to logout if we're logged in
    await _attemptLogout(driver);
    
    // Clear any modal states
    await _clearUIState(driver);
    
    // Wait for stable state
    await Future.delayed(Duration(seconds: 2));
  }
  
  static Future<void> _createAuthenticatedSession(AppiumWebDriver driver, WalletTestContext context) async {
    print('🔐 Creating authenticated session...');
    
    final helper = WalletTestHelper(driver);
    
    // Retry authentication up to 3 times
    for (int attempt = 1; attempt <= 3; attempt++) {
      try {
        await helper.performEmailAuthWithPasskey(context.email);
        await helper.waitForWalletsView();
        print('✅ Authentication successful on attempt $attempt');
        return;
        
      } catch (e) {
        print('⚠️ Authentication attempt $attempt failed: $e');
        if (attempt == 3) {
          throw Exception('Authentication failed after 3 attempts: $e');
        }
        
        // Wait and retry
        await Future.delayed(Duration(seconds: 2));
      }
    }
  }
  
  static Future<void> _setupWalletContext(AppiumWebDriver driver, WalletTestContext context) async {
    print('🏦 Setting up wallet context for ${context.walletType}...');
    
    final helper = WalletTestHelper(driver);
    
    switch (context.walletType) {
      case WalletType.evm:
        await helper.ensureEVMWalletExists();
        break;
      case WalletType.solana:
        await helper.ensureSolanaWalletExists();
        break;
      case WalletType.cosmos:
        await helper.ensureCosmosWalletExists();
        break;
    }
    
    print('✅ Wallet context ready for ${context.walletType}');
  }
  
  static Future<void> _attemptLogout(AppiumWebDriver driver) async {
    try {
      final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
      for (final button in buttons) {
        try {
          final label = await button.attributes['label'];
          if (label.toLowerCase().contains('logout')) {
            await button.click();
            await Future.delayed(Duration(seconds: 1));
            print('✅ Logout successful');
            return;
          }
        } catch (e) {
          // Continue searching
        }
      }
    } catch (e) {
      // Logout not available or failed - that's okay
    }
  }
  
  static Future<void> _clearUIState(AppiumWebDriver driver) async {
    try {
      // Dismiss any alerts
      final alerts = await driver.findElements(AppiumBy.className('XCUIElementTypeAlert')).toList();
      for (final alert in alerts) {
        try {
          final okButton = await alert.findElement(AppiumBy.className('XCUIElementTypeButton'));
          await okButton.click();
        } catch (e) {
          // Continue
        }
      }
      
      // Dismiss any modals by tapping outside
      final window = await driver.window;
      final size = await window.size;
      await driver.mouse.moveTo(xOffset: size.width ~/ 2, yOffset: 100, absolute: true);
      await driver.mouse.click();
      
    } catch (e) {
      // UI clear failed - that's okay
    }
  }
  
  static Future<void> _returnToMainScreen(AppiumWebDriver driver) async {
    // Try to navigate back to main screen
    for (int attempt = 0; attempt < 5; attempt++) {
      try {
        final elements = await driver.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
        for (final element in elements) {
          final text = await element.text;
          if (text.contains('Sign Up or Log In')) {
            print('✅ Successfully returned to main screen');
            return;
          }
        }
        
        // Try to go back
        final backButtons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
        for (final button in backButtons) {
          try {
            final label = await button.attributes['label'];
            if (label.contains('Back') || label.contains('←')) {
              await button.click();
              await Future.delayed(Duration(seconds: 1));
              break;
            }
          } catch (e) {
            // Continue
          }
        }
        
      } catch (e) {
        await Future.delayed(Duration(seconds: 1));
      }
    }
    
    print('⚠️ Could not return to main screen, but continuing...');
  }
}

/// Enhanced test helper with robust wallet operations
class WalletTestHelper {
  final AppiumWebDriver driver;
  
  WalletTestHelper(this.driver);
  
  /// Performs email authentication with comprehensive error handling
  Future<void> performEmailAuthWithPasskey(String email) async {
    print('🔐 Performing email authentication: $email');
    
    // Switch to email mode
    await _switchToEmailMode();
    
    // Enter email and continue
    await _enterEmailAndContinue(email);
    
    // Handle OTP verification
    await _handleOTPVerification();
    
    // Complete biometric authentication
    await _performBiometricAuth();
    
    print('✅ Email authentication completed');
  }
  
  /// Waits for wallets view with retry logic
  Future<void> waitForWalletsView() async {
    print('⏳ Waiting for wallets view...');
    
    for (int attempt = 0; attempt < 15; attempt++) {
      try {
        // Simple check: Look for "Wallets" title and "Logout" button
        bool hasWalletsTitle = false;
        bool hasLogoutButton = false;
        
        // Check for "Wallets" title
        final staticTexts = await driver.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
        for (final element in staticTexts) {
          final text = await element.text;
          if (text == 'Wallets') {
            hasWalletsTitle = true;
            break;
          }
        }
        
        // Check for "Logout" button
        final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
        for (final button in buttons) {
          final label = await button.attributes['label'];
          if (label == 'Logout') {
            hasLogoutButton = true;
            break;
          }
        }
        
        // Success if we find both key elements
        if (hasWalletsTitle && hasLogoutButton) {
          print('✅ Wallets view found (title: $hasWalletsTitle, logout: $hasLogoutButton)');
          return;
        }
        
      } catch (e) {
        // Continue waiting
      }
      
      if (attempt % 3 == 0) {
        print('⏳ Still waiting for wallets view... (attempt ${attempt + 1}/15)');
      }
      
      await Future.delayed(Duration(seconds: 1));
    }
    
    throw Exception('Wallets view not found after 15 attempts');
  }
  
  /// Ensures EVM wallet exists (creates if needed)
  Future<void> ensureEVMWalletExists() async {
    print('🏦 Ensuring EVM wallet exists...');
    
    try {
      // Check if "Create First Wallet" button exists
      final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
      for (final button in buttons) {
        try {
          final label = await button.attributes['label'];
          if (label.contains('Create First Wallet') || label.contains('createFirstWalletButton')) {
            await button.click();
            await Future.delayed(Duration(seconds: 3));
            print('✅ First EVM wallet created');
            return;
          }
        } catch (e) {
          // Continue searching
        }
      }
      
      // Check if EVM wallet already exists
      final cells = await driver.findElements(AppiumBy.className('XCUIElementTypeCell')).toList();
      if (cells.isNotEmpty) {
        print('✅ EVM wallet already exists');
        return;
      }
      
      throw Exception('Could not create or find EVM wallet');
      
    } catch (e) {
      throw Exception('EVM wallet setup failed: $e');
    }
  }
  
  /// Ensures Solana wallet exists (creates if needed)
  Future<void> ensureSolanaWalletExists() async {
    print('🏦 Ensuring Solana wallet exists...');
    
    try {
      await ensureEVMWalletExists(); // EVM wallet must exist first
      
      // Look for Create SOLANA Wallet button
      final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
      for (final button in buttons) {
        try {
          final label = await button.attributes['label'];
          if (label.contains('Create SOLANA Wallet')) {
            await button.click();
            await Future.delayed(Duration(seconds: 3));
            print('✅ Solana wallet created');
            return;
          }
        } catch (e) {
          // Continue searching
        }
      }
      
      print('✅ Solana wallet already exists or not needed');
      
    } catch (e) {
      throw Exception('Solana wallet setup failed: $e');
    }
  }
  
  /// Ensures Cosmos wallet exists (creates if needed)
  Future<void> ensureCosmosWalletExists() async {
    print('🏦 Ensuring Cosmos wallet exists...');
    
    try {
      await ensureEVMWalletExists(); // EVM wallet must exist first
      
      // Look for Create COSMOS Wallet button
      final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
      for (final button in buttons) {
        try {
          final label = await button.attributes['label'];
          if (label.contains('Create COSMOS Wallet')) {
            await button.click();
            await Future.delayed(Duration(seconds: 3));
            print('✅ Cosmos wallet created');
            return;
          }
        } catch (e) {
          // Continue searching
        }
      }
      
      print('✅ Cosmos wallet already exists or not needed');
      
    } catch (e) {
      throw Exception('Cosmos wallet setup failed: $e');
    }
  }
  
  // Private implementation methods
  
  Future<void> _switchToEmailMode() async {
    final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
    for (final button in buttons) {
      try {
        final label = await button.attributes['label'];
        if (label.contains('Email')) {
          await button.click();
          await Future.delayed(Duration(milliseconds: 500));
          return;
        }
      } catch (e) {
        // Continue searching
      }
    }
  }
  
  Future<void> _enterEmailAndContinue(String email) async {
    final textFields = await driver.findElements(AppiumBy.className('XCUIElementTypeTextField')).toList();
    if (textFields.isEmpty) {
      throw Exception('No email text field found');
    }
    
    await textFields.first.click();
    await textFields.first.clear();
    await textFields.first.sendKeys(email);
    await Future.delayed(Duration(seconds: 1));
    
    // Click Continue button
    final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
    for (final button in buttons) {
      try {
        final label = await button.attributes['label'];
        final enabled = await button.enabled;
        if (label == 'Continue' && enabled) {
          await button.click();
          return;
        }
      } catch (e) {
        // Continue searching
      }
    }
    
    throw Exception('Continue button not found or not enabled');
  }
  
  Future<void> _handleOTPVerification() async {
    // Wait for OTP verification view
    for (int attempt = 0; attempt < 15; attempt++) {
      try {
        final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
        for (final button in buttons) {
          final label = await button.attributes['label'];
          if (label.toLowerCase().contains('resend')) {
            print('✅ OTP verification view found');
            break;
          }
        }
        break;
      } catch (e) {
        await Future.delayed(Duration(seconds: 1));
      }
    }
    
    // Enter OTP code
    await _enterOTPCode(TestConstants.verificationCode);
  }
  
  Future<void> _enterOTPCode(String code) async {
    final textFields = await driver.findElements(AppiumBy.className('XCUIElementTypeTextField')).toList();
    if (textFields.length < 6) {
      throw Exception('Expected 6 OTP fields, found ${textFields.length}');
    }
    
    final otpFields = textFields.sublist(textFields.length - 6);
    
    for (int i = 0; i < 6 && i < code.length; i++) {
      await otpFields[i].click();
      await otpFields[i].clear();
      await otpFields[i].sendKeys(code[i]);
      await Future.delayed(Duration(milliseconds: 300));
    }
    
    await Future.delayed(Duration(seconds: 2));
  }
  
  Future<void> _performBiometricAuth() async {
    await Future.delayed(Duration(seconds: 3));
    try {
      await driver.execute('mobile:sendBiometricMatch', <dynamic>[<String, dynamic>{
        'type': 'touchId',
        'match': true
      }]);
      print('✅ Biometric authentication successful');
    } catch (e) {
      throw Exception('Biometric authentication failed: $e');
    }
  }
}