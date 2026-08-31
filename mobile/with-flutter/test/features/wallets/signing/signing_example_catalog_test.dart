import 'package:flutter_test/flutter_test.dart';
import 'package:para_flutter/features/wallets/signing/cosmos_signing_examples.dart';
import 'package:para_flutter/features/wallets/signing/evm_signing_examples.dart';
import 'package:para_flutter/features/wallets/signing/signing_example.dart';
import 'package:para_flutter/features/wallets/signing/solana_signing_examples.dart';
import 'package:para_flutter/features/wallets/signing/stellar_signing_examples.dart';
import 'package:para_flutter/features/wallets/signing/sui_signing_examples.dart';

void main() {
  test('publishes the complete EVM signing matrix', () {
    expectExampleIds(
      EvmSigningExamples.definitions,
      const [
        'evm-message-plain',
        'evm-message-eip712',
        'evm-message-eip7702',
        'evm-transaction-type0',
        'evm-transaction-type1',
        'evm-transaction-type2',
      ],
    );
  });

  test('publishes the complete Solana signing matrix', () {
    expectExampleIds(
      SolanaSigningExamples.definitions,
      const [
        'solana-message-plain',
        'solana-message-raw',
        'solana-transaction-structured',
        'solana-transaction-legacy',
        'solana-transaction-v0',
      ],
    );
  });

  test('publishes the complete Cosmos signing matrix', () {
    expectExampleIds(
      CosmosSigningExamples.definitions,
      const [
        'cosmos-message-adr036',
        'cosmos-transaction-direct',
        'cosmos-transaction-amino',
        'cosmos-transaction-serialized-direct',
        'cosmos-transaction-serialized-amino',
      ],
    );
  });

  test('publishes the complete Stellar signing matrix', () {
    expectExampleIds(
      StellarSigningExamples.definitions,
      const [
        'stellar-message-plain',
        'stellar-message-raw',
        'stellar-message-soroban-auth',
        'stellar-transaction-payment',
        'stellar-transaction-xdr',
        'stellar-transaction-fee-bump-xdr',
        'stellar-transaction-soroban-xdr',
      ],
    );
  });

  test('publishes the complete Sui signing matrix', () {
    expectExampleIds(
      SuiSigningExamples.definitions,
      const [
        'sui-message-plain',
        'sui-message-personal',
        'sui-transaction-bcs',
      ],
    );
  });

  test('every example has customer-facing guidance and a stable automation key',
      () {
    final definitions = [
      ...EvmSigningExamples.definitions,
      ...SolanaSigningExamples.definitions,
      ...CosmosSigningExamples.definitions,
      ...StellarSigningExamples.definitions,
      ...SuiSigningExamples.definitions,
    ];

    expect(definitions, hasLength(26));
    expect(definitions.map((example) => example.id).toSet(), hasLength(26));
    for (final definition in definitions) {
      expect(definition.title, isNotEmpty);
      expect(definition.description, isNotEmpty);
      expect(
        definition.operation,
        anyOf(SigningOperation.message, SigningOperation.transaction),
      );
    }
  });
}

void expectExampleIds(
  List<SigningExampleDefinition> definitions,
  List<String> expectedIds,
) {
  expect(definitions.map((definition) => definition.id), expectedIds);
}
