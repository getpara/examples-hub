#!/usr/bin/env dart

import 'dart:io';

/// Test runner for Para Flutter E2E tests
/// Manages Appium server and runs clean organized test suite
void main(List<String> args) async {
  final testType = args.isNotEmpty ? args[0] : 'all';
  
  print('🧪 Running Para Flutter E2E tests ($testType)...\n');

  // Ensure Flutter app is built for iOS simulator once before running
  final appPath = '../build/ios/iphonesimulator/Runner.app';
  if (!File(appPath).existsSync()) {
    print('📦 iOS app not found at $appPath. Building...');
    final build = await Process.run('flutter', ['build', 'ios', '--simulator'], workingDirectory: '..');
    if (build.exitCode != 0) {
      print('❌ Build failed:');
      stderr.write(build.stderr);
      exit(1);
    }
    print('✅ Build complete');
  }

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
  await Future.delayed(Duration(seconds: 5));

  try {
    List<String> testFiles = [];
    
    // Determine which test files to run
    switch (testType) {
      case 'authentication':
      case 'auth':
        testFiles = ['authentication_test.dart'];
        break;
      case 'evm':
        testFiles = ['evm_wallet_test.dart'];
        break;
      case 'solana':
        testFiles = ['solana_wallet_test.dart'];
        break;
      case 'cosmos':
        testFiles = ['cosmos_wallet_test.dart'];
        break;
      case 'wallets':
        testFiles = ['evm_wallet_test.dart', 'solana_wallet_test.dart', 'cosmos_wallet_test.dart'];
        break;
      case 'all':
      default:
        testFiles = [
          'authentication_test.dart',
          'evm_wallet_test.dart',
          'solana_wallet_test.dart',
          'cosmos_wallet_test.dart'
        ];
        break;
    }

    bool allPassed = true;
    
    for (final testFile in testFiles) {
      print('🔄 Running $testFile...');
      final testResult = await Process.run('dart', [
        'test',
        '--timeout', '300s',
        testFile
      ]);
      
      print(testResult.stdout);
      if (testResult.stderr.isNotEmpty) {
        print(testResult.stderr);
      }

      if (testResult.exitCode == 0) {
        print('✅ $testFile PASSED\n');
      } else {
        print('❌ $testFile FAILED\n');
        allPassed = false;
      }
    }

    if (allPassed) {
      print('\n🎉 All tests passed!');
    } else {
      print('\n❌ Some tests failed.');
      exit(1);
    }

  } finally {
    // Stop Appium server
    print('\n🛑 Stopping Appium server...');
    appiumProcess.kill();
  }
}