#!/usr/bin/env dart

import 'dart:io';

/// Setup script for Para Flutter E2E tests
/// Builds the Flutter app and prepares the test environment
void main(List<String> args) async {
  print('🔧 Setting up Para Flutter E2E tests...\n');

  // Build the Flutter app for iOS simulator
  print('📱 Building Flutter app for iOS simulator...');
  final buildResult = await Process.run(
    'flutter',
    ['build', 'ios', '--simulator'],
    workingDirectory: '..',
  );

  if (buildResult.exitCode != 0) {
    print('❌ Build failed:');
    print(buildResult.stderr);
    exit(1);
  }

  print('✅ App built successfully!');
  print('\n🚀 Setup complete! You can now run tests with:');
  print('   dart test');
  print('   dart test -t "Email Authentication Flow"');
  print('   dart test -t "Phone Authentication Flow"');
}