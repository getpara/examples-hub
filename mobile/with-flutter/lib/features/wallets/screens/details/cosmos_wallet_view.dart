import 'dart:convert';
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
  para_sdk.ParaCosmosSigner? _signer; // ignore: unused_field
  String _selectedChain = 'provider'; // Default to testnet
  bool _useCustomConfig = false;
  String _customChainId = '';
  String _customPrefix = '';
  
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
    _initializeCosmos();
  }
  
  Future<void> _initializeCosmos() async {
    try {
      _signer = para_sdk.ParaCosmosSigner(
        para: para,
        walletId: widget.wallet.id!,
        chainId: _currentConfig.chainId,
        prefix: _currentConfig.prefix,
      );
      
      // Cosmos addresses might be in addressSecondary
      final cosmosAddress = widget.wallet.addressSecondary ?? widget.wallet.address;
      if (cosmosAddress != null) {
        // Update the UI with the Cosmos address
        setState(() {});
      }
      
      await _fetchBalance();
    } catch (e) {
      _showResult('Error', 'Failed to initialize Cosmos signer: $e');
    }
  }
  
  Future<void> _reinitializeSigner() async {
    setState(() => _isLoading = true);
    try {
      final chainId = _useCustomConfig ? _customChainId : _currentConfig.chainId;
      final prefix = _useCustomConfig ? _customPrefix : _currentConfig.prefix;
      
      _signer = para_sdk.ParaCosmosSigner(
        para: para,
        walletId: widget.wallet.id!,
        chainId: chainId,
        prefix: prefix,
      );
      
      await _fetchBalance();
      _showResult('Success', 'Chain configuration updated');
    } catch (e) {
      _showResult('Error', 'Failed to update configuration: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }
  
  Future<void> _fetchBalance() async {
    // For demo purposes, we'll just show a mock balance
    // In production, you would query the chain's RPC endpoint
    setState(() => _balance = '0.0000 ${_currentConfig.denom.toUpperCase()}');
  }
  
  Future<void> _signMessage() async {
    if (_messageToSign.isEmpty) {
      _showResult('Error', 'Please enter a message to sign');
      return;
    }
    
    setState(() => _isLoading = true);
    final startTime = DateTime.now();
    
    try {
      final messageBytes = utf8.encode(_messageToSign);
      final messageBase64 = base64Encode(messageBytes);
      
      final result = await para.signMessage(
        walletId: widget.wallet.id!,
        messageBase64: messageBase64,
      );
      
      final duration = DateTime.now().difference(startTime).inMilliseconds / 1000;
      
      if (result is para_sdk.SuccessfulSignatureResult) {
        _showResult(
          'Success', 
          'Message signed successfully\nDuration: ${duration.toStringAsFixed(2)}s',
        );
      } else if (result is para_sdk.DeniedSignatureResultWithUrl) {
        _showResult(
          'Denied', 
          'Signature denied\nReview URL: ${result.transactionReviewUrl}',
        );
      } else {
        _showResult('Error', 'Signature denied');
      }
    } catch (e) {
      final duration = DateTime.now().difference(startTime).inMilliseconds / 1000;
      _showResult(
        'Error', 
        'Failed to sign message: $e\nDuration: ${duration.toStringAsFixed(2)}s',
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }
  
  Future<void> _signTransaction() async {
    // For demo purposes, we'll create a simple transfer transaction
    _showResult('Info', 'Cosmos transaction signing coming soon');
  }
  
  Future<void> _sendTransaction() async {
    // For demo purposes, we'll show the flow
    _showResult('Info', 'Cosmos transaction sending coming soon');
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
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha((255 * 0.05).round()),
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
          const Text(
            'Wallet Address',
            style: TextStyle(fontSize: 14, color: Colors.grey),
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.grey[100],
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    address ?? 'No address',
                    style: const TextStyle(
                      fontFamily: 'SF Mono',
                      fontSize: 12,
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
          if (_balance != null) ...[
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Balance:',
                  style: TextStyle(color: Colors.grey[600]),
                ),
                Text(
                  _balance!,
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                IconButton(
                  icon: const Icon(Icons.refresh, size: 18),
                  onPressed: _isLoading ? null : _fetchBalance,
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              ],
            ),
            if (_shouldShowFundButton()) ...[
              const SizedBox(height: 8),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _showFundingInstructions,
                  icon: const Icon(Icons.add_circle_outline),
                  label: Text('Fund Wallet (${_currentConfig.name})'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.orange,
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
          const Text(
            'Chain Configuration',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 16),
          SwitchListTile(
            title: const Text('Use Custom Configuration'),
            value: _useCustomConfig,
            onChanged: (value) {
              setState(() => _useCustomConfig = value);
              if (!value) {
                _reinitializeSigner();
              }
            },
            contentPadding: EdgeInsets.zero,
          ),
          if (_useCustomConfig) ...[
            const SizedBox(height: 12),
            TextField(
              onChanged: (value) => _customChainId = value,
              decoration: InputDecoration(
                labelText: 'Chain ID',
                hintText: 'e.g., cosmoshub-4',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                filled: true,
                fillColor: Colors.grey[100],
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              onChanged: (value) => _customPrefix = value,
              decoration: InputDecoration(
                labelText: 'Address Prefix',
                hintText: 'e.g., cosmos',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                filled: true,
                fillColor: Colors.grey[100],
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _customChainId.isNotEmpty && _customPrefix.isNotEmpty
                    ? _reinitializeSigner
                    : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.grey[300],
                  foregroundColor: Colors.black,
                ),
                child: const Text('Apply Configuration'),
              ),
            ),
          ] else ...[
            DropdownButtonFormField<String>(
              value: _selectedChain,
              decoration: InputDecoration(
                labelText: 'Select Chain',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                filled: true,
                fillColor: Colors.grey[100],
              ),
              items: _chainConfigs.entries.map((entry) {
                return DropdownMenuItem(
                  value: entry.key,
                  child: Text(entry.value.name),
                );
              }).toList(),
              onChanged: (value) {
                if (value != null) {
                  setState(() => _selectedChain = value);
                  _reinitializeSigner();
                }
              },
            ),
          ],
        ],
      ),
    );
  }
  
  Widget _buildMessageSigningCard() {
    return _buildCard(
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
            onChanged: (value) => setState(() => _messageToSign = value),
            decoration: InputDecoration(
              hintText: 'Enter a message to sign',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              filled: true,
              fillColor: Colors.grey[100],
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
                backgroundColor: Colors.black,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: const Text(
                'Sign Message',
                style: TextStyle(color: Colors.white),
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
          const Text(
            'Transaction Operations',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _sendTransaction,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.grey[300],
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: const Text('Send Transaction'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _signTransaction,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.grey[300],
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: const Text('Sign Transaction'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
  
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFBF9F7),
      appBar: AppBar(
        backgroundColor: const Color(0xFFFBF9F7),
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black),
        title: const Text(
          'Cosmos Wallet',
          style: TextStyle(color: Colors.black),
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
              ],
            ),
          ),
          if (_isLoading)
            Container(
              color: Colors.black.withAlpha((255 * 0.2).round()),
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