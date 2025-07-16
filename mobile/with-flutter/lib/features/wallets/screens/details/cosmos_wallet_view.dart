import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:para/para.dart' as para_sdk;
import '../../../../client/para.dart';
import '../../widgets/wallet_management_card.dart';

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
    // Debug: wallet initialization
    // print('CosmosWalletView initState - wallet id: ${widget.wallet.id}');
    // print('CosmosWalletView initState - address: ${widget.wallet.address}');
    // print('CosmosWalletView initState - addressSecondary: ${widget.wallet.addressSecondary}');
    _initializeCosmos();
  }
  
  Future<void> _initializeCosmos() async {
    try {
      _signer = para_sdk.ParaCosmosSigner(
        para: para,
        chainId: _currentConfig.chainId,
        prefix: _currentConfig.prefix,
        rpcUrl: _currentConfig.rpcUrl,
      );
      
      // Initialize the signer with the wallet
      await _signer!.selectWallet(widget.wallet.id!);
      // Debug: signer initialization
      // print('CosmosWalletView - Signer initialized with wallet: ${widget.wallet.id}');
      
      // Cosmos addresses might be in addressSecondary
      final cosmosAddress = widget.wallet.addressSecondary ?? widget.wallet.address;
      // Debug: address selection
      // print('CosmosWalletView - Using address: $cosmosAddress');
      
      if (cosmosAddress != null) {
        // Update the UI with the Cosmos address and set initial balance
        setState(() {
          _balance = '0.0000 ATOM'; // Set default balance
        });
        await _fetchBalance();
      } else {
        // Debug: no address found
        // print('CosmosWalletView - No address found, wallet might need initialization');
        setState(() {
          _isLoading = false;
        });
      }
    } catch (e) {
      // Debug: initialization error
      // print('CosmosWalletView - Error initializing: $e');
      _showResult('Error', 'Failed to initialize Cosmos signer: $e');
      setState(() {
        _isLoading = false;
      });
    }
  }
  
  Future<void> _reinitializeSigner() async {
    setState(() {
      _isLoading = true;
      _balance = null; // Reset balance when switching chains
    });
    try {
      _signer = para_sdk.ParaCosmosSigner(
        para: para,
        chainId: _currentConfig.chainId,
        prefix: _currentConfig.prefix,
        rpcUrl: _currentConfig.rpcUrl,
      );
      
      // Initialize the signer with the wallet
      await _signer!.selectWallet(widget.wallet.id!);
      
      await _fetchBalance();
      _showResult('Success', 'Switched to ${_currentConfig.name}');
    } catch (e) {
      _showResult('Error', 'Failed to switch chain: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }
  
  Future<void> _fetchBalance() async {
    if (_signer == null) {
      // Debug: signer not initialized
      // print('CosmosWalletView - Cannot fetch balance: signer not initialized');
      return;
    }
    
    final address = widget.wallet.addressSecondary ?? widget.wallet.address;
    if (address == null) {
      // Debug: no address for balance fetch
      // print('CosmosWalletView - Cannot fetch balance: no address');
      setState(() => _balance = 'No address available');
      return;
    }
    
    setState(() => _isLoading = true);
    try {
      // Debug: fetching balance
      // print('CosmosWalletView - Fetching balance for address: $address, denom: ${_currentConfig.denom}');
      final balanceString = await _signer!.getBalance(denom: _currentConfig.denom);
      // Debug: balance received
      // print('CosmosWalletView - Received balance: $balanceString');
      final balanceAmount = BigInt.tryParse(balanceString) ?? BigInt.zero;
      
      // Convert from smallest unit to display unit (divide by 10^6 for most Cosmos denoms)
      final displayBalance = balanceAmount.toDouble() / 1000000;
      
      setState(() => _balance = '${displayBalance.toStringAsFixed(4)} ${_currentConfig.denom.substring(1).toUpperCase()}');
    } catch (e) {
      // Debug: balance fetch error
      // print('CosmosWalletView - Error fetching balance: $e');
      // If balance fetch fails, show 0 balance
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
    if (_signer == null) {
      _showResult('Error', 'Signer not initialized');
      return;
    }
    
    setState(() => _isLoading = true);
    final startTime = DateTime.now();
    
    try {
      // Show dialog to choose signing method
      final signingMethod = await _showSigningMethodDialog();
      if (signingMethod == null) {
        setState(() => _isLoading = false);
        return;
      }
      
      if (signingMethod == 'proto') {
        // Create a minimal but valid protobuf SignDoc
        final signDocBase64 = _createProtoSignDoc();
        await _signer!.signDirect(signDocBase64: signDocBase64);
        
      } else {
        // Create an amino SignDoc for demo
        final signDocBase64 = _createAminoSignDoc();
        await _signer!.signAmino(signDocBase64: signDocBase64);
      }
      
      final duration = DateTime.now().difference(startTime).inMilliseconds / 1000;
      _showResult(
        'Success',
        'Transaction signed successfully using ${signingMethod.toUpperCase()}\nDuration: ${duration.toStringAsFixed(2)}s',
      );
    } catch (e) {
      final duration = DateTime.now().difference(startTime).inMilliseconds / 1000;
      _showResult(
        'Error',
        'Failed to sign transaction: $e\nDuration: ${duration.toStringAsFixed(2)}s',
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }
  
  Future<void> _sendTransaction() async {
    if (_signer == null) {
      _showResult('Error', 'Signer not initialized');
      return;
    }
    
    setState(() => _isLoading = true);
    final startTime = DateTime.now();
    
    try {
      // For demo purposes, we'll sign with amino and show the result
      final signDocBase64 = _createAminoSignDoc();
      await _signer!.signAmino(signDocBase64: signDocBase64);
      
      final duration = DateTime.now().difference(startTime).inMilliseconds / 1000;
      
      // In a real app, you would broadcast the signed transaction to the chain
      _showResult(
        'Success',
        'Transaction signed and ready to broadcast\n'
        'Chain: ${_currentConfig.name}\n'
        'To: ${_currentConfig.testAddress}\n'
        'Amount: 1.0 ${_currentConfig.denom.substring(1).toUpperCase()}\n'
        'Duration: ${duration.toStringAsFixed(2)}s\n\n'
        'Note: Broadcasting not implemented in demo',
      );
    } catch (e) {
      final duration = DateTime.now().difference(startTime).inMilliseconds / 1000;
      _showResult(
        'Error',
        'Failed to send transaction: $e\nDuration: ${duration.toStringAsFixed(2)}s',
      );
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
  
  
  String _createProtoSignDoc() {
    // Create a minimal but valid protobuf SignDoc
    // This must match the binary protobuf format, not JSON
    final chainId = _currentConfig.chainId;
    final chainIdBytes = utf8.encode(chainId);
    
    final protobufBytes = <int>[];
    
    // body_bytes (field 1, wire type 2) - empty
    protobufBytes.add(0x0A); // tag (field 1, wire type 2)
    protobufBytes.add(0x00); // length 0
    
    // auth_info_bytes (field 2, wire type 2) - empty  
    protobufBytes.add(0x12); // tag (field 2, wire type 2)
    protobufBytes.add(0x00); // length 0
    
    // chain_id (field 3, wire type 2)
    protobufBytes.add(0x1A); // tag (field 3, wire type 2)
    protobufBytes.add(chainIdBytes.length); // length
    protobufBytes.addAll(chainIdBytes); // chain ID string
    
    // account_number (field 4, wire type 0) - value 0
    protobufBytes.add(0x20); // tag (field 4, wire type 0)
    protobufBytes.add(0x00); // value 0
    
    return base64Encode(protobufBytes);
  }

  String _createAminoSignDoc() {
    final signDocJson = {
      'chain_id': _currentConfig.chainId,
      'account_number': '0',
      'sequence': '0',
      'fee': {
        'amount': [
          {'denom': _currentConfig.denom, 'amount': '5000'}
        ],
        'gas': '200000',
      },
      'msgs': [
        {
          'type': 'cosmos-sdk/MsgSend',
          'value': {
            'from_address': widget.wallet.addressSecondary ?? widget.wallet.address ?? '',
            'to_address': _currentConfig.testAddress,
            'amount': [
              {'denom': _currentConfig.denom, 'amount': '1000000'}
            ],
          },
        },
      ],
      'memo': 'Test transaction from Para Flutter',
    };
    
    return base64Encode(utf8.encode(jsonEncode(signDocJson)));
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
              color: Colors.grey[600],
              fontWeight: FontWeight.w500,
            ),
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
                    style: TextStyle(
                      fontFamily: 'SF Mono',
                      fontSize: 12,
                      color: address != null ? Colors.black : Colors.grey[600],
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
                style: TextStyle(color: Colors.grey[600]),
              ),
              Text(
                _balance ?? (_isLoading ? 'Loading...' : 'Tap refresh →'),
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: _balance != null ? Colors.black : Colors.grey[600],
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
          Text(
            'Select Chain',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
              value: _selectedChain,
              style: const TextStyle(
                fontSize: 16,
                color: Colors.black87,
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
                fillColor: Colors.white,
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
              dropdownColor: Colors.white,
              items: _chainConfigs.entries.map((entry) {
                return DropdownMenuItem(
                  value: entry.key,
                  child: Text(
                    entry.value.name,
                    style: const TextStyle(
                      fontSize: 16,
                      color: Colors.black87,
                    ),
                  ),
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
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 16),
          TextField(
            onChanged: (value) => setState(() => _messageToSign = value),
            style: const TextStyle(
              fontSize: 16,
              color: Colors.black87,
            ),
            decoration: InputDecoration(
              hintText: 'Enter a message to sign',
              hintStyle: TextStyle(
                color: Colors.grey[500],
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
              fillColor: Colors.white,
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
                'Sign Message',
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
              color: Colors.black87,
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
    final theme = Theme.of(context);
    return Scaffold(
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
                const SizedBox(height: 16),
                // Wallet Management Card
                WalletManagementCard(
                  onRefresh: _fetchBalance,
                ),
                const SizedBox(height: 32), // Add bottom padding
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