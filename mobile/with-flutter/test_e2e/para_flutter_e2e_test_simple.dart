// Para Flutter E2E Tests - Simple Structure Matching Swift
// Core authentication flows only

import 'dart:io';
import 'dart:math';
import 'package:test/test.dart';
import 'package:appium_driver/async_io.dart';
import 'package:dotenv/dotenv.dart';

// Test constants matching Swift exactly
class TestConstants {
  static const emailDomain = 'test.usecapsule.com';
  static const verificationCode = '123456';
  static const defaultTimeout = Duration(seconds: 5);
  static const longTimeout = Duration(seconds: 30);
  
  static String generateTestPhoneNumber() {
    final areaCodes = ['212', '310', '415', '512', '617', '702', '808', '919'];
    final areaCode = areaCodes[Random().nextInt(areaCodes.length)];
    final lastFour = (1000 + Random().nextInt(9000)).toString();
    return '${areaCode}555$lastFour';
  }
  
  static String generateUniqueEmail() {
    final randomLetters = 'abcdefghijklmnopqrstuvwxyz';
    final randomString = List.generate(6, (_) => randomLetters[Random().nextInt(26)]).join();
    return 'test$randomString@$emailDomain';
  }
}

// Test Helper Class - Simple and focused like Swift
class TestHelper {
  final AppiumWebDriver driver;
  
  TestHelper(this.driver);
  
  // Core helper methods matching Swift exactly
  Future<void> performEmailAuthWithPasskey(String email) async {
    await switchToEmailMode();
    await enterEmailAndContinue(email);
    await waitForOTPVerificationView();
    await enterOTPCode(TestConstants.verificationCode);
    await performBiometricAuth();
  }
  
  Future<void> performPhoneAuthWithPasskey(String phone) async {
    await switchToPhoneMode();
    await enterPhoneAndContinue(phone);
    await waitForOTPVerificationView();
    await enterOTPCode(TestConstants.verificationCode);
    await performBiometricAuth();
  }
  
  Future<void> performLoginFlow(String credential) async {
    final isEmail = credential.contains('@');
    
    if (isEmail) {
      await switchToEmailMode();
      await enterEmailAndContinue(credential);
    } else {
      await switchToPhoneMode();
      await enterPhoneAndContinue(credential);
    }
    
    await performBiometricAuthForLogin();
  }
  
  Future<void> waitForWalletsView() async {
    for (int attempt = 0; attempt < 10; attempt++) {
      try {
        final elements = await driver.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
        for (final element in elements) {
          final text = await element.text;
          if (text == 'Your Wallets' || text == 'EVM Wallet' || text == 'SOLANA Wallet') {
            print('✅ Found wallets view');
            return;
          }
        }
      } catch (e) {
        // Continue
      }
      await Future.delayed(Duration(seconds: 1));
    }
    throw Exception('Wallets view not found');
  }
  
  Future<void> waitForMainScreen() async {
    for (int attempt = 0; attempt < 10; attempt++) {
      try {
        final elements = await driver.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
        for (final element in elements) {
          final text = await element.text;
          if (text.contains('Sign Up or Log In')) {
            print('✅ Found main screen');
            return;
          }
        }
      } catch (e) {
        // Continue
      }
      await Future.delayed(Duration(seconds: 1));
    }
    throw Exception('Main screen not found');
  }
  
  Future<void> performLogout() async {
    final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
    for (final button in buttons) {
      try {
        final label = await button.attributes['label'];
        if (label.toLowerCase().contains('logout')) {
          await button.click();
          print('✅ Logout successful');
          return;
        }
      } catch (e) {
        // Continue
      }
    }
    throw Exception('Logout button not found');
  }
  
  // Implementation helpers
  Future<void> switchToEmailMode() async {
    final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
    for (final button in buttons) {
      try {
        final label = await button.attributes['label'];
        if (label.contains('Email')) {
          await button.click();
          break;
        }
      } catch (e) {
        // Continue
      }
    }
  }
  
  Future<void> switchToPhoneMode() async {
    final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
    for (final button in buttons) {
      try {
        final label = await button.attributes['label'];
        if (label.contains('Phone')) {
          await button.click();
          break;
        }
      } catch (e) {
        // Continue
      }
    }
  }
  
  Future<void> enterEmailAndContinue(String email) async {
    final textFields = await driver.findElements(AppiumBy.className('XCUIElementTypeTextField')).toList();
    await textFields.first.click();
    await textFields.first.clear();
    await textFields.first.sendKeys(email);
    await Future.delayed(Duration(seconds: 1));
    await clickContinueButton();
  }
  
  Future<void> enterPhoneAndContinue(String phone) async {
    final textFields = await driver.findElements(AppiumBy.className('XCUIElementTypeTextField')).toList();
    await textFields.first.click();
    await textFields.first.clear();
    await textFields.first.sendKeys(phone);
    await Future.delayed(Duration(seconds: 1));
    await clickContinueButton();
  }
  
  Future<void> clickContinueButton() async {
    final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
    for (final button in buttons) {
      try {
        final label = await button.attributes['label'];
        final enabled = await button.enabled;
        if (label == 'Continue' && enabled) {
          await button.click();
          return;
        }
      } catch (e) {
        // Continue
      }
    }
    throw Exception('Continue button not found or not enabled');
  }
  
  Future<void> waitForOTPVerificationView() async {
    for (int attempt = 0; attempt < 15; attempt++) {
      try {
        final buttons = await driver.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
        for (final button in buttons) {
          final label = await button.attributes['label'];
          if (label.toLowerCase().contains('resend')) {
            print('✅ OTP verification view found');
            return;
          }
        }
      } catch (e) {
        // Continue
      }
      await Future.delayed(Duration(seconds: 1));
    }
    throw Exception('OTP verification view not found');
  }
  
  Future<void> enterOTPCode(String code) async {
    final textFields = await driver.findElements(AppiumBy.className('XCUIElementTypeTextField')).toList();
    final otpFields = textFields.sublist(textFields.length - 6);
    
    for (int i = 0; i < 6 && i < code.length; i++) {
      await otpFields[i].click();
      await otpFields[i].clear();
      await otpFields[i].sendKeys(code[i]);
      await Future.delayed(Duration(milliseconds: 300));
    }
    
    await Future.delayed(Duration(seconds: 2));
  }
  
  Future<void> performBiometricAuth() async {
    await Future.delayed(Duration(seconds: 3));
    try {
      await driver.execute('mobile:sendBiometricMatch', <dynamic>[<String, dynamic>{
        'type': 'touchId',
        'match': true
      }]);
      print('✅ Biometric auth successful');
    } catch (e) {
      throw Exception('Biometric auth failed: $e');
    }
  }
  
  Future<void> performBiometricAuthForLogin() async {
    await Future.delayed(Duration(seconds: 2));
    try {
      await driver.execute('mobile:sendBiometricMatch', <dynamic>[<String, dynamic>{
        'type': 'touchId',
        'match': true
      }]);
      print('✅ Biometric auth for login successful');
    } catch (e) {
      throw Exception('Biometric auth for login failed: $e');
    }
  }
}

void main() {
  group('Para Flutter E2E Tests - Simple Structure', () {
    late AppiumWebDriver driver;
    late TestHelper helper;
    
    setUpAll(() async {
      final env = DotEnv(includePlatformEnvironment: true)..load(['.env']);
      final apiKey = Platform.environment['PARA_API_KEY'] ?? env['PARA_API_KEY'];
      if (apiKey == null || apiKey.isEmpty) {
        throw Exception('PARA_API_KEY must be set');
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
        'allowTouchIdEnroll': true,
        'touchIdMatch': true,
      };
      
      driver = await createDriver(
        uri: Uri.parse('http://127.0.0.1:4723/'),
        desired: capabilities,
      );
      
      helper = TestHelper(driver);
      
      // Enroll biometrics
      try {
        await driver.execute('mobile:enrollBiometric', <dynamic>[<String, dynamic>{'isEnabled': true}]);
        print('✅ Biometrics enrolled');
      } catch (e) {
        print('Warning: Could not enroll biometrics: $e');
      }
    });

    tearDownAll(() async {
      await driver.quit();
    });

    // Main tests matching Swift exactly
    test('Email Passkey Flow', () async {
      // PART 1: SIGNUP
      final uniqueEmail = TestConstants.generateUniqueEmail();
      print('📧 Generated email: $uniqueEmail');
      
      await helper.performEmailAuthWithPasskey(uniqueEmail);
      await helper.waitForWalletsView();
      
      // PART 2: TEST LOGIN
      await helper.performLogout();
      await helper.waitForMainScreen();
      
      await helper.performLoginFlow(uniqueEmail);
      await helper.waitForWalletsView();
      
      print('✅ Email passkey flow completed');
    }, timeout: Timeout(Duration(minutes: 5)));

    test('Phone Passkey Flow', () async {
      // PART 1: SIGNUP
      final phoneNumber = TestConstants.generateTestPhoneNumber();
      print('📱 Generated phone: $phoneNumber');
      
      await helper.performPhoneAuthWithPasskey(phoneNumber);
      await helper.waitForWalletsView();
      
      // PART 2: TEST LOGIN
      await helper.performLogout();
      await helper.waitForMainScreen();
      
      await helper.performLoginFlow(phoneNumber);
      await helper.waitForWalletsView();
      
      print('✅ Phone passkey flow completed');
    }, timeout: Timeout(Duration(minutes: 5)));
  });
}