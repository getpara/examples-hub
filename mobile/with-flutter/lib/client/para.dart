import 'package:para/para.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../config/para_config.dart';
import '../config/deep_link_constants.dart';

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
  apiKey: dotenv.env['PARA_API_KEY'] ??
      'YOUR_API_KEY_HERE', // Get from: http://developer.getpara.com
  environment: _getEnvironmentFromString(dotenv.env['PARA_ENV']),
);

// Initialize Para using configuration
final sessionPersistence = SessionPersistenceService();

final para = Para.fromConfig(
  config: config.toParaConfig(),
  appScheme: DeepLinkConstants.appScheme,
  sessionPersistence: sessionPersistence,
);

// External wallet connectors
final phantomConnector = ParaPhantomConnector(
  para: para,
  appUrl: "https://com.usecapsule.example.flutter",
  appScheme: DeepLinkConstants.appScheme,
);

final metamaskConnector = ParaMetaMaskConnector(
  para: para,
  appUrl: "https://com.usecapsule.example.flutter",
  appScheme: DeepLinkConstants.appScheme,
  config: const MetaMaskConfig(
    appName: "ParaFlutter",
    appId: "com.usecapsule.example.flutter",
  ),
);
