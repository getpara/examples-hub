#!/usr/bin/env dart

import 'dart:io';

/// Run a single test by number
void main(List<String> args) async {
  if (args.isEmpty) {
    print('Usage: dart run tool/run_single_test.dart <test-number>');
    print('Example: dart run tool/run_single_test.dart 01');
    exit(1);
  }
  
  final testNumber = args[0].padLeft(2, '0');
  print('🧪 Running test $testNumber...\n');
  
  // Start Appium server
  print('🚀 Starting Appium server...');
  final appiumProcess = await Process.start(
    'appium',
    ['--port', '4723'],
    mode: ProcessStartMode.detached,
  );
  
  await Future.delayed(Duration(seconds: 5));
  
  try {
    // Run the specific test by name pattern
    final testResult = await Process.run(
      'dart',
      ['test', '--timeout', '300s', '-N', '$testNumber ', 'para_flutter_e2e_test.dart'],
    );
    
    print(testResult.stdout);
    if (testResult.stderr.isNotEmpty) {
      print(testResult.stderr);
    }
    
    if (testResult.exitCode == 0) {
      print('\n✅ Test $testNumber PASSED');
    } else {
      print('\n❌ Test $testNumber FAILED');
    }
    
  } finally {
    print('\n🛑 Stopping Appium server...');
    appiumProcess.kill();
  }
}