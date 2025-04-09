# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Environment Setup
- Required env vars: PARA_API_KEY, PARA_ENVIRONMENT
- Testing requires setting these vars in Xcode scheme or Example.xctestplan

## Code Style Guidelines
- **Naming**: Use camelCase for variables/functions, PascalCase for types/protocols
- **Imports**: Group imports with SwiftUI/Foundation first, then third-party (ParaSwift), then project-specific
- **Error Handling**: Use do-catch blocks with specific error messages
- **Logging**: Use os.Logger for logging with appropriate subsystem/category
- **Accessibility**: Include accessibilityIdentifier for UI elements used in tests
- **Comments**: Use MARK comments to organize code sections
- **StateObjects**: Use @StateObject for view model creation, @EnvironmentObject for passing dependencies
- **Testing**: Tests should be self-contained, include appropriate waiting periods for UI operations

When adding new files, follow existing patterns in similar files.