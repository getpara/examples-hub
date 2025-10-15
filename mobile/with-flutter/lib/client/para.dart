import 'package:para/para.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../config/para_config.dart';

// Helper function to map environment string to Environment enum
Environment _getEnvironmentFromString(String? envString) {
  switch (envString?.toLowerCase()) {
    case 'sandbox':
      return Environment.sandbox;
    case 'beta':
      return Environment.beta;
    case 'prod':
      return Environment.prod;
    default:
      return Environment.beta; // Default to beta
  }
}

// Para Configuration
final config = ParaConfiguration(
  apiKey: dotenv.env['PARA_API_KEY'] ?? 'YOUR_API_KEY_HERE',  // Get from: http://developer.getpara.com
  environment: _getEnvironmentFromString(dotenv.env['PARA_ENV']),
);

// Initialize Para using configuration
final sessionPersistence = SessionPersistenceService();

final para = Para.fromConfig(
  config: config.toParaConfig(),
  appScheme: 'paraflutter',  // Para app scheme for deep linking
  sessionPersistence: sessionPersistence,
);

// External wallet connectors
final phantomConnector = ParaPhantomConnector(
  para: para,
  appUrl: "https://com.usecapsule.example.flutter",
  appScheme: "paraflutter",
);

final metamaskConnector = ParaMetaMaskConnector(
  para: para,
  appUrl: "https://com.usecapsule.example.flutter",
  appScheme: "paraflutter",
  config: const MetaMaskConfig(
    appName: "ParaFlutter",
    appId: "com.usecapsule.example.flutter",
  ),
);
