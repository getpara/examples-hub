import 'dart:convert';

import 'package:para/para.dart';

import 'signing_example.dart';

abstract final class SolanaSigningExamples {
  static const definitions = <SigningExampleDefinition>[
    SigningExampleDefinition(
      id: 'solana-message-plain',
      title: 'Plain message',
      description: 'Signs the UTF-8 bytes of a message.',
      operation: SigningOperation.message,
    ),
    SigningExampleDefinition(
      id: 'solana-message-raw',
      title: 'Raw message bytes',
      description:
          'Signs caller-provided base64 bytes without UTF-8 conversion.',
      operation: SigningOperation.message,
    ),
    SigningExampleDefinition(
      id: 'solana-transaction-structured',
      title: 'Structured legacy transfer',
      description:
          'Builds a legacy transfer using a recent blockhash from your Solana RPC.',
      operation: SigningOperation.transaction,
    ),
    SigningExampleDefinition(
      id: 'solana-transaction-legacy',
      title: 'Serialized legacy transaction',
      description: 'Signs a canonical base64 legacy transaction or message.',
      operation: SigningOperation.transaction,
    ),
    SigningExampleDefinition(
      id: 'solana-transaction-v0',
      title: 'Serialized v0 transaction',
      description: 'Signs a canonical base64 versioned transaction or message.',
      operation: SigningOperation.transaction,
    ),
  ];

  static List<SigningExampleAction> build({
    required SigningExampleClient client,
    required Wallet wallet,
  }) {
    final walletId = _require(wallet.id, 'wallet ID');
    final address = _require(wallet.address, 'Solana address');

    return [
      SigningExampleAction(
        definition: definitions[0],
        sign: (_) => client.signMessage(
          walletId: walletId,
          message: 'Sign in to the Para Solana example',
          chainType: BridgeChainType.solana,
        ),
      ),
      SigningExampleAction(
        definition: definitions[1],
        sign: (_) => client.signMessage(
          walletId: walletId,
          message: RawBridgeMessage.solana(
              base64Encode(utf8.encode('raw Solana bytes'))),
          chainType: BridgeChainType.solana,
        ),
      ),
      SigningExampleAction(
        definition: definitions[2],
        requiresInput: true,
        inputLabel: 'Recent blockhash (base58)',
        sign: (recentBlockhash) => client.signTransaction(
          walletId: walletId,
          transaction: SolanaTransaction(
            to: address,
            lamports: '1',
            recentBlockhash: recentBlockhash!,
            memo: 'Para structured Solana example',
          ),
          chainType: BridgeChainType.solana,
        ),
      ),
      for (var index = 3; index < definitions.length; index++)
        SigningExampleAction(
          definition: definitions[index],
          requiresInput: true,
          sign: (payload) => client.signTransaction(
            walletId: walletId,
            transaction: SerializedTransaction.solana(payload!),
            chainType: BridgeChainType.solana,
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
