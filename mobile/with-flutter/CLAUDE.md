# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- Install dependencies: `flutter pub get`
- Run application: `flutter run`
- Build Android: `flutter build apk`
- Build iOS: `flutter build ios`
- Format code: `flutter format .`
- **Lint code: `flutter analyze`** (REQUIRED: Always run and fix issues before completing tasks)
- Run tests: `flutter test`
- Run single test: `flutter test test/path_to_test.dart`
- E2E test setup: `cd test_e2e && dart run tool/setup.dart`
- E2E test run: `cd test_e2e && dart run tool/run_tests.dart`

## Code Style Guidelines
- Follow standard Flutter/Dart style conventions as defined in analysis_options.yaml
- **ALWAYS run `flutter analyze` and fix all issues before completing any task**
- File organization: client/, examples/, theme/, util/, widgets/, assets/
- Use named parameters for clarity in function calls
- Maintain null safety with proper usage of `?`, `!` operators
- Implement proper error handling with try/catch blocks
- Dispose resources properly in StatefulWidget dispose() methods
- Use descriptive error messages when logging errors
- Follow consistent widget spacing patterns
- Prefix private methods/variables with underscore (_)
- Keep code modular and reusable when possible

## E2E Testing
- E2E tests located in `test_e2e/` directory
- Use Dart tool scripts in `test_e2e/tool/` for automation
- Tests use Appium with iOS Simulator for authentication flows
- Setup: `cd test_e2e && dart run tool/setup.dart`
- Run all: `cd test_e2e && dart run tool/run_tests.dart`
- Run specific: `cd test_e2e && dart run tool/run_tests.dart email`