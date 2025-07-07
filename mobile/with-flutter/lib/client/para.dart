import 'package:para/para.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../config/para_config.dart';

// Para Configuration
final config = ParaConfiguration(
  apiKey: dotenv.env['PARA_API_KEY'] ?? 'YOUR_API_KEY_HERE',  // Get from: http://developer.getpara.com
  environment: dotenv.env['PARA_ENV'] == 'sandbox' ? Environment.sandbox : Environment.beta,
);

// Initialize Para using configuration
final para = Para.fromConfig(
  config: config.toParaConfig(),
  appScheme: 'com.usecapsule.example.flutter',  // Uses bundle ID as app scheme
);

// External wallet connectors
final phantomConnector = ParaPhantomConnector(para: para, appUrl: "https://usecapsule.com", appScheme: "paraflutter");

final metamaskConnector = ParaMetaMaskConnector(para: para, appUrl: "https://usecapsule.com", appScheme: "paraflutter");
