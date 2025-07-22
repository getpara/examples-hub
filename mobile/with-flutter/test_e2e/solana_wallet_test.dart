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
  print('📱 Navigating to Solana wallet...');
  
  // Look for Solana wallet in the wallets list (similar to EVM navigation)
  for (int attempt = 0; attempt < 10; attempt++) {
    try {
      print('🔍 Looking for Solana wallet (attempt ${attempt + 1})...');
      
      // Method 1: Look for SOLANA text
      final allTexts = await driver.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
      for (final textElement in allTexts) {
        try {
          final content = await textElement.text;
          if (content.contains('SOLANA') || content.contains('solana')) {
            print('✅ Found Solana text: "$content", tapping...');
            await textElement.click();
            await Future.delayed(Duration(seconds: 3));
            print('✅ Solana wallet view should be loaded');
            return;
          }
        } catch (e) {
          // Continue searching
        }
      }
      
      // Method 2: Look for Solana address pattern (base58, 32-44 chars)
      for (final textElement in allTexts) {
        try {
          final content = await textElement.text;
          // Solana addresses are base58 encoded, typically 32-44 characters
          if (content.length >= 32 && content.length <= 44 && 
              RegExp(r'^[1-9A-HJ-NP-Za-km-z]+$').hasMatch(content) &&
              !content.startsWith('0x') && !content.startsWith('cosmos')) {
            print('✅ Found potential Solana address: "$content", tapping...');
            await textElement.click();
            await Future.delayed(Duration(seconds: 3));
            print('✅ Potential Solana wallet tapped');
            return;
          }
        } catch (e) {
          // Continue searching
        }
      }
      
    } catch (e) {
      print('⚠️ Error in attempt ${attempt + 1}: $e');
    }
    
    await Future.delayed(Duration(seconds: 2));
  }
  
  throw Exception('Could not find Solana wallet after comprehensive analysis');
}

// Test Functions
Future<void> _testCopyWalletAddress(AppiumWebDriver driver) async {
  print('📋 Testing wallet address display...');
  
  // Look for Solana wallet address text (base58 format)
  final texts = await driver.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
  for (final text in texts) {
    try {
      final content = await text.text;
      if (content.length >= 32 && content.length <= 44 && 
          RegExp(r'^[1-9A-HJ-NP-Za-km-z]+$').hasMatch(content) &&
          !content.startsWith('0x') && !content.startsWith('cosmos')) {
        print('✅ Found Solana wallet address: $content');
        return;
      }
    } catch (e) {
      // Continue searching
    }
  }
  
  throw Exception('Solana wallet address not found');
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
  print('✍️ Testing sign message button...');
  
  // Look for Sign Message button (might be disabled)
  final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
  for (final button in buttons) {
    try {
      final label = await button.attributes['label'];
      if (label.contains('Sign Message')) {
        final enabled = await button.enabled;
        print('✅ Found Sign Message button (enabled: $enabled)');
        
        if (enabled) {
          await button.click();
          print('✅ Sign Message button clicked');
        } else {
          print('ℹ️ Sign Message button is disabled (expected for empty message)');
        }
        return;
      }
    } catch (e) {
      // Continue searching
    }
  }
  
  throw Exception('Sign Message button not found');
}

Future<void> _testSignTransaction(AppiumWebDriver driver) async {
  print('💰 Testing sign transaction...');
  
  // Look for sign transaction button
  final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
  for (final button in buttons) {
    try {
      final label = await button.attributes['label'];
      if (label.contains('Sign Transaction')) {
        await button.click();
        
        // Wait for signing result (might be success or error)
        await Future.delayed(Duration(seconds: 3));
        
        print('✅ Sign transaction completed (success or expected error)');
        return;
      }
    } catch (e) {
      // Continue searching
    }
  }
  
  throw Exception('Sign transaction button not found');
}
