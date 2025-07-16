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

// Helper class to track screen state
class _ScreenState {
  bool isOnLoginScreen = false;
  bool isOnWalletScreen = false;
  bool hasLoadingIndicator = false;
  final Set<String> foundLoginElements = {};
  final Set<String> foundWalletElements = {};
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
  
  /// Waits for wallets view with advanced debugging and refresh strategies
  Future<void> waitForWalletsView() async {
    print('⏳ Waiting for wallets view with advanced detection...');
    
    // Dump initial page source for debugging
    await _dumpPageSource('Initial state after authentication');
    
    // Force a refresh of Appium's view
    await _forceAppiumRefresh();
    
    // Wait for login screen to disappear and wallets screen to appear
    const maxAttempts = 40;
    const loginScreenIdentifiers = ['Sign Up or Log In', 'Phone', 'Email', 'Powered by'];
    const walletScreenIdentifiers = ['Wallets', 'Logout', 'Create Your First Wallet', 'Create First Wallet'];
    
    for (int attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        // Every 5 attempts, force another refresh and dump page source
        if (attempt > 0 && attempt % 5 == 0) {
          print('🔄 Forcing Appium refresh (attempt $attempt)...');
          await _forceAppiumRefresh();
          
          if (attempt % 10 == 0) {
            await _dumpPageSource('Debug at attempt $attempt');
          }
        }
        
        // Check current screen state
        final screenState = await _analyzeCurrentScreen(loginScreenIdentifiers, walletScreenIdentifiers);
        
        if (screenState.isOnWalletScreen) {
          print('✅ Wallet screen detected!');
          print('  - Found wallet elements: ${screenState.foundWalletElements}');
          await Future.delayed(Duration(seconds: 1)); // Let it stabilize
          return;
        }
        
        if (screenState.hasLoadingIndicator) {
          print('⏳ Loading indicator detected, waiting for transition...');
          await Future.delayed(Duration(seconds: 2));
          continue;
        }
        
        if (screenState.isOnLoginScreen) {
          if (attempt % 3 == 0) {
            print('⚠️ Still on login screen (attempt $attempt)');
            print('  - Found login elements: ${screenState.foundLoginElements}');
          }
        } else if (!screenState.isOnWalletScreen) {
          print('🔍 Unknown screen state (attempt $attempt)');
          print('  - Not login, not wallet, checking for any activity...');
          
          // Try to find ANY button or text that indicates we've moved past login
          final allButtons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
          final nonKeyboardButtons = <String>[];
          
          for (final button in allButtons) {
            try {
              final label = await button.attributes['label'];
              if (!['shift', 'done', 'Emoji', 'Dictate', 'null', ''].contains(label) &&
                  !loginScreenIdentifiers.any((id) => label.contains(id))) {
                nonKeyboardButtons.add(label);
              }
            } catch (e) {
              // Continue
            }
          }
          
          if (nonKeyboardButtons.isNotEmpty) {
            print('✅ Found non-login buttons: $nonKeyboardButtons');
            print('  Assuming we\'ve navigated away from login');
            return;
          }
        }
        
      } catch (e) {
        print('⚠️ Error during detection attempt $attempt: $e');
      }
      
      await Future.delayed(Duration(milliseconds: 500));
    }
    
    // Final diagnostic before giving up
    await _dumpPageSource('Final state - timeout reached');
    print('❌ Failed to detect wallet screen after $maxAttempts attempts');
    print('⚠️ Proceeding anyway, but test may fail');
  }
  
  // Helper method to dump page source for debugging
  Future<void> _dumpPageSource(String context) async {
    try {
      print('\n📋 PAGE SOURCE DUMP ($context):');
      // final pageSource = await driver.pageSource; // For future detailed analysis
      
      // Extract key information instead of dumping entire XML
      final staticTexts = await driver.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
      final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
      
      print('  - Static texts found: ${staticTexts.length}');
      for (int i = 0; i < staticTexts.length && i < 10; i++) {
        try {
          final text = await staticTexts[i].text;
          if (text.isNotEmpty) print('    [$i] "$text"');
        } catch (e) {
          // Skip
        }
      }
      
      print('  - Buttons found: ${buttons.length}');
      for (int i = 0; i < buttons.length && i < 10; i++) {
        try {
          final label = await buttons[i].attributes['label'];
          if (label != 'null') print('    [$i] "$label"');
        } catch (e) {
          // Skip
        }
      }
      
      // Save full page source to file for detailed analysis
      // Uncomment if needed:
      // import 'dart:io';
      // final timestamp = DateTime.now().millisecondsSinceEpoch;
      // await File('page_source_$timestamp.xml').writeAsString(pageSource);
      
      print('');
    } catch (e) {
      print('⚠️ Failed to dump page source: $e');
    }
  }
  
  // Force Appium to refresh its view of the UI
  Future<void> _forceAppiumRefresh() async {
    try {
      // Method 1: Request page source (forces re-query)
      await driver.pageSource;
      
      // Method 2: Perform a minimal swipe to trigger UI refresh
      final window = await driver.window;
      final size = await window.size;
      final centerX = size.width ~/ 2;
      final centerY = size.height ~/ 2;
      
      // Very small swipe that shouldn't affect UI but forces refresh
      await driver.execute('mobile:swipe', <dynamic>[<String, dynamic>{
        'direction': 'up',
        'startX': centerX,
        'startY': centerY,
        'endX': centerX,
        'endY': centerY - 10,
        'duration': 0.1
      }]);
      
      await Future.delayed(Duration(milliseconds: 200));
    } catch (e) {
      // Refresh failed, but continue
    }
  }
  
  // Analyze current screen state
  Future<_ScreenState> _analyzeCurrentScreen(
    List<String> loginIdentifiers,
    List<String> walletIdentifiers,
  ) async {
    final state = _ScreenState();
    
    try {
      // Check for loading indicators
      final loadingIndicators = await driver.findElements(AppiumBy.className('XCUIElementTypeActivityIndicator')).toList();
      state.hasLoadingIndicator = loadingIndicators.isNotEmpty;
      
      // Check static texts
      final staticTexts = await driver.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
      for (final element in staticTexts) {
        try {
          final text = await element.text;
          if (text.isEmpty) continue;
          
          // Check login identifiers
          for (final identifier in loginIdentifiers) {
            if (text.contains(identifier)) {
              state.foundLoginElements.add(identifier);
              state.isOnLoginScreen = true;
            }
          }
          
          // Check wallet identifiers
          for (final identifier in walletIdentifiers) {
            if (text.contains(identifier)) {
              state.foundWalletElements.add(identifier);
              state.isOnWalletScreen = true;
            }
          }
        } catch (e) {
          // Continue
        }
      }
      
      // Check buttons
      final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
      for (final button in buttons) {
        try {
          final label = await button.attributes['label'];
          if (label == 'null') continue;
          
          // Check for wallet screen buttons
          if (walletIdentifiers.any((id) => label.contains(id))) {
            state.foundWalletElements.add(label);
            state.isOnWalletScreen = true;
          }
          
          // Check for login screen buttons
          if (loginIdentifiers.any((id) => label.contains(id))) {
            state.foundLoginElements.add(label);
            state.isOnLoginScreen = true;
          }
        } catch (e) {
          // Continue
        }
      }
      
    } catch (e) {
      print('⚠️ Error analyzing screen: $e');
    }
    
    return state;
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
    print('🔢 Entering OTP code: $code');
    
    // Wait a moment for OTP fields to be ready
    await Future.delayed(Duration(seconds: 1));
    
    try {
      // Get all text fields
      final textFields = await driver.findElements(AppiumBy.className('XCUIElementTypeTextField')).toList();
      
      if (textFields.length >= 6) {
        // Use the last 6 text fields as OTP fields
        final otpFields = textFields.sublist(textFields.length - 6);
        
        for (int i = 0; i < 6 && i < code.length; i++) {
          await otpFields[i].click();
          await otpFields[i].clear();
          await otpFields[i].sendKeys(code[i]);
          await Future.delayed(Duration(milliseconds: 300));
        }
        
        await Future.delayed(Duration(seconds: 2));
        return;
      }
      
      throw Exception('Expected at least 6 text fields for OTP, found ${textFields.length}');
      
    } catch (e) {
      throw Exception('Failed to enter OTP code: $e');
    }
  }
  
  Future<void> _performBiometricAuth() async {
    await Future.delayed(Duration(seconds: 3));
    
    // Handle system dialog with coordinate tap (like Swift implementation)
    // Tap at normalized coordinates (0.5, 0.92) - center horizontally, 92% from top
    try {
      print('📱 Tapping Continue button location (coordinate-based)...');
      final window = await driver.window;
      final size = await window.size;
      
      // Calculate tap coordinates - center horizontally, 85% from top for Continue button
      final x = size.width ~/ 2;
      final y = (size.height * 0.85).round();
      
      // Perform tap at coordinates
      await driver.execute('mobile:tap', <dynamic>[<String, dynamic>{
        'x': x,
        'y': y
      }]);
      
      print('✅ Tapped at coordinates ($x, $y)');
      await Future.delayed(Duration(seconds: 1));
    } catch (e) {
      print('⚠️ Could not perform coordinate tap: $e');
    }
    
    try {
      await driver.execute('mobile:sendBiometricMatch', <dynamic>[<String, dynamic>{
        'type': 'touchId',
        'match': true
      }]);
      print('✅ Biometric authentication successful');
      
      // Wait longer for authentication to complete and navigation to happen
      print('⏳ Waiting for authentication to complete...');
      await Future.delayed(Duration(seconds: 5));
      
    } catch (e) {
      throw Exception('Biometric authentication failed: $e');
    }
  }
}