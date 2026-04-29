import 'package:flutter_dotenv/flutter_dotenv.dart';

/// Configuration for the Account Abstraction (Alchemy) demo.
///
/// Credentials live in the `.env` file. See `.env.example` for required keys.
class AlchemyConfig {
  /// Alchemy API key used to talk to Alchemy's AA infrastructure.
  static String get apiKey => dotenv.env['ALCHEMY_API_KEY'] ?? '';

  /// Gas Manager policy ID used to sponsor user operations.
  static String get gasPolicyId => dotenv.env['ALCHEMY_GAS_POLICY_ID'] ?? '';

  /// Ethereum Sepolia testnet chain id.
  static const int sepoliaChainId = 11155111;

  /// Arbitrary burn address used as the destination for the demo transaction.
  static const String burnAddress = '0x000000000000000000000000000000000000dEaD';

  /// Sepolia block explorer base URL — used to link to a sent transaction.
  static const String sepoliaExplorerBaseUrl = 'https://sepolia.etherscan.io';

  static bool get isConfigured => apiKey.isNotEmpty;
}
