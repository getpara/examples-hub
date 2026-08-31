import 'dart:convert';

import 'package:para/para.dart';

import 'signing_example.dart';

abstract final class SuiSigningExamples {
  static const definitions = <SigningExampleDefinition>[
    SigningExampleDefinition(
      id: 'sui-message-plain',
      title: 'Plain personal message',
      description: 'Signs UTF-8 text with the Sui personal-message intent.',
      operation: SigningOperation.message,
    ),
    SigningExampleDefinition(
      id: 'sui-message-personal',
      title: 'Personal message bytes',
      description:
          'Signs caller-provided base64 bytes with the Sui personal-message intent.',
      operation: SigningOperation.message,
    ),
    SigningExampleDefinition(
      id: 'sui-transaction-bcs',
      title: 'Serialized BCS transaction',
      description:
          'Signs canonical base64 BCS transaction bytes with the Sui transaction intent.',
      operation: SigningOperation.transaction,
    ),
  ];

  static const _sampleTransaction =
      'AAABAAgBAAAAAAAAAAECAAEBAAAREREREREREREREREREREREREREREREREREREREREREQEiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIgEAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEREREREREREREREREREREREREREREREREREREREREREBAAAAAAAAAEBCDwAAAAAAAA==';

  static List<SigningExampleAction> build({
    required SigningExampleClient client,
    required Wallet wallet,
  }) {
    final walletId = _require(wallet.id, 'wallet ID');

    return [
      SigningExampleAction(
        definition: definitions[0],
        sign: (_) => client.signMessage(
          walletId: walletId,
          message: 'Sign in to the Para Sui example',
          chainType: BridgeChainType.sui,
        ),
      ),
      SigningExampleAction(
        definition: definitions[1],
        sign: (_) => client.signMessage(
          walletId: walletId,
          message: SuiPersonalMessage(
              base64Encode(utf8.encode('Sui personal-message bytes'))),
          chainType: BridgeChainType.sui,
        ),
      ),
      SigningExampleAction(
        definition: definitions[2],
        requiresInput: true,
        initialInput: _sampleTransaction,
        sign: (payload) => client.signTransaction(
          walletId: walletId,
          transaction: SerializedTransaction.sui(payload!),
          chainType: BridgeChainType.sui,
        ),
      ),
    ];
  }

  static String _require(String? value, String label) {
    if (value == null || value.isEmpty) {
      throw StateError('The wallet has no $label.');
    }
    return value;
  }
}
