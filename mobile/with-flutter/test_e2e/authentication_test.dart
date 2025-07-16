// Authentication E2E Tests - Using Foundation
// Core authentication flows matching Swift patterns exactly

import 'dart:io';
import 'package:test/test.dart';
import 'package:appium_driver/async_io.dart';
import 'package:dotenv/dotenv.dart';
import 'lib/wallet_test_foundation.dart';
import 'lib/test_constants.dart';

void main() {
  group('Authentication Tests', () {
    late AppiumWebDriver driver;
    
    setUpAll(() async {
      // Load environment and validate prerequisites
      final env = DotEnv(includePlatformEnvironment: true)..load(['.env']);
      final apiKey = Platform.environment['PARA_API_KEY'] ?? env['PARA_API_KEY'];
      if (apiKey == null || apiKey.isEmpty) {
        throw Exception('PARA_API_KEY must be set in environment variables or .env file');
      }
      
      final currentDir = Directory.current.path;
      final projectRoot = currentDir.endsWith('test_e2e') 
          ? Directory.current.parent.path 
          : currentDir;
      final appPath = '$projectRoot/build/ios/iphonesimulator/Runner.app';
      
      final capabilities = <String, dynamic>{
        'platformName': 'iOS',
        'platformVersion': '26.0',
        'deviceName': 'iPhone 16 Pro',
        'automationName': 'XCUITest',
        'bundleId': 'com.usecapsule.example.flutter',
        'app': appPath,
        'newCommandTimeout': 300,
        'connectHardwareKeyboard': false,
        'useNewWDA': true,
        'wdaLaunchTimeout': 60000,
        'wdaConnectionTimeout': 60000,
        'allowTouchIdEnroll': true,
        'touchIdMatch': true,
        'simpleIsVisibleCheck': true,
      };
      
      driver = await createDriver(
        uri: Uri.parse('http://127.0.0.1:4723/'),
        desired: capabilities,
      );
      
      // Enroll biometrics for all tests
      try {
        await driver.execute('mobile:enrollBiometric', <dynamic>[<String, dynamic>{'isEnabled': true}]);
        print('✅ Biometrics enrolled successfully');
      } catch (e) {
        print('Warning: Could not enroll biometrics: $e');
      }
    });

    tearDownAll(() async {
      // Emergency cleanup
      await WalletTestFactory.destroyAllContexts(driver);
      await driver.quit();
    });

    test('Email Passkey Flow', () async {
      print('\\n🧪 Testing Email Passkey Flow (Signup + Login)...');
      
      // PART 1: SIGNUP
      final uniqueEmail = TestConstants.generateUniqueEmail();
      print('📧 Generated test email: $uniqueEmail');
      
      final helper = WalletTestHelper(driver);
      
      // Perform email authentication (signup)
      await helper.performEmailAuthWithPasskey(uniqueEmail);
      await helper.waitForWalletsView();
      print('✅ Email signup completed');
      
      // PART 2: TEST LOGIN
      await _performLogout(driver);
      await _waitForMainScreen(driver);
      print('✅ Logged out successfully');
      
      // Login with same email (should go directly to biometric auth)
      await _performLoginFlow(driver, uniqueEmail);
      await helper.waitForWalletsView();
      print('✅ Email login completed');
      
      print('✅ Email passkey flow completed successfully');
    }, timeout: Timeout(Duration(minutes: 5)));

    test('Phone Passkey Flow', () async {
      print('\\n🧪 Testing Phone Passkey Flow (Signup + Login)...');
      
      // SETUP: Ensure we start from main screen (in case previous test left us elsewhere)
      print('🔄 Ensuring clean state for Phone test...');
      try {
        await _performLogout(driver);
        await _waitForMainScreen(driver);
        print('✅ Started from clean state');
      } catch (e) {
        print('ℹ️ Already on main screen or logout not needed: $e');
      }
      
      // PART 1: SIGNUP
      final phoneNumber = TestConstants.generateTestPhoneNumber();
      print('📱 Generated test phone: $phoneNumber');
      
      final helper = WalletTestHelper(driver);
      
      // Perform phone authentication (signup)
      await _performPhoneAuthWithPasskey(driver, phoneNumber);
      await helper.waitForWalletsView();
      print('✅ Phone signup completed');
      
      // PART 2: TEST LOGIN
      await _performLogout(driver);
      await _waitForMainScreen(driver);
      print('✅ Logged out successfully');
      
      // Login with same phone (should go directly to biometric auth)
      await _performLoginFlow(driver, phoneNumber);
      await helper.waitForWalletsView();
      print('✅ Phone login completed');
      
      print('✅ Phone passkey flow completed successfully');
    }, timeout: Timeout(Duration(minutes: 5)));
  });
}

// Helper functions for authentication tests

Future<void> _performPhoneAuthWithPasskey(AppiumWebDriver driver, String phoneNumber) async {
  print('🔐 Performing phone authentication with passkey...');
  
  // Switch to phone mode
  await _switchToPhoneMode(driver);
  
  // Enter phone and continue
  await _enterPhoneAndContinue(driver, phoneNumber);
  
  // Handle OTP verification
  await _handleOTPVerification(driver);
  
  // Complete biometric authentication
  await _performBiometricAuth(driver);
  
  print('✅ Phone authentication completed');
}

Future<void> _performLoginFlow(AppiumWebDriver driver, String credential) async {
  print('🔑 Performing login flow for: $credential');
  
  final isEmail = credential.contains('@');
  
  if (isEmail) {
    await _switchToEmailMode(driver);
    await _enterEmailAndContinue(driver, credential);
  } else {
    await _switchToPhoneMode(driver);
    await _enterPhoneAndContinue(driver, credential);
  }
  
  // For login, we should go directly to biometric auth (no OTP)
  await _performBiometricAuthForLogin(driver);
  
  print('✅ Login flow completed');
}

Future<void> _performLogout(AppiumWebDriver driver) async {
  print('🚪 Performing logout...');
  
  // Try multiple approaches to find and click logout
  for (int attempt = 0; attempt < 5; attempt++) {
    try {
      final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
      
      for (final button in buttons) {
        try {
          final label = await button.attributes['label'];
          if (label.toLowerCase().contains('logout')) {
            await button.click();
            await Future.delayed(Duration(seconds: 3));
            print('✅ Logout button clicked');
            return;
          }
        } catch (e) {
          // Continue searching
        }
      }
      
      print('⚠️ Logout button not found on attempt ${attempt + 1}, retrying...');
      await Future.delayed(Duration(seconds: 1));
      
    } catch (e) {
      print('⚠️ Error during logout attempt ${attempt + 1}: $e');
      await Future.delayed(Duration(seconds: 1));
    }
  }
  
  print('⚠️ Could not find logout button, attempting to navigate away from current screen');
  
  // Fallback: try to navigate back or close any modals
  try {
    // Try back navigation using iOS back gesture
    final size = await (await driver.window).size;
    final startX = 10;
    final startY = size.height ~/ 2;
    final endX = size.width ~/ 2;
    
    await driver.execute('mobile:swipe', <dynamic>[<String, dynamic>{
      'direction': 'right',
      'startX': startX,
      'startY': startY,
      'endX': endX,
      'endY': startY,
      'duration': 0.5
    }]);
    await Future.delayed(Duration(seconds: 2));
  } catch (e) {
    print('⚠️ Fallback navigation failed: $e');
  }
}

Future<void> _waitForMainScreen(AppiumWebDriver driver) async {
  print('⏳ Waiting for main screen...');
  
  for (int attempt = 0; attempt < 15; attempt++) {
    try {
      final elements = await driver.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
      // bool foundMainScreen = false; // Unused variable
      
      for (final element in elements) {
        try {
          final text = await element.text;
          if (text.contains('Sign Up or Log In')) {
            print('✅ Main screen found');
            return;
          }
        } catch (e) {
          // Continue
        }
      }
      
      // Debug: show what we're seeing if not found
      if (attempt % 3 == 0) {
        print('🔍 Debug: Current screen elements (attempt ${attempt + 1}):');
        final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
        for (int i = 0; i < buttons.length && i < 5; i++) {
          try {
            final label = await buttons[i].attributes['label'];
            if (label != 'null' && label.isNotEmpty) {
              print('  Button: "$label"');
            }
          } catch (e) {
            // Continue
          }
        }
        
        for (int i = 0; i < elements.length && i < 5; i++) {
          try {
            final text = await elements[i].text;
            if (text.isNotEmpty) {
              print('  Text: "$text"');
            }
          } catch (e) {
            // Continue
          }
        }
      }
      
    } catch (e) {
      print('⚠️ Error checking main screen: $e');
    }
    await Future.delayed(Duration(seconds: 1));
  }
  
  print('⚠️ Main screen not found after 15 attempts, proceeding anyway');
}

Future<void> _switchToEmailMode(AppiumWebDriver driver) async {
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

Future<void> _switchToPhoneMode(AppiumWebDriver driver) async {
  final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
  for (final button in buttons) {
    try {
      final label = await button.attributes['label'];
      if (label.contains('Phone')) {
        await button.click();
        await Future.delayed(Duration(milliseconds: 500));
        return;
      }
    } catch (e) {
      // Continue searching
    }
  }
}

Future<void> _enterEmailAndContinue(AppiumWebDriver driver, String email) async {
  final textFields = await driver.findElements(AppiumBy.className('XCUIElementTypeTextField')).toList();
  if (textFields.isEmpty) {
    throw Exception('No email text field found');
  }
  
  await textFields.first.click();
  await textFields.first.clear();
  await textFields.first.sendKeys(email);
  await Future.delayed(Duration(seconds: 1));
  
  await _clickContinueButton(driver);
}

Future<void> _enterPhoneAndContinue(AppiumWebDriver driver, String phone) async {
  final textFields = await driver.findElements(AppiumBy.className('XCUIElementTypeTextField')).toList();
  if (textFields.isEmpty) {
    throw Exception('No phone text field found');
  }
  
  await textFields.first.click();
  await textFields.first.clear();
  await textFields.first.sendKeys(phone);
  await Future.delayed(Duration(seconds: 1));
  
  await _clickContinueButton(driver);
}

Future<void> _clickContinueButton(AppiumWebDriver driver) async {
  // Wait for Continue button to be enabled (with explicit wait)
  for (int attempt = 0; attempt < 10; attempt++) {
    try {
      // Method 1: Try accessibility identifier (most reliable)
      try {
        final continueButton = await driver.findElement(AppiumBy.accessibilityId('continue_button'));
        final enabled = await continueButton.enabled;
        if (enabled) {
          await continueButton.click();
          print('✅ Continue button clicked (accessibility ID)');
          return;
        } else {
          print('⏳ Continue button found but disabled, waiting... (attempt ${attempt + 1}/10)');
        }
      } catch (e) {
        // Fallback to text-based detection
      }
      
      // Method 2: Fallback to button label detection
      final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
      for (final button in buttons) {
        try {
          final label = await button.attributes['label'];
          final enabled = await button.enabled;
          if (label == 'Continue' && enabled) {
            await button.click();
            print('✅ Continue button clicked (fallback)');
            return;
          }
        } catch (e) {
          // Continue searching
        }
      }
    } catch (e) {
      // Continue waiting
    }
    
    // Wait before next attempt
    await Future.delayed(Duration(seconds: 1));
  }
  
  throw Exception('Continue button not found or not enabled after 10 attempts');
}

Future<void> _handleOTPVerification(AppiumWebDriver driver) async {
  // Wait for OTP verification view with more robust detection
  print('⏳ Waiting for OTP verification view...');
  
  for (int attempt = 0; attempt < 20; attempt++) {
    try {
      // Check for OTP fields specifically
      final textFields = await driver.findElements(AppiumBy.className('XCUIElementTypeTextField')).toList();
      
      if (textFields.length >= 6) {
        print('✅ OTP verification view found with ${textFields.length} text fields');
        break;
      }
      
      // Also check for resend button as backup
      final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
      for (final button in buttons) {
        try {
          final label = await button.attributes['label'];
          if (label.toLowerCase().contains('resend')) {
            print('✅ OTP verification view found (resend button detected)');
            break;
          }
        } catch (e) {
          // Continue
        }
      }
      
      if (attempt % 3 == 0) {
        print('⏳ Waiting for OTP fields... (attempt ${attempt + 1}, found ${textFields.length} text fields)');
      }
      
    } catch (e) {
      print('⚠️ Error checking for OTP view: $e');
    }
    
    await Future.delayed(Duration(seconds: 1));
  }
  
  // Enter OTP code
  await _enterOTPCode(driver, TestConstants.verificationCode);
  
  // After OTP entry, handle biometric authentication
  await _performBiometricAuth(driver);
}

Future<void> _enterOTPCode(AppiumWebDriver driver, String code) async {
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

Future<void> _performBiometricAuth(AppiumWebDriver driver) async {
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
    print('✅ Biometric authentication successful (signup)');
    
    // Wait longer for authentication to complete and navigation to happen
    print('⏳ Waiting for authentication to complete...');
    await Future.delayed(Duration(seconds: 5));
    
  } catch (e) {
    throw Exception('Biometric authentication failed: $e');
  }
}

Future<void> _performBiometricAuthForLogin(AppiumWebDriver driver) async {
  await Future.delayed(Duration(seconds: 2));
  
  // For login, we need to handle the "Sign in" dialog first
  // This dialog appears with "Continue" button at a different position
  try {
    print('📱 Looking for Sign in dialog...');
    
    // Wait for the Sign in dialog to appear
    await Future.delayed(Duration(seconds: 2));
    
    // Tap the Continue button on the Sign in dialog
    // This button is lower on the screen (around 85% from top)
    final window = await driver.window;
    final size = await window.size;
    
    final x = size.width ~/ 2;
    final y = (size.height * 0.85).round();
    
    print('📱 Tapping Continue button on Sign in dialog at ($x, $y)...');
    await driver.execute('mobile:tap', <dynamic>[<String, dynamic>{
      'x': x,
      'y': y
    }]);
    
    print('✅ Tapped Continue on Sign in dialog');
    await Future.delayed(Duration(seconds: 2));
    
    // Now handle the biometric authentication
    await driver.execute('mobile:sendBiometricMatch', <dynamic>[<String, dynamic>{
      'type': 'touchId',
      'match': true
    }]);
    print('✅ Biometric authentication successful (login)');
    
    // Wait for authentication to complete and navigation to happen
    print('⏳ Waiting for authentication to complete...');
    await Future.delayed(Duration(seconds: 5));
    
  } catch (e) {
    throw Exception('Login authentication failed: $e');
  }
}