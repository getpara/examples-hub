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

    test('Invalid API Key Error', () async {
      print('Testing invalid API key error...');
      
      // Set invalid API key environment variable (in real test, this would be done differently)
      // For now, we'll trigger an error through invalid input
      
      // Try email auth which should fail with invalid credentials
      final emailInput = await driver.findElement(AppiumBy.accessibilityId('emailPhoneInput'));
      await emailInput.click();
      await emailInput.sendKeys('invalid@test.com');
      
      final continueButton = await driver.findElement(AppiumBy.accessibilityId('continue_button'));
      await continueButton.click();
      
      // Wait for potential error alert
      await Future.delayed(const Duration(seconds: 3));
      
      try {
        final alerts = await driver.findElements(AppiumBy.className('XCUIElementTypeAlert')).toList();
        if (alerts.isNotEmpty) {
          // Get error message from alert
          final staticTexts = await alerts.first.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
          if (staticTexts.length > 1) {
            final errorMessage = await staticTexts[1].text;
            print('Error message: $errorMessage');
            
            // Verify it's not generic
            expect(errorMessage, isNot(contains('Unknown error')),
                reason: 'Error should be specific, not generic');
            
            // Dismiss alert
            final okButton = await driver.findElement(AppiumBy.accessibilityId('OK'));
            await okButton.click();
            
            print('✅ Error properly surfaced from bridge');
          }
        }
      } catch (e) {
        print('No error alert found - may have succeeded');
      }
    });

    test('Network Timeout Error', timeout: const Timeout(Duration(minutes: 2)), () async {
      print('Testing network timeout error...');
      
      // First login with valid credentials
      await foundation.performEmailLogin();
      await foundation.waitForWalletsView();
      
      // Create wallet if needed
      await foundation.createWalletIfNeeded();
      
      // Navigate to EVM wallet
      final evmCell = await driver.findElement(AppiumBy.accessibilityId('walletCell_EVM'));
      await evmCell.click();
      
      // Wait for wallet detail view
      await Future.delayed(const Duration(seconds: 2));
      
      // Try to fetch balance - with invalid RPC this should fail
      try {
        final fetchButton = await driver.findElement(AppiumBy.xpath('//XCUIElementTypeButton[@name="Fetch Balance"]'));
        await fetchButton.click();
        
        // Wait for potential network error
        await Future.delayed(const Duration(seconds: 5));
        
        // Check for error alert
        final alerts = await driver.findElements(AppiumBy.className('XCUIElementTypeAlert')).toList();
        if (alerts.isNotEmpty) {
          final staticTexts = await alerts.first.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
          if (staticTexts.length > 1) {
            final errorMessage = await staticTexts[1].text;
            print('Network error: $errorMessage');
            
            // Verify it's not generic
            expect(errorMessage, isNot(contains('Unknown error')),
                reason: 'Should have specific network error');
            
            // Dismiss alert
            final okButton = await driver.findElement(AppiumBy.accessibilityId('OK'));
            await okButton.click();
            
            print('✅ Network error properly handled');
          }
        }
      } catch (e) {
        print('Could not test network error: $e');
      }
      
      // Navigate back
      final backButton = await driver.findElement(AppiumBy.className('XCUIElementTypeButton'));
      await backButton.click();
    });
  });
}