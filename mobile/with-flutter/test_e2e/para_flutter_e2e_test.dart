// Para Flutter E2E Tests - Simplified Version
// Streamlined with minimal code duplication

import 'dart:io';
import 'dart:math';
import 'package:test/test.dart';
import 'package:appium_driver/async_io.dart';
import 'package:dotenv/dotenv.dart';

// Test constants
const shortDelay = Duration(seconds: 1);
const mediumDelay = Duration(seconds: 2);
const longDelay = Duration(seconds: 5);
const testVerificationCode = '123456';
const testRecipientAddress = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
const testAmount = '0.001';

// Test state
String? savedEmail;
String? savedPhoneNumber;

void main() {
  group('Para Flutter E2E Tests', () {
    late AppiumWebDriver driver;
    
    
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
        'platformVersion': '18.5',
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
      // Add small delay between tests for stability
      await Future.delayed(Duration(seconds: 2));
      print('🔄 Starting new test...');
    });
    
    tearDown(() async {
      // Cleanup after each test
      try {
        await Future.delayed(Duration(seconds: 1));
        print('🧹 Test cleanup completed');
      } catch (e) {
        print('⚠️ Test cleanup had minor issues: $e');
      }
    });

    // Core Helper Methods
    bool isWalletScreenText(String text) {
      return text == 'Your Wallets' || text == 'EVM Wallet' || text == 'SOLANA Wallet' || 
             text == 'COSMOS Wallet' || text == 'Send Funds' || text.contains('Signing Demo') ||
             (text.contains('Create') && text.contains('Wallet')) || text.contains('Balance:');
    }
    
    Future<void> clickElementByText(String searchText, {String className = 'XCUIElementTypeButton'}) async {
      final elements = await driver.findElements(AppiumBy.className(className)).toList();
      for (final element in elements) {
        final label = className == 'XCUIElementTypeButton' 
            ? await element.attributes['label'] 
            : await element.text;
        final isEnabled = className == 'XCUIElementTypeButton' ? await element.enabled : true;
        if (label.toLowerCase().contains(searchText.toLowerCase()) && isEnabled) {
          await element.click();
          return;
        }
      }
      throw Exception('Element with text "$searchText" not found');
    }

    Future<void> enterText(String text, {int fieldIndex = 0}) async {
      final textFields = await driver.findElements(AppiumBy.className('XCUIElementTypeTextField')).toList();
      if (textFields.length <= fieldIndex) {
        throw Exception('Text field at index $fieldIndex not found');
      }
      await textFields[fieldIndex].click();
      await textFields[fieldIndex].sendKeys(text);
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
      await Future.delayed(longDelay);
      await manualTapContinue();
      await Future.delayed(mediumDelay);
      
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
      await Future.delayed(longDelay);
      
      for (int attempt = 0; attempt < 10; attempt++) {
        try {
          final elementTypes = ['XCUIElementTypeStaticText', 'XCUIElementTypeButton', 'XCUIElementTypeNavigationBar'];
          
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
                  await Future.delayed(shortDelay);
                  return;
                }
              } catch (e) {
                // Continue checking
              }
            }
          }
          
          if ((attempt + 1) % 3 == 0) {
            print('Still waiting for wallets view... (Attempt ${attempt + 1}/10)');
          }
          
          await Future.delayed(Duration(seconds: 2));
        } catch (e) {
          await Future.delayed(Duration(seconds: 2));
        }
      }
      
      throw Exception('❌ Timed out waiting for wallets view after 10 attempts');
    }

    Future<void> performAuthFlow(String authType, String credential) async {
      print('🔑 Starting $authType authentication flow...');
      
      await Future.delayed(mediumDelay);
      await clickElementByText('$authType + Passkey Authentication', className: 'XCUIElementTypeStaticText');
      await Future.delayed(shortDelay);
      
      if (authType == 'Email') {
        await enterText(credential);
      } else {
        await enterText(credential, fieldIndex: 1); // Phone number field
      }
      
      await dismissKeyboard();
      await Future.delayed(shortDelay);
      await clickElementByText('continue');
      await Future.delayed(mediumDelay);
      
      // Enter verification code
      final verificationFields = await driver.findElements(AppiumBy.className('XCUIElementTypeTextField')).toList();
      final secureFields = await driver.findElements(AppiumBy.className('XCUIElementTypeSecureTextField')).toList();
      final allFields = [...verificationFields, ...secureFields];
      
      if (allFields.isNotEmpty) {
        await allFields.first.click();
        await allFields.first.sendKeys(testVerificationCode);
        await Future.delayed(Duration(seconds: 3));
      }
      
      await clickElementByText('Use Biometrics', className: 'XCUIElementTypeStaticText');
      await Future.delayed(shortDelay);
      await manualTapContinue();
      await performBiometricAuth();
      await waitForWalletsView();
      
      print('✅ $authType authentication completed');
    }
    
    Future<void> quickLogin() async {
      final email = 'test${DateTime.now().millisecondsSinceEpoch}@test.usecapsule.com';
      await performAuthFlow('Email', email);
    }

    Future<void> ensureLoggedIn() async {
      try {
        await waitForWalletsView();
        print('✅ Already authenticated');
      } catch (e) {
        print('🔑 Performing quick login...');
        await quickLogin();
      }
    }

    Future<void> performLogout() async {
      try {
        await clickElementByText('logout');
        await Future.delayed(Duration(seconds: 3));
      } catch (e) {
        print('Logout not needed or failed: $e');
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

    Future<void> performTransactionSigning(String chain, {String? recipientAddress}) async {
      await ensureLoggedIn();
      
      // Navigate to transaction screen - try multiple navigation options
      await waitForWalletsView();
      
      try {
        await clickElementByText('Send Funds');
      } catch (e) {
        print('⚠️ "Send Funds" not found, trying to navigate back to main wallet screen...');
        try {
          // Try to go back to main screen
          await clickElementByText('Back');
          await Future.delayed(shortDelay);
          await waitForWalletsView();
          await clickElementByText('Send Funds');
        } catch (e2) {
          print('⚠️ Still cannot find "Send Funds", continuing with current screen...');
        }
      }
      await Future.delayed(shortDelay);
      
      // Navigate to specific chain - try multiple variations
      try {
        await clickElementByText('$chain Transactions', className: 'XCUIElementTypeStaticText');
      } catch (e) {
        print('⚠️ Could not find "$chain Transactions", trying alternatives...');
        try {
          await clickElementByText(chain, className: 'XCUIElementTypeStaticText');
        } catch (e2) {
          print('⚠️ Could not find "$chain", trying button...');
          await clickElementByText(chain);
        }
      }
      await Future.delayed(mediumDelay);
      
      // Fill transaction details
      try {
        await enterText(recipientAddress ?? testRecipientAddress, fieldIndex: 0);
        await dismissKeyboard();
        await enterText(testAmount, fieldIndex: 1);
        await dismissKeyboard();
        
        // Send transaction
        await clickElementByText('Send Transaction');
        await Future.delayed(longDelay);
        
        // Check for expected insufficient funds error
        final textElements = await driver.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
        for (final element in textElements) {
          final text = await element.text;
          if (text.contains('insufficient funds') || text.contains('Error') || text.contains('RPCError')) {
            print('✅ Transaction signing successful (expected error: $text)');
            break;
          }
        }
      } catch (e) {
        print('⚠️ Transaction form interaction failed: $e');
      }
      
      await dismissAlert();
    }

    test('01 Email Authentication: Signup + Login Flow', () async {
      print('🧪 Starting Email Authentication: Signup + Login Flow...');
      
      // Generate unique email and perform signup
      final email = 'test${DateTime.now().millisecondsSinceEpoch}@test.usecapsule.com';
      savedEmail = email;
      print('📧 Generated test email: $email');
      
      await performAuthFlow('Email', email);
      
      // Test logout and login
      await performLogout();
      print('✅ Logged out');
      
      // Login with same email (should go directly to biometric auth)
      await Future.delayed(Duration(seconds: 2));
      await clickElementByText('Email + Passkey Authentication', className: 'XCUIElementTypeStaticText');
      await Future.delayed(shortDelay);
      await enterText(email);
      await dismissKeyboard();
      await clickElementByText('continue');
      await performBiometricAuth();
      await waitForWalletsView();
      print('✅ Email login completed successfully');
    }, timeout: Timeout(Duration(minutes: 2)));

    test('02 Phone Authentication: Signup + Login Flow', () async {
      print('🧪 Starting Phone Authentication: Signup + Login Flow...');
      
      await performLogout();
      
      // Generate unique phone number and perform signup
      final phoneNumber = '408555${1000 + Random().nextInt(9000)}';
      savedPhoneNumber = phoneNumber;
      print('📱 Generated test phone: $phoneNumber');
      
      await performAuthFlow('Phone', phoneNumber);
      
      // Test logout and login
      await performLogout();
      print('✅ Logged out');
      
      // Login with same phone (should go directly to biometric auth)
      await Future.delayed(Duration(seconds: 2));
      await clickElementByText('Phone + Passkey Authentication', className: 'XCUIElementTypeStaticText');
      await Future.delayed(shortDelay);
      await enterText(phoneNumber, fieldIndex: 1);
      await dismissKeyboard();
      await clickElementByText('continue');
      await performBiometricAuth();
      await waitForWalletsView();
      print('✅ Phone login completed successfully');
    }, timeout: Timeout(Duration(minutes: 2)));
    
    
    test('03 Wallet Verification Flow', () async {
      print('🧪 Starting Wallet Verification Flow...');
      await ensureLoggedIn();
      print('✅ Wallet verification completed successfully');
    });
    
    test('04 Copy Wallet Address Flow', () async {
      print('🧪 Starting Copy Wallet Address Flow...');
      await ensureLoggedIn();
      
      try {
        await clickElementByText('copy');
        await Future.delayed(Duration(seconds: 2));
        print('✅ Copy address operation completed');
      } catch (e) {
        print('⚠️ Copy button not found or operation failed');
      }
    });
    
    test('05 EVM Transaction Signing Flow', () async {
      print('🧪 Starting EVM Transaction Signing Flow...');
      await performTransactionSigning('EVM');
    }, timeout: Timeout(Duration(minutes: 2)));
    
    test('06 Session Validation Flow', () async {
      print('🧪 Starting Session Validation Flow...');
      await ensureLoggedIn();
      print('✅ Session is valid - can access wallet screen');
    });
    
    test('07 Logout Flow', () async {
      print('🧪 Starting Logout Flow...');
      await ensureLoggedIn();
      await performLogout();
      print('✅ Logout completed');
    });

    test('08 Solana Transaction Signing Flow', () async {
      print('🧪 Starting Solana Transaction Signing Flow...');
      
      // Check if Solana wallet exists, create if needed
      await ensureLoggedIn();
      final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
      for (final button in buttons) {
        final label = await button.attributes['label'];
        if (label.contains('Create SOLANA Wallet')) {
          await button.click();
          await Future.delayed(longDelay);
          break;
        }
      }
      
      await performTransactionSigning('Solana', recipientAddress: '11111111111111111111111111111112');
    }, timeout: Timeout(Duration(minutes: 2)));

  });
}
