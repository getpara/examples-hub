import 'package:para/para.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

final environment = dotenv.env['ENVIRONMENT'] ?? 'beta';

final apiKey = environment == 'sandbox'
    ? dotenv.env['PARA_SANDBOX_API_KEY'] ?? (throw Exception('PARA_SANDBOX_API_KEY not found in .env file'))
    : dotenv.env['PARA_BETA_API_KEY'] ?? (throw Exception('PARA_BETA_API_KEY not found in .env file'));

final para = Para(
  environment: environment == 'sandbox' ? Environment.sandbox : Environment.beta,
  apiKey: apiKey,
);
