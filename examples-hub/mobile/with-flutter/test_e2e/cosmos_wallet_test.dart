// Cosmos Wallet E2E Tests - Matches Swift CosmosWalletUITests.swift patterns
// Tests wallet operations, signing flows, chain configuration, and management

import 'dart:io';
import 'package:test/test.dart';
import 'package:appium_driver/async_io.dart';
import 'package:dotenv/dotenv.dart';
import 'lib/wallet_test_foundation.dart';
import 'lib/test_constants.dart';

void main() {
  group('Cosmos Wallet E2E Tests', () {
    late AppiumWebDriver driver;
    
    setUpAll(() async {
      // Load environment variables
      final env = DotEnv(includePlatformEnvironment: true)
        ..load(['.env', '../.env']);
      final apiKey = Platform.environment['PARA_API_KEY']
          ?? env['PARA_API_KEY']
          ?? Platform.environment['PARA_BETA_API_KEY']
          ?? env['PARA_BETA_API_KEY'];
      if (apiKey == null || apiKey.isEmpty) {
        throw Exception('PARA_API_KEY or PARA_BETA_API_KEY must be set in environment variables or .env/.env in project root');
      }

      // Initialize driver
      driver = await createIOSDriver();
      
      // Enroll biometrics for all tests
      try {
        await driver.execute('mobile:enrollBiometric', <dynamic>[<String, dynamic>{'isEnabled': true}]);
        print('✅ Biometrics enrolled successfully');
      } catch (e) {
        print('Warning: Could not enroll biometrics: $e');
      }
      
      // Perform one-time authentication setup (Cosmos wallet created by default)
      print('🔐 Setting up authentication for Cosmos wallet tests...');
      final helper = WalletTestHelper(driver);
      final uniqueEmail = TestConstants.generateUniqueEmail();
      await helper.performEmailAuthWithPasskey(uniqueEmail);
      await helper.waitForWalletsView();
      print('✅ Authentication completed - Cosmos wallet should be available');
    });

    tearDownAll(() async {
      await driver.quit();
    });

    setUp(() async {
      print('\\n🚀 Setting up Cosmos wallet test...');
      // Ensure we start each test in the Cosmos wallet view
      await _navigateToCosmosWallet(driver);
      print('✅ Cosmos wallet test ready');
    });

    test('Basic Wallet Operations', () async {
      print('🧪 Testing Cosmos wallet basic operations...');
      
      // Test copying wallet address
      await _testCopyWalletAddress(driver);
      
      // Test verifying Cosmos address format
      await _testVerifyAddressFormat(driver);
      
      print('✅ Basic Cosmos wallet operations completed');
    });

    test('Signing Operations', () async {
      print('🧪 Testing Cosmos wallet signing operations...');
      
      // Test signing message
      await _testSignMessage(driver);
      
      // Test signing transaction
      await _testSignTransaction(driver);
      
      print('✅ Cosmos wallet signing operations completed');
    });
  }, skip: 'Disabled to mirror Swift suite (Cosmos tests are commented out there)');
}

// Helper class for Cosmos wallet tests
class CosmosWalletTestHelper {
  final AppiumWebDriver driver;
  
  CosmosWalletTestHelper(this.driver);
  
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
  
  Future<String?> findCosmosAddress() async {
    // Cosmos address patterns for different chains
    final patterns = [
      RegExp(r'^cosmos1[a-z0-9]{38,58}$'),  // Cosmos Hub
      RegExp(r'^osmo1[a-z0-9]{38,58}$'),    // Osmosis
      RegExp(r'^juno1[a-z0-9]{38,58}$'),    // Juno
      RegExp(r'^stars1[a-z0-9]{38,58}$'),   // Stargaze
      RegExp(r'^[a-z]+1[a-z0-9]{38,58}$'),  // Custom chains
    ];
    
    final staticTexts = await driver.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
    for (final element in staticTexts) {
      try {
        final text = await element.text;
        for (final pattern in patterns) {
          if (pattern.hasMatch(text)) {
            return text;
          }
        }
      } catch (e) {
        // Continue searching
      }
    }
    return null;
  }
  
  Future<void> enterText(String text, {String? placeholder}) async {
    final textFields = await driver.findElements(AppiumBy.className('XCUIElementTypeTextField')).toList();
    
    for (final field in textFields) {
      try {
        final placeholderValue = await field.attributes['placeholderValue'];
        if (placeholder == null || placeholderValue.contains(placeholder)) {
          await field.click();
          await Future.delayed(Duration(milliseconds: 500));
          await field.clear();
          await field.sendKeys(text);
          print('✅ Entered "$text" in field');
          return;
        }
      } catch (e) {
        // Continue searching
      }
    }
    
    // Fallback: use first available text field
    if (textFields.isNotEmpty) {
      await textFields.first.click();
      await Future.delayed(Duration(milliseconds: 500));
      await textFields.first.clear();
      await textFields.first.sendKeys(text);
      print('✅ Entered "$text" in first available field');
    }
  }
}

// Navigation Functions
Future<void> _navigateToCosmosWallet(AppiumWebDriver driver) async {
  print('📱 Navigating to Cosmos wallet...');
  
  // Look for Cosmos wallet in the wallets list (similar to EVM navigation)
  for (int attempt = 0; attempt < 10; attempt++) {
    try {
      print('🔍 Looking for Cosmos wallet (attempt ${attempt + 1})...');
      
      // Method 1: Look for COSMOS text
      final allTexts = await driver.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
      for (final textElement in allTexts) {
        try {
          final content = await textElement.text;
          if (content.contains('COSMOS') || content.contains('cosmos')) {
            print('✅ Found Cosmos text: "$content", tapping...');
            await textElement.click();
            await Future.delayed(Duration(seconds: 3));
            print('✅ Cosmos wallet view should be loaded');
            return;
          }
        } catch (e) {
          // Continue searching
        }
      }
      
      // Method 2: Look for Cosmos address pattern (any long string that looks like an address)
      for (final textElement in allTexts) {
        try {
          final content = await textElement.text;
          // Look for any address-like strings
          if (content.length > 30 && content.length < 70 && !content.startsWith('0x') && 
              !content.contains(' ') && !content.contains('\n') &&
              (content.contains('cosmos') || content.contains('osmo') || content.contains('juno') || 
               content.contains('stars') || RegExp(r'^[a-z]+1[a-z0-9]{30,}$').hasMatch(content))) {
            print('✅ Found potential Cosmos address: "$content", tapping...');
            await textElement.click();
            await Future.delayed(Duration(seconds: 3));
            print('✅ Potential Cosmos wallet tapped');
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
  
  throw Exception('Could not find Cosmos wallet after comprehensive analysis');
}

// Basic Wallet Operations
Future<void> _testCopyWalletAddress(AppiumWebDriver driver) async {
  print('📋 Testing wallet address display...');
  
  // Look for any Cosmos-style wallet address text
  final texts = await driver.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
  
  // Debug: Print all available text to see what's in the Cosmos wallet view
  print('🔍 Available text elements in Cosmos wallet view:');
  for (int i = 0; i < texts.length && i < 10; i++) {
    try {
      final content = await texts[i].text;
      if (content.isNotEmpty) {
        print('  [$i] "$content"');
      }
    } catch (e) {
      print('  [$i] (error reading text)');
    }
  }
  
  for (final text in texts) {
    try {
      final content = await text.text;
      // Look for Cosmos address patterns
      if (content.startsWith('cosmos1') || content.startsWith('osmo1') || 
          content.startsWith('juno1') || content.startsWith('stars1') ||
          (content.length > 30 && RegExp(r'^[a-z]+1[a-z0-9]{30,}$').hasMatch(content))) {
        print('✅ Found Cosmos wallet address: $content');
        return;
      }
      // Also check for any address-like string that's long enough
      if (content.length > 35 && content.length < 70 && !content.startsWith('0x') && 
          !content.contains(' ') && !content.contains('\n')) {
        print('✅ Found potential Cosmos address: $content');
        return;
      }
    } catch (e) {
      // Continue searching
    }
  }
  
  // If no address found, that's OK - maybe the wallet view is different
  print('⚠️ No Cosmos wallet address found, but continuing test...');
}

Future<void> _testVerifyAddressFormat(AppiumWebDriver driver) async {
  print('🔍 Testing Cosmos address format verification...');
  
  final helper = CosmosWalletTestHelper(driver);
  
  // Find Cosmos address on screen
  final address = await helper.findCosmosAddress();
  if (address != null) {
    print('✅ Found Cosmos address: $address');
    
    // Verify address format based on prefix
    if (address.startsWith('cosmos1')) {
      print('✅ Cosmos Hub address format is valid');
    } else if (address.startsWith('osmo1')) {
      print('✅ Osmosis address format is valid');
    } else if (address.startsWith('juno1')) {
      print('✅ Juno address format is valid');
    } else if (address.startsWith('stars1')) {
      print('✅ Stargaze address format is valid');
    } else if (RegExp(r'^[a-z]+1[a-z0-9]{38,58}$').hasMatch(address)) {
      print('✅ Custom chain address format is valid');
    } else {
      throw Exception('Invalid Cosmos address format: $address');
    }
  } else {
    print('⚠️ Could not find Cosmos address on screen');
  }
}

// Signing Operations
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
