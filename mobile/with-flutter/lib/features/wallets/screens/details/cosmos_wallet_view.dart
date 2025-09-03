import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:para/para.dart' as para_sdk;
import '../../../../client/para.dart';

class CosmosWalletView extends StatefulWidget {
  final para_sdk.Wallet wallet;

  const CosmosWalletView({
    super.key,
    required this.wallet,
  });

  @override
  State<CosmosWalletView> createState() => _CosmosWalletViewState();
}

class _CosmosWalletViewState extends State<CosmosWalletView> {
  String _selectedChain = 'provider'; // Default to testnet
  
  String? _balance;
  String _messageToSign = '';
  bool _isLoading = false;
  
  // Chain configurations
  static const Map<String, ChainConfig> _chainConfigs = {
    'provider': ChainConfig(
      name: 'Cosmos Testnet',
      chainId: 'provider',
      prefix: 'cosmos',
      rpcUrl: 'https://rpc.provider-state-sync-01.rs-testnet.polypore.xyz',
      denom: 'uatom',
      testAddress: 'cosmos1v9yrqx8aaddlna29zxngr4ye3jnxtpprk8s7c2',
    ),
    'cosmoshub-4': ChainConfig(
      name: 'Cosmos Hub',
      chainId: 'cosmoshub-4',
      prefix: 'cosmos',
      rpcUrl: 'https://cosmos-rpc.publicnode.com',
      denom: 'uatom',
      testAddress: 'cosmos1v9yrqx8aaddlna29zxngr4ye3jnxtpprk8s7c2',
    ),
    'osmosis-1': ChainConfig(
      name: 'Osmosis',
      chainId: 'osmosis-1',
      prefix: 'osmo',
      rpcUrl: 'https://osmosis-rpc.publicnode.com',
      denom: 'uosmo',
      testAddress: 'osmo1v9yrqx8aaddlna29zxngr4ye3jnxtpprrej532',
    ),
    'juno-1': ChainConfig(
      name: 'Juno',
      chainId: 'juno-1',
      prefix: 'juno',
      rpcUrl: 'https://juno-rpc.publicnode.com',
      denom: 'ujuno',
      testAddress: 'juno1v9yrqx8aaddlna29zxngr4ye3jnxtpprhxtcwg',
    ),
    'stargaze-1': ChainConfig(
      name: 'Stargaze',
      chainId: 'stargaze-1',
      prefix: 'stars',
      rpcUrl: 'https://stargaze-rpc.publicnode.com',
      denom: 'ustars',
      testAddress: 'stars1v9yrqx8aaddlna29zxngr4ye3jnxtpprfu7n3c',
    ),
    'osmo-test-5': ChainConfig(
      name: 'Osmosis Testnet',
      chainId: 'osmo-test-5',
      prefix: 'osmo',
      rpcUrl: 'https://rpc.testnet.osmosis.zone',
      denom: 'uosmo',
      testAddress: 'osmo1v9yrqx8aaddlna29zxngr4ye3jnxtpprrej532',
    ),
  };
  
  ChainConfig get _currentConfig => _chainConfigs[_selectedChain]!;
  
  final List<String> _faucetUrls = [
    'https://faucet.ping.pub/',
  ];
  
  @override
  void initState() {
    super.initState();
    _fetchBalance();
  }
  
  
  Future<void> _switchChain(String chainId) async {
    setState(() {
      _isLoading = true;
      _selectedChain = chainId;
    });
    
    try {
      await _fetchBalance();
      _showResult('Success', 'Switched to ${_currentConfig.name}');
    } catch (e) {
      _showResult('Error', 'Failed to switch chain: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }
  
  Future<void> _fetchBalance() async {
    setState(() => _isLoading = true);
    try {
      final balanceString = await para.getBalance(
        walletId: widget.wallet.id!,
        rpcUrl: _currentConfig.rpcUrl,
        chainPrefix: _currentConfig.prefix,  // Critical for correct address derivation
        denom: _currentConfig.denom,
      );
      
      final balanceAmount = BigInt.tryParse(balanceString) ?? BigInt.zero;
      final displayBalance = balanceAmount.toDouble() / 1000000;
      setState(() => _balance = '${displayBalance.toStringAsFixed(4)} ${_currentConfig.denom.substring(1).toUpperCase()}');
    } catch (e) {
      setState(() => _balance = '0.0000 ${_currentConfig.denom.substring(1).toUpperCase()}');
    } finally {
      setState(() => _isLoading = false);
    }
  }
  
  Future<void> _signMessage() async {
    if (_messageToSign.isEmpty) {
      _showResult('Error', 'Please enter a message to sign');
      return;
    }
    
    setState(() => _isLoading = true);
    final startTime = DateTime.now();
    
    try {
      final signature = await para.signMessage(
        walletId: widget.wallet.id!,
        message: _messageToSign,
      );
      
      final duration = DateTime.now().difference(startTime).inMilliseconds / 1000;
      if (signature is para_sdk.SuccessfulSignatureResult) {
        _showResult(
          'Message Signed', 
          'Message: $_messageToSign\n\n'
          'Signature:\n${signature.signedTransaction}\n\n'
          'Duration: ${duration.toStringAsFixed(3)}s',
        );
      } else {
        _showResult('Error', 'Signature denied');
      }
    } catch (e) {
      final duration = DateTime.now().difference(startTime).inMilliseconds / 1000;
      _showResult('Error', 'Failed to sign message: $e\nDuration: ${duration.toStringAsFixed(2)}s');
    } finally {
      setState(() => _isLoading = false);
    }
  }
  
  Future<void> _signTransaction() async {
    setState(() => _isLoading = true);
    final startTime = DateTime.now();
    
    try {
      final signingMethod = await _showSigningMethodDialog();
      if (signingMethod == null) {
        setState(() => _isLoading = false);
        return;
      }
      
      final transaction = para_sdk.CosmosTransaction(
        to: _currentConfig.testAddress,
        amount: '1000000',  // 1 token in smallest denomination
        denom: _currentConfig.denom,
        memo: 'Test ${signingMethod.toUpperCase()} Transaction',
        chainId: _currentConfig.chainId,
        format: signingMethod,  // "proto" or "amino"
      );
      
      final result = await para.signTransaction(
        walletId: widget.wallet.id!,
        transaction: transaction.toJson(),
        chainId: _currentConfig.chainId,
        rpcUrl: _currentConfig.rpcUrl,
      );
      
      final duration = DateTime.now().difference(startTime).inMilliseconds / 1000;
      
      if (result is para_sdk.SuccessfulSignatureResult) {
        _showResult(
          '✅ ${signingMethod.toUpperCase()} Signed',
          '🔗 Chain: ${_currentConfig.name} (${_currentConfig.chainId})\n'
          'To: ${_currentConfig.testAddress.substring(0, 20)}...\n'
          'Amount: 1 ${_currentConfig.denom.substring(1).toUpperCase()}\n'
          'Format: ${signingMethod.toUpperCase()}\n\n'
          '🔐 Signature:\n${result.signedTransaction}\n\n'
          'Duration: ${duration.toStringAsFixed(3)}s',
        );
      } else if (result is para_sdk.DeniedSignatureResultWithUrl) {
        _showResult(
          'Denied',
          'Transaction denied\nReview URL: ${result.transactionReviewUrl}',
        );
      } else {
        _showResult('Error', 'Failed to sign transaction');
      }
    } catch (e) {
      final duration = DateTime.now().difference(startTime).inMilliseconds / 1000;
      _showResult('Error', 'Failed to sign transaction: $e\nDuration: ${duration.toStringAsFixed(2)}s');
    } finally {
      setState(() => _isLoading = false);
    }
  }
  
  Future<String?> _showSigningMethodDialog() async {
    return showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Select Signing Method'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              title: const Text('Proto (Direct)'),
              subtitle: const Text('Modern protobuf-based signing'),
              onTap: () => Navigator.pop(context, 'proto'),
            ),
            ListTile(
              title: const Text('Amino'),
              subtitle: const Text('Legacy JSON-based signing'),
              onTap: () => Navigator.pop(context, 'amino'),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
        ],
      ),
    );
  }
  
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
    final address = widget.wallet.addressSecondary ?? widget.wallet.address;
    if (address != null) {
      Clipboard.setData(ClipboardData(text: address));
      _showResult('Success', 'Address copied to clipboard');
    } else {
      _showResult('Error', 'No address to copy');
    }
  }
  

  void _showFundingInstructions() {
    final address = widget.wallet.addressSecondary ?? widget.wallet.address;
    if (address != null) {
      Clipboard.setData(ClipboardData(text: address));
      _showResult(
        'Wallet Address Copied',
        'Your address has been copied to clipboard.\n\n'
        'To fund your wallet on ${_currentConfig.name}:\n'
        '${_faucetUrls.asMap().entries.map((e) => '${e.key + 1}. ${e.value}').join('\n')}\n\n'
        'Note: Testnet tokens have no real value',
      );
    }
  }
  
  bool _shouldShowFundButton() {
    if (_balance == null) return false;
    final numericString = _balance!.replaceAll(RegExp(r'[^\d.]'), '');
    final balanceValue = double.tryParse(numericString) ?? 0;
    return balanceValue < 0.001;
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
  
  Widget _buildAddressCard() {
    final address = widget.wallet.addressSecondary ?? widget.wallet.address;
    return _buildCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Wallet Address',
            style: TextStyle(
              fontSize: 14,
              color: Theme.of(context).colorScheme.onSurfaceVariant,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surfaceContainerHighest.withValues(alpha: 0.3),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    address ?? 'No address',
                    style: TextStyle(
                      fontFamily: 'SF Mono',
                      fontSize: 12,
                      color: Theme.of(context).colorScheme.onSurface,
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
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Balance:',
                style: TextStyle(color: Theme.of(context).colorScheme.onSurfaceVariant),
              ),
              Text(
                _balance ?? (_isLoading ? 'Loading...' : 'Tap refresh →'),
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: Theme.of(context).colorScheme.onSurface,
                ),
              ),
              IconButton(
                icon: const Icon(Icons.refresh, size: 18),
                onPressed: _isLoading ? null : _fetchBalance,
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
              ),
            ],
          ),
          if (_balance != null) ...[
            if (_shouldShowFundButton()) ...[
              const SizedBox(height: 8),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _showFundingInstructions,
                  icon: const Icon(Icons.add_circle_outline),
                  label: Text('Fund Wallet (${_currentConfig.name})'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue,
                    foregroundColor: Colors.white,
                  ),
                ),
              ),
            ],
          ] else ...[
            const SizedBox(height: 16),
            Align(
              alignment: Alignment.centerRight,
              child: TextButton(
                onPressed: _isLoading ? null : _fetchBalance,
                child: const Text('Fetch Balance'),
              ),
            ),
          ],
        ],
      ),
    );
  }
  
  Widget _buildChainConfigurationCard() {
    return _buildCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Select Chain',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: Theme.of(context).colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
              value: _selectedChain,
              style: TextStyle(
                fontSize: 16,
                color: Theme.of(context).colorScheme.onSurface,
              ),
              decoration: InputDecoration(
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: Theme.of(context).colorScheme.outline),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: Theme.of(context).colorScheme.outline),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: Theme.of(context).colorScheme.primary, width: 2),
                ),
                filled: true,
                fillColor: Theme.of(context).colorScheme.surface,
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
              dropdownColor: Theme.of(context).colorScheme.surface,
              items: _chainConfigs.entries.map((entry) {
                return DropdownMenuItem(
                  value: entry.key,
                  child: Text(
                    entry.value.name,
                    style: TextStyle(
                      fontSize: 16,
                      color: Theme.of(context).colorScheme.onSurface,
                    ),
                  ),
                );
              }).toList(),
              onChanged: (value) {
                if (value != null) {
                  _switchChain(value);
                }
              },
          ),
        ],
      ),
    );
  }
  
  Widget _buildMessageSigningCard() {
    return _buildCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Message Signing',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: Theme.of(context).colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 16),
          TextField(
            onChanged: (value) => setState(() => _messageToSign = value),
            style: TextStyle(
              fontSize: 16,
              color: Theme.of(context).colorScheme.onSurface,
            ),
            decoration: InputDecoration(
              hintText: 'Enter a message to sign',
              hintStyle: TextStyle(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
                fontSize: 16,
              ),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: Theme.of(context).colorScheme.outline),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: Theme.of(context).colorScheme.outline),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: Theme.of(context).colorScheme.primary, width: 2),
              ),
              filled: true,
              fillColor: Theme.of(context).colorScheme.surface,
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _isLoading || _messageToSign.isEmpty
                  ? null
                  : _signMessage,
              style: ElevatedButton.styleFrom(
                backgroundColor: _isLoading || _messageToSign.isEmpty
                    ? Colors.grey[400]
                    : Colors.black,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 2,
              ),
              child: const Text(
                'Sign Message (ADR-36)',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildTransactionOperationsCard() {
    return _buildCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Transaction Operations',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: Theme.of(context).colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _isLoading ? null : _signTransaction,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.grey[300],
                foregroundColor: Colors.black,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: const Text('Sign Transaction (Proto/Amino)'),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Chain: ${_currentConfig.name} (${_currentConfig.prefix}1...)\n'
            'Signs 1 ${_currentConfig.denom.substring(1).toUpperCase()} transfer (offline only)',
            style: TextStyle(
              fontSize: 12,
              color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.6),
            ),
          ),
        ],
      ),
    );
  }
  
  
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      key: const Key('walletDetailView'),
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: theme.scaffoldBackgroundColor,
        elevation: 0,
        iconTheme: IconThemeData(color: theme.colorScheme.onSurface),
        title: Text(
          'Cosmos Wallet',
          style: TextStyle(color: theme.colorScheme.onSurface),
        ),
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                _buildAddressCard(),
                const SizedBox(height: 16),
                _buildChainConfigurationCard(),
                const SizedBox(height: 16),
                _buildMessageSigningCard(),
                const SizedBox(height: 16),
                _buildTransactionOperationsCard(),
                const SizedBox(height: 32), // Add bottom padding
              ],
            ),
          ),
          if (_isLoading)
            Container(
              color: Colors.black.withValues(alpha: 0.2),
              child: const Center(
                child: CircularProgressIndicator(),
              ),
            ),
        ],
      ),
    );
  }
}

class ChainConfig {
  final String name;
  final String chainId;
  final String prefix;
  final String rpcUrl;
  final String denom;
  final String testAddress;

  const ChainConfig({
    required this.name,
    required this.chainId,
    required this.prefix,
    required this.rpcUrl,
    required this.denom,
    required this.testAddress,
  });
}