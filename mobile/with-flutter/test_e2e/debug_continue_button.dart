// Debug script for testing the Continue button clicking logic
// Run this with: cd test_e2e && dart run debug_continue_button.dart

import 'dart:io';
import 'para_flutter_e2e_test.dart';
import 'package:appium_driver/async_io.dart';
import 'package:dotenv/dotenv.dart';

void main() async {
  print('🧪 Starting Continue Button Debug Test...');
  
  try {
    // Load environment variables
    final env = DotEnv(includePlatformEnvironment: true)..load(['.env']);
    
    // Check for API key
    final apiKey = Platform.environment['PARA_API_KEY'] ?? env['PARA_API_KEY'];
    if (apiKey == null || apiKey.isEmpty) {
      throw Exception('PARA_API_KEY must be set in environment variables or .env file');
    }
    
    // Initialize driver with same capabilities as main test
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
    
    final driver = await createDriver(
      uri: Uri.parse('http://127.0.0.1:4723/'),
      desired: capabilities,
    );
    
    final helper = TestHelper(driver);
    
    print('✅ Driver initialized successfully');
    
    // Wait for app to load
    await Future.delayed(Duration(seconds: 3));
    
    // Switch to email mode
    await helper.switchToEmailMode();
    print('✅ Switched to email mode');
    
    // Enter test email
    final testEmail = TestConstants.generateUniqueEmail();
    print('📧 Using test email: $testEmail');
    
    await helper.enterText(testEmail, fieldIndex: 0);
    print('✅ Entered test email');
    
    // Wait for button to become enabled
    await Future.delayed(Duration(seconds: 2));
    
    // Test the new Continue button clicking logic
    print('🔍 Testing Continue button clicking logic...');
    await helper.clickContinueButtonWithDebug();
    
    print('✅ Continue button test completed');
    
    // Wait to see if OTP verification appears
    print('🔍 Checking for OTP verification view...');
    try {
      await helper.waitForOTPVerificationView('Email');
      print('✅ OTP verification view appeared successfully');
    } catch (e) {
      print('❌ OTP verification view did not appear: $e');
    }
    
    await driver.quit();
    print('✅ Debug test completed');
    
  } catch (e) {
    print('❌ Debug test failed: $e');
    exit(1);
  }
}