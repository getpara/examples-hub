import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'theme/app_theme.dart';
import 'app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: ".env");
  runApp(const ParaDemoApp());
}

class ParaDemoApp extends StatelessWidget {
  const ParaDemoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Para',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: const ParaApp(),
    );
  }
}
