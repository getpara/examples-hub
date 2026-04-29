import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:para/para.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../client/para.dart';
import '../../config/alchemy_config.dart';

/// Mirrors the Expo example at
/// `examples-hub/mobile/with-expo-one-click-login/app/(tabs)/smart-account.tsx`.
///
/// Creates an Alchemy smart account on init, shows the EOA + smart-account
/// addresses, and lets the user fire a zero-value sponsored transaction on
/// Sepolia to demonstrate EIP-4337 gas sponsorship.
class SmartAccountScreen extends StatefulWidget {
  const SmartAccountScreen({super.key});

  @override
  State<SmartAccountScreen> createState() => _SmartAccountScreenState();
}

class _SmartAccountScreenState extends State<SmartAccountScreen> {
  String? _eoaAddress;
  SmartAccountInfo? _smartAccount;
  bool _isInitializing = true;
  String? _initError;

  bool _isSending = false;
  String? _txHash;
  String? _txError;

  @override
  void initState() {
    super.initState();
    _initialize();
  }

  Future<void> _initialize() async {
    try {
      final wallets = await para.fetchWallets();
      final evmWallet = wallets.firstWhere(
        (w) => w.type == WalletType.evm && w.address != null,
        orElse: () => throw Exception('No EVM wallet found. Create one first.'),
      );

      if (!mounted) return;
      setState(() => _eoaAddress = evmWallet.address);

      if (!AlchemyConfig.isConfigured) {
        setState(() {
          _isInitializing = false;
          _initError =
              'ALCHEMY_API_KEY is not set. Add it to .env to enable the Smart Account demo.';
        });
        return;
      }

      final info = await para.createSmartAccount(
        apiKey: AlchemyConfig.apiKey,
        chainId: AlchemyConfig.sepoliaChainId,
        gasPolicyId: AlchemyConfig.gasPolicyId,
        mode: '4337',
        walletId: evmWallet.id,
      );

      if (!mounted) return;
      setState(() {
        _smartAccount = info;
        _isInitializing = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isInitializing = false;
        _initError = e.toString();
      });
    }
  }

  Future<void> _sendGaslessTx() async {
    final smartAccount = _smartAccount;
    if (smartAccount == null || _isSending) return;

    setState(() {
      _isSending = true;
      _txError = null;
      _txHash = null;
    });

    try {
      final receipt = await para.sendSmartAccountTransaction(
        smartAccountAddress: smartAccount.smartAccountAddress,
        chainId: smartAccount.chainId,
        to: AlchemyConfig.burnAddress,
      );

      if (!mounted) return;
      setState(() {
        _isSending = false;
        _txHash = receipt.transactionHash;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isSending = false;
        _txError = e.toString();
      });
    }
  }

  Future<void> _copyToClipboard(String value) async {
    await Clipboard.setData(ClipboardData(text: value));
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Copied to clipboard'),
        duration: Duration(seconds: 2),
      ),
    );
  }

  Future<void> _openEtherscan() async {
    final hash = _txHash;
    if (hash == null) return;
    final uri = Uri.parse('${AlchemyConfig.sepoliaExplorerBaseUrl}/tx/$hash');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  String _truncate(String? value, {int chars = 8}) {
    if (value == null || value.isEmpty) return '—';
    if (value.length <= chars * 2 + 2) return value;
    return '${value.substring(0, chars + 2)}...${value.substring(value.length - chars)}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFBF9F7),
      appBar: AppBar(
        backgroundColor: const Color(0xFFFBF9F7),
        elevation: 0,
        title: const Text(
          'Smart Account',
          style: TextStyle(color: Colors.black, fontWeight: FontWeight.w600),
        ),
        iconTheme: const IconThemeData(color: Colors.black),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildConnectedWalletsCard(),
            const SizedBox(height: 16),
            _buildSendTransactionCard(),
            const SizedBox(height: 16),
            _buildExplainerCard(),
          ],
        ),
      ),
    );
  }

  Widget _buildCard({required Widget child}) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(18),
            blurRadius: 12,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: child,
    );
  }

  Widget _buildAddressTile({
    required String label,
    required Widget content,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFF5F5F4),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: Color(0xFF6B7280),
            ),
          ),
          const SizedBox(height: 6),
          content,
        ],
      ),
    );
  }

  Widget _buildAddressRow(String address) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Text(
            _truncate(address),
            style: const TextStyle(
              fontFamily: 'monospace',
              fontSize: 14,
              color: Colors.black,
            ),
          ),
        ),
        IconButton(
          icon: const Icon(Icons.copy_outlined, size: 18, color: Color(0xFF6B7280)),
          padding: EdgeInsets.zero,
          constraints: const BoxConstraints(),
          onPressed: () => _copyToClipboard(address),
          tooltip: 'Copy',
        ),
      ],
    );
  }

  Widget _buildConnectedWalletsCard() {
    return _buildCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Connected Wallets',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: Colors.black,
            ),
          ),
          const SizedBox(height: 16),
          _buildAddressTile(
            label: 'EOA (Para Wallet)',
            content: _eoaAddress == null
                ? const Text(
                    'No EVM wallet found',
                    style: TextStyle(fontSize: 14, color: Color(0xFF9CA3AF)),
                  )
                : _buildAddressRow(_eoaAddress!),
          ),
          const SizedBox(height: 12),
          _buildAddressTile(
            label: 'Smart Account (Alchemy Modular Account)',
            content: _buildSmartAccountContent(),
          ),
        ],
      ),
    );
  }

  Widget _buildSmartAccountContent() {
    if (_isInitializing) {
      return const Row(
        children: [
          SizedBox(
            height: 14,
            width: 14,
            child: CircularProgressIndicator(strokeWidth: 2),
          ),
          SizedBox(width: 10),
          Text(
            'Initializing smart account...',
            style: TextStyle(fontSize: 14, color: Color(0xFF9CA3AF)),
          ),
        ],
      );
    }
    if (_initError != null) {
      return Text(
        _initError!,
        style: const TextStyle(fontSize: 14, color: Color(0xFFDC2626)),
      );
    }
    if (_smartAccount != null) {
      return _buildAddressRow(_smartAccount!.smartAccountAddress);
    }
    return const Text(
      'Not available',
      style: TextStyle(fontSize: 14, color: Color(0xFF9CA3AF)),
    );
  }

  Widget _buildSendTransactionCard() {
    final canSend = _smartAccount != null && !_isSending;
    return _buildCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Send Sponsored Transaction',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: Colors.black,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            "Sends a zero-value transaction to demonstrate EIP-4337 gas sponsorship via Alchemy's paymaster.",
            style: TextStyle(fontSize: 14, color: Color(0xFF6B7280)),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton.icon(
              onPressed: canSend ? _sendGaslessTx : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.black,
                disabledBackgroundColor: const Color(0xFFD1D5DB),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              icon: _isSending
                  ? const SizedBox(
                      height: 18,
                      width: 18,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                      ),
                    )
                  : const Icon(Icons.flash_on_outlined, size: 20, color: Colors.white),
              label: Text(
                _isSending ? 'Sending...' : 'Send Gasless Transaction',
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ),
          if (_txError != null && !_isSending) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFFEF2F2),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                _txError!,
                style: const TextStyle(fontSize: 13, color: Color(0xFFDC2626)),
              ),
            ),
          ],
          if (_txHash != null && !_isSending) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFECFDF5),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Transaction sent successfully!',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: Color(0xFF065F46),
                    ),
                  ),
                  const SizedBox(height: 8),
                  SelectableText(
                    _txHash!,
                    style: const TextStyle(
                      fontFamily: 'monospace',
                      fontSize: 12,
                      color: Color(0xFF047857),
                    ),
                  ),
                  const SizedBox(height: 12),
                  OutlinedButton.icon(
                    onPressed: _openEtherscan,
                    icon: const Icon(Icons.open_in_new, size: 16),
                    label: const Text('View on Etherscan'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFF374151),
                      side: const BorderSide(color: Color(0xFFD1D5DB)),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildExplainerCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFEEF2FF),
        borderRadius: BorderRadius.circular(12),
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'What is Account Abstraction?',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: Color(0xFF3730A3),
            ),
          ),
          SizedBox(height: 6),
          Text(
            'Account Abstraction (EIP-4337) lets you use smart contract wallets that support gas '
            'sponsorship, batched transactions, and custom validation. Your Para wallet acts as the '
            'signer, while the smart account handles on-chain execution.',
            style: TextStyle(
              fontSize: 12,
              height: 1.5,
              color: Color(0xFF4338CA),
            ),
          ),
        ],
      ),
    );
  }
}
