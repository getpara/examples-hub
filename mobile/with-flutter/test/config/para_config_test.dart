import 'package:flutter_test/flutter_test.dart';
import 'package:para/para.dart';
import 'package:para_flutter/config/para_config.dart';

void main() {
  test('DEV configuration pins the local Bridge and relying party', () {
    final configuration = ParaConfiguration.fromValues({
      'PARA_API_KEY': 'local-api-key',
      'PARA_ENV': 'dev',
      'PARA_BRIDGE_URL': 'http://localhost:5173',
      'PARA_RELYING_PARTY_ID': 'localhost',
    });
    final sdkConfig = configuration.toParaConfig();

    expect(configuration.environment, Environment.dev);
    expect(sdkConfig.jsBridgeUri.toString(), 'http://localhost:5173');
    expect(sdkConfig.relyingPartyId, 'localhost');
  });

  test('rejects a DEV configuration that omits its local routing values', () {
    expect(
      () => ParaConfiguration.fromValues({
        'PARA_API_KEY': 'local-api-key',
        'PARA_ENV': 'dev',
      }),
      throwsArgumentError,
    );
  });

  test('keeps hosted environments on their SDK defaults', () {
    final configuration = ParaConfiguration.fromValues({
      'PARA_API_KEY': 'sandbox-api-key',
      'PARA_ENV': 'sandbox',
    });
    final sdkConfig = configuration.toParaConfig();

    expect(configuration.environment, Environment.sandbox);
    expect(sdkConfig.jsBridgeUri, isNull);
    expect(sdkConfig.relyingPartyId, isNull);
  });
}
