// Test Constants - Deep Implementation
// Centralized constants for wallet E2E tests with robust generation

import 'dart:math';

class TestConstants {
  // Email configuration
  static const String emailDomain = 'test.usecapsule.com';
  static const String verificationCode = '123456';
  
  // Timeouts - carefully chosen based on real-world performance
  static const Duration quickTimeout = Duration(seconds: 2);   // UI elements that should exist
  static const Duration defaultTimeout = Duration(seconds: 5);  // Network operations
  static const Duration longTimeout = Duration(seconds: 15);    // Authentication flows
  static const Duration veryLongTimeout = Duration(seconds: 30); // Wallet creation
  
  // Test data for transactions
  static const String testRecipientAddress = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
  static const String testCosmosRecipientAddress = 'cosmos1hsk6jryyqjfhp5dhc55tc9jtckygx0eph6dd02';
  static const String testSolanaRecipientAddress = '11111111111111111111111111111112';
  static const String testAmount = '0.001';
  static const String testMessage = 'Hello, blockchain world!';
  
  // Phone number generation - realistic US numbers
  static const List<String> _areaCodes = [
    '212', '310', '415', '512', '617', '702', '808', '919',
    '303', '404', '503', '602', '713', '214', '305', '206'
  ];
  
  // Random string generation for unique identifiers
  static const String _randomChars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  static final Random _random = Random();
  
  /// Generates a unique test phone number
  /// Format: (area code) 555-xxxx (where 555 is reserved for testing)
  static String generateTestPhoneNumber() {
    final areaCode = _areaCodes[_random.nextInt(_areaCodes.length)];
    final lastFour = _random.nextInt(9000) + 1000; // 1000-9999
    return '${areaCode}555$lastFour';
  }
  
  /// Generates a unique test email address
  /// Format: test{random}@test.usecapsule.com
  static String generateUniqueEmail() {
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    final randomSuffix = _generateRandomString(6);
    return 'test$timestamp$randomSuffix@$emailDomain';
  }
  
  /// Generates a unique test message for signing
  static String generateTestMessage() {
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    final randomSuffix = _generateRandomString(4);
    return 'Test message $timestamp-$randomSuffix';
  }
  
  /// Generates a random string of specified length
  static String _generateRandomString(int length) {
    return List.generate(length, (index) => 
      _randomChars[_random.nextInt(_randomChars.length)]
    ).join();
  }
  
  /// Validates if an email is a test email
  static bool isTestEmail(String email) {
    return email.endsWith('@$emailDomain');
  }
  
  /// Validates if a phone number is a test phone number
  static bool isTestPhoneNumber(String phone) {
    return phone.contains('555') && 
           _areaCodes.any((code) => phone.startsWith(code));
  }
}