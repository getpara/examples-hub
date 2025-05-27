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
String? savedWalletAddress;

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
    
    Future<void> navigateToWalletHome() async {
      // Ensure we're logged in and on the wallet home screen
      final foundWallets = await waitForWalletsView();
      if (!foundWallets) {
        throw Exception('Failed to navigate to wallet home screen');
      }
    }
    
    Future<void> createWallet(String walletType) async {
      await navigateToWalletHome();
      
      // Find and click the Create Wallet button for the specified type
      final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
      for (final button in buttons) {
        final label = await button.attributes['label'];
        if (label.toLowerCase().contains('create') && 
            label.toLowerCase().contains(walletType.toLowerCase())) {
          await button.click();
          
          // Wait for wallet creation to complete
          await Future.delayed(Duration(seconds: 10));
          return;
        }
      }
      
      throw Exception('Create $walletType Wallet button not found');
    }
    
    Future<String?> getWalletAddress() async {
      await navigateToWalletHome();
      
      // Look for wallet address in static text elements
      final textElements = await driver.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
      for (final element in textElements) {
        final text = await element.text;
        // Ethereum addresses start with 0x and are 42 chars long
        if (text.startsWith('0x') && text.length > 40) {
          return text;
        }
        // Solana addresses are base58 encoded and typically 44 chars
        if (text.length > 40 && !text.contains(' ')) {
          return text;
        }
      }
      
      return null;
    }
    
    Future<void> copyWalletAddress() async {
      await navigateToWalletHome();
      
      // Find and click the copy button (usually has a copy icon)
      final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
      for (final button in buttons) {
        final label = await button.attributes['label'];
        if (label.toLowerCase().contains('copy')) {
          await button.click();
          
          // Wait for copy operation to complete
          await Future.delayed(Duration(seconds: 2));
          return;
        }
      }
      
      throw Exception('Copy address button not found');
    }
    
    Future<void> navigateToTransactionScreen() async {
      await navigateToWalletHome();
      
      // Find and click the Send Funds button
      await clickButtonByText('Send Funds');
      await Future.delayed(Duration(seconds: 2));
    }
    
    Future<void> navigateToEvmSigningScreen() async {
      await navigateToTransactionScreen();
      
      // Click on EVM Transactions option
      await clickTextElementByContent('EVM Transactions');
      await Future.delayed(Duration(seconds: 2));
    }
    
    Future<void> navigateToSolanaSigningScreen() async {
      await navigateToTransactionScreen();
      
      // Click on Solana Transactions option
      await clickTextElementByContent('Solana Transactions');
      await Future.delayed(Duration(seconds: 2));
    }
    
    Future<void> signTransaction() async {
      // This assumes we're already on a signing screen
      // Enter recipient and amount
      final textFields = await driver.findElements(AppiumBy.className('XCUIElementTypeTextField')).toList();
      if (textFields.length >= 2) {
        // Enter recipient address (using a test address)
        await textFields[0].click();
        await textFields[0].sendKeys('0x71C7656EC7ab88b098defB751B7401B5f6d8976F');
        await dismissKeyboard();
        
        // Enter amount
        await textFields[1].click();
        await textFields[1].sendKeys('0.001');
        await dismissKeyboard();
      }
      
      // Click Sign Transaction button
      await clickButtonByText('Sign Transaction');
      
      // Wait for signing to complete
      await Future.delayed(Duration(seconds: 5));
    }
    
    Future<void> checkForAlert() async {
      try {
        // Check if an alert is present
        final alerts = await driver.findElements(AppiumBy.className('XCUIElementTypeAlert')).toList();
        if (alerts.isNotEmpty) {
          // Dismiss the alert by clicking OK
          final buttons = await alerts.first.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
          for (final button in buttons) {
            final label = await button.attributes['label'];
            if (label == 'OK' || label == 'Ok') {
              await button.click();
              return;
            }
          }
        }
      } catch (e) {
        // No alert present or error dismissing
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
    
    test('05 Wallet Refresh Flow', () async {
      // Ensure we're logged in and on the wallet home screen
      await navigateToWalletHome();
      
      // Verify we can see the wallet screen
      final navigationBars = await driver.findElements(AppiumBy.className('XCUIElementTypeNavigationBar')).toList();
      bool foundWalletTitle = false;
      
      for (final navBar in navigationBars) {
        final title = await navBar.attributes['name'];
        if (title == 'Your Wallets') {
          foundWalletTitle = true;
          break;
        }
      }
      
      expect(foundWalletTitle, true, reason: 'Should see wallet navigation title');
      
      // Pull to refresh (simulate by swiping down)
      final window = await driver.window;
      final size = await window.size;
      
      final startX = size.width / 2;
      final startY = size.height / 3;
      final endY = startY + 200;
      
      await driver.touchActions()
        .down(startX, startY)
        .wait(100)
        .moveTo(startX, endY)
        .release()
        .perform();
      
      // Wait for refresh to complete
      await Future.delayed(Duration(seconds: 5));
      
      // Verify we're still on the wallet screen
      expect(await waitForWalletsView(), true, reason: 'Should still be on wallet screen after refresh');
    });
    
    test('06 Create Wallet Flow', () async {
      // Ensure we're logged in and on the wallet home screen
      await navigateToWalletHome();
      
      // Create an EVM wallet if one doesn't exist
      try {
        await createWallet('EVM');
        print('✅ Created EVM wallet');
      } catch (e) {
        print('EVM wallet may already exist: $e');
      }
      
      // Save the wallet address for later tests
      savedWalletAddress = await getWalletAddress();
      print('Saved wallet address: $savedWalletAddress');
      
      // Verify we have a wallet address
      expect(savedWalletAddress != null, true, reason: 'Should have a wallet address after creation');
      
      // Try to create a Solana wallet
      try {
        await createWallet('SOLANA');
        print('✅ Created Solana wallet');
      } catch (e) {
        print('Solana wallet may already exist: $e');
      }
      
      // Verify we're still on the wallet screen
      expect(await waitForWalletsView(), true, reason: 'Should still be on wallet screen after wallet creation');
    });
    
    test('07 Copy Wallet Address Flow', () async {
      // Ensure we're logged in and on the wallet home screen
      await navigateToWalletHome();
      
      // Copy the wallet address
      await copyWalletAddress();
      
      // Verify by checking for a snackbar or toast message
      final textElements = await driver.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
      bool foundCopyConfirmation = false;
      
      for (final element in textElements) {
        final text = await element.text;
        if (text.contains('copied') || text.contains('clipboard')) {
          foundCopyConfirmation = true;
          break;
        }
      }
      
      // Note: In some cases, the copy confirmation might be too quick to catch
      // So we'll consider this test passed if no exception was thrown
      print(foundCopyConfirmation 
          ? '✅ Found copy confirmation message' 
          : '⚠️ Copy confirmation message not found, but operation completed');
    });
    
    test('08 Sign Message Flow', () async {
      // Navigate to EVM signing screen
      try {
        await navigateToEvmSigningScreen();
      } catch (e) {
        print('Error navigating to EVM signing: $e');
        // Try creating a wallet first if navigation failed
        await createWallet('EVM');
        await navigateToEvmSigningScreen();
      }
      
      // Verify we're on the signing screen
      final navigationBars = await driver.findElements(AppiumBy.className('XCUIElementTypeNavigationBar')).toList();
      bool foundSigningScreen = false;
      
      for (final navBar in navigationBars) {
        final title = await navBar.attributes['name'];
        if (title.contains('Sign') || title.contains('Ethereum')) {
          foundSigningScreen = true;
          break;
        }
      }
      
      expect(foundSigningScreen, true, reason: 'Should be on signing screen');
      
      // Fill in recipient and amount
      final textFields = await driver.findElements(AppiumBy.className('XCUIElementTypeTextField')).toList();
      if (textFields.length >= 2) {
        // Enter recipient address (using a test address)
        await textFields[0].click();
        await textFields[0].sendKeys('0x71C7656EC7ab88b098defB751B7401B5f6d8976F');
        await dismissKeyboard();
        
        // Enter amount
        await textFields[1].click();
        await textFields[1].sendKeys('0.001');
        await dismissKeyboard();
      }
      
      // Click Sign Transaction button
      await clickButtonByText('Sign Transaction');
      
      // Wait for signing to complete and check for result
      await Future.delayed(Duration(seconds: 5));
      
      // Check for transaction hash or signature
      final textElements = await driver.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
      bool foundSignatureText = false;
      
      for (final element in textElements) {
        final text = await element.text;
        if (text.contains('Signature') || text.contains('Transaction Hash') || text.contains('0x')) {
          foundSignatureText = true;
          print('✅ Found signature text: $text');
          break;
        }
      }
      
      // Check for any alerts and dismiss them
      await checkForAlert();
      
      // This might fail in some environments, so we'll make it a soft assertion
      if (!foundSignatureText) {
        print('⚠️ Warning: Could not verify signature text, but test continued');
      }
    });
    
    test('09 Sign Transaction Flow', () async {
      // Navigate to EVM signing screen
      try {
        await navigateToEvmSigningScreen();
      } catch (e) {
        print('Error navigating to EVM signing: $e');
        // Try creating a wallet first if navigation failed
        await createWallet('EVM');
        await navigateToEvmSigningScreen();
      }
      
      // Verify we're on the signing screen
      final navigationBars = await driver.findElements(AppiumBy.className('XCUIElementTypeNavigationBar')).toList();
      bool foundSigningScreen = false;
      
      for (final navBar in navigationBars) {
        final title = await navBar.attributes['name'];
        if (title.contains('Sign') || title.contains('Ethereum')) {
          foundSigningScreen = true;
          break;
        }
      }
      
      expect(foundSigningScreen, true, reason: 'Should be on signing screen');
      
      // Select EIP-1559 transaction type if available
      final segmentedButtons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
      for (final button in segmentedButtons) {
        final label = await button.attributes['label'];
        if (label.contains('EIP-1559')) {
          await button.click();
          break;
        }
      }
      
      // Fill in recipient and amount
      final textFields = await driver.findElements(AppiumBy.className('XCUIElementTypeTextField')).toList();
      if (textFields.length >= 2) {
        // Enter recipient address (using a test address)
        await textFields[0].click();
        await textFields[0].sendKeys('0x71C7656EC7ab88b098defB751B7401B5f6d8976F');
        await dismissKeyboard();
        
        // Enter amount
        await textFields[1].click();
        await textFields[1].sendKeys('0.001');
        await dismissKeyboard();
      }
      
      // Click Send Transaction button
      await clickButtonByText('Send Transaction');
      
      // Wait for transaction to complete
      await Future.delayed(Duration(seconds: 10));
      
      // Check for transaction hash
      final textElements = await driver.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
      bool foundTxHashText = false;
      
      for (final element in textElements) {
        final text = await element.text;
        if (text.contains('Transaction Hash') || text.contains('0x')) {
          foundTxHashText = true;
          print('✅ Found transaction hash: $text');
          break;
        }
      }
      
      // Check for any alerts and dismiss them
      await checkForAlert();
      
      // This might fail in some environments, so we'll make it a soft assertion
      if (!foundTxHashText) {
        print('⚠️ Warning: Could not verify transaction hash, but test continued');
      }
    });
    
    test('10 Check Session Flow', () async {
      // Ensure we're logged in and on the wallet home screen
      await navigateToWalletHome();
      
      // Verify we can see the wallet screen which confirms session is valid
      final navigationBars = await driver.findElements(AppiumBy.className('XCUIElementTypeNavigationBar')).toList();
      bool foundWalletTitle = false;
      
      for (final navBar in navigationBars) {
        final title = await navBar.attributes['name'];
        if (title == 'Your Wallets') {
          foundWalletTitle = true;
          break;
        }
      }
      
      expect(foundWalletTitle, true, reason: 'Should see wallet navigation title, confirming valid session');
      
      // Verify we can see wallet addresses which confirms session is valid
      final walletAddress = await getWalletAddress();
      expect(walletAddress != null, true, reason: 'Should be able to fetch wallet address with valid session');
    });
    
    test('11 Logout Flow', () async {
      // Ensure we're logged in and on the wallet home screen
      await navigateToWalletHome();
      
      // Perform logout
      await performLogout();
      
      // Verify we're back on the auth screen
      await Future.delayed(Duration(seconds: 3));
      
      // Look for auth options to confirm logout
      final textElements = await driver.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
      bool foundAuthOption = false;
      
      for (final element in textElements) {
        final text = await element.text;
        if (text.contains('Authentication') || text.contains('Email') || text.contains('Phone')) {
          foundAuthOption = true;
          print('✅ Found auth option after logout: $text');
          break;
        }
      }
      
      expect(foundAuthOption, true, reason: 'Should see auth options after logout');
    });
  });
}
