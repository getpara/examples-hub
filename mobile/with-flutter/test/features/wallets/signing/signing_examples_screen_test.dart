import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:para/para.dart';
import 'package:para_flutter/features/wallets/signing/signing_example.dart';
import 'package:para_flutter/features/wallets/signing/signing_examples_screen.dart';

void main() {
  testWidgets('organizes EVM signing examples into messages and transactions',
      (tester) async {
    final wallet = Wallet.fromMap({
      'id': 'evm-wallet',
      'type': 'EVM',
      'address': '0x0000000000000000000000000000000000000770',
    });

    await tester.pumpWidget(
      MaterialApp(
        home: SigningExamplesScreen(
          wallet: wallet,
          client: _UnusedSigningClient(),
        ),
      ),
    );

    expect(find.byKey(const Key('signingExamplesScreen')), findsOneWidget);
    expect(find.byKey(const Key('signingExamplesNotice')), findsOneWidget);
    expect(find.text('Messages'), findsOneWidget);
    expect(find.byKey(const Key('evm-message-plain')), findsOneWidget);
    await tester.scrollUntilVisible(find.text('Transactions'), 300);
    expect(find.text('Transactions'), findsOneWidget);
  });

  testWidgets('makes the Sui BCS signing path directly runnable',
      (tester) async {
    final wallet = Wallet.fromMap({
      'id': 'sui-wallet',
      'type': 'SUI',
      'address':
          '0x1111111111111111111111111111111111111111111111111111111111111111',
    });

    await tester.pumpWidget(
      MaterialApp(
        home: SigningExamplesScreen(
          wallet: wallet,
          client: _UnusedSigningClient(),
        ),
      ),
    );
    await tester.scrollUntilVisible(
      find.byKey(const Key('sui-transaction-bcs')),
      300,
    );

    expect(find.byKey(const Key('sui-transaction-bcs-input')), findsOneWidget);
    expect(find.byKey(const Key('sui-transaction-bcs')), findsOneWidget);
  });

  testWidgets('renders missing wallet data as an actionable error state',
      (tester) async {
    final wallet = Wallet.fromMap({
      'id': 'solana-wallet',
      'type': 'SOLANA',
    });

    await tester.pumpWidget(
      MaterialApp(
        home: SigningExamplesScreen(
          wallet: wallet,
          client: _UnusedSigningClient(),
        ),
      ),
    );

    expect(find.text('Signing examples unavailable'), findsOneWidget);
    expect(find.textContaining('Solana address'), findsOneWidget);
  });

  testWidgets('rejects a Stellar wallet without a canonical G-address',
      (tester) async {
    final wallet = Wallet.fromMap({
      'id': 'stellar-wallet',
      'type': 'STELLAR',
    });

    await tester.pumpWidget(
      MaterialApp(
        home: SigningExamplesScreen(
          wallet: wallet,
          client: _UnusedSigningClient(),
        ),
      ),
    );

    expect(find.text('Signing examples unavailable'), findsOneWidget);
    expect(find.textContaining('Stellar address'), findsOneWidget);
  });

  testWidgets('asks for a real recent blockhash for structured Solana signing',
      (tester) async {
    final wallet = Wallet.fromMap({
      'id': 'solana-wallet',
      'type': 'SOLANA',
      'address': '11111111111111111111111111111111',
    });

    await tester.pumpWidget(
      MaterialApp(
        home: SigningExamplesScreen(
          wallet: wallet,
          client: _UnusedSigningClient(),
        ),
      ),
    );
    await tester.scrollUntilVisible(
      find.byKey(const Key('solana-transaction-structured-input')),
      300,
      scrollable: find.byType(Scrollable).first,
    );

    expect(find.text('Recent blockhash (base58)'), findsOneWidget);
  });
}

class _UnusedSigningClient implements SigningExampleClient {
  @override
  Future<SignatureResult> signMessage({
    required String walletId,
    required Object message,
    BridgeChainType? chainType,
  }) =>
      throw UnimplementedError();

  @override
  Future<SignatureResult> signTransaction({
    required String walletId,
    required Object transaction,
    String? chainId,
    BridgeChainType? chainType,
    String? rpcUrl,
  }) =>
      throw UnimplementedError();
}
