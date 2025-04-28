import 'package:para_flutter/widgets/demo_transactions.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:para/para.dart';
import 'package:para_flutter/client/para.dart';
import 'package:para_flutter/widgets/demo_auth_selector.dart';

class DemoHome extends StatefulWidget {
  const DemoHome({super.key});

  @override
  State<DemoHome> createState() => _DemoHomeState();
}

class _DemoHomeState extends State<DemoHome> {
  bool _isLoading = false;
  List<Wallet> _wallets = [];
  final Map<WalletType, bool> _creatingWallet = {};

  @override
  void initState() {
    super.initState();
    _loadWallets();
  }

  Future<void> _loadWallets() async {
    setState(() => _isLoading = true);
    try {
      final wallets = await para.fetchWallets();
      setState(() => _wallets = wallets);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading wallets: ${e.toString()}')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _createWallet(WalletType type) async {
    setState(() => _creatingWallet[type] = true);
    try {
      await para.createWallet(
        type: type,
        skipDistribute: false,
      );
      await _loadWallets();

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Successfully created ${type.value} wallet')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error creating wallet: ${e.toString()}')),
      );
    } finally {
      if (mounted) setState(() => _creatingWallet[type] = false);
    }
  }

  Future<void> _logout() async {
    try {
      await para.logout();
      setState(() {
        _wallets = []; // Clear wallets on logout
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Successfully logged out')),
        );
        // Navigate back to DemoAuthSelector and remove all previous routes
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (context) => const DemoAuthSelector()),
          (Route<dynamic> route) => false, // Remove all routes
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error logging out: ${e.toString()}')),
        );
      }
    }
  }

  Future<void> _copyAddress(String address) async {
    await Clipboard.setData(ClipboardData(text: address));
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Address copied to clipboard')),
    );
  }

  Widget _buildWalletSection(WalletType type) {
    final walletForType = _wallets.where((w) => w.type == type).toList();
    final hasWallet = walletForType.isNotEmpty;
    final wallet = hasWallet ? walletForType.first : null;
    final isCreating = _creatingWallet[type] ?? false;

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(
                  '${type.value} Wallet',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                if (hasWallet && wallet?.scheme?.value != null) ...[
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: Theme.of(context).colorScheme.primaryContainer,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      wallet!.scheme!.value,
                      style: TextStyle(
                        fontSize: 12,
                        color: Theme.of(context).colorScheme.onPrimaryContainer,
                      ),
                    ),
                  ),
                ],
              ],
            ),
            const SizedBox(height: 16),
            if (hasWallet && wallet?.address != null)
              Row(
                children: [
                  Expanded(
                    child: Text(
                      type == WalletType.cosmos &&
                              wallet!.addressSecondary != null
                          ? wallet.addressSecondary!
                          : wallet!.address!,
                      style: const TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 14,
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.copy),
                    onPressed: () => _copyAddress(
                      type == WalletType.cosmos &&
                              wallet.addressSecondary != null
                          ? wallet.addressSecondary!
                          : wallet.address!,
                    ),
                    tooltip: 'Copy address',
                  ),
                ],
              )
            else
              ElevatedButton(
                onPressed: isCreating ? null : () => _createWallet(type),
                child: isCreating
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : Text('Create ${type.value} Wallet'),
              ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Your Wallets'),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Logout',
            onPressed: _logout,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SafeArea(
              child: Column(
                children: [
                  Expanded(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          ...WalletType.values.map(_buildWalletSection),
                        ],
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(24),
                    child: ElevatedButton(
                      onPressed: _wallets.isEmpty
                          ? null
                          : () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) =>
                                      DemoTransactions(wallets: _wallets),
                                ),
                              );
                            },
                      style: ElevatedButton.styleFrom(
                        minimumSize: const Size.fromHeight(50),
                      ),
                      child: const Text('Send Funds'),
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}
