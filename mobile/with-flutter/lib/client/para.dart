import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:para/para.dart';
import '../config/para_config.dart';
import '../config/deep_link_constants.dart';

// Para Configuration
final config = ParaConfiguration.fromValues(
  dotenv.env.map((key, value) => MapEntry(key, value)),
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
