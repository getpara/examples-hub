# Mobile Examples

Native and cross-platform mobile application examples.

## Folder Structure

```
mobile/
├── with-expo-one-click-login/   # Expo with one-click login flow
├── with-react-native/           # React Native (bare workflow)
├── with-flutter/                # Flutter (Dart)
└── with-swift/                  # Native Swift (iOS)
```

## Examples

| Example | Framework | Platform | Description |
|---------|-----------|----------|-------------|
| `with-expo-one-click-login` | Expo | iOS, Android | One-click login with passkeys |
| `with-react-native` | React Native | iOS, Android | Bare React Native workflow |
| `with-flutter` | Flutter | iOS, Android | Cross-platform Flutter app |
| `with-swift` | Swift | iOS | Native iOS implementation |

## Quick Start

### Expo
```bash
cd with-expo-one-click-login
yarn install
npx expo start
```

### React Native
```bash
cd with-react-native
yarn install
npx pod-install  # iOS only
yarn ios  # or yarn android
```

### Flutter
```bash
cd with-flutter
flutter pub get
flutter run
```

### Swift
Open `with-swift/example.xcodeproj` in Xcode and run.

Each example has its own README with detailed setup instructions.
