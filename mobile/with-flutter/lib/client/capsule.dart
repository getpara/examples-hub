import 'package:capsule/capsule.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

final environment = dotenv.env['ENVIRONMENT'] ?? 'beta';

final apiKey = environment == 'sandbox'
    ? dotenv.env['CAPSULE_SANDBOX_API_KEY'] ?? (throw Exception('CAPSULE_SANDBOX_API_KEY not found in .env file'))
    : dotenv.env['CAPSULE_BETA_API_KEY'] ?? (throw Exception('CAPSULE_BETA_API_KEY not found in .env file'));

final capsuleClient = Capsule(
  environment: environment == 'sandbox' ? Environment.sandbox : Environment.beta,
  apiKey: apiKey,
);
