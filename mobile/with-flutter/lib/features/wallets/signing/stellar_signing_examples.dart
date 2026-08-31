import 'dart:convert';

import 'package:para/para.dart';

import '../models/wallet_model.dart';
import 'signing_example.dart';

abstract final class StellarSigningExamples {
  static const _sorobanAuthorizationPreimage =
      'AAAACc7gMC1ZhE0yvcqRXIID3USzP7t+3BkFHqN6vt8o7NRyAAAAAAAAAAEAAABkAAAAAAAAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQAAAAVoZWxsbwAAAAAAAAAAAAAA';

  static const definitions = <SigningExampleDefinition>[
    SigningExampleDefinition(
      id: 'stellar-message-plain',
      title: 'Plain message',
      description: 'Signs the UTF-8 bytes of a message.',
      operation: SigningOperation.message,
    ),
    SigningExampleDefinition(
      id: 'stellar-message-raw',
      title: 'Raw message bytes',
      description:
          'Signs caller-provided base64 bytes without UTF-8 conversion.',
      operation: SigningOperation.message,
    ),
    SigningExampleDefinition(
      id: 'stellar-message-soroban-auth',
      title: 'Soroban authorization entry',
      description: 'Signs the canonical XDR authorization-entry preimage.',
      operation: SigningOperation.message,
    ),
    SigningExampleDefinition(
      id: 'stellar-transaction-payment',
      title: 'Structured payment',
      description: 'Builds and signs a Stellar payment envelope.',
      operation: SigningOperation.transaction,
    ),
    SigningExampleDefinition(
      id: 'stellar-transaction-xdr',
      title: 'Serialized transaction XDR',
      description:
          'Adds the Para signature to a standard transaction envelope.',
      operation: SigningOperation.transaction,
    ),
    SigningExampleDefinition(
      id: 'stellar-transaction-fee-bump-xdr',
      title: 'Fee-bump transaction XDR',
      description:
          'Signs a fee-bump envelope without changing its inner transaction.',
      operation: SigningOperation.transaction,
    ),
    SigningExampleDefinition(
      id: 'stellar-transaction-soroban-xdr',
      title: 'Soroban transaction XDR',
      description: 'Signs a serialized Soroban host-function transaction.',
      operation: SigningOperation.transaction,
    ),
  ];

  static List<SigningExampleAction> build({
    required SigningExampleClient client,
    required Wallet wallet,
  }) {
    final walletId = _require(wallet.id, 'wallet ID');
    final address = wallet.stellarAddress;
    if (!address.startsWith('G')) {
      throw StateError('The wallet has no Stellar address.');
    }

    return [
      SigningExampleAction(
        definition: definitions[0],
        sign: (_) => client.signMessage(
          walletId: walletId,
          message: 'Sign in to the Para Stellar example',
          chainType: BridgeChainType.stellar,
        ),
      ),
      SigningExampleAction(
        definition: definitions[1],
        sign: (_) => client.signMessage(
          walletId: walletId,
          message: RawBridgeMessage.stellar(
              base64Encode(utf8.encode('raw Stellar bytes'))),
          chainType: BridgeChainType.stellar,
        ),
      ),
      SigningExampleAction(
        definition: definitions[2],
        sign: (_) => client.signMessage(
          walletId: walletId,
          message: const StellarAuthEntryMessage(_sorobanAuthorizationPreimage),
          chainType: BridgeChainType.stellar,
        ),
      ),
      SigningExampleAction(
        definition: definitions[3],
        sign: (_) => client.signTransaction(
          walletId: walletId,
          transaction: StellarTransaction.payment(
            to: address,
            amount: '0.0000001',
            memo: const StellarMemo.text('Para payment example'),
            networkPassphrase: StellarNetwork.testnetPassphrase,
            sequenceNumber: '1',
          ),
          chainType: BridgeChainType.stellar,
        ),
      ),
      for (var index = 4; index < definitions.length; index++)
        SigningExampleAction(
          definition: definitions[index],
          requiresInput: true,
          sign: (payload) => client.signTransaction(
            walletId: walletId,
            transaction: SerializedTransaction.stellar(
              xdr: payload!,
              networkPassphrase: StellarNetwork.testnetPassphrase,
            ),
            chainType: BridgeChainType.stellar,
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
