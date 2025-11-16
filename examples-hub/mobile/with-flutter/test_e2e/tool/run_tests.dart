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
        // Parity with Swift: only EVM wallet tests are enabled
        testFiles = ['evm_wallet_test.dart'];
        break;
      case 'error':
      case 'errors':
        testFiles = [];
        break;
      case 'all':
      default:
        // Parity with Swift: run auth + EVM only
        testFiles = ['authentication_test.dart', 'evm_wallet_test.dart'];
        break;
    }

    bool allPassed = true;
    
    for (final testFile in testFiles) {
      print('🔄 Running $testFile...');
      final proc = await Process.start(
        'dart',
        ['test', '-r', 'expanded', '--timeout', '300s', testFile],
        mode: ProcessStartMode.normal,
        workingDirectory: Directory.current.path,
      );

      // Stream logs live for visibility
      proc.stdout.listen((data) => stdout.add(data));
      proc.stderr.listen((data) => stderr.add(data));

      final code = await proc.exitCode;
      if (code == 0) {
        print('\n✅ $testFile PASSED\n');
      } else {
        print('\n❌ $testFile FAILED (exit code $code)\n');
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
