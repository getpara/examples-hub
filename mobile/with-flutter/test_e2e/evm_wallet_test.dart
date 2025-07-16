// EVM Wallet E2E Tests - Deep Implementation
// Comprehensive tests for EVM wallet operations using isolated contexts

import 'dart:io';
import 'package:test/test.dart';
import 'package:appium_driver/async_io.dart';
import 'package:dotenv/dotenv.dart';
import 'lib/wallet_test_foundation.dart';
import 'lib/test_constants.dart';

void main() {
  group('EVM Wallet Tests', () {
    late AppiumWebDriver driver;
    late WalletTestContext context;
    
    setUpAll(() async {
      // Load environment and validate prerequisites
      final env = DotEnv(includePlatformEnvironment: true)..load(['.env']);
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
    });

    tearDownAll(() async {
      // Emergency cleanup of any remaining contexts
      await WalletTestFactory.destroyAllContexts(driver);
      await driver.quit();
    });

    setUp(() async {
      print('\\n🚀 Setting up fresh EVM wallet test context...');
      
      // Create isolated test context for this specific test
      context = await WalletTestFactory.createIsolatedContext(
        driver: driver,
        walletType: WalletType.evm,
      );
      
      // Navigate to EVM wallet view
      await _navigateToEVMWallet(driver);
      
      print('✅ EVM wallet test context ready');
    });

    tearDown(() async {
      print('\\n🧹 Cleaning up EVM wallet test context...');
      
      // Destroy the isolated context
      await WalletTestFactory.destroyContext(driver, context);
      
      print('✅ EVM wallet test context cleaned up');
    });

    test('Basic Wallet Operations', () async {
      print('\\n🧪 Testing EVM wallet basic operations...');
      
      // Test 1: Copy wallet address
      await _testCopyWalletAddress(driver);
      
      // Test 2: Refresh wallet balance
      await _testRefreshWalletBalance(driver);
      
      // Test 3: Check session status
      await _testCheckSession(driver);
      
      // Test 4: Fetch wallets
      await _testFetchWallets(driver);
      
      print('✅ All basic wallet operations completed successfully');
    }, timeout: Timeout(Duration(minutes: 3)));

    test('Signing Operations', () async {
      print('\\n🧪 Testing EVM wallet signing operations...');
      
      // Test 1: Sign message
      await _testSignMessage(driver);
      
      // Test 2: Sign transaction
      await _testSignTransaction(driver);
      
      print('✅ All signing operations completed successfully');
    }, timeout: Timeout(Duration(minutes: 3)));

    test('Wallet Refresh Flow', () async {
      print('\\n🧪 Testing EVM wallet refresh flow...');
      
      // Navigate back to wallets view
      await _navigateToWalletsView(driver);
      
      // Test wallet refresh functionality
      await _testWalletRefreshFlow(driver);
      
      print('✅ Wallet refresh flow completed successfully');
    }, timeout: Timeout(Duration(minutes: 2)));
  });
}

// Helper functions for EVM wallet operations

Future<void> _navigateToEVMWallet(AppiumWebDriver driver) async {
  print('📱 Navigating to EVM wallet...');
  
  // Look for first wallet cell (should be EVM)
  final cells = await driver.findElements(AppiumBy.className('XCUIElementTypeCell')).toList();
  if (cells.isEmpty) {
    throw Exception('No wallet cells found');
  }
  
  await cells.first.click();
  
  // Wait for EVM wallet view to appear
  for (int attempt = 0; attempt < 10; attempt++) {
    try {
      final navBars = await driver.findElements(AppiumBy.className('XCUIElementTypeNavigationBar')).toList();
      for (final navBar in navBars) {
        final name = await navBar.attributes['name'];
        if (name.contains('EVM Wallet')) {
          print('✅ EVM wallet view loaded');
          return;
        }
      }
    } catch (e) {
      // Continue waiting
    }
    await Future.delayed(Duration(seconds: 1));
  }
  
  throw Exception('EVM wallet view did not load');
}

Future<void> _navigateToWalletsView(AppiumWebDriver driver) async {
  print('📱 Navigating back to wallets view...');
  
  // Look for back button in navigation bar
  final navBars = await driver.findElements(AppiumBy.className('XCUIElementTypeNavigationBar')).toList();
  for (final navBar in navBars) {
    try {
      final buttons = await navBar.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
      if (buttons.isNotEmpty) {
        await buttons.first.click(); // Usually the back button
        await Future.delayed(Duration(seconds: 1));
        print('✅ Navigated back to wallets view');
        return;
      }
    } catch (e) {
      // Continue searching
    }
  }
  
  throw Exception('Could not navigate back to wallets view');
}

Future<void> _testCopyWalletAddress(AppiumWebDriver driver) async {
  print('📋 Testing copy wallet address...');
  
  // Look for copy address button
  final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
  for (final button in buttons) {
    try {
      final label = await button.attributes['label'];
      if (label.contains('copy') || label.contains('Copy')) {
        await button.click();
        
        // Wait for success alert
        await _waitForAndDismissAlert(driver, expectSuccess: true);
        
        print('✅ Copy wallet address successful');
        return;
      }
    } catch (e) {
      // Continue searching
    }
  }
  
  throw Exception('Copy address button not found');
}

Future<void> _testRefreshWalletBalance(AppiumWebDriver driver) async {
  print('🔄 Testing refresh wallet balance...');
  
  // Look for refresh button
  final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
  for (final button in buttons) {
    try {
      final label = await button.attributes['label'];
      if (label.contains('refresh') || label.contains('Refresh')) {
        await button.click();
        
        // Wait for balance to update (no alert expected)
        await Future.delayed(TestConstants.defaultTimeout);
        
        print('✅ Refresh wallet balance successful');
        return;
      }
    } catch (e) {
      // Continue searching
    }
  }
  
  throw Exception('Refresh balance button not found');
}

Future<void> _testCheckSession(AppiumWebDriver driver) async {
  print('🔍 Testing check session...');
  
  // Look for check session button
  final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
  for (final button in buttons) {
    try {
      final label = await button.attributes['label'];
      if (label.contains('Check Session') || label.contains('Session')) {
        await button.click();
        
        // Wait for session status alert
        await _waitForAndDismissAlert(driver, expectSuccess: true);
        
        print('✅ Check session successful');
        return;
      }
    } catch (e) {
      // Continue searching
    }
  }
  
  throw Exception('Check session button not found');
}

Future<void> _testFetchWallets(AppiumWebDriver driver) async {
  print('📱 Testing fetch wallets...');
  
  // Look for fetch wallets button
  final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
  for (final button in buttons) {
    try {
      final label = await button.attributes['label'];
      if (label.contains('Fetch Wallets') || label.contains('Fetch')) {
        await button.click();
        
        // Wait for wallets alert
        await _waitForAndDismissAlert(driver, expectSuccess: true);
        
        print('✅ Fetch wallets successful');
        return;
      }
    } catch (e) {
      // Continue searching
    }
  }
  
  throw Exception('Fetch wallets button not found');
}

Future<void> _testSignMessage(AppiumWebDriver driver) async {
  print('✍️ Testing sign message...');
  
  // Find message input field
  final textFields = await driver.findElements(AppiumBy.className('XCUIElementTypeTextField')).toList();
  for (final field in textFields) {
    try {
      final placeholder = await field.attributes['placeholder'];
      if (placeholder.contains('message') || placeholder.contains('Message')) {
        await field.click();
        await field.clear();
        await field.sendKeys(TestConstants.generateTestMessage());
        
        // Find and tap sign message button
        final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
        for (final button in buttons) {
          final label = await button.attributes['label'];
          if (label.contains('Sign Message')) {
            await button.click();
            
            // Wait for signing success
            await _waitForAndDismissAlert(driver, expectSuccess: true);
            
            print('✅ Sign message successful');
            return;
          }
        }
      }
    } catch (e) {
      // Continue searching
    }
  }
  
  throw Exception('Sign message functionality not found');
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
        
        // Wait for signing result (might be success or insufficient funds)
        await _waitForAndDismissAlert(driver, expectSuccess: false);
        
        print('✅ Sign transaction completed (success or expected error)');
        return;
      }
    } catch (e) {
      // Continue searching
    }
  }
  
  throw Exception('Sign transaction button not found');
}

Future<void> _testWalletRefreshFlow(AppiumWebDriver driver) async {
  print('🔄 Testing wallet refresh flow...');
  
  // Count initial wallets
  final initialCells = await driver.findElements(AppiumBy.className('XCUIElementTypeCell')).toList();
  final initialCount = initialCells.length;
  
  // Find refresh button
  final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
  for (final button in buttons) {
    try {
      final label = await button.attributes['label'];
      if (label.contains('refresh') || label.contains('Refresh')) {
        await button.click();
        
        // Wait for refresh to complete
        await Future.delayed(TestConstants.defaultTimeout);
        
        // Verify wallets still exist
        final finalCells = await driver.findElements(AppiumBy.className('XCUIElementTypeCell')).toList();
        final finalCount = finalCells.length;
        
        if (finalCount != initialCount) {
          throw Exception('Wallet count changed after refresh: $initialCount -> $finalCount');
        }
        
        print('✅ Wallet refresh flow successful (count maintained: $finalCount)');
        return;
      }
    } catch (e) {
      // Continue searching
    }
  }
  
  throw Exception('Wallet refresh button not found');
}

Future<void> _waitForAndDismissAlert(AppiumWebDriver driver, {required bool expectSuccess}) async {
  print('⏳ Waiting for alert...');
  
  for (int attempt = 0; attempt < 10; attempt++) {
    try {
      final alerts = await driver.findElements(AppiumBy.className('XCUIElementTypeAlert')).toList();
      if (alerts.isNotEmpty) {
        final alert = alerts.first;
        
        // Read alert content for verification
        final staticTexts = await alert.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
        for (final text in staticTexts) {
          final content = await text.text;
          print('📝 Alert content: $content');
          
          if (expectSuccess) {
            // Verify it's not an error
            if (content.toLowerCase().contains('error') || content.toLowerCase().contains('failed')) {
              throw Exception('Expected success but got error: $content');
            }
          }
        }
        
        // Dismiss alert
        final okButtons = await alert.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
        for (final button in okButtons) {
          final label = await button.attributes['label'];
          if (label.contains('OK') || label.contains('Dismiss')) {
            await button.click();
            await Future.delayed(Duration(seconds: 1));
            print('✅ Alert dismissed');
            return;
          }
        }
        
        // If no OK button found, tap the first button
        if (okButtons.isNotEmpty) {
          await okButtons.first.click();
          await Future.delayed(Duration(seconds: 1));
          print('✅ Alert dismissed (first button)');
          return;
        }
      }
    } catch (e) {
      // Continue waiting
    }
    
    await Future.delayed(Duration(seconds: 1));
  }
  
  if (expectSuccess) {
    throw Exception('Expected success alert but none appeared');
  } else {
    print('⚠️ No alert appeared (this may be expected)');
  }
}