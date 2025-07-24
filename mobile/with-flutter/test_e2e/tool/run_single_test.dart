#!/usr/bin/env dart

import 'dart:io';

/// Run a single test file
void main(List<String> args) async {
  if (args.isEmpty) {
    print('Usage: dart run tool/run_single_test.dart <test-file>');
    print('Available tests:');
    print('  authentication - Run authentication tests');
    print('  evm - Run EVM wallet tests');
    print('  solana - Run Solana wallet tests');
    print('  cosmos - Run Cosmos wallet tests');
    exit(1);
  }
  
  final testType = args[0];
  String testFile;
  
  switch (testType) {
    case 'authentication':
    case 'auth':
      testFile = 'authentication_test.dart';
      break;
    case 'evm':
      testFile = 'evm_wallet_test.dart';
      break;
    case 'solana':
      testFile = 'solana_wallet_test.dart';
      break;
    case 'cosmos':
      testFile = 'cosmos_wallet_test.dart';
      break;
    default:
      print('❌ Unknown test type: $testType');
      exit(1);
  }
  
  print('🧪 Running $testType tests ($testFile)...\n');
  
  // Start Appium server
  print('🚀 Starting Appium server...');
  final appiumProcess = await Process.start(
    'appium',
    ['--port', '4723'],
    mode: ProcessStartMode.detached,
  );
  
  await Future.delayed(Duration(seconds: 5));
  
  try {
    // Run the specific test file
    final testResult = await Process.run(
      'dart',
      ['test', '--timeout', '300s', testFile],
    );
    
    print(testResult.stdout);
    if (testResult.stderr.isNotEmpty) {
      print(testResult.stderr);
    }
    
    if (testResult.exitCode == 0) {
      print('\n✅ $testType tests PASSED');
    } else {
      print('\n❌ $testType tests FAILED');
    }
    
  } finally {
    print('\n🛑 Stopping Appium server...');
    appiumProcess.kill();
  }
}