// Test Helpers for Error Handling E2E Tests
// Provides utilities for error testing and validation

import 'package:appium_driver/async_io.dart';
import 'test_constants.dart';
import 'wallet_test_foundation.dart';

export 'package:appium_driver/async_io.dart' show AppiumWebDriver, AppiumBy, AppiumWebElement;

/// Test driver wrapper for error handling tests
class TestDriver {
  AppiumWebDriver? _driver;
  
  Future<void> initialize() async {
    final capabilities = {
      'platformName': 'iOS',
      'platformVersion': '17.0',
      'deviceName': 'iPhone 15 Pro',
      'app': '../build/ios/Debug-iphonesimulator/Runner.app',
      'automationName': 'XCUITest',
      'noReset': false,
      'fullReset': false,
      'language': 'en',
      'locale': 'en_US',
    };
    
    _driver = await createDriver(
      uri: Uri.parse('http://127.0.0.1:4723/'),
      desired: capabilities,
    );
  }
  
  Future<void> dispose() async {
    await _driver?.quit();
  }
  
  Future<void> resetApp() async {
    // Reset app state
    await _driver?.execute('mobile:terminateApp', <dynamic>[<String, dynamic>{
      'bundleId': 'com.example.withFlutter'
    }]);
    
    await Future.delayed(Duration(seconds: 1));
    
    await _driver?.execute('mobile:launchApp', <dynamic>[<String, dynamic>{
      'bundleId': 'com.example.withFlutter'
    }]);
    
    await Future.delayed(Duration(seconds: 2));
  }
  
  Future<void> setEnvironmentVariable(String key, String value) async {
    // Note: In a real implementation, you'd need to pass environment variables
    // through the app or use a test configuration
    // This is a placeholder for the test structure
    print('Setting environment variable: $key = $value');
  }
  
  Future<void> tap(Finder finder) async {
    final element = await _findElement(finder);
    await element.click();
  }
  
  Future<void> waitFor(Finder finder, {Duration timeout = const Duration(seconds: 5)}) async {
    final endTime = DateTime.now().add(timeout);
    
    while (DateTime.now().isBefore(endTime)) {
      try {
        await _findElement(finder);
        return;
      } catch (e) {
        await Future.delayed(Duration(milliseconds: 500));
      }
    }
    
    throw Exception('Element not found within timeout: ${finder.description}');
  }
  
  Future<bool> exists(Finder finder, {Duration timeout = const Duration(seconds: 2)}) async {
    try {
      await waitFor(finder, timeout: timeout);
      return true;
    } catch (e) {
      return false;
    }
  }
  
  Future<String> getText(Finder finder) async {
    final element = await _findElement(finder);
    return await element.text ?? '';
  }
  
  Future<String> getAlertText() async {
    // Get text from alert dialog
    final alerts = await _driver!.findElements(AppiumBy.className('XCUIElementTypeAlert')).toList();
    if (alerts.isEmpty) {
      throw Exception('No alert found');
    }
    
    final staticTexts = await alerts.first.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
    final texts = <String>[];
    
    for (final text in staticTexts) {
      final content = await text.text;
      if (content.isNotEmpty) {
        texts.add(content);
      }
    }
    
    return texts.join('\n');
  }
  
  Future<void> enterText(String text) async {
    // Type text into the currently focused field
    await _driver!.keyboard.sendKeys(text);
  }
  
  Future<AppiumWebElement> _findElement(Finder finder) async {
    if (finder.byType != null) {
      final elements = await _driver!.findElements(finder._toAppiumBy()).toList();
      if (elements.isEmpty) {
        throw Exception('Element not found: ${finder.description}');
      }
      return elements[finder.index ?? 0];
    } else if (finder.byKey != null) {
      return await _findByKey(finder.byKey!);
    } else if (finder.byText != null) {
      return await _findByText(finder.byText!);
    } else if (finder.byTooltip != null) {
      return await _findByTooltip(finder.byTooltip!);
    }
    
    throw Exception('Unsupported finder type');
  }
  
  Future<AppiumWebElement> _findByKey(String key) async {
    // In Flutter, keys are mapped to accessibility identifiers
    final elements = await _driver!.findElements(AppiumBy.accessibilityId(key)).toList();
    if (elements.isNotEmpty) {
      return elements.first;
    }
    
    // Fallback: search by name attribute
    final allElements = await _driver!.findElements(AppiumBy.className('XCUIElementTypeOther')).toList();
    for (final element in allElements) {
      try {
        final name = await element.attributes['name'];
        if (name == key) {
          return element;
        }
      } catch (e) {
        // Continue searching
      }
    }
    
    throw Exception('Element with key "$key" not found');
  }
  
  Future<AppiumWebElement> _findByText(String text) async {
    // Find by static text
    final staticTexts = await _driver!.findElements(AppiumBy.className('XCUIElementTypeStaticText')).toList();
    for (final element in staticTexts) {
      try {
        final content = await element.text;
        if (content == text) {
          return element;
        }
      } catch (e) {
        // Continue searching
      }
    }
    
    // Find by button label
    final buttons = await _driver!.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
    for (final button in buttons) {
      try {
        final label = await button.attributes['label'];
        if (label == text) {
          return button;
        }
      } catch (e) {
        // Continue searching
      }
    }
    
    throw Exception('Element with text "$text" not found');
  }
  
  Future<AppiumWebElement> _findByTooltip(String tooltip) async {
    // Find by tooltip (usually the back button)
    final buttons = await _driver!.findElements(AppiumBy.className('XCUIElementTypeButton')).toList();
    for (final button in buttons) {
      try {
        final label = await button.attributes['label'];
        if (label.contains(tooltip)) {
          return button;
        }
      } catch (e) {
        // Continue searching
      }
    }
    
    throw Exception('Element with tooltip "$tooltip" not found');
  }
}

/// Finder class for locating elements
class Finder {
  final String? byType;
  final String? byKey;
  final String? byText;
  final String? byTooltip;
  final int? index;
  
  Finder._({
    this.byType,
    this.byKey,
    this.byText,
    this.byTooltip,
    this.index,
  });
  
  String get description {
    if (byType != null) return 'Type: $byType${index != null ? " at index $index" : ""}';
    if (byKey != null) return 'Key: $byKey';
    if (byText != null) return 'Text: $byText';
    if (byTooltip != null) return 'Tooltip: $byTooltip';
    return 'Unknown finder';
  }
  
  AppiumBy _toAppiumBy() {
    if (byType == 'AlertDialog') {
      return AppiumBy.className('XCUIElementTypeAlert');
    } else if (byType == 'Text') {
      return AppiumBy.className('XCUIElementTypeStaticText');
    }
    return AppiumBy.className('XCUIElementTypeOther');
  }
  
  Finder at(int index) {
    return Finder._(
      byType: byType,
      byKey: byKey,
      byText: byText,
      byTooltip: byTooltip,
      index: index,
    );
  }
  
  Finder descendant({required Finder of, required Finder matching}) {
    // This is a simplified implementation
    // In a real implementation, you'd need to find descendants properly
    return matching;
  }
}

/// Finder factory methods
class find {
  static Finder byType(Type type) {
    return Finder._(byType: type.toString());
  }
  
  static Finder byKey(Key key) {
    // Extract the key value from the Key object
    final keyString = key.toString();
    final match = RegExp(r'<\'(.+)\'>').firstMatch(keyString);
    final keyValue = match?.group(1) ?? keyString;
    return Finder._(byKey: keyValue);
  }
  
  static Finder text(String text) {
    return Finder._(byText: text);
  }
  
  static Finder byTooltip(String tooltip) {
    return Finder._(byTooltip: tooltip);
  }
  
  static Finder descendant({required Finder of, required Finder matching}) {
    return matching;
  }
}

/// Key class for widget identification
class Key {
  final String value;
  
  const Key(this.value);
  
  @override
  String toString() => '<\'$value\'>';
}

/// Widget types for testing
class AlertDialog {}
class Text {}

/// Test helpers for common operations
class TestHelpers {
  final TestDriver driver;
  
  TestHelpers(this.driver);
  
  Future<void> ensureLoggedOut() async {
    // Check if we're on the login screen
    final loginScreenExists = await driver.exists(
      find.text('Sign Up or Log In'),
      timeout: Duration(seconds: 2),
    );
    
    if (!loginScreenExists) {
      // Try to logout
      final logoutButton = find.byKey(const Key('wallets_screen_logout_button'));
      if (await driver.exists(logoutButton, timeout: Duration(seconds: 2))) {
        await driver.tap(logoutButton);
        await Future.delayed(Duration(seconds: 2));
      }
    }
  }
  
  Future<void> performEmailLogin() async {
    // Switch to email mode
    final emailButton = find.text('Email');
    if (await driver.exists(emailButton)) {
      await driver.tap(emailButton);
    }
    
    // Enter email
    final email = TestConstants.generateUniqueEmail();
    await driver.enterText(email);
    
    // Tap continue
    await driver.tap(find.byKey(const Key('continue_button')));
    
    // Wait for OTP screen
    await Future.delayed(Duration(seconds: 2));
    
    // Enter OTP
    for (int i = 0; i < 6; i++) {
      await driver.tap(find.byKey(Key('otp_field_$i')));
      await driver.enterText(TestConstants.verificationCode[i]);
    }
    
    // Wait for biometric prompt
    await Future.delayed(Duration(seconds: 3));
    
    // Handle biometric authentication (simulator)
    // This would be handled by the Appium driver's biometric simulation
    
    // Wait for wallets screen
    await driver.waitFor(find.byKey(const Key('wallets_screen')));
  }
}