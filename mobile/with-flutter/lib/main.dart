import 'package:flutter/material.dart';
import 'widgets/demo_auth_selector.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'theme/app_theme.dart';

void main() async {
  await dotenv.load(fileName: ".env");
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const CapsuleDemoApp());
}

class CapsuleDemoApp extends StatelessWidget {
  const CapsuleDemoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Capsule SDK Demo',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: const DemoAuthSelector(),
    );
  }
}
