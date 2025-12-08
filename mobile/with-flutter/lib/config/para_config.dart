import 'dart:io' show Platform;
import 'package:para/para.dart';

/// Configuration for the Para SDK
class ParaConfiguration {
  final String apiKey;
  final Environment environment;

  ParaConfiguration({
    required String apiKey,
    this.environment = Environment.sandbox,
  }) : apiKey = _getApiKey(apiKey);

  /// Checks for PARA_API_KEY environment variable override
  static String _getApiKey(String defaultKey) {
    try {
      final envKey = Platform.environment['PARA_API_KEY'];
      if (envKey != null && envKey.isNotEmpty) {
        return envKey;
      }
    } catch (e) {
      // Platform.environment might not be available in all contexts
      // Fall back to default key
    }
    return defaultKey;
  }

  /// Creates a ParaConfig instance for SDK initialization
  ParaConfig toParaConfig() {
    return ParaConfig(
      apiKey: apiKey,
      environment: environment,
    );
  }
}