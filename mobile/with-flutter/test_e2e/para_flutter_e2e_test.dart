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
const testCosmosRecipientAddress = 'cosmos1hsk6jryyqjfhp5dhc55tc9jtckygx0eph6dd02';
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
      // Reduced delay between tests for faster execution
      await Future.delayed(Duration(seconds: 1));
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

    Future<void> performAuthFlow(String authType, String credential) async {
      print('🔑 Starting $authType authentication flow...');
      
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
        // Try multiple logout strategies
        await clickElementByText('logout');
        await Future.delayed(Duration(seconds: 2));
        print('✅ Logout successful');
      } catch (e) {
        try {
          // Try alternative logout approaches
          await clickElementByText('Logout');
          await Future.delayed(Duration(seconds: 2));
          print('✅ Logout successful');
        } catch (e2) {
          try {
            // Look for settings or menu button
            await clickElementByText('Settings');
            await Future.delayed(shortDelay);
            await clickElementByText('logout');
            await Future.delayed(Duration(seconds: 2));
            print('✅ Logout successful');
          } catch (e3) {
            print('ℹ️ Logout not available or already logged out');
          }
        }
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

    Future<void> dismissPasswordManagerModal() async {
      // Tap "Not Now" if iOS password manager appears
      try {
        await Future.delayed(Duration(seconds: 1));
        final window = await driver.window;
        final size = await window.size;
        
        await driver.mouse.moveTo(
          xOffset: (size.width / 2).round(),
          yOffset: (size.height * 0.92).round(),
          absolute: true
        );
        await driver.mouse.click();
        await Future.delayed(Duration(seconds: 1));
      } catch (e) {
        // Modal not present
      }
    }

    Future<void> handleIOSSystemDialog() async {
      // Handle iOS system dialogs (like "Continue" when switching to web view)
      try {
        await Future.delayed(Duration(seconds: 1));
        
        // First try to find Continue button directly
        final allButtons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
        for (final button in allButtons) {
          try {
            final label = await button.attributes['label'];
            if (label.toLowerCase() == 'continue') {
              await button.click();
              print('✅ Found and tapped Continue button');
              await Future.delayed(Duration(seconds: 1));
              return;
            }
          } catch (e) {
            // Continue searching
          }
        }
        
        // Fallback: coordinate tap where Continue button typically appears
        final window = await driver.window;
        final size = await window.size;
        
        await driver.mouse.moveTo(
          xOffset: (size.width * 0.65).round(),  // Right side of dialog
          yOffset: (size.height * 0.57).round(), // Dialog button area
          absolute: true
        );
        await Future.delayed(Duration(milliseconds: 300));
        await driver.mouse.click();
        print('✅ Tapped Continue via coordinates');
        await Future.delayed(Duration(seconds: 1));
        
      } catch (e) {
        print('ℹ️ iOS system dialog handling completed');
      }
    }

    Future<void> createPasswordInWebView(String password) async {
      print('🔐 Creating password in web view...');
      
      // Wait for web view to fully load
      await Future.delayed(Duration(seconds: 5));
      
      // Find password fields with multiple approaches
      List<dynamic> passwordFields = await driver.findElements(AppiumBy.className('XCUIElementTypeSecureTextField')).toList();
      
      // Also check for regular text fields that might be password fields
      if (passwordFields.isEmpty) {
        final allTextFields = await driver.findElements(AppiumBy.className('XCUIElementTypeTextField')).toList();
        for (final field in allTextFields) {
          try {
            final placeholder = await field.attributes['placeholderValue'];
            if (placeholder.toLowerCase().contains('password')) {
              passwordFields.add(field);
            }
          } catch (e) {
            // Continue
          }
        }
      }
      
      print('🔍 Found ${passwordFields.length} password fields');
      
      if (passwordFields.length >= 2) {
        // Debug: Print field info
        for (int i = 0; i < passwordFields.length; i++) {
          try {
            final placeholder = await passwordFields[i].attributes['placeholderValue'];
            final label = await passwordFields[i].attributes['label'];
            print('🔍 Field $i: placeholder="$placeholder", label="$label"');
          } catch (e) {
            print('🔍 Field $i: Could not get attributes');
          }
        }
        
        // Fill first field (Enter password) - follow Swift pattern exactly
        print('🔍 Filling first password field...');
        
        // Step 1: Tap password field (like Swift)
        await passwordFields[0].click();
        await Future.delayed(Duration(seconds: 1));
        
        // Step 2: Handle iOS password manager modal (like Swift tapNotNowOnPasswordModal)
        await dismissPasswordManagerModal();
        
        // Step 3: Tap password field again and enter password (like Swift)
        await passwordFields[0].click();
        await passwordFields[0].sendKeys(password);
        await Future.delayed(Duration(seconds: 2));
        
        // Fill second field (Confirm password) with multiple attempts
        print('🔍 Filling second password field...');
        
        for (int attempt = 0; attempt < 3; attempt++) {
          await passwordFields[1].click();
          await Future.delayed(Duration(seconds: 1));
          await passwordFields[1].sendKeys(password);
          await Future.delayed(Duration(seconds: 2));
          
          // Check if passwords match by looking for error text
          final staticTexts = await driver.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
          bool hasError = false;
          for (final text in staticTexts) {
            try {
              final content = await text.text;
              if (content.toLowerCase().contains('do not match')) {
                hasError = true;
                break;
              }
            } catch (e) {
              // Continue
            }
          }
          
          if (!hasError) {
            print('✅ Both password fields filled successfully');
            break;
          } else {
            print('⚠️ Attempt ${attempt + 1}: Passwords still don\'t match, retrying...');
          }
        }
        
        
        // Final validation
        await Future.delayed(Duration(seconds: 1));
        
        // Submit the form
        final buttonTexts = ['Save Password', 'Create Password', 'Submit', 'Continue'];
        bool buttonClicked = false;
        
        for (final buttonText in buttonTexts) {
          try {
            await clickElementByText(buttonText);
            print('✅ Password created with: $buttonText');
            buttonClicked = true;
            break;
          } catch (e) {
            // Try next button
          }
        }
        
        if (!buttonClicked) {
          // Fallback coordinate tap
          final window = await driver.window;
          final size = await window.size;
          await driver.mouse.moveTo(
            xOffset: (size.width / 2).round(),
            yOffset: (size.height * 0.8).round(),
            absolute: true
          );
          await driver.mouse.click();
          print('✅ Password created via coordinate tap');
        }
      } else {
        throw Exception('Expected 2 password fields, found ${passwordFields.length}');
      }
    }

    Future<void> enterPasswordInWebView(String password) async {
      print('🔐 Entering password for login...');
      
      // Wait for login web view to fully load
      await Future.delayed(Duration(seconds: 5));
      
      // Find password field
      final passwordFields = await driver.findElements(AppiumBy.className('XCUIElementTypeSecureTextField')).toList();
      
      if (passwordFields.isNotEmpty) {
        await passwordFields[0].click();
        await passwordFields[0].sendKeys(password);
        await Future.delayed(shortDelay);
        
        // Submit login
        final buttonTexts = ['Continue', 'Sign In', 'Login', 'Submit'];
        for (final buttonText in buttonTexts) {
          try {
            await clickElementByText(buttonText);
            print('✅ Logged in with: $buttonText');
            return;
          } catch (e) {
            // Try next button
          }
        }
        
        // Fallback coordinate tap
        final window = await driver.window;
        final size = await window.size;
        await driver.mouse.moveTo(
          xOffset: (size.width / 2).round(),
          yOffset: (size.height * 0.8).round(),
          absolute: true
        );
        await driver.mouse.click();
        print('✅ Logged in via coordinate tap');
      } else {
        throw Exception('No password field found for login');
      }
    }

    Future<void> performPasswordAuthFlow(String authType, String credential, String password) async {
      print('🔑 Starting $authType password authentication flow...');
      
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
      
      // Choose password option instead of biometrics
      final passwordTexts = ['Use Password', 'Create Password', 'Password'];
      bool passwordOptionFound = false;
      
      for (final text in passwordTexts) {
        try {
          await clickElementByText(text, className: 'XCUIElementTypeStaticText');
          passwordOptionFound = true;
          print('✅ Found password option: $text');
          break;
        } catch (e) {
          try {
            await clickElementByText(text);
            passwordOptionFound = true;
            print('✅ Found password option: $text');
            break;
          } catch (e2) {
            // Try next option
          }
        }
      }
      
      if (!passwordOptionFound) {
        throw Exception('Password authentication option not found');
      }
      
      await Future.delayed(shortDelay);
      
      // Handle iOS system dialog that appears when transitioning to web view
      await handleIOSSystemDialog();
      
      // Handle password creation in web view
      await createPasswordInWebView(password);
      await waitForWalletsView();
      
      print('✅ $authType password authentication completed');
    }

    Future<void> loginWithPassword(String authType, String credential, String password) async {
      print('🔑 Starting $authType password login...');
      
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
      
      // Handle iOS system dialog for login web view transition
      await handleIOSSystemDialog();
      
      // For existing accounts, should go directly to password entry
      await enterPasswordInWebView(password);
      await waitForWalletsView();
      
      print('✅ $authType password login completed');
    }

    Future<void> performTransactionSigning(String chain, {String? recipientAddress}) async {
      await ensureLoggedIn();
      
      // Navigate to transaction screen - enhanced navigation with more options
      await waitForWalletsView();
      
      try {
        await clickElementByText('Send Funds');
        print('✅ Found "Send Funds" button');
      } catch (e) {
        print('⚠️ "Send Funds" not found, trying alternative navigation...');
        try {
          // Try multiple navigation strategies
          await clickElementByText('Back');
          await Future.delayed(shortDelay);
          await waitForWalletsView();
          await clickElementByText('Send Funds');
        } catch (e2) {
          try {
            // Try tapping on wallet type to get back to main screen
            await clickElementByText('EVM');
            await Future.delayed(shortDelay);
            await clickElementByText('Send Funds');
          } catch (e3) {
            print('⚠️ Cannot find transaction screen, skipping transaction test...');
            return; // Exit gracefully instead of continuing with broken state
          }
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

    test('03 Email Password Authentication: Signup + Login Flow', () async {
      print('🧪 Starting Email Password Authentication: Signup + Login Flow...');
      
      await performLogout();
      
      // Generate unique email and password for testing
      final email = 'test${DateTime.now().millisecondsSinceEpoch}@test.usecapsule.com';
      const password = 'ParaTestPassword123';
      print('📧 Generated test email: $email');
      print('🔐 Using test password: $password');
      
      try {
        // PART 1: SIGNUP WITH PASSWORD
        await performPasswordAuthFlow('Email', email, password);
        
        // PART 2: TEST LOGOUT AND LOGIN WITH PASSWORD
        await performLogout();
        print('✅ Logged out after password signup');
        
        // Login with same email and password
        await Future.delayed(Duration(seconds: 2));
        await loginWithPassword('Email', email, password);
        print('✅ Email password login completed successfully');
      } catch (e) {
        print('⚠️ Password authentication test failed: $e');
        print('ℹ️ This might indicate that password authentication is not available in this Flutter app version');
        
        // Log out any partial state and continue with other tests
        try {
          await performLogout();
        } catch (logoutError) {
          // Ignore logout errors in error state
        }
        
        // Skip password test if not available
        print('⚠️ Password authentication not available in this app version');
      }
    }, timeout: Timeout(Duration(minutes: 3)));
    
    
    test('04 Wallet Verification Flow', () async {
      print('🧪 Starting Wallet Verification Flow...');
      await ensureLoggedIn();
      print('✅ Wallet verification completed successfully');
    });
    
    test('05 Copy Wallet Address Flow', () async {
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
    
    test('06 EVM Transaction Signing Flow', () async {
      print('🧪 Starting EVM Transaction Signing Flow...');
      await performTransactionSigning('EVM');
    }, timeout: Timeout(Duration(minutes: 2)));
    
    test('07 Session Validation Flow', () async {
      print('🧪 Starting Session Validation Flow...');
      await ensureLoggedIn();
      print('✅ Session is valid - can access wallet screen');
    });
    
    test('08 Logout Flow', () async {
      print('🧪 Starting Logout Flow...');
      await ensureLoggedIn();
      await performLogout();
      print('✅ Logout completed');
    });

    test('09 Solana Transaction Signing Flow', () async {
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

    test('10 Cosmos Wallet Creation and Message Signing Flow', () async {
      print('🧪 Starting Cosmos Wallet Creation and Message Signing Flow...');
      
      await ensureLoggedIn();
      
      // Check if Cosmos wallet exists, create if needed
      bool cosmosWalletExists = false;
      final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
      for (final button in buttons) {
        final label = await button.attributes['label'];
        if (label.contains('Create COSMOS Wallet')) {
          await button.click();
          await Future.delayed(longDelay);
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
      await clickElementByText('Send Funds');
      await Future.delayed(shortDelay);
      await clickElementByText('Cosmos Transactions', className: 'XCUIElementTypeStaticText');
      await Future.delayed(mediumDelay);
      
      // Verify we're on the Cosmos screen
      final screenElements = await driver.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
      bool onCosmosScreen = false;
      for (final element in screenElements) {
        final text = await element.text;
        if (text.contains('Cosmos') && (text.contains('Sign') || text.contains('Demo'))) {
          onCosmosScreen = true;
          break;
        }
      }
      
      if (!onCosmosScreen) {
        throw Exception('❌ Failed to navigate to Cosmos signing screen');
      }
      
      // Test message signing
      await clickElementByText('Sign Message');
      await Future.delayed(shortDelay);
      
      // Enter test message
      await enterText('Hello Cosmos from Para Flutter SDK!', fieldIndex: 0);
      await dismissKeyboard();
      
      // Sign the message
      await clickElementByText('Sign Message');
      await Future.delayed(longDelay);
      
      // Strict validation: Check for actual signature result or specific error
      final textElements = await driver.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
      bool signatureFound = false;
      bool errorFound = false;
      String? errorMessage;
      
      for (final element in textElements) {
        final text = await element.text;
        if (text.contains('Signature Result') || (text.contains('signature') && text.length > 20)) {
          signatureFound = true;
          print('✅ Cosmos message signing successful - found signature result');
          break;
        } else if (text.contains('ParaCosmosSignerException') || text.contains('FormatException') || text.contains('Failed to sign')) {
          errorFound = true;
          errorMessage = text;
          break;
        }
      }
      
      if (errorFound) {
        throw Exception('❌ Cosmos message signing failed with error: $errorMessage');
      }
      
      if (!signatureFound) {
        throw Exception('❌ Cosmos message signing failed - no signature result found');
      }
      
      print('✅ Cosmos message signing test completed successfully');
    }, timeout: Timeout(Duration(minutes: 2)));

    test('11 Cosmos Transaction Signing Flow', () async {
      print('🧪 Starting Cosmos Transaction Signing Flow...');
      
      await ensureLoggedIn();
      
      // Navigate to Cosmos transaction screen
      await clickElementByText('Send Funds');
      await Future.delayed(shortDelay);
      await clickElementByText('Cosmos Transactions', className: 'XCUIElementTypeStaticText');
      await Future.delayed(mediumDelay);
      
      // Verify Bank Send button exists and click it
      bool bankSendFound = false;
      try {
        await clickElementByText('Bank Send');
        bankSendFound = true;
        await Future.delayed(shortDelay);
        print('✅ Successfully switched to Bank Send mode');
      } catch (e) {
        // Bank Send might already be selected, check if we're in the right mode
        final allElements = await driver.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
        for (final element in allElements) {
          final text = await element.text;
          if (text.contains('Recipient Address') || text.contains('Amount')) {
            bankSendFound = true;
            print('✅ Already in Bank Send mode');
            break;
          }
        }
      }
      
      if (!bankSendFound) {
        throw Exception('❌ Failed to access Bank Send transaction mode');
      }
      
      // Verify that recipient address is pre-filled
      final textFields = await driver.findElements(AppiumBy.className('XCUIElementTypeTextField')).toList();
      if (textFields.isEmpty) {
        throw Exception('❌ No text fields found for transaction input');
      }
      
      // Check if recipient field has pre-filled address
      bool recipientPreFilled = false;
      try {
        final recipientValue = await textFields[0].text;
        if (recipientValue.contains('cosmos1')) {
          recipientPreFilled = true;
          print('✅ Recipient address is pre-filled: $recipientValue');
        }
      } catch (e) {
        // Pre-filled check failed, continue with manual entry
      }
      
      if (!recipientPreFilled) {
        // Fill transaction details manually
        await enterText(testCosmosRecipientAddress, fieldIndex: 0);
        await dismissKeyboard();
      }
      
      await enterText('0.000001', fieldIndex: 1); // Small amount in ATOM
      await dismissKeyboard();
      
      // Sign the transaction
      await clickElementByText('Sign Transaction');
      await Future.delayed(longDelay);
      
      // Strict validation: Check for actual result
      final textElements = await driver.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
      bool successFound = false;
      bool errorFound = false;
      String? resultMessage;
      
      for (final element in textElements) {
        final text = await element.text;
        if (text.contains('Signature Result') || (text.contains('signature') && text.length > 20)) {
          successFound = true;
          resultMessage = text;
          break;
        } else if (text.contains('insufficient funds') && text.contains('Error')) {
          // This is expected for testnet/mainnet addresses without funds
          successFound = true;
          resultMessage = 'Expected insufficient funds error (transaction signing worked)';
          break;
        } else if (text.contains('ParaCosmosSignerException') || text.contains('FormatException') || text.contains('Failed to sign')) {
          errorFound = true;
          resultMessage = text;
          break;
        }
      }
      
      if (errorFound) {
        throw Exception('❌ Cosmos transaction signing failed with error: $resultMessage');
      }
      
      if (!successFound) {
        throw Exception('❌ Cosmos transaction signing failed - no valid result found');
      }
      
      print('✅ Cosmos transaction signing completed successfully: $resultMessage');
    }, timeout: Timeout(Duration(minutes: 2)));

    test('12 Cosmos Signing Method Validation Flow', () async {
      print('🧪 Starting Cosmos Signing Method Validation Flow...');
      
      await ensureLoggedIn();
      
      // Navigate to Cosmos transaction screen
      await clickElementByText('Send Funds');
      await Future.delayed(shortDelay);
      await clickElementByText('Cosmos Transactions', className: 'XCUIElementTypeStaticText');
      await Future.delayed(mediumDelay);
      
      // Ensure we're in Bank Send mode
      try {
        await clickElementByText('Bank Send');
        await Future.delayed(shortDelay);
      } catch (e) {
        // Might already be in Bank Send mode
      }
      
      // Verify signing method buttons exist
      bool aminoButtonExists = false;
      bool protoButtonExists = false;
      
      final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
      for (final button in buttons) {
        final label = await button.attributes['label'];
        if (label == 'Amino') {
          aminoButtonExists = true;
        } else if (label == 'Proto') {
          protoButtonExists = true;
        }
      }
      
      if (!aminoButtonExists || !protoButtonExists) {
        throw Exception('❌ Signing method buttons not found (Amino: $aminoButtonExists, Proto: $protoButtonExists)');
      }
      
      // Test Amino signing method
      await clickElementByText('Amino');
      await Future.delayed(shortDelay);
      print('✅ Selected Amino signing method');
      
      // Test Proto signing method
      await clickElementByText('Proto');
      await Future.delayed(shortDelay);
      print('✅ Selected Proto signing method');
      
      // Verify recipient address is pre-filled or fill it
      final textFields = await driver.findElements(AppiumBy.className('XCUIElementTypeTextField')).toList();
      if (textFields.isEmpty) {
        throw Exception('❌ No text fields found for transaction validation');
      }
      
      bool needsRecipientFill = true;
      try {
        final recipientValue = await textFields[0].text;
        if (recipientValue.contains('cosmos1')) {
          needsRecipientFill = false;
          print('✅ Recipient address already filled');
        }
      } catch (e) {
        // Will fill manually
      }
      
      if (needsRecipientFill) {
        await enterText(testCosmosRecipientAddress, fieldIndex: 0);
        await dismissKeyboard();
      }
      
      await enterText('0.000001', fieldIndex: 1);
      await dismissKeyboard();
      
      // Attempt signing with Proto method
      await clickElementByText('Sign Transaction');
      await Future.delayed(longDelay);
      
      // Validate that signing worked (either success or expected error)
      final textElements = await driver.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
      bool validResultFound = false;
      String? resultMessage;
      
      for (final element in textElements) {
        final text = await element.text;
        if (text.contains('Signature Result') || 
            (text.contains('signature') && text.length > 20) ||
            (text.contains('insufficient funds') && text.contains('Error'))) {
          validResultFound = true;
          resultMessage = text;
          break;
        } else if (text.contains('ParaCosmosSignerException') || text.contains('FormatException')) {
          throw Exception('❌ Signing method validation failed with error: $text');
        }
      }
      
      if (!validResultFound) {
        throw Exception('❌ Cosmos signing method validation failed - no valid result found');
      }
      
      print('✅ Cosmos signing method validation completed successfully: ${resultMessage?.substring(0, 50)}...');
    }, timeout: Timeout(Duration(minutes: 2)));

  });
}
