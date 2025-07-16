import 'package:flutter/material.dart';
import '../../../client/para.dart';

class WalletManagementCard extends StatefulWidget {
  final VoidCallback? onRefresh;

  const WalletManagementCard({
    super.key,
    this.onRefresh,
  });

  @override
  State<WalletManagementCard> createState() => _WalletManagementCardState();
}

class _WalletManagementCardState extends State<WalletManagementCard> {
  bool _isLoading = false;

  Future<void> _checkSession() async {
    setState(() => _isLoading = true);
    try {
      final user = await para.currentUser();
      if (mounted) {
        _showResult(
          'Session Status',
          'User ID: ${user.userId}\nLogged In: ${user.isLoggedIn}',
        );
      }
    } catch (e) {
      if (mounted) {
        _showResult('Error', 'Failed to check session: $e');
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _fetchWallets() async {
    setState(() => _isLoading = true);
    try {
      final wallets = await para.fetchWallets();
      if (mounted) {
        final walletInfo = wallets
            .map((w) => '${w.type?.value ?? "Unknown"}: ${w.address ?? "No address"}')
            .join('\n');
        _showResult(
          'Wallets (${wallets.length})',
          walletInfo.isEmpty ? 'No wallets found' : walletInfo,
        );
        widget.onRefresh?.call();
      }
    } catch (e) {
      if (mounted) {
        _showResult('Error', 'Failed to fetch wallets: $e');
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _showResult(String title, String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Theme.of(context).colorScheme.surface,
        title: Text(title),
        content: SingleChildScrollView(
          child: Text(message),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 5,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Wallet Management',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: Theme.of(context).colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _checkSession,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.grey[300],
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: const Text('Check Session'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _fetchWallets,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.grey[300],
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: const Text('Fetch Wallets'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}