# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- Install dependencies: `flutter pub get`
- Run application: `flutter run`
- Build Android: `flutter build apk`
- Build iOS: `flutter build ios`
- Format code: `flutter format .`
- Lint code: `flutter analyze`
- Run tests: `flutter test`
- Run single test: `flutter test test/path_to_test.dart`

## Code Style Guidelines
- Follow standard Flutter/Dart style conventions as defined in analysis_options.yaml
- File organization: client/, examples/, theme/, util/, widgets/, assets/
- Use named parameters for clarity in function calls
- Maintain null safety with proper usage of `?`, `!` operators
- Implement proper error handling with try/catch blocks
- Dispose resources properly in StatefulWidget dispose() methods
- Use descriptive error messages when logging errors
- Follow consistent widget spacing patterns
- Prefix private methods/variables with underscore (_)
- Keep code modular and reusable when possible