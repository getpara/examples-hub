import 'package:para_flutter/examples/signing/cosmos_sign_example.dart';
import 'package:para_flutter/examples/signing/evm_sign_example.dart';
import 'package:para_flutter/examples/signing/solana_sign_example.dart';
import 'package:flutter/material.dart';
import 'package:para/para.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class DemoTransactions extends StatelessWidget {
  final List<Wallet> wallets;

  const DemoTransactions({
    super.key,
    required this.wallets,
  });

  void _navigateToSigningExample(BuildContext context, WalletType type) {
    final walletsForType = wallets.where((w) => w.type == type).toList();

    if (walletsForType.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('No ${type.value} wallet available')),
      );
      return;
    }

    Widget screen;
    switch (type) {
      case WalletType.evm:
        screen = EvmSignExample(wallet: walletsForType.first);
        break;
      case WalletType.solana:
        screen = SolanaSignExample(wallet: walletsForType.first);
        break;
      case WalletType.cosmos:
        screen = CosmosSignExample(wallet: walletsForType.first);
        break;
    }

    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => screen),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Transaction Examples'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'Select Chain Type',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Choose a chain to view signing examples using your wallet.',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.black87,
                ),
              ),
              const SizedBox(height: 32),
              _buildChainOption(
                context: context,
                type: WalletType.evm,
                title: 'EVM Transactions',
                description: 'Sign Ethereum-compatible transactions and messages',
                icon: FontAwesomeIcons.ethereum,
              ),
              const SizedBox(height: 16),
              _buildChainOption(
                context: context,
                type: WalletType.solana,
                title: 'Solana Transactions',
                description: 'Sign Solana transactions and messages',
                icon: FontAwesomeIcons.ethereum,
              ),
              const SizedBox(height: 16),
              _buildChainOption(
                context: context,
                type: WalletType.cosmos,
                title: 'Cosmos Transactions',
                description: 'Sign Cosmos transactions and messages',
                icon: FontAwesomeIcons.ethereum,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildChainOption({
    required BuildContext context,
    required WalletType type,
    required String title,
    required String description,
    required IconData icon,
  }) {
    final hasWallet = wallets.any((w) => w.type == type);

    return Card(
      child: InkWell(
        onTap: hasWallet ? () => _navigateToSigningExample(context, type) : null,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: hasWallet
                      ? Theme.of(context).colorScheme.primaryContainer
                      : Theme.of(context).disabledColor.withAlpha(26),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  icon,
                  size: 24,
                  color: hasWallet ? Theme.of(context).colorScheme.primary : Theme.of(context).disabledColor,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                        color: hasWallet ? Theme.of(context).colorScheme.onSurface : Theme.of(context).disabledColor,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      description,
                      style: TextStyle(
                        fontSize: 14,
                        color: hasWallet
                            ? Theme.of(context).colorScheme.onSurfaceVariant
                            : Theme.of(context).disabledColor,
                      ),
                    ),
                    if (!hasWallet) ...[
                      const SizedBox(height: 8),
                      Text(
                        'Create a ${type.value} wallet first',
                        style: TextStyle(
                          fontSize: 12,
                          color: Theme.of(context).colorScheme.error,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              if (hasWallet)
                Icon(
                  Icons.arrow_forward_ios,
                  size: 16,
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
            ],
          ),
        ),
      ),
    );
  }
}
