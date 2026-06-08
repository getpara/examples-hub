import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:para/para.dart' as para_sdk;
import '../../../../client/para.dart';

class StellarWalletView extends StatefulWidget {
  final para_sdk.Wallet wallet;

  const StellarWalletView({super.key, required this.wallet});

  @override
  State<StellarWalletView> createState() => _StellarWalletViewState();
}

class _StellarWalletViewState extends State<StellarWalletView> {
  String _messageToSign = '';
  bool _isLoading = false;

  String get _stellarAddress {
    final rawAddress = widget.wallet.address;
    if (rawAddress != null && rawAddress.startsWith('G')) {
      return rawAddress;
    }
    final publicKey = widget.wallet.publicKey;
    if (publicKey != null && publicKey.isNotEmpty) {
      try {
        return para_sdk.getStellarAddress(publicKey);
      } catch (_) {}
    }
    if (rawAddress != null && rawAddress.isNotEmpty) {
      try {
        return para_sdk.getStellarAddressFromSolana(rawAddress);
      } catch (_) {}
    }
    return rawAddress ?? '';
  }

  bool get _hasStellarAddress => _stellarAddress.startsWith('G');

  void _showResult(String title, String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _copyAddress() {
    if (!_hasStellarAddress) {
      _showResult('Error', 'No Stellar address to copy');
      return;
    }
    Clipboard.setData(ClipboardData(text: _stellarAddress));
    _showResult('Success', 'Address copied to clipboard');
  }

  Future<void> _signMessage() async {
    if (_messageToSign.isEmpty) {
      _showResult('Error', 'Please enter a message to sign');
      return;
    }

    setState(() => _isLoading = true);
    final startTime = DateTime.now();

    try {
      final result = await para.signMessage(
        walletId: widget.wallet.id!,
        message: _messageToSign,
      );

      final duration =
          DateTime.now().difference(startTime).inMilliseconds / 1000;

      if (result is para_sdk.SuccessfulSignatureResult) {
        _showResult(
          'Message Signed',
          'Message: $_messageToSign\n\n'
              'Signature:\n${result.signedTransaction}\n\n'
              'Duration: ${duration.toStringAsFixed(3)}s',
        );
      } else if (result is para_sdk.DeniedSignatureResultWithUrl) {
        _showResult(
          'Approval Required',
          'This operation requires approval.\n\n'
              'Pending ID: ${result.pendingTransactionId}\n'
              'Review URL: ${result.transactionReviewUrl}\n\n'
              'Please approve in the browser and try again.',
        );
      } else {
        _showResult('Error', 'Signature denied');
      }
    } catch (e) {
      final duration =
          DateTime.now().difference(startTime).inMilliseconds / 1000;
      _showResult(
        'Error',
        'Failed to sign message: $e\nDuration: ${duration.toStringAsFixed(2)}s',
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _signTransaction() async {
    if (!_hasStellarAddress) {
      _showResult(
        'Error',
        'A Stellar G-address is required to build a test transaction',
      );
      return;
    }

    setState(() => _isLoading = true);
    final startTime = DateTime.now();

    try {
      final transaction = para_sdk.StellarTransaction.payment(
        to: _stellarAddress,
        amount: '0.01',
        networkPassphrase: para_sdk.StellarNetwork.testnetPassphrase,
        memo: const para_sdk.StellarMemo.text('Test transaction from Flutter'),
        fee: '100',
        timeout: 30,
        sequenceNumber: '0',
      );

      final result = await para.signTransaction(
        walletId: widget.wallet.id!,
        transaction: transaction.toJson(),
      );

      final duration =
          DateTime.now().difference(startTime).inMilliseconds / 1000;

      if (result is para_sdk.SuccessfulSignatureResult) {
        _showResult(
          'Transaction Signed',
          'To: $_stellarAddress\n'
              'Amount: 0.01 XLM\n'
              'Network: Testnet\n'
              'Memo: Test transaction from Flutter\n\n'
              'Signed XDR:\n${result.signedTransaction}\n\n'
              'Duration: ${duration.toStringAsFixed(3)}s',
        );
      } else if (result is para_sdk.DeniedSignatureResultWithUrl) {
        _showResult(
          'Approval Required',
          'This operation requires approval.\n\n'
              'Pending ID: ${result.pendingTransactionId}\n'
              'Review URL: ${result.transactionReviewUrl}\n\n'
              'Please approve in the browser and try again.',
        );
      } else {
        _showResult('Error', 'Failed to sign transaction');
      }
    } catch (e) {
      final duration =
          DateTime.now().difference(startTime).inMilliseconds / 1000;
      _showResult(
        'Error',
        'Failed to sign transaction: $e\nDuration: ${duration.toStringAsFixed(2)}s',
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Widget _buildCard({required Widget child}) {
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
      child: child,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: const Key('walletDetailView'),
      backgroundColor: Theme.of(context).colorScheme.surface,
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.surface,
        elevation: 0,
        iconTheme: IconThemeData(
          color: Theme.of(context).colorScheme.onSurface,
        ),
        title: Text(
          'Stellar Wallet',
          style: TextStyle(color: Theme.of(context).colorScheme.onSurface),
        ),
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                _buildCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Wallet Address',
                        style: TextStyle(
                          fontSize: 14,
                          color: Theme.of(
                            context,
                          ).colorScheme.onSurface.withValues(alpha: 0.6),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Theme.of(
                            context,
                          ).colorScheme.surfaceContainerHighest,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: Text(
                                _hasStellarAddress
                                    ? _stellarAddress
                                    : 'No address',
                                style: TextStyle(
                                  fontFamily: 'SF Mono',
                                  fontSize: 12,
                                  color: _hasStellarAddress
                                      ? Theme.of(context).colorScheme.onSurface
                                      : Theme.of(context).colorScheme.onSurface
                                            .withValues(alpha: 0.6),
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.copy, size: 18),
                              onPressed: _copyAddress,
                              padding: EdgeInsets.zero,
                              constraints: const BoxConstraints(),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                _buildCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Message Signing',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 16),
                      TextField(
                        onChanged: (value) =>
                            setState(() => _messageToSign = value),
                        decoration: InputDecoration(
                          hintText: 'Enter a message to sign',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          key: const Key('signMessageButton'),
                          onPressed: _isLoading || _messageToSign.isEmpty
                              ? null
                              : _signMessage,
                          style: ElevatedButton.styleFrom(
                            backgroundColor:
                                _isLoading || _messageToSign.isEmpty
                                ? Colors.grey[400]
                                : Colors.black,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                          ),
                          child: const Text('Sign Message (Ed25519)'),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                _buildCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Transaction Operations',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          key: const Key('signTransactionButton'),
                          onPressed: _isLoading ? null : _signTransaction,
                          child: const Text('Sign Transaction'),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Signs a 0.01 XLM self-payment on Stellar Testnet (offline only)',
                        style: TextStyle(
                          fontSize: 12,
                          color: Theme.of(
                            context,
                          ).colorScheme.onSurface.withValues(alpha: 0.6),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 32),
              ],
            ),
          ),
          if (_isLoading)
            Container(
              color: Colors.black.withAlpha((255 * 0.2).round()),
              child: const Center(child: CircularProgressIndicator()),
            ),
        ],
      ),
    );
  }
}
