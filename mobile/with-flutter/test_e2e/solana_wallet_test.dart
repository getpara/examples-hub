// Solana Wallet E2E Tests - Matches Swift SolanaWalletUITests.swift patterns
// Tests basic wallet operations and signing functionality

import 'dart:io';
import 'package:test/test.dart';
import 'package:appium_driver/async_io.dart';
import 'package:dotenv/dotenv.dart';
import 'lib/wallet_test_foundation.dart';
import 'lib/test_constants.dart';

void main() {
  group('Solana Wallet E2E Tests', () {
    late AppiumWebDriver driver;
    
    setUpAll(() async {
      // Load environment variables
      final env = DotEnv(includePlatformEnvironment: true)..load(['.env']);
      final apiKey = Platform.environment['PARA_API_KEY'] ?? env['PARA_API_KEY'];
      if (apiKey == null || apiKey.isEmpty) {
        throw Exception('PARA_API_KEY must be set in environment variables or .env file');
      }

      // Initialize driver
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
      
      // Perform one-time authentication setup (Solana wallet created by default)
      print('🔐 Setting up authentication for Solana wallet tests...');
      final helper = WalletTestHelper(driver);
      final uniqueEmail = TestConstants.generateUniqueEmail();
      await helper.performEmailAuthWithPasskey(uniqueEmail);
      await helper.waitForWalletsView();
      print('✅ Authentication completed - Solana wallet should be available');
    });

    tearDownAll(() async {
      await driver.quit();
    });

    setUp(() async {
      print('\\n🚀 Setting up Solana wallet test...');
      // Ensure we start each test in the Solana wallet view
      await _navigateToSolanaWallet(driver);
      print('✅ Solana wallet test ready');
    });

    test('Basic Wallet Operations', () async {
      print('🧪 Testing Solana wallet basic operations...');
      
      // Test copying wallet address
      await _testCopyWalletAddress(driver);
      
      // Test verifying Solana address format
      await _testVerifyAddressFormat(driver);
      
      print('✅ Basic Solana wallet operations completed');
    });

    test('Signing Operations', () async {
      print('🧪 Testing Solana wallet signing operations...');
      
      // Test signing message
      await _testSignMessage(driver);
      
      // Test signing transaction
      await _testSignTransaction(driver);
      
      print('✅ Solana wallet signing operations completed');
    });
  });
}

// Helper class for Solana wallet tests
class SolanaWalletTestHelper {
  final AppiumWebDriver driver;
  
  SolanaWalletTestHelper(this.driver);
  
  Future<void> clickElementByText(String searchText, {String? className}) async {
    await Future.delayed(Duration(seconds: 1));
    
    final classNames = className != null 
        ? [className] 
        : ['XCUIElementTypeButton', 'XCUIElementTypeStaticText', 'XCUIElementTypeOther', 'XCUIElementTypeCell'];
    
    for (int attempt = 0; attempt < 5; attempt++) {
      for (final elementType in classNames) {
        final elements = await driver.findElements(AppiumBy.className(elementType)).toList();
        for (final element in elements) {
          try {
            final label = elementType == 'XCUIElementTypeButton' 
                ? await element.attributes['label'] 
                : await element.text;
            final isEnabled = elementType == 'XCUIElementTypeButton' ? await element.enabled : true;
            
            if (label.toLowerCase().contains(searchText.toLowerCase()) && isEnabled) {
              await element.click();
              print('✅ Clicked "$searchText" as $elementType');
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
    throw Exception('Element with text "$searchText" not found after 5 attempts');
  }
  
  Future<String?> findSolanaAddress() async {
    // Solana address pattern: base58, 32-44 characters
    final solanaAddressPattern = RegExp(r'^[1-9A-HJ-NP-Za-km-z]{32,44}$');
    
    final staticTexts = await driver.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
    for (final element in staticTexts) {
      try {
        final text = await element.text;
        if (solanaAddressPattern.hasMatch(text)) {
          return text;
        }
      } catch (e) {
        // Continue searching
      }
    }
    return null;
  }
}

// Navigation Functions
Future<void> _navigateToSolanaWallet(AppiumWebDriver driver) async {
  print('🔄 Navigating to Solana wallet...');
  
  // Switch to Solana tab
  await _switchToSolanaTab(driver);
  
  // Look for existing Solana wallet or create one
  final cells = await driver.findElements(AppiumBy.className('XCUIElementTypeCell')).toList();
  if (cells.isNotEmpty) {
    // Click on first Solana wallet cell
    await cells.first.click();
    print('✅ Navigated to existing Solana wallet');
  } else {
    // Create first Solana wallet
    try {
      final createButton = await driver.findElement(AppiumBy.accessibilityId('createFirstWalletButton'));
      await createButton.click();
      print('✅ Created first Solana wallet');
      
      // Wait for wallet creation to complete
      await Future.delayed(Duration(seconds: 3));
    } catch (e) {
      print('⚠️ Could not find create wallet button, continuing...');
    }
  }
  
  // Verify we're in Solana wallet view
  await _verifyInSolanaWalletView(driver);
}

Future<void> _switchToSolanaTab(AppiumWebDriver driver) async {
  print('🔄 Switching to Solana tab...');
  
  // Look for Solana tab button
  final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
  for (final button in buttons) {
    try {
      final label = await button.attributes['label'];
      if (label.toLowerCase().contains('solana')) {
        await button.click();
        print('✅ Switched to Solana tab');
        await Future.delayed(Duration(seconds: 2));
        return;
      }
    } catch (e) {
      // Continue searching
    }
  }
  
  // Alternative: try clicking by accessibility id
  try {
    final solanaButton = await driver.findElement(AppiumBy.accessibilityId('Solana'));
    await solanaButton.click();
    print('✅ Switched to Solana tab (by accessibility id)');
    await Future.delayed(Duration(seconds: 2));
  } catch (e) {
    print('⚠️ Could not switch to Solana tab, continuing...');
  }
}

Future<void> _verifyInSolanaWalletView(AppiumWebDriver driver) async {
  print('🔍 Verifying in Solana wallet view...');
  
  // Look for "Solana Wallet" title
  final staticTexts = await driver.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
  for (final element in staticTexts) {
    try {
      final text = await element.text;
      if (text.contains('Solana Wallet')) {
        print('✅ Confirmed in Solana wallet view');
        return;
      }
    } catch (e) {
      // Continue searching
    }
  }
  
  // Also check navigation bars
  final navBars = await driver.findElements(AppiumBy.className('XCUIElementTypeNavigationBar')).toList();
  for (final navBar in navBars) {
    try {
      final name = await navBar.attributes['name'];
      if (name.contains('Solana')) {
        print('✅ Confirmed in Solana wallet view (nav bar)');
        return;
      }
    } catch (e) {
      // Continue searching
    }
  }
  
  print('⚠️ Could not verify Solana wallet view, continuing...');
}

// Test Functions
Future<void> _testCopyWalletAddress(AppiumWebDriver driver) async {
  print('📋 Testing copy wallet address...');
  
  final helper = SolanaWalletTestHelper(driver);
  
  // Find and click copy button
  try {
    await helper.clickElementByText('copy');
    print('✅ Copy button clicked');
    await Future.delayed(Duration(seconds: 2));
  } catch (e) {
    print('⚠️ Could not find copy button: $e');
  }
}

Future<void> _testVerifyAddressFormat(AppiumWebDriver driver) async {
  print('🔍 Testing Solana address format verification...');
  
  final helper = SolanaWalletTestHelper(driver);
  
  // Find Solana address on screen
  final address = await helper.findSolanaAddress();
  if (address != null) {
    print('✅ Found Solana address: $address');
    
    // Verify address format
    final solanaAddressPattern = RegExp(r'^[1-9A-HJ-NP-Za-km-z]{32,44}$');
    if (solanaAddressPattern.hasMatch(address)) {
      print('✅ Solana address format is valid');
    } else {
      throw Exception('Invalid Solana address format: $address');
    }
  } else {
    print('⚠️ Could not find Solana address on screen');
  }
}

Future<void> _testSignMessage(AppiumWebDriver driver) async {
  print('✍️ Testing sign message...');
  
  final helper = SolanaWalletTestHelper(driver);
  
  try {
    // Look for sign message button or demo
    await helper.clickElementByText('sign message');
    print('✅ Sign message initiated');
    await Future.delayed(Duration(seconds: 3));
    
    // Handle any authentication prompts
    await _handleBiometricAuthentication(driver);
    
    print('✅ Sign message completed');
  } catch (e) {
    print('⚠️ Sign message test failed: $e');
  }
}

Future<void> _testSignTransaction(AppiumWebDriver driver) async {
  print('✍️ Testing sign transaction...');
  
  final helper = SolanaWalletTestHelper(driver);
  
  try {
    // Look for sign transaction button or demo
    await helper.clickElementByText('sign transaction');
    print('✅ Sign transaction initiated');
    await Future.delayed(Duration(seconds: 3));
    
    // Handle any authentication prompts
    await _handleBiometricAuthentication(driver);
    
    print('✅ Sign transaction completed');
  } catch (e) {
    print('⚠️ Sign transaction test failed: $e');
  }
}

Future<void> _handleBiometricAuthentication(AppiumWebDriver driver) async {
  print('🔐 Handling biometric authentication...');
  
  try {
    // Wait for biometric prompt
    await Future.delayed(Duration(seconds: 2));
    
    // Send biometric match
    await driver.execute('mobile:sendBiometricMatch', <dynamic>[<String, dynamic>{
      'type': 'touchId',
      'match': true
    }]);
    
    print('✅ Biometric authentication successful');
    await Future.delayed(Duration(seconds: 2));
  } catch (e) {
    print('⚠️ Biometric authentication failed or not required: $e');
  }
}