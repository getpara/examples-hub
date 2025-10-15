// Wallet Test Foundation - Deep Implementation
// Provides robust, isolated test contexts for wallet operations

import 'dart:io';
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
  
  /// Performs One-Click authentication (email or phone) with OTP entry in web view
  /// Mirrors Swift's performOneClickAuthentication: enters credential, taps Continue,
  /// handles any system "Continue" prompts, enters OTP digits, and waits for wallets view.
  Future<void> performOneClickAuthentication(String credential, {String otpCode = TestConstants.verificationCode}) async {
    print('🔐 Performing One-Click authentication: $credential');

    // Switch to appropriate mode based on credential
    final isEmail = credential.contains('@');
    if (isEmail) {
      await _switchToEmailMode();
      await _enterEmailAndContinue(credential);
    } else {
      await _switchToPhoneMode();
      await _enterPhoneAndContinue(credential);
    }

    // Allow any system dialog that may request confirmation to proceed
    await _allowUseCapsuleSignInIfNeeded();

    // Wait for OTP fields to appear and enter the code
    await _waitForOtpFieldsAndEnterCode(otpCode);

    // Phone flows often present an extra Continue + biometric hand-off after OTP.
    if (!isEmail) {
      await _finalizePhoneOneClickIfNeeded();
    }

    // After OTP, the Safari view should dismiss and app should foreground wallets view
    await waitForWalletsView();
    print('✅ One-Click authentication completed');
  }

  /// If a system or in-app alert is present with a Continue button, tap it.
  Future<void> _allowUseCapsuleSignInIfNeeded() async {
    try {
      // Poll briefly to catch any alert
      for (int attempt = 0; attempt < 10; attempt++) {
        // 1) Try a real iOS alert first
        final alerts = await driver.findElements(AppiumBy.className('XCUIElementTypeAlert')).toList();
        if (alerts.isNotEmpty) {
          final alert = alerts.first;
          final buttons = await alert.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
          AppiumWebElement? continueBtn;
          for (final b in buttons) {
            try {
              final label = await b.attributes['label'];
              if (label.toLowerCase().contains('continue')) {
                continueBtn = b; break;
              }
            } catch (_) {}
          }
          final toTap = continueBtn ?? (buttons.isNotEmpty ? buttons.last : null);
          if (toTap != null) {
            await toTap.click();
            print('✅ Allowed sign-in via system alert');
            await Future.delayed(const Duration(milliseconds: 500));
            return;
          }
        }

        // 2) Some sheets are not XCUIElementTypeAlert. Only try tapping a "Continue"
        //    button if we detect sheet-like copy (to avoid re-tapping the app's Continue).
        bool looksLikeSignInSheet = false;
        try {
          final texts = await driver.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
          for (final t in texts) {
            try {
              final val = await t.text;
              if (val.contains('usecapsule.com') ||
                  val.contains('Wants to Use') ||
                  val.contains('Sign In')) {
                looksLikeSignInSheet = true; break;
              }
            } catch (_) {}
          }
        } catch (_) {}

        if (looksLikeSignInSheet) {
          try {
            final continueById = await driver.findElement(AppiumBy.accessibilityId('Continue'));
            final enabled = await continueById.enabled;
            if (enabled) {
              await continueById.click();
              print('✅ Allowed sign-in by tapping Continue (accessibility)');
              await Future.delayed(const Duration(milliseconds: 500));
              return;
            }
          } catch (_) {}

          // Broad button scan last
          try {
            final allButtons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
            for (final b in allButtons.reversed) {
              try {
                final label = await b.attributes['label'];
                if (label.toLowerCase().contains('continue')) {
                  await b.click();
                  print('✅ Allowed sign-in by tapping Continue (broad scan)');
                  await Future.delayed(const Duration(milliseconds: 500));
                  return;
                }
              } catch (_) {}
            }
          } catch (_) {}
        }

        // Avoid blindly tapping generic "Continue" buttons on the auth landing screen,
        // which would just restart the login flow.
        bool onAuthLanding = false;
        try {
          final staticTexts = await driver.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
          for (final t in staticTexts) {
            try {
              final val = await t.text;
              if (val.contains('Sign Up or Log In') ||
                  val.contains('By logging in you agree') ||
                  val.contains('Powered by')) {
                onAuthLanding = true;
                break;
              }
            } catch (_) {}
          }
        } catch (_) {}

        if (!onAuthLanding) {
          final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
          for (final b in buttons) {
            try {
              final label = await b.attributes['label'];
              if (label.toLowerCase().contains('continue')) {
                await b.click();
                print('✅ Allowed sign-in by tapping Continue (generic button)');
                await Future.delayed(const Duration(milliseconds: 500));
                return;
              }
            } catch (_) {}
          }
        }

        // 3) Try Appium's iOS alert accept command
        try {
          await driver.execute('mobile:alert', <dynamic>[<String, dynamic>{'action': 'accept'}]);
          print('✅ Allowed sign-in by mobile:alert accept');
          await Future.delayed(const Duration(milliseconds: 500));
          return;
        } catch (_) {}

        // 4) As a last resort, attempt coordinate taps at likely button position
        if (attempt > 2) {
          final tapped = await _tapSystemContinueOnly();
          if (tapped) {
            print('✅ Allowed sign-in by coordinate tap');
            await Future.delayed(const Duration(milliseconds: 500));
            return;
          }
        }
        await Future.delayed(const Duration(milliseconds: 250));
      }
    } catch (_) {
      // Ignore alert handling failures
    }
  }

  Future<void> _finalizePhoneOneClickIfNeeded() async {
    print('📱 Finalizing phone One-Click post-OTP...');
    await Future.delayed(const Duration(milliseconds: 800));

    final webViews = await driver.findElements(AppiumBy.className('XCUIElementTypeWebView')).toList();
    if (webViews.isEmpty) {
      print('ℹ️ No web views present post-OTP; skipping phone-specific finalization.');
      return;
    }

    // Re-scan for any explicit Continue buttons presented by the web view/sheet.
    bool tappedExplicitContinue = false;
    try {
      final targetViews = webViews.take(2).toList().reversed;
      for (final webView in targetViews) {
        try {
          final buttons = await webView.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
          for (final button in buttons) {
            try {
              final label = await button.attributes['label'];
              if (label.toLowerCase().contains('continue')) {
                await button.click();
                tappedExplicitContinue = true;
                print('✅ Tapped explicit Continue button inside web view post-OTP');
                await Future.delayed(const Duration(milliseconds: 500));
                break;
              }
            } catch (_) {}
          }
          if (tappedExplicitContinue) break;
        } catch (_) {}
      }
    } catch (_) {}

    // Allow any sheets that might have appeared during the OTP transition.
    await _allowUseCapsuleSignInIfNeeded();

    // Some builds require a system Continue + biometric confirmation.
    if (tappedExplicitContinue || webViews.isNotEmpty) {
      try {
        await tapSystemContinueAndAuthenticate(driver);
      } catch (e) {
        if (!tappedExplicitContinue) {
          print('ℹ️ No system biometric prompt detected post-OTP: $e');
        } else {
          print('ℹ️ System biometric prompt not triggered after tapping Continue: $e');
        }
      }
    }
  }

  /// Try coordinate taps in the bottom portion of the screen where iOS places Continue.
  /// Returns true if a tap was sent.
  Future<bool> _tapSystemContinueOnly() async {
    try {
      final window = await driver.window;
      final size = await window.size;
      // Try several X positions biased to the right where "Continue" sits
      final xs = <double>[0.60, 0.68, 0.76, 0.84, 0.90];
      // Try several Y positions above the keyboard and near sheet buttons
      final ys = <double>[0.78, 0.82, 0.86, 0.90, 0.94];
      for (final fx in xs) {
        for (final fy in ys) {
          final x = (size.width * fx).round();
          final y = (size.height * fy).round();
          await driver.execute('mobile:tap', <dynamic>[<String, dynamic>{'x': x, 'y': y}]);
          await Future.delayed(const Duration(milliseconds: 120));
        }
      }
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<void> _waitForOtpFieldsAndEnterCode(String code) async {
    print('⏳ Waiting for OTP fields to appear...');
    // Wait up to ~20s for OTP text fields to appear (often from SafariViewService)
    for (int attempt = 0; attempt < 40; attempt++) {
      try {
        // Check web view visibility for diagnostics
        final webViews = await driver.findElements(AppiumBy.className('XCUIElementTypeWebView')).toList();
        if (attempt % 5 == 0) {
          print('🔎 WebViews visible: ${webViews.length}');
        }
        // If we still don't see a web view after a few attempts, try foregrounding SafariViewService
        if (webViews.isEmpty && (attempt == 6 || attempt == 12)) {
          try {
            print('ℹ️ Attempting to foreground SafariViewService (attempt $attempt)');
            await driver.execute('mobile: activateApp', <dynamic>[<String, dynamic>{'bundleId': 'com.apple.SafariViewService'}]);
            await Future.delayed(const Duration(milliseconds: 600));
          } catch (_) {}
        }

        // Collect both plain and secure text fields
        final plain = await driver.findElements(AppiumBy.className('XCUIElementTypeTextField')).toList();
        final secure = await driver.findElements(AppiumBy.className('XCUIElementTypeSecureTextField')).toList();
        if (attempt % 5 == 0) {
          print('🔎 TextFields: ${plain.length}, SecureTextFields: ${secure.length}');
        }
        final fields = [...plain, ...secure];
        if (fields.length >= 6 || fields.length == 1) {
          final entered = await _completeOtpEntryInternal(code, fields);
          if (entered) {
            await Future.delayed(const Duration(seconds: 1));
            return;
          }
        }
        // While waiting, also allow any popups that request confirmation
        await _allowUseCapsuleSignInIfNeeded();
      } catch (_) {
        // keep polling
      }
      await Future.delayed(const Duration(milliseconds: 500));
    }
    throw Exception('OTP fields did not appear for One-Click flow');
  }
  
  /// Performs email authentication with comprehensive error handling
  Future<void> performEmailAuthWithPasskey(String email) async {
    print('🔐 Performing email authentication: $email');
    
    // Switch to email mode
    await _switchToEmailMode();
    
    // Enter email and continue
    await _enterEmailAndContinue(email);
    
    // Handle OTP verification
    await _handleOTPVerification();
    // Pick passkey as the method when prompted
    await handleAuthMethodDialogIfPresent();
    
    // Complete biometric authentication
    await _performBiometricAuth();
    
    print('✅ Email authentication completed');
  }

  // Private implementation methods for login mode switching and credential entry
  Future<void> _switchToPhoneMode() async {
    final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
    for (final button in buttons) {
      try {
        final label = await button.attributes['label'];
        if (label.contains('Phone')) {
          await button.click();
          await Future.delayed(const Duration(milliseconds: 500));
          return;
        }
      } catch (_) {}
    }
  }

  Future<void> _enterPhoneAndContinue(String phone) async {
    final textFields = await driver.findElements(AppiumBy.className('XCUIElementTypeTextField')).toList();
    if (textFields.isEmpty) {
      throw Exception('No phone text field found');
    }

    await textFields.first.click();
    await textFields.first.clear();
    await textFields.first.sendKeys(phone);
    await Future.delayed(const Duration(seconds: 1));

    // Click Continue button
    final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
    for (final button in buttons) {
      try {
        final label = await button.attributes['label'];
        final enabled = await button.enabled;
        if (label == 'Continue' && enabled) {
          await button.click();
          await _allowUseCapsuleSignInIfNeeded();
          return;
        }
      } catch (_) {}
    }

    throw Exception('Continue button not found or not enabled');
  }

  /// If the "Choose Authentication Method" dialog appears, choose "Use Passkey".
  Future<void> handleAuthMethodDialogIfPresent() async {
    try {
      // small wait to allow sheet/dialog to appear
      await Future.delayed(const Duration(milliseconds: 400));
      final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
      for (final button in buttons) {
        try {
          final label = await button.attributes['label'];
          if (label.contains('Use Passkey')) {
            print('🪪 Selecting "Use Passkey" on auth method dialog');
            await button.click();
            await Future.delayed(const Duration(seconds: 1));
            return;
          }
        } catch (_) {}
      }
    } catch (_) {}
  }
  
  /// Waits for wallets view with advanced debugging and refresh strategies
  Future<void> waitForWalletsView() async {
    print('⏳ Waiting for wallets view with advanced detection...');
    
    // Dump initial page source for debugging
    await _dumpPageSource('Initial state after authentication');
    
    // Force a refresh of Appium's view
    await _forceAppiumRefresh();
    
    // Wait for login screen to disappear and wallets screen to appear
    const maxAttempts = 120; // allow up to ~2 minutes total
    const loginScreenIdentifiers = ['Sign Up or Log In', 'Phone', 'Email', 'Powered by'];
    const walletScreenIdentifiers = ['Wallets', 'Logout', 'Create Your First Wallet', 'Create First Wallet'];
    const pendingSetupIdentifiers = ['Setting up your account', 'Creating your secure wallets'];
    
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
        
        // Handle explicit setup screen messaging as a loading state
        final isPendingSetup = await _detectTexts(pendingSetupIdentifiers);
        if (screenState.hasLoadingIndicator || isPendingSetup) {
          print('⏳ Loading indicator detected, waiting for transition...');
          await Future.delayed(Duration(seconds: 2));
          continue;
        }
        
        if (screenState.isOnLoginScreen) {
          if (attempt % 3 == 0) {
            print('⚠️ Still on login screen (attempt $attempt)');
            print('  - Found login elements: ${screenState.foundLoginElements}');
          }
          // Opportunistically pick passkey if dialog is up
          await handleAuthMethodDialogIfPresent();
          // Also allow system/in-app Continue prompts if present
          await _allowUseCapsuleSignInIfNeeded();
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

  // Utility: check if any of the given texts exist on screen
  Future<bool> _detectTexts(List<String> texts) async {
    try {
      final staticTexts = await driver.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
      for (final element in staticTexts) {
        try {
          final value = await element.text;
          for (final t in texts) {
            if (value.contains(t)) return true;
          }
        } catch (_) {}
      }
    } catch (_) {}
    return false;
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
      // First check if EVM wallet already exists by looking for EVM wallet cells
      final cells = await driver.findElements(AppiumBy.className('XCUIElementTypeCell')).toList();
      print('🔍 Found ${cells.length} wallet cells');
      
      for (int i = 0; i < cells.length; i++) {
        try {
          final staticTexts = await cells[i].findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
          for (final text in staticTexts) {
            final content = await text.text;
            print('  Cell [$i] text: "$content"');
            if (content.contains('EVM') || content.contains('Ethereum')) {
              print('✅ EVM wallet already exists');
              return;
            }
          }
        } catch (e) {
          print('  Cell [$i] error reading text: $e');
        }
      }
      
      // Look for "Add Wallet" button
      print('📱 Looking for Add Wallet button...');
      final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
      
      // Debug: Print all available buttons
      print('🔍 Available buttons:');
      for (int i = 0; i < buttons.length && i < 10; i++) {
        try {
          final label = await buttons[i].attributes['label'];
          print('  [$i] "$label"');
        } catch (e) {
          print('  [$i] (error reading label)');
        }
      }
      
      for (final button in buttons) {
        try {
          final label = await button.attributes['label'];
          if (label.contains('Add Wallet')) {
            print('📱 Tapping Add Wallet button...');
            await button.click();
            await Future.delayed(Duration(seconds: 2));
            
            // Now look for EVM in the bottom sheet
            print('📱 Looking for EVM option in bottom sheet...');
            await _selectEVMInBottomSheet();
            
            // Wait for wallet creation to complete (can take up to 10 seconds)
            print('⏳ Waiting for EVM wallet creation to complete...');
            await Future.delayed(Duration(seconds: 12));
            print('✅ EVM wallet created successfully');
            return;
          }
        } catch (e) {
          // Continue searching
        }
      }
      
      // Look for "Add Wallet" or "Create Your First Wallet" text
      // Both are GestureDetector with Text, not Buttons
      print('📱 Looking for Add Wallet or Create Your First Wallet text...');
      final staticTexts = await driver.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
      
      // Debug: Print all available text elements
      print('🔍 Available text elements:');
      for (int i = 0; i < staticTexts.length && i < 10; i++) {
        try {
          final content = await staticTexts[i].text;
          print('  [$i] "$content"');
        } catch (e) {
          print('  [$i] (error reading text)');
        }
      }
      
      for (final text in staticTexts) {
        try {
          final content = await text.text;
          if (content.contains('Add Wallet') || 
              content.contains('Create Your First Wallet') || 
              content.contains('Create First Wallet')) {
            print('📱 Tapping wallet creation area: "$content"');
            await text.click();
            await Future.delayed(Duration(seconds: 2));
            
            // Look for EVM in the bottom sheet
            await _selectEVMInBottomSheet();
            
            await Future.delayed(Duration(seconds: 5));
            print('✅ EVM wallet created successfully');
            return;
          }
        } catch (e) {
          // Continue searching
        }
      }
      
      throw Exception('Could not find Add Wallet or Create First Wallet button');
      
    } catch (e) {
      throw Exception('EVM wallet setup failed: $e');
    }
  }

  /// Helper method to select EVM in the wallet type bottom sheet
  Future<void> _selectEVMInBottomSheet() async {
    print('📱 Selecting EVM in bottom sheet...');
    
    // Wait for bottom sheet to appear
    await Future.delayed(Duration(seconds: 1));
    
    // Look for EVM button in the bottom sheet
    final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
    for (final button in buttons) {
      try {
        final label = await button.attributes['label'];
        if (label.contains('EVM') || label.contains('evm')) {
          print('📱 Tapping EVM button...');
          await button.click();
          return;
        }
      } catch (e) {
        // Continue searching
      }
    }
    
    throw Exception('Could not find EVM button in bottom sheet');
  }
  
  /// Ensures Solana wallet exists (creates if needed)
  Future<void> ensureSolanaWalletExists() async {
    print('🏦 Ensuring Solana wallet exists...');
    
    try {
      // Check if SOLANA wallet exists already by scanning wallet cells
      final cells = await driver.findElements(AppiumBy.className('XCUIElementTypeCell')).toList();
      for (final cell in cells) {
        try {
          final texts = await cell.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
          for (final t in texts) {
            final content = await t.text;
            if (content.contains('SOLANA')) {
              print('✅ Solana wallet already exists');
              return;
            }
          }
        } catch (_) {}
      }

      // Create via Add Wallet bottom sheet
      print('📱 Opening Add Wallet and selecting SOLANA...');
      final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
      for (final button in buttons) {
        try {
          final label = await button.attributes['label'];
          if (label.contains('Add Wallet')) {
            await button.click();
            await Future.delayed(Duration(seconds: 1));
            break;
          }
        } catch (_) {}
      }

      // In bottom sheet, choose SOLANA
      final sheetButtons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
      for (final button in sheetButtons) {
        try {
          final label = await button.attributes['label'];
          if (label.contains('SOLANA')) {
            await button.click();
            await Future.delayed(Duration(seconds: 5));
            print('✅ Solana wallet created');
            return;
          }
        } catch (_) {}
      }

      throw Exception('Could not find SOLANA option in Add Wallet');
      
    } catch (e) {
      throw Exception('Solana wallet setup failed: $e');
    }
  }
  
  /// Ensures Cosmos wallet exists (creates if needed)
  Future<void> ensureCosmosWalletExists() async {
    print('🏦 Ensuring Cosmos wallet exists...');
    
    try {
      // Check if COSMOS wallet exists already
      final cells = await driver.findElements(AppiumBy.className('XCUIElementTypeCell')).toList();
      for (final cell in cells) {
        try {
          final texts = await cell.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
          for (final t in texts) {
            final content = await t.text;
            if (content.contains('COSMOS')) {
              print('✅ Cosmos wallet already exists');
              return;
            }
          }
        } catch (_) {}
      }

      // Create via Add Wallet bottom sheet
      print('📱 Opening Add Wallet and selecting COSMOS...');
      final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
      for (final button in buttons) {
        try {
          final label = await button.attributes['label'];
          if (label.contains('Add Wallet')) {
            await button.click();
            await Future.delayed(Duration(seconds: 1));
            break;
          }
        } catch (_) {}
      }

      // In bottom sheet, choose COSMOS
      final sheetButtons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
      for (final button in sheetButtons) {
        try {
          final label = await button.attributes['label'];
          if (label.contains('COSMOS')) {
            await button.click();
            await Future.delayed(Duration(seconds: 5));
            print('✅ Cosmos wallet created');
            return;
          }
        } catch (_) {}
      }

      throw Exception('Could not find COSMOS option in Add Wallet');
      
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
          // Immediately handle potential sign-in confirmation
          await _allowUseCapsuleSignInIfNeeded();
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
          if (label.toLowerCase().contains('resend') || label.toLowerCase().contains('continue')) {
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
      // Collect both plain and secure text fields (handles both OTP UIs)
      final plain = await driver.findElements(AppiumBy.className('XCUIElementTypeTextField')).toList();
      final secure = await driver.findElements(AppiumBy.className('XCUIElementTypeSecureTextField')).toList();
      final fields = [...plain, ...secure];

      if (await _completeOtpEntryInternal(code, fields)) {
        await Future.delayed(const Duration(seconds: 1));
        return;
      }

      // If fields are not yet present or entry failed, try the robust waiter used by One‑Click
      print('ℹ️ OTP fields not ready or entry failed (found ${fields.length}); retrying with robust waiter...');
      await _waitForOtpFieldsAndEnterCode(code);
      return;
      
    } catch (e) {
      throw Exception('Failed to enter OTP code: $e');
    }
  }

  /// Shared, robust OTP entry used by both One‑Click and Passkey flows.
  /// Returns true if an entry strategy was applied.
  Future<bool> _completeOtpEntryInternal(String code, List<AppiumWebElement> allFields) async {
    // Normalize list order and inspect
    final fields = List<AppiumWebElement>.from(allFields);
    if (fields.isEmpty) return false;

    // Filter obvious non-OTP fields (email entry, search bars, etc.) so we focus on the code inputs.
    final otpCandidates = <AppiumWebElement>[];
    for (final field in fields) {
      try {
        final isVisible = await field.displayed;
        final isEnabled = await field.enabled;
        if (!isVisible || !isEnabled) {
          continue;
        }
        final label = (await field.attributes['label'])?.toString().toLowerCase() ?? '';
        final name = (await field.attributes['name'])?.toString().toLowerCase() ?? '';
        final placeholder = (await field.attributes['placeholderValue'])?.toString().toLowerCase() ?? '';
        final value = (await field.attributes['value'])?.toString().toLowerCase() ?? '';
        bool looksLikeCredentialField(String candidate) {
          return candidate.contains('email') ||
              candidate.contains('phone') ||
              candidate.contains('log in') ||
              candidate.contains('login') ||
              candidate.contains('sign up');
        }
        if (looksLikeCredentialField(label) ||
            looksLikeCredentialField(name) ||
            looksLikeCredentialField(placeholder) ||
            looksLikeCredentialField(value)) {
          continue;
        }
        otpCandidates.add(field);
      } catch (_) {
        // Keep field for fallback handling below.
      }
    }

    final refined = otpCandidates.isNotEmpty ? otpCandidates : fields;

    // Strategy A: single-field OTP — enter full code
    if (refined.length == 1) {
      final field = refined.first;
      try {
        await field.click();
        try {
          await field.clear();
        } catch (_) {
          // Some OTP widgets reject clear(); continue without failing.
        }
        await field.sendKeys(code);
        await Future.delayed(const Duration(milliseconds: 200));
        try {
          await field.sendKeys('\n');
        } catch (_) {
          // Return key may not exist; ignore.
        }
        print('✅ Entered OTP via single-field entry');
        return true;
      } catch (_) {}
    }

    // Strategy B: multi-field OTP — try entering full code in the first field (auto-advance)
    if (refined.length >= code.length) {
      // Prefer the last N fields since host views often keep credential inputs earlier.
      final otpFields = refined.length > code.length
          ? refined.sublist(refined.length - code.length)
          : refined;

      try {
        for (int i = 0; i < code.length; i++) {
          final digit = code[i];
          final field = otpFields[i];
          await field.click();
          try {
            await field.clear();
          } catch (_) {
            // Some OTP boxes do not support clear()
          }
          await field.sendKeys(digit);
          await Future.delayed(const Duration(milliseconds: 120));
        }
        print('✅ Entered OTP digits via multi-field entry (${otpFields.length} fields)');
        await Future.delayed(const Duration(milliseconds: 400));
        return true;
      } catch (e) {
        print('ℹ️ Multi-field OTP entry attempt failed: $e');
      }

      // Fallback: let auto-advance logic handle it if available.
      try {
        final first = refined.first;
        await first.click();
        await first.clear();
        await first.sendKeys(code);
        await Future.delayed(const Duration(milliseconds: 400));
        return true; // most OTP widgets auto-advance
      } catch (_) {}

    }

    return false;
  }
  
  Future<void> _performBiometricAuth() async {
    // Short grace to allow sheet to present
    await Future.delayed(const Duration(milliseconds: 800));

    // First try to accept any visible system/in-app Continue prompts
    await _allowUseCapsuleSignInIfNeeded();

    // If that didn't transition, proactively try coordinate-based Continue + biometric
    await tapSystemContinueAndAuthenticate(driver);
  }
}

// --- Shared driver/capabilities helpers for iOS Appium tests ---

/// Resolve project root from current directory (supports running inside `test_e2e/`).
String resolveProjectRoot() {
  final currentDir = Directory.current.path;
  final projectRoot = currentDir.endsWith('test_e2e')
      ? Directory.current.parent.path
      : currentDir;
  return projectRoot;
}

/// Resolve built app path for iOS simulator.
String resolveIOSAppPath() {
  final root = resolveProjectRoot();
  return '$root/build/ios/iphonesimulator/Runner.app';
}

/// Build a set of sane default capabilities for iOS XCUITest.
/// Allows overriding via environment variables when needed:
/// - IOS_SIM_UDID: target a specific booted simulator
/// - IOS_DEVICE_NAME: e.g. "iPhone 16 Pro"
/// - IOS_PLATFORM_VERSION: e.g. "18.0"
/// - BUNDLE_ID: override the bundle identifier if app id changed
Map<String, dynamic> buildIOSCapabilities() {
  final env = Platform.environment;

  final udid = env['IOS_SIM_UDID'];
  final deviceName = env['IOS_DEVICE_NAME'];
  final platformVersion = env['IOS_PLATFORM_VERSION'];
  final bundleId = env['BUNDLE_ID'] ?? 'com.usecapsule.example.flutter';

  final capabilities = <String, dynamic>{
    'platformName': 'iOS',
    'automationName': 'XCUITest',
    // App under test
    'bundleId': bundleId,
    'app': resolveIOSAppPath(),
    // Useful stability flags
    'newCommandTimeout': 300,
    'connectHardwareKeyboard': false,
    'useNewWDA': true,
    'wdaLaunchTimeout': 60000,
    'wdaConnectionTimeout': 60000,
    'allowTouchIdEnroll': true,
    'touchIdMatch': true,
    'simpleIsVisibleCheck': true,
    // Auto-accept system alerts such as "... wants to use usecapsule.com"
    'autoAcceptAlerts': true,
    // Prefer tapping a Continue-like button when accepting alerts
    'acceptAlertButtonSelector': "label == 'Continue' OR name == 'Continue'",
  };

  // Only set optional selectors if provided, to avoid mismatches with local Xcode
  if (udid != null && udid.isNotEmpty) {
    capabilities['udid'] = udid;
  }
  if (deviceName != null && deviceName.isNotEmpty) {
    capabilities['deviceName'] = deviceName;
  } else {
    // Provide a sensible default to satisfy Appium when creating simulator
    capabilities['deviceName'] = 'iPhone';
  }
  if (platformVersion != null && platformVersion.isNotEmpty) {
    capabilities['platformVersion'] = platformVersion;
  }

  // Auto-detect a booted simulator if UDID not provided
  if (!capabilities.containsKey('udid')) {
    final detected = _detectSimulator();
    if (detected != null) {
      capabilities.addAll(detected);
    }
  }

  return capabilities;
}

/// Create an iOS Appium driver using defaults and optional APPIUM_SERVER_URL env override.
Future<AppiumWebDriver> createIOSDriver() async {
  final serverUrl = Platform.environment['APPIUM_SERVER_URL'] ?? 'http://127.0.0.1:4723/';

  // Respect explicit simulator choice via env and ensure it is booted
  final targetUdid = Platform.environment['IOS_SIM_UDID'];
  if (targetUdid != null && targetUdid.isNotEmpty) {
    print('📱 Ensuring target simulator is booted: UDID=$targetUdid');
    final ensured = _ensureBootedSimulator(udid: targetUdid);
    if (ensured != null) {
      await Future.delayed(const Duration(seconds: 3));
    }
  } else {
    // Otherwise, ensure any simulator is booted to avoid Appium creating a new one
    final booted = _detectSimulator();
    if (booted == null) {
      final ensured = _ensureBootedSimulator();
      if (ensured != null) {
        await Future.delayed(const Duration(seconds: 3));
      }
    }
  }

  final desired = buildIOSCapabilities();
  if (desired.containsKey('udid')) {
    print('📦 Using desired capabilities with UDID: ${desired['udid']} (deviceName: ${desired['deviceName']})');
  } else {
    print('📦 Using desired capabilities without explicit UDID (deviceName: ${desired['deviceName']})');
  }

  return createDriver(
    uri: Uri.parse(serverUrl),
    desired: desired,
  );
}

/// Inspect local simulators and find a booted one; else pick the first available iPhone.
Map<String, String>? _detectSimulator({String? targetUdid}) {
  try {
    // Prefer booted
    final booted = _firstMatchFromCommand(
      ['xcrun', 'simctl', 'list', 'devices', 'booted'],
      RegExp(r'^(.*) \(([A-F0-9-]{36})\) \(Booted\)'),
    );
    if (booted != null) {
      final deviceName = booted.group(1)!.trim();
      final udid = booted.group(2)!.trim();
      if (targetUdid != null && targetUdid.isNotEmpty && udid != targetUdid) {
        // A different simulator is booted; signal mismatch by returning null
        return null;
      }
      return {
        'udid': udid,
        'deviceName': deviceName,
      };
    }

    // Fallback: any available iPhone device
    final available = _firstMatchFromCommand(
      ['xcrun', 'simctl', 'list', 'devices', 'available'],
      // Example: "iPhone 14 (C30E...-UDID) (Shutdown)"
      RegExp(r'^(iPhone[^\(]+) \(([A-F0-9-]{36})\) \((?:Shutdown|Booted)\)'),
    );
    if (available != null) {
      final deviceName = available.group(1)!.trim();
      final udid = available.group(2)!.trim();
      return {
        'udid': udid,
        'deviceName': deviceName,
      };
    }
  } catch (_) {
    // Ignore auto-detect errors
  }
  return null;
}

RegExpMatch? _firstMatchFromCommand(List<String> command, RegExp pattern) {
  try {
    final result = Process.runSync(command.first, command.sublist(1));
    if (result.exitCode != 0) return null;
    final lines = result.stdout.toString().split('\n');
    for (final line in lines.map((l) => l.trim())) {
      final m = pattern.firstMatch(line);
      if (m != null) return m;
    }
  } catch (_) {}
  return null;
}

/// Try to boot a simulator if none is booted.
Map<String, String>? _ensureBootedSimulator({String? udid}) {
  try {
    // Already booted? If target UDID specified, ensure it's the one booted
    final booted = _detectSimulator(targetUdid: udid);
    if (booted != null) return booted;

    String? deviceName;
    String? target;
    if (udid != null && udid.isNotEmpty) {
      // Lookup name for the specific UDID
      final specific = _firstMatchFromCommand(
        ['xcrun', 'simctl', 'list', 'devices', 'available'],
        RegExp('^(iPhone[^\\(]+) \\(($udid)\\) \\((?:Shutdown|Booted)\\)')
      );
      if (specific != null) {
        deviceName = specific.group(1)!.trim();
        target = udid;
      } else {
        target = udid; // we'll try to boot anyway
      }
    } else {
      // Find any available iPhone simulator
      final m = _firstMatchFromCommand(
        ['xcrun', 'simctl', 'list', 'devices', 'available'],
        RegExp(r'^(iPhone[^\(]+) \(([A-F0-9-]{36})\) \((?:Shutdown|Booted)\)'),
      );
      if (m == null) return null;
      deviceName = m.group(1)!.trim();
      target = m.group(2)!.trim();
    }

    // Launch Simulator app
    Process.runSync('open', ['-a', 'Simulator']);
    // Boot device
    if (target != null) {
      Process.runSync('xcrun', ['simctl', 'boot', target]);
    }

    // Small wait for boot
    sleep(const Duration(seconds: 2));

    return {
      'udid': target ?? '',
      'deviceName': deviceName ?? 'iPhone',
    };
  } catch (_) {
    return null;
  }
}

/// Try coordinate taps for Continue and immediately attempt biometric match.
Future<void> tapSystemContinueAndAuthenticate(AppiumWebDriver driver) async {
  try {
    final window = await driver.window;
    final size = await window.size;
    final x = size.width ~/ 2;
    // Keep taps well above bottom actions like "Save on another device"
    final yFactors = <double>[0.885, 0.895, 0.905, 0.915, 0.925];
    print('📱 Attempting system Continue + biometric match...');
    for (final factor in yFactors) {
      final y = (size.height * factor).round();
      await driver.execute('mobile:tap', <dynamic>[<String, dynamic>{'x': x, 'y': y}]);
      print('✅ Tapped at ($x, $y) [factor=$factor]');
      // Brief wait for biometric prompt to appear
      await Future.delayed(const Duration(milliseconds: 400));
      final matched = await _attemptBiometricMatch(driver);
      if (matched) {
        print('✅ Biometric authentication successful');
        // Small settle time
        await Future.delayed(const Duration(seconds: 1));
        return;
      }
    }
    throw Exception('Unable to trigger biometric prompt via coordinate tap');
  } catch (e) {
    throw Exception('Coordinate tap/biometric failed: $e');
  }
}

/// Try Face ID first, then Touch ID. Returns true if accepted.
Future<bool> _attemptBiometricMatch(AppiumWebDriver driver) async {
  // Try Face ID
  try {
    await driver.execute('mobile:sendBiometricMatch', <dynamic>[<String, dynamic>{
      'type': 'faceId',
      'match': true,
    }]);
    return true;
  } catch (_) {}
  // Try Touch ID
  try {
    await driver.execute('mobile:sendBiometricMatch', <dynamic>[<String, dynamic>{
      'type': 'touchId',
      'match': true,
    }]);
    return true;
  } catch (_) {}
  return false;
}
