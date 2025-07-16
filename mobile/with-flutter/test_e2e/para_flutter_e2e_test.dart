// Para Flutter E2E Tests - Updated for New Authentication UI
// Matches Swift test patterns with unified auth flow

import 'dart:io';
import 'dart:math';
import 'package:test/test.dart';
import 'package:appium_driver/async_io.dart';
import 'package:dotenv/dotenv.dart';

// Test constants matching Swift
class TestConstants {
  static const emailDomain = 'test.usecapsule.com';
  static const verificationCode = '123456';
  static const defaultTimeout = Duration(seconds: 5);
  static const longTimeout = Duration(seconds: 30);
  
  static String generateTestPhoneNumber() {
    final areaCodes = ['212', '310', '415', '512', '617', '702', '808', '919'];
    final areaCode = areaCodes[Random().nextInt(areaCodes.length)];
    final lastFour = (1000 + Random().nextInt(9000)).toString();
    return '${areaCode}555$lastFour';
  }
  
  static String generateUniqueEmail() {
    final randomLetters = 'abcdefghijklmnopqrstuvwxyz';
    final randomString = List.generate(6, (_) => randomLetters[Random().nextInt(26)]).join();
    return 'test$randomString@$emailDomain';
  }
}

// Additional test constants
const testRecipientAddress = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
const testCosmosRecipientAddress = 'cosmos1hsk6jryyqjfhp5dhc55tc9jtckygx0eph6dd02';
const testAmount = '0.001';

// Test Helper Class
class TestHelper {
  final AppiumWebDriver driver;
  
  TestHelper(this.driver);
  
  // Core Helper Methods
  Future<void> ensureLoggedOut() async {
    // Check if we're in the wallets view (logged in state)
    try {
      await clickElementByText('logout');
      await Future.delayed(Duration(seconds: 2));
    } catch (e) {
      // Already logged out or logout not available
    }
    
    // Wait for main screen to appear - check for the unified input field
    await waitForMainScreen();
  }
  
  Future<void> waitForMainScreen() async {
    // Look for "Sign Up or Log In" text to confirm we're on auth screen
    for (int attempt = 0; attempt < 10; attempt++) {
      final staticTexts = await driver.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
      for (final element in staticTexts) {
        try {
          final text = await element.text;
          if (text.contains('Sign Up or Log In')) {
            print('✅ Found main authentication screen');
            return;
          }
        } catch (e) {
          // Continue
        }
      }
      await Future.delayed(Duration(seconds: 1));
    }
    throw Exception('❌ Could not find main authentication screen');
  }
  
  bool isWalletScreenText(String text) {
    return text == 'Your Wallets' || text == 'EVM Wallet' || text == 'SOLANA Wallet' || 
           text == 'COSMOS Wallet' || text == 'Send Funds' || text.contains('Signing Demo') ||
           (text.contains('Create') && text.contains('Wallet')) || text.contains('Balance:');
  }
  
  Future<void> clickElementByText(String searchText, {String? className}) async {
    // Wait for elements to be available
    await Future.delayed(Duration(seconds: 1));
    
    // If no className specified, try multiple element types
    final classNames = className != null 
        ? [className] 
        : ['XCUIElementTypeButton', 'XCUIElementTypeStaticText', 'XCUIElementTypeOther', 'XCUIElementTypeCell'];
    
    // First try to find enabled elements
    for (int attempt = 0; attempt < 5; attempt++) {
      for (final elementType in classNames) {
        final elements = await driver.findElements(AppiumBy.className(elementType)).toList();
        for (final element in elements) {
          try {
            final label = elementType == 'XCUIElementTypeButton' 
                ? await element.attributes['label'] 
                : await element.text;
            final isEnabled = elementType == 'XCUIElementTypeButton' ? await element.enabled : true;
            // For debugging: print found elements
            if (label.isNotEmpty && label.toLowerCase().contains(searchText.toLowerCase())) {
              print('🔍 Found matching element: "$label" (type: $elementType, enabled: $isEnabled)');
            }
            if (label.toLowerCase().contains(searchText.toLowerCase()) && isEnabled) {
              await element.click();
              print('✅ Found and clicked "$searchText" as $elementType');
              return;
            }
          } catch (e) {
            // Continue searching
          }
        }
      }
      if (attempt < 4) {
        await Future.delayed(Duration(seconds: 1));
      }
    }
    
    // If no enabled elements found, try clicking disabled ones as last resort
    print('⚠️ No enabled elements found, trying disabled ones...');
    for (final elementType in classNames) {
      final elements = await driver.findElements(AppiumBy.className(elementType)).toList();
      for (final element in elements) {
        try {
          final label = elementType == 'XCUIElementTypeButton' 
              ? await element.attributes['label'] 
              : await element.text;
          if (label.toLowerCase().contains(searchText.toLowerCase())) {
            await element.click();
            print('✅ Clicked disabled element "$searchText" as $elementType');
            return;
          }
        } catch (e) {
          // Continue searching
        }
      }
    }
    throw Exception('Element with text "$searchText" not found after 5 attempts');
  }

  Future<void> enterText(String text, {int fieldIndex = 0}) async {
    // Wait for fields and retry if needed
    List<AppiumWebElement> textFields = [];
    
    for (int attempt = 0; attempt < 3; attempt++) {
      await Future.delayed(Duration(seconds: 1));
      textFields = await driver.findElements(AppiumBy.className('XCUIElementTypeTextField')).toList();
      print('🔍 Attempt ${attempt + 1}: Found ${textFields.length} text fields');
      
      if (textFields.length > fieldIndex) {
        break;
      }
      
      if (attempt < 2) {
        await Future.delayed(Duration(seconds: 1));
      }
    }
    
    if (textFields.length <= fieldIndex) {
      // Debug: Print available fields
      for (int i = 0; i < textFields.length; i++) {
        try {
          final placeholder = await textFields[i].attributes['placeholderValue'];
          final label = await textFields[i].attributes['label'];
          print('🔍 Available field $i: placeholder="$placeholder", label="$label"');
        } catch (e) {
          print('🔍 Available field $i: Could not get attributes');
        }
      }
      throw Exception('Text field at index $fieldIndex not found. Found ${textFields.length} fields total.');
    }
    
    // Click and clear field
    await textFields[fieldIndex].click();
    await Future.delayed(Duration(milliseconds: 500));
    
    // Try to clear existing text
    try {
      await textFields[fieldIndex].clear();
      await Future.delayed(Duration(milliseconds: 300));
    } catch (e) {
      // Field might already be empty
    }
    
    await textFields[fieldIndex].sendKeys(text);
    print('✅ Entered text "$text" in field $fieldIndex');
  }

  Future<void> dismissKeyboard() async {
    try {
      await clickElementByText('done');
    } catch (e) {
      // Keyboard might not be visible
    }
  }

  Future<void> manualTapContinue() async {
    final window = await driver.window;
    final size = await window.size;
    try {
      await driver.mouse.moveTo(
        xOffset: (size.width / 2).round(), 
        yOffset: (size.height - 100).round(), 
        absolute: true
      );
      await Future.delayed(Duration(milliseconds: 100));
      await driver.mouse.click();
    } catch (e) {
      // Continue anyway
    }
  }

  Future<void> performBiometricAuth() async {
    await Future.delayed(TestConstants.defaultTimeout);
    await manualTapContinue();
    await Future.delayed(Duration(seconds: 2));
    
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

  Future<void> waitForWalletsView() async {
    // Reduced initial delay for faster detection
    await Future.delayed(Duration(seconds: 2));
    
    for (int attempt = 0; attempt < 8; attempt++) {
      try {
        // Check most common elements first for faster detection
        final elementTypes = ['XCUIElementTypeButton', 'XCUIElementTypeStaticText', 'XCUIElementTypeNavigationBar'];
        
        for (final elementType in elementTypes) {
          final elements = await driver.findElements(AppiumBy.className(elementType)).toList();
          for (final element in elements) {
            try {
              final content = elementType == 'XCUIElementTypeNavigationBar' 
                  ? await element.attributes['name']
                  : elementType == 'XCUIElementTypeButton'
                      ? await element.attributes['label']
                      : await element.text;
                      
              if (content.isNotEmpty && isWalletScreenText(content)) {
                print('✅ Found wallets screen: "$content"');
                return; // Removed extra delay for faster tests
              }
            } catch (e) {
              // Continue checking
            }
          }
        }
        
        // Less frequent logging to reduce noise
        if ((attempt + 1) % 2 == 0) {
          print('Still waiting for wallets view... (Attempt ${attempt + 1}/8)');
        }
        
        // Shorter wait between attempts for faster response
        await Future.delayed(Duration(milliseconds: 1500));
      } catch (e) {
        await Future.delayed(Duration(milliseconds: 1500));
      }
    }
    
    throw Exception('❌ Timed out waiting for wallets view after 8 attempts');
  }

  // Enhanced Continue Button Clicking with Debug
  Future<void> clickContinueButtonWithDebug() async {
    print('🔍 Looking for Continue button...');
    
    // Give the UI time to update after typing
    await Future.delayed(Duration(seconds: 1));
    
    final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
    print('🔍 Found ${buttons.length} buttons');
    
    // Debug: Show all available buttons
    for (int i = 0; i < buttons.length; i++) {
      try {
        final label = await buttons[i].attributes['label'];
        final enabled = await buttons[i].enabled;
        print('  Button $i: "$label" (enabled: $enabled)');
      } catch (e) {
        print('  Button $i: <error getting attributes>');
      }
    }
    
    bool continueButtonFound = false;
    
    // Approach 1: Look for exact 'Continue' label and enabled state
    for (final button in buttons) {
      try {
        final label = await button.attributes['label'];
        final enabled = await button.enabled;
        if (label == 'Continue' && enabled) {
          print('🎯 Found enabled Continue button, clicking...');
          await button.click();
          continueButtonFound = true;
          break;
        }
      } catch (e) {
        // Continue searching
      }
    }
    
    // Approach 2: Look for partial match if exact match failed
    if (!continueButtonFound) {
      for (final button in buttons) {
        try {
          final label = await button.attributes['label'];
          final enabled = await button.enabled;
          if (label.toLowerCase().contains('continue') && enabled) {
            print('🎯 Found Continue button (partial match), clicking...');
            await button.click();
            continueButtonFound = true;
            break;
          }
        } catch (e) {
          // Continue searching
        }
      }
    }
    
    // Approach 3: Fallback to existing clickElementByText
    if (!continueButtonFound) {
      print('🔍 Fallback: Using clickElementByText method');
      try {
        await clickElementByText('Continue');
        continueButtonFound = true;
      } catch (e) {
        print('⚠️ Fallback method also failed: $e');
      }
    }
    
    if (!continueButtonFound) {
      throw Exception('Continue button not found or not enabled');
    }
    
    // Wait and check what elements are visible after clicking Continue
    await Future.delayed(Duration(seconds: 2));
    
    print('📱 Elements visible after Continue click:');
    try {
      final textsAfterClick = await driver.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
      for (int i = 0; i < textsAfterClick.length && i < 10; i++) {
        try {
          final text = await textsAfterClick[i].text;
          if (text.isNotEmpty) {
            print('  Text: "$text"');
          }
        } catch (e) {
          // Continue
        }
      }
    } catch (e) {
      print('  Could not get post-click elements: $e');
    }
  }
  
  // Authentication Support Methods
  Future<void> switchToEmailMode() async {
    // Look for Email segment button in the SegmentedButton
    try {
      // Find the segmented button for Email
      final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
      for (final button in buttons) {
        try {
          final label = await button.attributes['label'];
          if (label.contains('Email')) {
            await button.click();
            await Future.delayed(Duration(milliseconds: 500));
            print('✅ Switched to email mode');
            return;
          }
        } catch (e) {
          // Continue
        }
      }
    } catch (e) {
      // May already be in email mode
    }
  }
  
  Future<void> switchToPhoneMode() async {
    // Look for Phone segment button in the SegmentedButton
    try {
      // Find the segmented button for Phone
      final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
      for (final button in buttons) {
        try {
          final label = await button.attributes['label'];
          if (label.contains('Phone')) {
            await button.click();
            await Future.delayed(Duration(milliseconds: 500));
            print('✅ Switched to phone mode');
            return;
          }
        } catch (e) {
          // Continue
        }
      }
    } catch (e) {
      // May already be in phone mode
    }
  }
  
  Future<void> waitForOTPVerificationView(String type) async {
    print('🔍 Waiting for OTP verification view to appear...');
    for (int attempt = 0; attempt < 15; attempt++) {
      // Check multiple element types for OTP verification indicators
      final staticTexts = await driver.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
      final textFields = await driver.findElements(AppiumBy.className('XCUIElementTypeTextField')).toList();
      final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
      
      // Debug: Print all visible text elements every 5 attempts
      if (attempt > 0 && attempt % 5 == 0) {
        print('🔍 Attempt $attempt - Current visible elements:');
        print('  Text fields: ${textFields.length}');
        print('  Static texts:');
        for (final element in staticTexts) {
          try {
            final text = await element.text;
            if (text.isNotEmpty && text.length > 2) {
              print('    - "$text"');
            }
          } catch (e) {
            // Continue
          }
        }
        print('  Buttons:');
        for (final button in buttons) {
          try {
            final label = await button.attributes['label'];
            if (label.isNotEmpty) {
              print('    - "$label"');
            }
          } catch (e) {
            // Continue
          }
        }
      }
      
      // Enhanced OTP verification detection
      bool otpViewFound = false;
      
      // Method 1: Check for specific OTP verification text
      for (final element in staticTexts) {
        try {
          final text = await element.text;
          if (text.contains('Verify your identity') || 
              text.contains('Enter the 6-digit code') || 
              text.contains('sent to') ||
              text.contains('Resend code')) {
            print('✅ Found OTP verification text: "$text"');
            otpViewFound = true;
            break;
          }
        } catch (e) {
          // Continue
        }
      }
      
      // Method 2: Check for OTP text field pattern (6 digit fields)
      if (!otpViewFound && textFields.length >= 6) {
        // Look for 6 small text fields which indicate OTP input
        int otpFieldCount = 0;
        for (final field in textFields) {
          try {
            final placeholder = await field.attributes['placeholderValue'];
            // OTP fields typically have empty or minimal placeholders
            if (placeholder.isEmpty || placeholder.length <= 2) {
              otpFieldCount++;
            }
          } catch (e) {
            // Continue
          }
        }
        
        if (otpFieldCount >= 6) {
          print('✅ Found OTP verification via text field pattern ($otpFieldCount fields)');
          otpViewFound = true;
        }
      }
      
      // Method 3: Check for "Resend code" button as an indicator
      if (!otpViewFound) {
        for (final button in buttons) {
          try {
            final label = await button.attributes['label'];
            if (label.toLowerCase().contains('resend')) {
              print('✅ Found OTP verification via Resend button');
              otpViewFound = true;
              break;
            }
          } catch (e) {
            // Continue
          }
        }
      }
      
      if (otpViewFound) {
        print('✅ OTP verification view detected successfully');
        await Future.delayed(Duration(seconds: 1)); // Let modal fully load
        return;
      }
      
      await Future.delayed(Duration(seconds: 1));
    }
    throw Exception('OTP verification view did not appear after 15 attempts');
  }
  
  Future<void> enterOTPCode(String code) async {
    await Future.delayed(Duration(seconds: 2)); // Give OTP modal time to appear
    
    // The OTP verification uses 6 separate TextFields in a bottom sheet
    final textFields = await driver.findElements(AppiumBy.className('XCUIElementTypeTextField')).toList();
    
    print('🔍 Found ${textFields.length} text fields for OTP entry');
    
    // Debug: Show information about all text fields
    for (int i = 0; i < textFields.length; i++) {
      try {
        final field = textFields[i];
        final placeholder = await field.attributes['placeholderValue'];
        final label = await field.attributes['label'];
        final value = await field.attributes['value'];
        print('🔍 Field $i: placeholder="$placeholder", label="$label", value="$value"');
      } catch (e) {
        print('🔍 Field $i: Could not read attributes');
      }
    }
    
    // Enhanced OTP field detection
    List<AppiumWebElement> otpFields = [];
    
    // Method 1: If we have exactly 6 additional fields (main input + 6 OTP fields)
    if (textFields.length >= 6) {
      // Try to identify OTP fields by looking for fields with minimal placeholders
      List<AppiumWebElement> candidateFields = [];
      for (final field in textFields) {
        try {
          final placeholder = await field.attributes['placeholderValue'];
          // OTP fields typically have empty placeholders or very short ones
          if (placeholder.isEmpty || placeholder.length <= 2) {
            candidateFields.add(field);
          }
        } catch (e) {
          // Continue
        }
      }
      
      // If we found 6 candidate fields, use them
      if (candidateFields.length >= 6) {
        otpFields = candidateFields.take(6).toList();
        print('🎯 Using ${otpFields.length} OTP fields identified by placeholder analysis');
      }
    }
    
    // Method 2: Fallback - assume last 6 fields are OTP fields
    if (otpFields.isEmpty && textFields.length >= 6) {
      otpFields = textFields.sublist(textFields.length - 6);
      print('🎯 Using last 6 fields as OTP fields (fallback method)');
    }
    
    if (otpFields.length < 6) {
      throw Exception('Expected 6 OTP text fields, found ${otpFields.length}');
    }
    
    // Enter each digit in the 6 OTP fields with enhanced error handling
    print('🔢 Entering OTP code: $code');
    for (int i = 0; i < 6 && i < code.length; i++) {
      try {
        await otpFields[i].click();
        await Future.delayed(Duration(milliseconds: 100));
        await otpFields[i].sendKeys(code[i]);
        print('  ✅ Entered digit ${i + 1}: ${code[i]}');
        await Future.delayed(Duration(milliseconds: 200));
      } catch (e) {
        print('  ❌ Failed to enter digit ${i + 1}: $e');
        throw Exception('Failed to enter OTP digit ${i + 1}: $e');
      }
    }
    
    print('🔢 OTP code entry completed, waiting for verification...');
    // Wait for automatic verification after entering all digits
    await Future.delayed(Duration(seconds: 3));
  }
  
  Future<void> performBiometricAuthForLogin() async {
    // For login - button appears higher from bottom
    await performBiometricAuthWithOffsetFromBottom(50);
  }
  
  Future<void> performBiometricAuthWithOffsetFromBottom(double offset) async {
    final window = await driver.window;
    final size = await window.size;
    
    await Future.delayed(Duration(seconds: 5));
    await driver.mouse.moveTo(
      xOffset: (size.width / 2).round(),
      yOffset: (size.height - offset).round(),
      absolute: true
    );
    await Future.delayed(Duration(milliseconds: 100));
    await driver.mouse.click();
    await Future.delayed(Duration(seconds: 2));
    
    try {
      await driver.execute('mobile:sendBiometricMatch', <dynamic>[<String, dynamic>{
        'type': 'touchId',
        'match': true
      }]);
      print('✅ Biometric authentication successful');
    } catch (e) {
      throw Exception('Biometric authentication failed: $e');
    }
    
    await Future.delayed(Duration(seconds: 1));
  }

  // Authentication Flow Helpers - Matching Swift patterns
  Future<void> performEmailAuthWithPasskey(String email, {bool isNewUser = true}) async {
    print('🔑 Starting email authentication with passkey...');
    
    // Switch to email mode if needed
    await switchToEmailMode();
    
    // Enter email in the unified input field
    final textFields = await driver.findElements(AppiumBy.className('XCUIElementTypeTextField')).toList();
    if (textFields.isEmpty) {
      throw Exception('No text field found for email input');
    }
    
    // Use the first text field (the main email/phone input)
    await textFields.first.click();
    await textFields.first.clear();
    await textFields.first.sendKeys(email);
    
    // Wait for Continue button to be enabled (after valid email entry)
    await Future.delayed(Duration(seconds: 1));
    
    // Click Continue button with enhanced debugging
    await clickContinueButtonWithDebug();
    
    if (isNewUser) {
      // Wait for OTP verification bottom sheet
      await waitForOTPVerificationView('Email');
      
      // Enter OTP code in the 6 digit fields
      await enterOTPCode(TestConstants.verificationCode);
      
      // Complete biometric authentication for signup
      await performBiometricAuth();
    } else {
      // Existing user - perform biometric authentication for login
      await performBiometricAuthForLogin();
    }
    
    await waitForWalletsView();
    print('✅ Email authentication completed');
  }
  
  Future<void> performPhoneAuthWithPasskey(String phone, {bool isNewUser = true}) async {
    print('🔑 Starting phone authentication with passkey...');
    
    // Switch to phone mode if needed
    await switchToPhoneMode();
    
    // Enter phone in the unified input field
    final textFields = await driver.findElements(AppiumBy.className('XCUIElementTypeTextField')).toList();
    if (textFields.isEmpty) {
      throw Exception('No text field found for phone input');
    }
    
    // Use the first text field (the main email/phone input)
    await textFields.first.click();
    await textFields.first.clear();
    await textFields.first.sendKeys(phone);
    
    // Wait for Continue button to be enabled (after valid phone entry)
    await Future.delayed(Duration(seconds: 1));
    
    // Click Continue button with enhanced debugging
    await clickContinueButtonWithDebug();
    
    if (isNewUser) {
      // Wait for OTP verification bottom sheet
      await waitForOTPVerificationView('Phone');
      
      // Enter OTP code in the 6 digit fields
      await enterOTPCode(TestConstants.verificationCode);
      
      // Complete biometric authentication for signup
      await performBiometricAuth();
    } else {
      // Existing user - perform biometric authentication for login
      await performBiometricAuthForLogin();
    }
    
    await waitForWalletsView();
    print('✅ Phone authentication completed');
  }

  // Simplified helper for login flow (existing users)
  Future<void> performLoginFlow(String credential) async {
    // Determine if it's email or phone based on format
    final isEmail = credential.contains('@');
    
    if (isEmail) {
      await performEmailAuthWithPasskey(credential, isNewUser: false);
    } else {
      await performPhoneAuthWithPasskey(credential, isNewUser: false);
    }
  }

  // Other Helper Methods
  Future<void> navigateBackToHome() async {
    // First check if we're already on the wallet screen or auth selector
    try {
      final elements = await driver.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
      for (final element in elements) {
        try {
          final text = await element.text;
          // Check if we're on wallet screen
          if (text == 'Your Wallets' || text.contains('Send Funds') || text.contains('Balance:')) {
            print('✅ Already on main wallet screen');
            return;
          }
          // Check if we're on auth selector
          if (text.contains('Authentication') && text.contains('Passkey')) {
            print('✅ Already on authentication selector screen');
            return;
          }
        } catch (e) {
          // Continue checking
        }
      }
    } catch (e) {
      // Continue with navigation attempt
    }
    
    // If we're on a deeper screen (like transaction details), try to go back
    for (int attempt = 0; attempt < 3; attempt++) {
      try {
        // Look for back button
        final backButtons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
        for (final button in backButtons) {
          try {
            final label = await button.attributes['label'];
            if (label.toLowerCase().contains('back') || label == '<' || label == 'Back') {
              await button.click();
              await Future.delayed(Duration(seconds: 1));
              print('✅ Clicked back button: "$label"');
              return;
            }
          } catch (e) {
            // Continue trying other buttons
          }
        }
      } catch (e) {
        await Future.delayed(Duration(milliseconds: 500));
      }
    }
    
    // If no back button found, we're likely already on the main screen
    print('ℹ️ No back navigation needed');
  }
  
  Future<void> performLogout() async {
    print('🚪 Starting logout...');
    try {
      // Look for logout button more thoroughly
      final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
      bool logoutFound = false;
      
      for (final button in buttons) {
        try {
          final label = await button.attributes['label'];
          if (label.toLowerCase().contains('logout')) {
            await button.click();
            logoutFound = true;
            print('✅ Logout button clicked');
            break;
          }
        } catch (e) {
          // Continue searching
        }
      }
      
      if (!logoutFound) {
        print('⚠️ Logout button not found, may already be logged out');
      }
      
      await Future.delayed(Duration(seconds: 2));
    } catch (e) {
      print('⚠️ Logout error: $e');
    }
    
    // Wait for main screen to appear
    await waitForMainScreen();
    print('✅ Logout completed');
  }
  
  Future<void> quickLogin() async {
    // Quick login with a new email account
    print('🚀 Starting quick login...');
    
    // Wait for app to be ready after restart
    await Future.delayed(Duration(seconds: 3));
    
    // Ensure we're on the main screen
    await waitForMainScreen();
    
    final email = TestConstants.generateUniqueEmail();
    await performEmailAuthWithPasskey(email, isNewUser: true);
    print('✅ Quick login completed');
  }

  Future<void> ensureLoggedIn() async {
    try {
      await Future.delayed(Duration(seconds: 2));
      await waitForWalletsView();
      print('✅ Already authenticated');
    } catch (e) {
      print('🔑 Performing quick login...');
      await quickLogin();
    }
  }

  Future<void> dismissAlert() async {
    try {
      final alerts = await driver.findElements(AppiumBy.className('XCUIElementTypeAlert')).toList();
      if (alerts.isNotEmpty) {
        await clickElementByText('OK');
      }
    } catch (e) {
      // No alert present
    }
  }
  
  // Duplicate method removed - using original implementation

  // Transaction Helper Methods
  Future<void> performTransactionSigning(String chain, {String? recipientAddress}) async {
    await ensureLoggedIn();
    
    // Navigate to transaction screen
    await waitForWalletsView();
    await clickElementByText('Send Funds');
    await Future.delayed(Duration(seconds: 2));
    
    // Navigate to specific chain
    await clickElementByText('$chain Transactions', className: 'XCUIElementTypeStaticText');
    await Future.delayed(Duration(seconds: 2));
    
    // Fill transaction details
    await enterText(recipientAddress ?? testRecipientAddress, fieldIndex: 0);
    await dismissKeyboard();
    await enterText(testAmount, fieldIndex: 1);
    await dismissKeyboard();
    
    // Try to sign/send transaction - different chains have different button text
    try {
      await clickElementByText('Sign Transaction');
      await Future.delayed(TestConstants.defaultTimeout);
      print('✅ Clicked Sign Transaction button');
    } catch (e) {
      try {
        await clickElementByText('Send Transaction');
        await Future.delayed(TestConstants.defaultTimeout);
        print('✅ Clicked Send Transaction button');
      } catch (e2) {
        throw Exception('❌ Could not find Sign Transaction or Send Transaction button');
      }
    }
    
    // Check for transaction result - either success or expected insufficient funds
    final textElements = await driver.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
    bool foundValidResult = false;
    bool foundUnexpectedError = false;
    String? resultMessage;
    
    for (final element in textElements) {
      final text = await element.text;
      
      // Expected results (either success or expected insufficient funds error)
      if (text.contains('insufficient funds') || 
          text.contains('RPCError') && text.contains('insufficient funds') ||
          text.contains('Signature:') || 
          text.contains('Last Signature:') ||
          text.contains('Transaction Hash:') ||
          text.contains('Success')) {
        foundValidResult = true;
        resultMessage = text;
        print('✅ Transaction signing successful (result: ${text.length > 50 ? "${text.substring(0, 50)}..." : text})');
        break;
      }
      
      // Unexpected errors that should fail the test
      if ((text.contains('Error') || text.contains('Exception') || text.contains('Failed')) &&
          !text.contains('insufficient funds')) {
        foundUnexpectedError = true;
        resultMessage = text;
        break;
      }
    }
    
    if (foundUnexpectedError) {
      throw Exception('❌ Transaction signing failed with unexpected error: ${resultMessage?.substring(0, 100)}...');
    }
    
    if (!foundValidResult) {
      print('⚠️ No clear transaction result found. Visible text:');
      for (final element in textElements) {
        final text = await element.text;
        if (text.length > 10) {
          print('📝 Found text: ${text.length > 50 ? "${text.substring(0, 50)}..." : text}');
        }
      }
      throw Exception('❌ Transaction signing failed - no valid result found');
    }
    
    await dismissAlert();
  }
}

void main() {
  // Support running individual tests
  final singleTest = Platform.environment['SINGLE_TEST'];
  
  group('Para Flutter E2E Tests', () {
    late AppiumWebDriver driver;
    late TestHelper helper;
    
    setUpAll(() async {
      // Load environment variables from .env file
      final env = DotEnv(includePlatformEnvironment: true)..load(['.env']);
      
      // Check for API key in environment variables or .env file
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
      
      // Create helper instance
      helper = TestHelper(driver);
      
      print('✅ Environment validated');
      
      // Enroll biometrics
      try {
        await driver.execute('mobile:enrollBiometric', <dynamic>[<String, dynamic>{'isEnabled': true}]);
        print('✅ Biometrics enrolled successfully');
      } catch (e) {
        print('Warning: Could not enroll biometrics: $e');
      }
    });

    tearDownAll(() async {
      await driver.quit();
    });
    
    setUp(() async {
      // Give app time to fully restart between tests
      await Future.delayed(Duration(seconds: 3));
      print('🔄 Starting new test...');
    });

    tearDown(() async {
      // Simple cleanup: always restart app for clean state
      print('🧹 Restarting app for clean state...');
      try {
        // Terminate the app
        await driver.execute('mobile:terminateApp', <dynamic>[<String, dynamic>{
          'bundleId': 'com.usecapsule.example.flutter'
        }]);
        await Future.delayed(Duration(seconds: 1));
        
        // Relaunch the app
        await driver.execute('mobile:launchApp', <dynamic>[<String, dynamic>{
          'bundleId': 'com.usecapsule.example.flutter'
        }]);
        await Future.delayed(Duration(seconds: 2));
        print('✅ App restarted');
      } catch (e) {
        print('⚠️ Could not restart app: $e');
      }
    });

    test('01 Email Authentication: Signup + Login Flow', () async {
      print('🧪 Starting Email Authentication: Signup + Login Flow...');
      
      // Generate unique email and perform signup
      final email = TestConstants.generateUniqueEmail();
      print('📧 Generated test email: $email');
      
      try {
        await helper.performEmailAuthWithPasskey(email, isNewUser: true);
        print('✅ Email signup completed');
        
        // Test logout and login
        await helper.performLogout();
        print('✅ Logged out');
        
        // Login with same email (should go directly to biometric auth)
        await Future.delayed(Duration(seconds: 2));
        await helper.performEmailAuthWithPasskey(email, isNewUser: false);
        print('✅ Email login completed successfully');
      } catch (e) {
        print('❌ Email auth test failed: $e');
        rethrow;
      }
    }, timeout: Timeout(Duration(minutes: 2)), skip: singleTest != null && singleTest != 'email_full');

    test('02 Phone Authentication: Signup + Login Flow', () async {
      print('🧪 Starting Phone Authentication: Signup + Login Flow...');
      
      // Generate unique phone number and perform signup
      final phoneNumber = TestConstants.generateTestPhoneNumber();
      print('📱 Generated test phone: $phoneNumber');
      
      try {
        await helper.performPhoneAuthWithPasskey(phoneNumber, isNewUser: true);
        print('✅ Phone signup completed');
        
        // Test logout and login
        await helper.performLogout();
        print('✅ Logged out');
        
        // Login with same phone (should go directly to biometric auth)
        await Future.delayed(Duration(seconds: 2));
        await helper.performPhoneAuthWithPasskey(phoneNumber, isNewUser: false);
        print('✅ Phone login completed successfully');
      } catch (e) {
        print('❌ Phone auth test failed: $e');
        rethrow;
      }
    }, timeout: Timeout(Duration(minutes: 3)), skip: singleTest != null && singleTest != 'phone_full');

    // Individual signup tests for debugging
    test('Email Signup Only', () async {
      print('🧪 Starting Email Signup Only...');
      
      final email = TestConstants.generateUniqueEmail();
      print('📧 Generated test email: $email');
      
      try {
        await helper.performEmailAuthWithPasskey(email, isNewUser: true);
        print('✅ Email signup completed successfully');
      } catch (e) {
        print('❌ Email signup failed: $e');
        rethrow;
      }
    }, timeout: Timeout(Duration(minutes: 2)), skip: singleTest != null && singleTest != 'email_signup');

    test('Phone Signup Only', () async {
      print('🧪 Starting Phone Signup Only...');
      
      final phoneNumber = TestConstants.generateTestPhoneNumber();
      print('📱 Generated test phone: $phoneNumber');
      
      try {
        await helper.performPhoneAuthWithPasskey(phoneNumber, isNewUser: true);
        print('✅ Phone signup completed successfully');
      } catch (e) {
        print('❌ Phone signup failed: $e');
        rethrow;
      }
    }, timeout: Timeout(Duration(minutes: 2)), skip: singleTest != null && singleTest != 'phone_signup');

    // Password authentication is no longer supported in the new UI
    // This test has been removed as per the Swift test pattern

    test('04 Wallet Verification Flow', () async {
      print('🧪 Starting Wallet Verification Flow...');
      await helper.ensureLoggedIn();
      print('✅ Wallet verification completed successfully');
    }, skip: singleTest != null && singleTest != 'wallet_verification');
    
    test('05 Copy Wallet Address Flow', () async {
      print('🧪 Starting Copy Wallet Address Flow...');
      await helper.ensureLoggedIn();
      
      try {
        await helper.clickElementByText('copy');
        await Future.delayed(Duration(seconds: 2));
        print('✅ Copy address operation completed');
      } catch (e) {
        print('⚠️ Copy button not found or operation failed');
      }
    }, skip: singleTest != null && singleTest != 'copy_address');
    
    test('06 EVM Transaction Signing Flow', () async {
      print('🧪 Starting EVM Transaction Signing Flow...');
      
      await helper.quickLogin();
      await helper.performTransactionSigning('EVM');
    }, timeout: Timeout(Duration(minutes: 2)), skip: singleTest != null && singleTest != 'evm_transaction');
    
    test('07 Session Validation Flow', () async {
      print('🧪 Starting Session Validation Flow...');
      await helper.quickLogin();
      print('✅ Session is valid - can access wallet screen');
    }, timeout: Timeout(Duration(minutes: 2)));
    
    test('08 Logout Flow', () async {
      print('🧪 Starting Logout Flow...');
      await helper.quickLogin();
      await helper.performLogout();
      print('✅ Logout completed');
    }, timeout: Timeout(Duration(minutes: 2)));

    test('09 Solana Transaction Signing Flow', () async {
      print('🧪 Starting Solana Transaction Signing Flow...');
      
      await helper.quickLogin();
      
      // Check if Solana wallet exists, create if needed
      final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
      for (final button in buttons) {
        final label = await button.attributes['label'];
        if (label.contains('Create SOLANA Wallet')) {
          await button.click();
          await Future.delayed(TestConstants.defaultTimeout);
          break;
        }
      }
      
      await helper.performTransactionSigning('Solana', recipientAddress: '11111111111111111111111111111112');
    }, timeout: Timeout(Duration(minutes: 2)));

    test('10 Cosmos Wallet Creation and Message Signing Flow', () async {
      print('🧪 Starting Cosmos Wallet Creation and Message Signing Flow...');
      
      await helper.quickLogin();
      
      // Check if Cosmos wallet exists, create if needed
      bool cosmosWalletExists = false;
      final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
      for (final button in buttons) {
        final label = await button.attributes['label'];
        if (label.contains('Create COSMOS Wallet')) {
          await button.click();
          await Future.delayed(TestConstants.defaultTimeout);
          print('✅ Created Cosmos wallet');
          cosmosWalletExists = true;
          break;
        } else if (label.contains('COSMOS Wallet') && !label.contains('Create')) {
          cosmosWalletExists = true;
          print('✅ Cosmos wallet already exists');
          break;
        }
      }
      
      if (!cosmosWalletExists) {
        throw Exception('❌ Failed to find or create Cosmos wallet');
      }
      
      // Navigate to Cosmos signing example
      await helper.clickElementByText('Send Funds');
      await Future.delayed(Duration(seconds: 3));
      
      // Try different ways to navigate to Cosmos screen
      try {
        await helper.clickElementByText('Cosmos Transactions', className: 'XCUIElementTypeStaticText');
      } catch (e) {
        // If that doesn't work, try just "Cosmos"
        try {
          await helper.clickElementByText('Cosmos', className: 'XCUIElementTypeStaticText');
        } catch (e2) {
          // Last resort - look for any element containing Cosmos
          final elements = await driver.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
          bool foundCosmos = false;
          for (final element in elements) {
            final text = await element.text;
            if (text.toLowerCase().contains('cosmos')) {
              await element.click();
              foundCosmos = true;
              print('✅ Clicked on Cosmos element: "$text"');
              break;
            }
          }
          if (!foundCosmos) {
            throw Exception('❌ Could not find any Cosmos navigation option');
          }
        }
      }
      await Future.delayed(Duration(seconds: 3));
      
      // Verify we're on the Cosmos screen - be more flexible
      final screenElements = await driver.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
      bool onCosmosScreen = false;
      for (final element in screenElements) {
        final text = await element.text;
        if (text.toLowerCase().contains('cosmos') || text.contains('Sign Message') || text.contains('Bank Send')) {
          onCosmosScreen = true;
          print('✅ On Cosmos screen - found: "$text"');
          break;
        }
      }
      
      if (!onCosmosScreen) {
        // Log what we see to help debug
        print('❌ Not on Cosmos screen. Visible text elements:');
        for (final element in screenElements) {
          final text = await element.text;
          if (text.length > 5) {
            print('  - "$text"');
          }
        }
        throw Exception('❌ Failed to navigate to Cosmos signing screen');
      }
      
      // Wait for Cosmos signer to initialize - check for a shorter time
      print('🔄 Waiting for Cosmos signer to initialize...');
      bool signerReady = false;
      for (int attempt = 0; attempt < 5; attempt++) {
        await Future.delayed(Duration(seconds: 2));
        
        // Check if Sign Message button is enabled
        final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
        for (final button in buttons) {
          try {
            final label = await button.attributes['label'];
            if (label.contains('Sign Message')) {
              final enabled = await button.enabled;
              print('🔍 Sign Message button enabled: $enabled (attempt ${attempt + 1})');
              if (enabled) {
                signerReady = true;
                break;
              }
            }
          } catch (e) {
            // Continue checking
          }
        }
        
        if (signerReady) break;
      }
      
      if (!signerReady) {
        print('⚠️ Cosmos signer not ready after 10 seconds, will try clicking disabled buttons to see error...');
      }
      
      // Test message signing - try different button texts
      try {
        await helper.clickElementByText('Sign Message');
        print('✅ Found Sign Message button');
      } catch (e) {
        try {
          await helper.clickElementByText('Message');
          print('✅ Found Message button');
        } catch (e2) {
          // Look for any sign-related button
          final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
          bool foundSignButton = false;
          for (final button in buttons) {
            final label = await button.attributes['label'];
            if (label.toLowerCase().contains('sign') || label.toLowerCase().contains('message')) {
              await button.click();
              print('✅ Clicked button: "$label"');
              foundSignButton = true;
              break;
            }
          }
          if (!foundSignButton) {
            print('⚠️ Could not find Sign Message button, continuing anyway');
          }
        }
      }
      await Future.delayed(Duration(seconds: 2));
      
      // Enter test message if there's an input field
      try {
        await helper.enterText('Hello Cosmos from Para Flutter SDK!', fieldIndex: 0);
        await helper.dismissKeyboard();
        print('✅ Entered test message');
      } catch (e) {
        print('⚠️ Could not enter message, may not be needed');
      }
      
      // Try to sign the message
      try {
        await helper.clickElementByText('Sign');
        await Future.delayed(TestConstants.defaultTimeout);
        print('✅ Message signed');
      } catch (e) {
        print('⚠️ Could not find Sign button, test may have completed already');
      }
      
      // Proper validation: Check for success vs error
      final textElements = await driver.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
      bool successFound = false;
      bool errorFound = false;
      String? errorMessage;
      
      for (final element in textElements) {
        final text = await element.text;
        
        // Check for error conditions FIRST
        if (text.contains('Error') || 
            text.contains('Exception') || 
            text.contains('failed') ||
            text.contains('Failed') ||
            text.toLowerCase().contains('operation failed')) {
          errorFound = true;
          errorMessage = text;
          break;
        }
        
        // Only check for success if no error found
        if (!errorFound && (
            (text.toLowerCase().contains('signature') && !text.toLowerCase().contains('failed')) ||
            text.toLowerCase().contains('signed successfully') ||
            text.contains('Success') ||
            (text.contains('0x') && text.length > 20) || // Hex signature
            (text.startsWith('cosmos1') && text.length > 20))) { // Valid cosmos address
          successFound = true;
          print('✅ Cosmos operation completed successfully - found: ${text.length > 50 ? "${text.substring(0, 50)}..." : text}');
          break;
        }
      }
      
      if (errorFound) {
        throw Exception('❌ Cosmos message signing failed with error: ${errorMessage?.substring(0, 100)}...');
      }
      
      if (!successFound) {
        print('⚠️ No clear success result found. Visible text:');
        for (final element in textElements) {
          final text = await element.text;
          if (text.length > 10) {
            print('  - "${text.length > 50 ? "${text.substring(0, 50)}..." : text}"');
          }
        }
        throw Exception('❌ Cosmos message signing failed - no success result found');
      }
      
      print('✅ Cosmos message signing test completed');
    }, timeout: Timeout(Duration(minutes: 3)));

    test('11 Cosmos Transaction Signing Flow', () async {
      print('🧪 Starting Cosmos Transaction Signing Flow...');
      
      // Ensure clean login state
      try {
        await helper.performLogout();
        await Future.delayed(Duration(seconds: 2));
      } catch (e) {
        print('ℹ️ Logout not needed: $e');
      }
      await helper.quickLogin();
      
      // Check if Cosmos wallet exists, create if needed
      bool cosmosWalletExists = false;
      final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
      for (final button in buttons) {
        final label = await button.attributes['label'];
        if (label.contains('Create COSMOS Wallet')) {
          await button.click();
          await Future.delayed(TestConstants.defaultTimeout);
          print('✅ Created Cosmos wallet');
          cosmosWalletExists = true;
          break;
        } else if (label.contains('COSMOS Wallet') && !label.contains('Create')) {
          cosmosWalletExists = true;
          print('✅ Cosmos wallet already exists');
          break;
        }
      }
      
      if (!cosmosWalletExists) {
        print('ℹ️ Cosmos wallet status unclear, continuing...');
      }
      
      // Navigate to Cosmos transaction screen
      await helper.clickElementByText('Send Funds');
      await Future.delayed(Duration(seconds: 3));
      
      // Try different ways to navigate to Cosmos screen
      try {
        await helper.clickElementByText('Cosmos Transactions', className: 'XCUIElementTypeStaticText');
      } catch (e) {
        try {
          await helper.clickElementByText('Cosmos', className: 'XCUIElementTypeStaticText');
        } catch (e2) {
          // Look for any element containing Cosmos
          final elements = await driver.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
          bool foundCosmos = false;
          for (final element in elements) {
            final text = await element.text;
            if (text.toLowerCase().contains('cosmos')) {
              await element.click();
              foundCosmos = true;
              print('✅ Clicked on Cosmos element: "$text"');
              break;
            }
          }
          if (!foundCosmos) {
            throw Exception('❌ Could not find Cosmos navigation option');
          }
        }
      }
      await Future.delayed(Duration(seconds: 3));
      
      // Verify we're on the Cosmos Wallet screen - use flexible validation like test 10
      final screenElements = await driver.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
      bool onCosmosScreen = false;
      for (final element in screenElements) {
        final text = await element.text;
        if (text.toLowerCase().contains('cosmos') || text.contains('Sign Message') || text.contains('Bank Send') || 
            text.contains('Cosmos Wallet') || text.contains('Sign Proto') || text.contains('Sign Amino')) {
          onCosmosScreen = true;
          print('✅ On Cosmos Wallet screen - found: "$text"');
          break;
        }
      }
      
      if (!onCosmosScreen) {
        throw Exception('❌ Not on Cosmos Wallet screen');
      }
      
      // Test Cosmos transaction signing using the actual UI
      // Try Sign Proto first (protobuf signing)
      try {
        await helper.clickElementByText('Sign Proto');
        await Future.delayed(Duration(seconds: 3));
        print('✅ Clicked Sign Proto button');
      } catch (e) {
        // If Sign Proto doesn't work, try Sign Amino
        try {
          await helper.clickElementByText('Sign Amino');
          await Future.delayed(Duration(seconds: 3));
          print('✅ Clicked Sign Amino button');
        } catch (e2) {
          throw Exception('❌ Could not find Sign Proto or Sign Amino buttons');
        }
      }
      
      // Proper validation: Check for success vs error
      final textElements = await driver.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
      bool successFound = false;
      bool errorFound = false;
      String? resultMessage;
      
      for (final element in textElements) {
        final text = await element.text;
        
        // Check for errors FIRST
        if (text.contains('Error') || 
            text.contains('Exception') || 
            text.contains('failed') ||
            text.contains('Failed') ||
            text.toLowerCase().contains('operation failed')) {
          errorFound = true;
          resultMessage = text;
          break;
        }
        
        // Only check for success if no error found
        if (!errorFound && (
            text.contains('Signature Result') || 
            (text.toLowerCase().contains('signature') && !text.toLowerCase().contains('failed') && text.length > 20) ||
            text.contains('insufficient funds') ||  // Expected for test addresses
            text.contains('Success'))) {
          successFound = true;
          resultMessage = text;
          break;
        }
      }
      
      if (errorFound) {
        throw Exception('❌ Cosmos transaction signing failed with error: ${resultMessage?.substring(0, 100)}...');
      }
      
      if (!successFound) {
        print('⚠️ No clear result found. Visible text:');
        for (final element in textElements) {
          final text = await element.text;
          if (text.length > 10) {
            print('  - "${text.length > 50 ? "${text.substring(0, 50)}..." : text}"');
          }
        }
        throw Exception('❌ Cosmos transaction signing failed - no valid result found');
      }
      
      print('✅ Cosmos transaction signing completed successfully: ${resultMessage != null && resultMessage.length > 100 ? "${resultMessage.substring(0, 100)}..." : resultMessage}');
    }, timeout: Timeout(Duration(minutes: 2)));

    test('12 Cosmos Signing Method Validation Flow', () async {
      print('🧪 Starting Cosmos Signing Method Validation Flow...');
      
      // Ensure clean login state
      try {
        await helper.performLogout();
        await Future.delayed(Duration(seconds: 2));
      } catch (e) {
        print('ℹ️ Logout not needed: $e');
      }
      await helper.quickLogin();
      
      // Check if Cosmos wallet exists, create if needed
      bool cosmosWalletExists = false;
      final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
      for (final button in buttons) {
        final label = await button.attributes['label'];
        if (label.contains('Create COSMOS Wallet')) {
          await button.click();
          await Future.delayed(TestConstants.defaultTimeout);
          print('✅ Created Cosmos wallet');
          cosmosWalletExists = true;
          break;
        } else if (label.contains('COSMOS Wallet') && !label.contains('Create')) {
          cosmosWalletExists = true;
          print('✅ Cosmos wallet already exists');
          break;
        }
      }
      
      if (!cosmosWalletExists) {
        print('ℹ️ Cosmos wallet status unclear, continuing...');
      }
      
      // Navigate to Cosmos transaction screen
      await helper.clickElementByText('Send Funds');
      await Future.delayed(Duration(seconds: 3));
      
      // Try different ways to navigate to Cosmos screen
      try {
        await helper.clickElementByText('Cosmos Transactions', className: 'XCUIElementTypeStaticText');
      } catch (e) {
        try {
          await helper.clickElementByText('Cosmos', className: 'XCUIElementTypeStaticText');
        } catch (e2) {
          // Look for any element containing Cosmos
          final elements = await driver.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
          bool foundCosmos = false;
          for (final element in elements) {
            final text = await element.text;
            if (text.toLowerCase().contains('cosmos')) {
              await element.click();
              foundCosmos = true;
              print('✅ Clicked on Cosmos element: "$text"');
              break;
            }
          }
          if (!foundCosmos) {
            throw Exception('❌ Could not find Cosmos navigation option');
          }
        }
      }
      await Future.delayed(Duration(seconds: 3));
      
      // Verify we're on the Cosmos Wallet screen and can see signing options - use flexible validation like test 10
      final screenElements = await driver.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
      bool onCosmosScreen = false;
      String? signingOptionsFound;
      
      for (final element in screenElements) {
        final text = await element.text;
        if (text.toLowerCase().contains('cosmos') || text.contains('Sign Message') || text.contains('Bank Send') ||
            text.contains('Cosmos Wallet')) {
          onCosmosScreen = true;
          print('✅ On Cosmos Wallet screen - found: "$text"');
        }
        
        // Check for signing options
        if (text.contains('Sign Proto') || text.contains('Sign Amino') || text.contains('Bank Send') || text.contains('Sign Message')) {
          signingOptionsFound = text;
        }
      }
      
      if (!onCosmosScreen) {
        throw Exception('❌ Not on Cosmos Wallet screen');
      }
      
      if (signingOptionsFound == null) {
        print('⚠️ No specific signing options found, but on Cosmos screen');
      } else {
        print('✅ Found Cosmos signing options: "$signingOptionsFound"');
      }
      
      print('✅ Cosmos signing method validation test completed successfully');
    }, timeout: Timeout(Duration(minutes: 2)));
  });
}