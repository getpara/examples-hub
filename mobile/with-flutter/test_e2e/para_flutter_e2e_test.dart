// Para Flutter E2E Tests - Organized Version
// Clean, organized structure with helper methods to reduce duplication

import 'dart:io';
import 'dart:math';
import 'package:test/test.dart';
import 'package:appium_driver/async_io.dart';
import 'package:dotenv/dotenv.dart';

// Test state management (similar to Swift TestConstants)
String? savedEmail;
String? savedPhoneNumber;

void main() {
  group('Para Flutter E2E Tests', () {
    late AppiumWebDriver driver;
    
    setUpAll(() async {
      // Load environment variables from .env file
      final env = DotEnv()..load(['.env']);
      
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
        'platformVersion': '18.4',
        'deviceName': 'iPhone 16',
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
      
      // Enroll biometrics
      try {
        await driver.execute('mobile:enrollBiometric', <dynamic>[<String, dynamic>{'isEnabled': true}]);
      } catch (e) {
        print('Warning: Could not enroll biometrics: $e');
      }
    });

    tearDownAll(() async {
      await driver.quit();
    });

    // Helper Methods
    bool isWalletScreenText(String text) {
      return text == 'Your Wallets' ||
          text == 'EVM Wallet' ||
          text == 'SOLANA Wallet' ||
          text == 'COSMOS Wallet' ||
          text == 'Send Funds' ||
          text.contains('Create') && text.contains('Wallet');
    }
    
    Future<void> clickButtonByText(String searchText) async {
      final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
      for (final button in buttons) {
        final label = await button.attributes['label'];
        final isEnabled = await button.enabled;
        if (label.toLowerCase().contains(searchText.toLowerCase()) && isEnabled) {
          await button.click();
          return;
        }
      }
      throw Exception('Button with text "$searchText" not found');
    }

    Future<void> clickTextElementByContent(String searchText) async {
      final textElements = await driver.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
      for (final element in textElements) {
        final text = await element.text;
        if (text.contains(searchText)) {
          await element.click();
          return;
        }
      }
      throw Exception('Text element with content "$searchText" not found');
    }

    Future<void> enterTextInField(String text) async {
      final textFields = await driver.findElements(AppiumBy.className('XCUIElementTypeTextField')).toList();
      if (textFields.isEmpty) {
        throw Exception('No text fields found');
      }
      
      await textFields.first.click();
      await textFields.first.sendKeys(text);
    }

    Future<void> enterPhoneNumber(String phoneNumber) async {
      final textFields = await driver.findElements(AppiumBy.className('XCUIElementTypeTextField')).toList();
      if (textFields.length < 2) {
        throw Exception('Phone form requires at least 2 text fields (country code + phone)');
      }
      
      // Click the second field (phone number field, not country code)
      await textFields[1].click();
      await textFields[1].sendKeys(phoneNumber);
    }

    Future<void> dismissKeyboard() async {
      try {
        final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
        for (final button in buttons) {
          final label = await button.attributes['label'];
          if (label == 'done' || label == 'Done') {
            await button.click();
            return;
          }
        }
      } catch (e) {
        // Keyboard might not be visible
      }
    }

    Future<void> enterVerificationCode(String code) async {
      final verificationFields = await driver.findElements(AppiumBy.className('XCUIElementTypeTextField')).toList();
      final secureFields = await driver.findElements(AppiumBy.className('XCUIElementTypeSecureTextField')).toList();
      final allFields = [...verificationFields, ...secureFields];
      
      if (allFields.isEmpty) {
        throw Exception('No verification code fields found');
      }
      
      // Enter the verification code in the first field (single field input)
      await allFields.first.click();
      await allFields.first.sendKeys(code);
    }

    Future<void> performBiometricAuth() async {
      // Wait for biometric prompt
      await Future.delayed(Duration(seconds: 5));
      
      // Manual coordinate tap for Continue button
      final window = await driver.window;
      final size = await window.size;
      const offsetFromBottom = 100;
      final tapX = (size.width / 2).round();
      final tapY = (size.height - offsetFromBottom).round();
      
      try {
        await driver.mouse.moveTo(xOffset: tapX, yOffset: tapY, absolute: true);
        await Future.delayed(Duration(milliseconds: 100));
        await driver.mouse.click();
      } catch (e) {
        print('Manual tap failed, continuing: $e');
      }
      
      await Future.delayed(Duration(seconds: 2));
      
      // Biometric authentication
      try {
        await driver.execute('mobile:sendBiometricMatch', <dynamic>[<String, dynamic>{
          'type': 'touchId',
          'match': true
        }]);
      } catch (e) {
        throw Exception('Biometric authentication failed: $e');
      }
    }

    Future<bool> waitForWalletsView() async {
      // Wait longer for wallet creation to complete
      await Future.delayed(Duration(seconds: 10));
      
      for (int attempt = 0; attempt < 60; attempt++) {
        try {
          // Flutter text might be in buttons or other elements, not just StaticText
          final texts = await driver.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
          final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
          final navigationBars = await driver.findElements(AppiumBy.className('XCUIElementTypeNavigationBar')).toList();
          
          final allFoundContent = <String>[];
          
          // Check StaticText elements
          for (final text in texts) {
            try {
              final textContent = await text.text;
              if (textContent.isNotEmpty) {
                allFoundContent.add('[Text] $textContent');
                if (isWalletScreenText(textContent)) {
                  print('✅ Found wallets screen via StaticText: "$textContent"');
                  return true;
                }
              }
            } catch (e) {
              // Continue checking
            }
          }
          
          // Check Button labels (Flutter buttons might contain the text)
          for (final button in buttons) {
            try {
              final label = await button.attributes['label'];
              if (label.isNotEmpty) {
                allFoundContent.add('[Button] $label');
                if (isWalletScreenText(label)) {
                  print('✅ Found wallets screen via Button: "$label"');
                  return true;
                }
              }
            } catch (e) {
              // Continue checking
            }
          }
          
          // Check NavigationBar for title
          for (final navBar in navigationBars) {
            try {
              final title = await navBar.attributes['name'];
              if (title.isNotEmpty) {
                allFoundContent.add('[NavBar] $title');
                if (isWalletScreenText(title)) {
                  print('✅ Found wallets screen via NavigationBar: "$title"');
                  return true;
                }
              }
            } catch (e) {
              // Continue checking
            }
          }
          
          // Minimal debug output for long waits
          if (attempt % 15 == 0 && attempt > 0) {
            print('Still waiting for wallet screen... (attempt $attempt/60)');
          }
          
          await Future.delayed(Duration(seconds: 2));
        } catch (e) {
          await Future.delayed(Duration(seconds: 2));
        }
      }
      
      return false;
    }

    Future<void> performLogout() async {
      try {
        // Look for logout button in current screen
        final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
        for (final button in buttons) {
          final label = await button.attributes['label'];
          if (label.toLowerCase().contains('logout')) {
            await button.click();
            await Future.delayed(Duration(seconds: 3));
            return;
          }
        }
        
        // If no logout button found, we might already be on auth screen
        print('No logout button found - may already be logged out');
      } catch (e) {
        print('Logout attempt failed: $e');
      }
    }

    test('01 Email Authentication Signup Flow', () async {
      // Generate unique email and save it (simple format)
      final timestamp = DateTime.now().millisecondsSinceEpoch;
      final email = 'test$timestamp@test.usecapsule.com';
      savedEmail = email;
      
      // Click Email Authentication
      await Future.delayed(Duration(seconds: 2));
      await clickTextElementByContent('Email + Passkey Authentication');
      
      // Enter email
      await Future.delayed(Duration(seconds: 1));
      await enterTextInField(email);
      
      // Dismiss keyboard and tap Continue
      await dismissKeyboard();
      await Future.delayed(Duration(seconds: 1));
      await clickButtonByText('continue');
      
      // Enter verification code (auto-verifies when 6 digits entered)
      await Future.delayed(Duration(seconds: 2));
      await enterVerificationCode('123456');
      
      // Wait for auto-verification to complete
      await Future.delayed(Duration(seconds: 3));
      
      // Choose Passkey
      await Future.delayed(Duration(seconds: 2));
      await clickTextElementByContent('Passkey');
      
      // Perform biometric authentication
      await performBiometricAuth();
      
      // Wait for wallets view
      final foundWallets = await waitForWalletsView();
      expect(foundWallets, true, reason: 'Should reach wallets view after authentication');
    });

    test('02 Email Passkey Login Flow', () async {
      // Logout if needed
      await performLogout();
      
      // Verify we have a saved email from signup
      if (savedEmail == null) {
        throw Exception('No saved email found. Run Email Authentication Signup Flow first.');
      }
      
      // Click Email Authentication
      await Future.delayed(Duration(seconds: 2));
      await clickTextElementByContent('Email + Passkey Authentication');
      
      // Enter the saved email (should be recognized as existing user)
      await Future.delayed(Duration(seconds: 1));
      await enterTextInField(savedEmail!);
      
      // Dismiss keyboard and tap Continue
      await dismissKeyboard();
      await Future.delayed(Duration(seconds: 1));
      await clickButtonByText('continue');
      
      // Should go directly to biometric authentication (no verification code needed for login)
      await performBiometricAuth();
      
      // Wait for wallets view
      final foundWallets = await waitForWalletsView();
      expect(foundWallets, true, reason: 'Should reach wallets view after login');
    });

    test('03 Phone Authentication Signup Flow', () async {
      // Logout if needed
      await performLogout();
      
      // Generate unique phone number and save it
      final phoneNumber = '408555${1000 + Random().nextInt(9000)}';
      savedPhoneNumber = phoneNumber;
      
      // Click Phone Authentication
      await Future.delayed(Duration(seconds: 2));
      try {
        await clickTextElementByContent('Phone + Passkey Authentication');
      } catch (e) {
        // Might already be logged out, try to find the button anyway
        print('Phone auth button not found immediately, waiting...');
        await Future.delayed(Duration(seconds: 2));
        await clickTextElementByContent('Phone + Passkey Authentication');
      }
      
      // Enter phone number (in the phone field, not country code field)
      await Future.delayed(Duration(seconds: 1));
      await enterPhoneNumber(phoneNumber);
      
      // Dismiss keyboard and tap Continue
      await dismissKeyboard();
      await Future.delayed(Duration(seconds: 1));
      await clickButtonByText('continue');
      
      // Enter verification code (auto-verifies when 6 digits entered)
      await Future.delayed(Duration(seconds: 2));
      await enterVerificationCode('123456');
      
      // Wait for auto-verification to complete
      await Future.delayed(Duration(seconds: 3));
      
      // Choose Passkey
      await Future.delayed(Duration(seconds: 2));
      await clickTextElementByContent('Passkey');
      
      // Perform biometric authentication
      await performBiometricAuth();
      
      // Wait for wallets view
      final foundWallets = await waitForWalletsView();
      expect(foundWallets, true, reason: 'Should reach wallets view after authentication');
    });

    test('04 Phone Passkey Login Flow', () async {
      // Logout if needed
      await performLogout();
      
      // Verify we have a saved phone number from signup
      if (savedPhoneNumber == null) {
        throw Exception('No saved phone number found. Run Phone Authentication Signup Flow first.');
      }
      
      // Click Phone Authentication
      await Future.delayed(Duration(seconds: 2));
      await clickTextElementByContent('Phone + Passkey Authentication');
      
      // Enter the saved phone number (should be recognized as existing user)
      await Future.delayed(Duration(seconds: 1));
      await enterPhoneNumber(savedPhoneNumber!);
      
      // Dismiss keyboard and tap Continue
      await dismissKeyboard();
      await Future.delayed(Duration(seconds: 1));
      await clickButtonByText('continue');
      
      // Should go directly to biometric authentication (no verification code needed for login)
      await performBiometricAuth();
      
      // Wait for wallets view
      final foundWallets = await waitForWalletsView();
      expect(foundWallets, true, reason: 'Should reach wallets view after login');
    });
  });
}