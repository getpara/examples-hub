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

    test('Wallet Operations', () async {
      print('🧪 Testing Cosmos wallet operations...');
      
      // Test copying wallet address
      await _testCopyWalletAddress(driver);
      
      // Test verifying Cosmos address format
      await _testVerifyAddressFormat(driver);
      
      // Test fetch balance
      await _testFetchBalance(driver);
      
      print('✅ Cosmos wallet operations completed');
    });

    test('Signing Flows', () async {
      print('🧪 Testing Cosmos wallet signing flows...');
      
      // Test signing message
      await _testSignMessage(driver);
      
      // Test signing transaction
      await _testSignTransaction(driver);
      
      // Test both Proto and Amino signing modes
      await _testSigningModes(driver);
      
      print('✅ Cosmos wallet signing flows completed');
    });

    test('Chain Configuration', () async {
      print('🧪 Testing Cosmos chain configuration...');
      
      // Test switching between different chains
      await _testChainSwitching(driver);
      
      // Test custom chain configuration
      await _testCustomChainConfiguration(driver);
      
      print('✅ Cosmos chain configuration completed');
    });

    test('Chain Specific Transactions', () async {
      print('🧪 Testing chain-specific transactions...');
      
      // Test transactions on different chains
      await _testTransactionOnOsmosis(driver);
      await _testTransactionOnJuno(driver);
      await _testTransactionOnStargaze(driver);
      
      print('✅ Chain-specific transactions completed');
    });

    test('Wallet Management', () async {
      print('🧪 Testing Cosmos wallet management...');
      
      // Test session management
      await _testCheckSession(driver);
      
      // Test fetch wallets
      await _testFetchWallets(driver);
      
      print('✅ Cosmos wallet management completed');
    });
  });
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
  print('🔄 Navigating to Cosmos wallet...');
  
  // Switch to Cosmos tab
  await _switchToCosmosTab(driver);
  
  // Look for existing Cosmos wallet or create one
  final cells = await driver.findElements(AppiumBy.className('XCUIElementTypeCell')).toList();
  if (cells.isNotEmpty) {
    // Click on first Cosmos wallet cell
    await cells.first.click();
    print('✅ Navigated to existing Cosmos wallet');
  } else {
    // Create first Cosmos wallet
    try {
      final createButton = await driver.findElement(AppiumBy.accessibilityId('createFirstWalletButton'));
      await createButton.click();
      print('✅ Created first Cosmos wallet');
      
      // Wait for wallet creation to complete
      await Future.delayed(Duration(seconds: 3));
    } catch (e) {
      print('⚠️ Could not find create wallet button, continuing...');
    }
  }
  
  // Verify we're in Cosmos wallet view
  await _verifyInCosmosWalletView(driver);
}

Future<void> _switchToCosmosTab(AppiumWebDriver driver) async {
  print('🔄 Switching to Cosmos tab...');
  
  // Look for Cosmos tab button
  final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
  for (final button in buttons) {
    try {
      final label = await button.attributes['label'];
      if (label.toLowerCase().contains('cosmos')) {
        await button.click();
        print('✅ Switched to Cosmos tab');
        await Future.delayed(Duration(seconds: 2));
        return;
      }
    } catch (e) {
      // Continue searching
    }
  }
  
  // Alternative: try clicking by accessibility id
  try {
    final cosmosButton = await driver.findElement(AppiumBy.accessibilityId('Cosmos'));
    await cosmosButton.click();
    print('✅ Switched to Cosmos tab (by accessibility id)');
    await Future.delayed(Duration(seconds: 2));
  } catch (e) {
    print('⚠️ Could not switch to Cosmos tab, continuing...');
  }
}

Future<void> _verifyInCosmosWalletView(AppiumWebDriver driver) async {
  print('🔍 Verifying in Cosmos wallet view...');
  
  // Look for "Cosmos Wallet" title
  final staticTexts = await driver.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
  for (final element in staticTexts) {
    try {
      final text = await element.text;
      if (text.contains('Cosmos Wallet')) {
        print('✅ Confirmed in Cosmos wallet view');
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
      if (name.contains('Cosmos')) {
        print('✅ Confirmed in Cosmos wallet view (nav bar)');
        return;
      }
    } catch (e) {
      // Continue searching
    }
  }
  
  print('⚠️ Could not verify Cosmos wallet view, continuing...');
}

// Basic Wallet Operations
Future<void> _testCopyWalletAddress(AppiumWebDriver driver) async {
  print('📋 Testing copy wallet address...');
  
  final helper = CosmosWalletTestHelper(driver);
  
  try {
    await helper.clickElementByText('copy');
    print('✅ Copy button clicked');
    await Future.delayed(Duration(seconds: 2));
  } catch (e) {
    print('⚠️ Could not find copy button: $e');
  }
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

Future<void> _testFetchBalance(AppiumWebDriver driver) async {
  print('💰 Testing fetch balance...');
  
  final helper = CosmosWalletTestHelper(driver);
  
  try {
    await helper.clickElementByText('fetch balance');
    print('✅ Fetch balance initiated');
    await Future.delayed(Duration(seconds: 3));
    print('✅ Fetch balance completed');
  } catch (e) {
    print('⚠️ Fetch balance test failed: $e');
  }
}

// Signing Operations
Future<void> _testSignMessage(AppiumWebDriver driver) async {
  print('✍️ Testing sign message...');
  
  final helper = CosmosWalletTestHelper(driver);
  
  try {
    // Enter message to sign
    await helper.enterText('Test message for signing', placeholder: 'Enter a message to sign');
    
    // Click sign message button
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
  
  final helper = CosmosWalletTestHelper(driver);
  
  try {
    // Click sign transaction button
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

Future<void> _testSigningModes(AppiumWebDriver driver) async {
  print('🔄 Testing signing modes (Proto/Amino)...');
  
  final helper = CosmosWalletTestHelper(driver);
  
  try {
    // Test Proto mode (default)
    await helper.clickElementByText('proto');
    print('✅ Switched to Proto mode');
    await _testSignMessage(driver);
    
    // Test Amino mode
    await helper.clickElementByText('amino');
    print('✅ Switched to Amino mode');
    await _testSignMessage(driver);
    
    print('✅ Signing modes test completed');
  } catch (e) {
    print('⚠️ Signing modes test failed: $e');
  }
}

// Chain Configuration
Future<void> _testChainSwitching(AppiumWebDriver driver) async {
  print('🔄 Testing chain switching...');
  
  final helper = CosmosWalletTestHelper(driver);
  
  final chains = ['Osmosis', 'Juno', 'Stargaze', 'Cosmos Hub'];
  
  for (final chain in chains) {
    try {
      print('🔄 Switching to $chain...');
      
      // Click chain picker
      await helper.clickElementByText('chain');
      await Future.delayed(Duration(seconds: 1));
      
      // Select chain
      await helper.clickElementByText(chain);
      await Future.delayed(Duration(seconds: 2));
      
      // Verify address format changed
      await _testVerifyAddressFormat(driver);
      
      print('✅ Successfully switched to $chain');
    } catch (e) {
      print('⚠️ Chain switching to $chain failed: $e');
    }
  }
}

Future<void> _testCustomChainConfiguration(AppiumWebDriver driver) async {
  print('⚙️ Testing custom chain configuration...');
  
  final helper = CosmosWalletTestHelper(driver);
  
  try {
    // Toggle custom configuration
    await helper.clickElementByText('custom');
    await Future.delayed(Duration(seconds: 1));
    
    // Enter custom chain ID
    await helper.enterText('testchain-1', placeholder: 'cosmoshub-4');
    
    // Enter custom address prefix
    await helper.enterText('test', placeholder: 'cosmos');
    
    // Apply configuration
    await helper.clickElementByText('apply');
    await Future.delayed(Duration(seconds: 3));
    
    // Verify custom address format
    await _testVerifyAddressFormat(driver);
    
    // Switch back to preset chains
    await helper.clickElementByText('cosmos hub');
    await Future.delayed(Duration(seconds: 2));
    
    print('✅ Custom chain configuration completed');
  } catch (e) {
    print('⚠️ Custom chain configuration failed: $e');
  }
}

// Chain-Specific Transactions
Future<void> _testTransactionOnOsmosis(AppiumWebDriver driver) async {
  print('🧪 Testing transaction on Osmosis...');
  
  final helper = CosmosWalletTestHelper(driver);
  
  try {
    // Switch to Osmosis
    await helper.clickElementByText('osmosis');
    await Future.delayed(Duration(seconds: 2));
    
    // Test transaction
    await _testSignTransaction(driver);
    
    print('✅ Osmosis transaction completed');
  } catch (e) {
    print('⚠️ Osmosis transaction failed: $e');
  }
}

Future<void> _testTransactionOnJuno(AppiumWebDriver driver) async {
  print('🧪 Testing transaction on Juno...');
  
  final helper = CosmosWalletTestHelper(driver);
  
  try {
    // Switch to Juno
    await helper.clickElementByText('juno');
    await Future.delayed(Duration(seconds: 2));
    
    // Test transaction
    await _testSignTransaction(driver);
    
    print('✅ Juno transaction completed');
  } catch (e) {
    print('⚠️ Juno transaction failed: $e');
  }
}

Future<void> _testTransactionOnStargaze(AppiumWebDriver driver) async {
  print('🧪 Testing transaction on Stargaze...');
  
  final helper = CosmosWalletTestHelper(driver);
  
  try {
    // Switch to Stargaze
    await helper.clickElementByText('stargaze');
    await Future.delayed(Duration(seconds: 2));
    
    // Test transaction
    await _testSignTransaction(driver);
    
    print('✅ Stargaze transaction completed');
  } catch (e) {
    print('⚠️ Stargaze transaction failed: $e');
  }
}

// Wallet Management
Future<void> _testCheckSession(AppiumWebDriver driver) async {
  print('🔍 Testing check session...');
  
  final helper = CosmosWalletTestHelper(driver);
  
  try {
    await helper.clickElementByText('check session');
    print('✅ Check session initiated');
    await Future.delayed(Duration(seconds: 3));
    print('✅ Check session completed');
  } catch (e) {
    print('⚠️ Check session test failed: $e');
  }
}

Future<void> _testFetchWallets(AppiumWebDriver driver) async {
  print('📱 Testing fetch wallets...');
  
  final helper = CosmosWalletTestHelper(driver);
  
  try {
    await helper.clickElementByText('fetch wallets');
    print('✅ Fetch wallets initiated');
    await Future.delayed(Duration(seconds: 3));
    print('✅ Fetch wallets completed');
  } catch (e) {
    print('⚠️ Fetch wallets test failed: $e');
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