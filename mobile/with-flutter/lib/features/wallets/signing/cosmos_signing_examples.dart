import 'package:para/para.dart';

import 'signing_example.dart';

abstract final class CosmosSigningExamples {
  static const definitions = <SigningExampleDefinition>[
    SigningExampleDefinition(
      id: 'cosmos-message-adr036',
      title: 'ADR-036 message',
      description:
          'Signs a plain message using the Cosmos ADR-036 sign document.',
      operation: SigningOperation.message,
    ),
    SigningExampleDefinition(
      id: 'cosmos-transaction-direct',
      title: 'Structured Direct transaction',
      description: 'Builds and signs a protobuf SIGN_MODE_DIRECT transfer.',
      operation: SigningOperation.transaction,
    ),
    SigningExampleDefinition(
      id: 'cosmos-transaction-amino',
      title: 'Structured Amino transaction',
      description: 'Builds and signs a legacy Amino JSON transfer.',
      operation: SigningOperation.transaction,
    ),
    SigningExampleDefinition(
      id: 'cosmos-transaction-serialized-direct',
      title: 'Serialized Direct SignDoc',
      description: 'Signs canonical protobuf SignDoc bytes supplied as base64.',
      operation: SigningOperation.transaction,
    ),
    SigningExampleDefinition(
      id: 'cosmos-transaction-serialized-amino',
      title: 'Serialized Amino sign document',
      description:
          'Signs a canonical Amino JSON sign document supplied as base64.',
      operation: SigningOperation.transaction,
    ),
  ];

  static List<SigningExampleAction> build({
    required SigningExampleClient client,
    required Wallet wallet,
  }) {
    final walletId = _require(wallet.id, 'wallet ID');
    final address =
        _require(wallet.addressSecondary ?? wallet.address, 'Cosmos address');
    const chainId = 'provider';

    return [
      SigningExampleAction(
        definition: definitions[0],
        sign: (_) => client.signMessage(
          walletId: walletId,
          message: 'Sign in to the Para Cosmos example',
          chainType: BridgeChainType.cosmos,
        ),
      ),
      SigningExampleAction(
        definition: definitions[1],
        sign: (_) => client.signTransaction(
          walletId: walletId,
          transaction: CosmosTransaction(
            to: address,
            amount: '1',
            denom: 'uatom',
            memo: 'Para Direct example',
            gasLimit: '200000',
            gasPrice: '5000',
            sequence: 0,
            accountNumber: 0,
            chainId: chainId,
            format: 'proto',
          ),
          chainId: chainId,
          chainType: BridgeChainType.cosmos,
        ),
      ),
      SigningExampleAction(
        definition: definitions[2],
        sign: (_) => client.signTransaction(
          walletId: walletId,
          transaction: CosmosTransaction(
            to: address,
            amount: '1',
            denom: 'uatom',
            memo: 'Para Amino example',
            gasLimit: '200000',
            gasPrice: '5000',
            sequence: 0,
            accountNumber: 0,
            chainId: chainId,
            format: 'amino',
          ),
          chainId: chainId,
          chainType: BridgeChainType.cosmos,
        ),
      ),
      SigningExampleAction(
        definition: definitions[3],
        requiresInput: true,
        sign: (payload) => client.signTransaction(
          walletId: walletId,
          transaction: SerializedTransaction.cosmos(
            data: payload!,
            signMode: CosmosSignMode.direct,
          ),
          chainType: BridgeChainType.cosmos,
        ),
      ),
      SigningExampleAction(
        definition: definitions[4],
        requiresInput: true,
        sign: (payload) => client.signTransaction(
          walletId: walletId,
          transaction: SerializedTransaction.cosmos(
            data: payload!,
            signMode: CosmosSignMode.amino,
          ),
          chainType: BridgeChainType.cosmos,
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
