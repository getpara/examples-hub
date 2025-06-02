#!/usr/bin/env dart

import 'dart:io';

/// Test runner for Para Flutter E2E tests
/// Manages Appium server and runs tests
void main(List<String> args) async {
  final testType = args.isNotEmpty ? args[0] : 'all';
  
  print('🧪 Running Para Flutter E2E tests ($testType)...\n');

  // Check if Appium is available
  final appiumCheck = await Process.run('which', ['appium']);
  if (appiumCheck.exitCode != 0) {
    print('❌ Appium not found. Install with: npm install -g appium');
    print('   Then install driver: appium driver install xcuitest');
    exit(1);
  }

  // Start Appium server
  print('🚀 Starting Appium server...');
  final appiumProcess = await Process.start(
    'appium',
    ['--port', '4723'],
    mode: ProcessStartMode.detached,
  );

  // Wait a moment for Appium to start
  await Future.delayed(Duration(seconds: 3));

  try {
    // Run tests based on type
    List<String> testArgs = ['test', '--timeout', '120s'];
    
    switch (testType) {
      case 'email':
        // Run both email signup and login tests
        testArgs.addAll(['--name', 'Email Authentication']);
        break;
      case 'phone':
        // Run both phone signup and login tests  
        testArgs.addAll(['--name', 'Phone Authentication']);
        break;
      case 'email-signup':
        testArgs.addAll(['--name', '01 Email Authentication Signup Flow']);
        break;
      case 'email-login':
        testArgs.addAll(['--name', '02 Email Passkey Login Flow']);
        break;
      case 'phone-signup':
        testArgs.addAll(['--name', '03 Phone Authentication Signup Flow']);
        break;
      case 'phone-login':
        testArgs.addAll(['--name', '04 Phone Passkey Login Flow']);
        break;
      case 'all':
      default:
        // Run all tests
        break;
    }

    testArgs.add('para_flutter_e2e_test.dart');

    print('🔄 Running tests...');
    final testResult = await Process.run('dart', testArgs);
    
    print(testResult.stdout);
    if (testResult.stderr.isNotEmpty) {
      print(testResult.stderr);
    }

    if (testResult.exitCode == 0) {
      print('\n✅ All tests passed!');
    } else {
      print('\n❌ Some tests failed.');
      exit(testResult.exitCode);
    }

  } finally {
    // Stop Appium server
    print('\n🛑 Stopping Appium server...');
    appiumProcess.kill();
  }
}