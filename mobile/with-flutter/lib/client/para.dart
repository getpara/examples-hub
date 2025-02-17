import 'package:para/para.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

final environment = dotenv.env['PARA_ENV'] ?? 'beta';
final apiKey = dotenv.env['PARA_API_KEY'] ??
    (throw Exception('PARA_API_KEY not found in .env file'));

final para = Para(
  environment:
      environment == 'sandbox' ? Environment.sandbox : Environment.beta,
  apiKey: apiKey,
);

final phantomConnector = ParaPhantomConnector(
    para: para, appUrl: "https://usecapsule.com", deepLink: "paraflutter");

final metamaskConnector = ParaMetaMaskConnector(
    para: para, appUrl: "https://usecapsule.com", deepLink: "paraflutter");
