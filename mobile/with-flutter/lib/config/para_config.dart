import 'dart:io' show Platform;
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:para/para.dart';

/// Configuration for the Para SDK
class ParaConfiguration {
  final String apiKey;
  final Environment environment;
  final WebUri? jsBridgeUri;
  final String? relyingPartyId;

  ParaConfiguration({
    required String apiKey,
    this.environment = Environment.sandbox,
    this.jsBridgeUri,
    this.relyingPartyId,
  }) : apiKey = _getApiKey(apiKey);

  factory ParaConfiguration.fromValues(Map<String, String> values) {
    final environment = Environment.fromString(
      (values['PARA_ENV'] ?? Environment.sandbox.value).toLowerCase(),
    );
    final apiKey = values['PARA_API_KEY']?.trim();
    if (apiKey == null || apiKey.isEmpty) {
      throw ArgumentError('PARA_API_KEY is required.');
    }

    final bridgeUrl = values['PARA_BRIDGE_URL']?.trim();
    final relyingPartyId = values['PARA_RELYING_PARTY_ID']?.trim();
    if (environment == Environment.dev &&
        (bridgeUrl == null ||
            bridgeUrl.isEmpty ||
            relyingPartyId == null ||
            relyingPartyId.isEmpty)) {
      throw ArgumentError(
        'PARA_BRIDGE_URL and PARA_RELYING_PARTY_ID are required when PARA_ENV=dev.',
      );
    }

    return ParaConfiguration(
      apiKey: apiKey,
      environment: environment,
      jsBridgeUri:
          bridgeUrl == null || bridgeUrl.isEmpty ? null : WebUri(bridgeUrl),
      relyingPartyId: relyingPartyId == null || relyingPartyId.isEmpty
          ? null
          : relyingPartyId,
    );
  }

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
      jsBridgeUri: jsBridgeUri,
      relyingPartyId: relyingPartyId,
    );
  }
}
