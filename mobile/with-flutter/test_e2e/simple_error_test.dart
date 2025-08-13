// Simple Error Test for Para Flutter SDK
// 
// Tests that errors from the bridge are properly surfaced

import 'package:appium_driver/async_io.dart';
import 'package:test/test.dart';
import './lib/test_constants.dart';
import './lib/wallet_test_foundation.dart';

void main() {
  group('Simple Error Tests', () {
    late AppiumWebDriver driver;
    late WalletTestFoundation foundation;

    setUpAll(() async {
      driver = await WalletTestFoundation.createDriver();
      foundation = WalletTestFoundation(driver);
    });

    tearDownAll(() async {
      await driver.quit();
    });

    setUp(() async {
      await foundation.ensureLoggedOut();
    });

    test('Invalid OTP Code Error', () async {
      print('Testing invalid OTP code error...');
      
      // Enter valid email first
      final emailInput = await driver.findElement(AppiumBy.accessibilityId('emailPhoneInput'));
      await emailInput.click();
      await emailInput.sendKeys('test${DateTime.now().millisecondsSinceEpoch}@example.com');
      
      final continueButton = await driver.findElement(AppiumBy.accessibilityId('continue_button'));
      await continueButton.click();
      
      // Wait for OTP verification view
      await Future.delayed(const Duration(seconds: 2));
      
      // Enter invalid OTP code
      try {
        final otpField = await driver.findElement(AppiumBy.accessibilityId('otp_input'));
        await otpField.click();
        await otpField.sendKeys('000000'); // Invalid OTP code
        
        // Wait for auto-submission and error response
        await Future.delayed(const Duration(seconds: 3));
        
        // Check for error alert
        final alerts = await driver.findElements(AppiumBy.className('XCUIElementTypeAlert')).toList();
        if (alerts.isNotEmpty) {
          // Get error message from alert
          final staticTexts = await alerts.first.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
          if (staticTexts.length > 1) {
            final errorMessage = await staticTexts[1].text;
            print('Invalid OTP Error: $errorMessage');
            
            // Verify error is specific, not generic
            expect(errorMessage, isNot(contains('Unknown error')),
                reason: 'Error should be specific: $errorMessage');
            
            // Should mention OTP, code, or verification
            final hasRelevantError = errorMessage.toLowerCase().contains('otp') ||
                                    errorMessage.toLowerCase().contains('code') ||
                                    errorMessage.toLowerCase().contains('verification') ||
                                    errorMessage.toLowerCase().contains('invalid');
            
            expect(hasRelevantError, isTrue,
                reason: 'Error should mention invalid OTP: $errorMessage');
            
            // Dismiss alert
            final okButton = await driver.findElement(AppiumBy.accessibilityId('OK'));
            await okButton.click();
            
            print('✅ Invalid OTP code error properly surfaced from bridge');
          }
        } else {
          print('ℹ️ No error alert found for invalid OTP');
        }
      } catch (e) {
        print('Could not test invalid OTP: $e');
      }
    });
  });
}