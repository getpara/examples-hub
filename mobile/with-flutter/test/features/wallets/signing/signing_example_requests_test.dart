import 'package:flutter_test/flutter_test.dart';
import 'package:para/para.dart';
import 'package:para_flutter/features/wallets/signing/cosmos_signing_examples.dart';
import 'package:para_flutter/features/wallets/signing/evm_signing_examples.dart';
import 'package:para_flutter/features/wallets/signing/signing_example.dart';
import 'package:para_flutter/features/wallets/signing/solana_signing_examples.dart';
import 'package:para_flutter/features/wallets/signing/stellar_signing_examples.dart';
import 'package:para_flutter/features/wallets/signing/sui_signing_examples.dart';

void main() {
  test('EVM examples use typed messages, authorizations, and transaction types 0 through 2',
      () async {
    final client = RecordingSigningClient();
    final actions = EvmSigningExamples.build(client: client, wallet: evmWallet);

    await action(actions, 'evm-message-eip712').sign();
    expect(client.messages.single.message, isA<EVMTypedDataMessage>());

    await action(actions, 'evm-message-eip7702').sign();
    expect(client.messages.last.message, isA<EVMAuthorizationMessage>());

    for (var type = 0; type <= 2; type++) {
      await action(actions, 'evm-transaction-type$type').sign();
      expect(
          (client.transactions.last.transaction as EVMTransaction).type, type);
    }
  });

  test(
      'Solana examples preserve raw bytes and distinguish legacy from v0 input',
      () async {
    final client = RecordingSigningClient();
    final actions =
        SolanaSigningExamples.build(client: client, wallet: solanaWallet);

    await action(actions, 'solana-message-raw').sign();
    expect(client.messages.single.message, isA<RawBridgeMessage>());

    await action(actions, 'solana-transaction-structured')
        .sign(input: '11111111111111111111111111111111');
    expect(
      (client.transactions.single.transaction as SolanaTransaction)
          .recentBlockhash,
      '11111111111111111111111111111111',
    );

    await action(actions, 'solana-transaction-legacy')
        .sign(input: 'legacy-base64');
    await action(actions, 'solana-transaction-v0').sign(input: 'v0-base64');
    expect(
      client.transactions.skip(1).map(
          (request) => (request.transaction as SerializedTransaction).data),
      ['legacy-base64', 'v0-base64'],
    );
  });

  test('Cosmos examples preserve Direct and Amino signing modes', () async {
    final client = RecordingSigningClient();
    final actions =
        CosmosSigningExamples.build(client: client, wallet: cosmosWallet);

    await action(actions, 'cosmos-transaction-direct').sign();
    await action(actions, 'cosmos-transaction-amino').sign();
    expect(
      client.transactions
          .take(2)
          .map((request) => (request.transaction as CosmosTransaction).format),
      ['proto', 'amino'],
    );
    expect(client.transactions.first.chainId, 'provider');

    await action(actions, 'cosmos-transaction-serialized-direct')
        .sign(input: 'direct-base64');
    await action(actions, 'cosmos-transaction-serialized-amino')
        .sign(input: 'amino-base64');
    expect(
      client.transactions.skip(2).map((request) =>
          (request.transaction as SerializedTransaction).cosmosSignMode),
      [CosmosSignMode.direct, CosmosSignMode.amino],
    );
  });

  test('Stellar examples expose raw, Soroban authorization, and XDR envelopes',
      () async {
    final client = RecordingSigningClient();
    final actions =
        StellarSigningExamples.build(client: client, wallet: stellarWallet);

    await action(actions, 'stellar-message-raw').sign();
    await action(actions, 'stellar-message-soroban-auth').sign();
    expect(client.messages[0].message, isA<RawBridgeMessage>());
    expect(client.messages[1].message, isA<StellarAuthEntryMessage>());

    for (final id in [
      'stellar-transaction-xdr',
      'stellar-transaction-fee-bump-xdr',
      'stellar-transaction-soroban-xdr',
    ]) {
      await action(actions, id).sign(input: '$id-base64');
    }
    expect(
      client.transactions
          .map((request) =>
              (request.transaction as SerializedTransaction).chainType)
          .toSet(),
      {BridgeChainType.stellar},
    );
  });

  test('Sui examples use personal-message and transaction intents', () async {
    final client = RecordingSigningClient();
    final actions = SuiSigningExamples.build(client: client, wallet: suiWallet);

    await action(actions, 'sui-message-plain').sign();
    await action(actions, 'sui-message-personal').sign();
    await action(actions, 'sui-transaction-bcs').sign();

    expect(client.messages[0].chainType, BridgeChainType.sui);
    expect(client.messages[1].message, isA<SuiPersonalMessage>());
    expect(
        client.transactions.single.transaction, isA<SerializedTransaction>());
  });
}

SigningExampleAction action(List<SigningExampleAction> actions, String id) =>
    actions.singleWhere((example) => example.definition.id == id);

final evmWallet = Wallet.fromMap({
  'id': 'evm-wallet',
  'type': 'EVM',
  'address': '0x0000000000000000000000000000000000000770',
});

final solanaWallet = Wallet.fromMap({
  'id': 'solana-wallet',
  'type': 'SOLANA',
  'address': '11111111111111111111111111111111',
});

final cosmosWallet = Wallet.fromMap({
  'id': 'cosmos-wallet',
  'type': 'COSMOS',
  'address': 'cosmos1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqnrql8a',
});

final stellarWallet = Wallet.fromMap({
  'id': 'stellar-wallet',
  'type': 'STELLAR',
  'address': 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
});

final suiWallet = Wallet.fromMap({
  'id': 'sui-wallet',
  'type': 'SUI',
  'address':
      '0x1111111111111111111111111111111111111111111111111111111111111111',
});

class RecordingSigningClient implements SigningExampleClient {
  final messages = <MessageRequest>[];
  final transactions = <TransactionRequest>[];

  @override
  Future<SignatureResult> signMessage({
    required String walletId,
    required Object message,
    BridgeChainType? chainType,
  }) async {
    messages.add((walletId: walletId, message: message, chainType: chainType));
    if (message is EVMAuthorizationMessage) {
      return const SignedAuthorizationResult(
        EVMSignedAuthorization(
          address: '0x0000000000000000000000000000000000000770',
          chainId: 11155111,
          nonce: 0,
          yParity: 0,
          r: '0x01',
          s: '0x02',
        ),
      );
    }
    return SuccessfulSignatureResult('signed-message');
  }

  @override
  Future<SignatureResult> signTransaction({
    required String walletId,
    required Object transaction,
    String? chainId,
    BridgeChainType? chainType,
    String? rpcUrl,
  }) async {
    transactions.add((
      walletId: walletId,
      transaction: transaction,
      chainId: chainId,
      chainType: chainType,
      rpcUrl: rpcUrl,
    ));
    return SuccessfulSignatureResult('signed-transaction');
  }
}

typedef MessageRequest = ({
  String walletId,
  Object message,
  BridgeChainType? chainType
});
typedef TransactionRequest = ({
  String walletId,
  Object transaction,
  String? chainId,
  BridgeChainType? chainType,
  String? rpcUrl,
});
