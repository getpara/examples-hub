import 'package:flutter_test/flutter_test.dart';
import 'package:para/para.dart';
import 'package:para_flutter/features/wallets/models/wallet_model.dart';

void main() {
  test('maps every Bridge chain type to a customer-facing chain', () {
    expect(
      BridgeChainType.values.map((type) => type.toChain),
      const [
        WalletChain.evm,
        WalletChain.solana,
        WalletChain.cosmos,
        WalletChain.stellar,
        WalletChain.sui,
      ],
    );
  });

  test('shows the canonical Sui address instead of the shared Ed25519 address',
      () {
    final wallet = Wallet.fromMap({
      'id': 'sui-wallet',
      'type': 'SUI',
      'address': '11111111111111111111111111111111',
      'addressSui':
          '0x1111111111111111111111111111111111111111111111111111111111111111',
    });

    expect(wallet.formattedAddress, '0x111111...111111');
  });

  test('does not truncate the missing Sui address guidance', () {
    final wallet = Wallet.fromMap({
      'id': 'sui-wallet',
      'type': 'SUI',
      'address': '11111111111111111111111111111111',
    });

    expect(wallet.formattedAddress, 'Sui address unavailable');
  });
}
