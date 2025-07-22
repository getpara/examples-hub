import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart';
import 'package:para/para.dart' as para_sdk;
import 'package:web3dart/web3dart.dart';
import '../../../../client/para.dart';
import '../../widgets/wallet_management_card.dart';

class EVMWalletView extends StatefulWidget {
  final para_sdk.Wallet wallet;

  const EVMWalletView({
    super.key,
    required this.wallet,
  });

  @override
  State<EVMWalletView> createState() => _EVMWalletViewState();
}

class _EVMWalletViewState extends State<EVMWalletView> {
  late Web3Client _web3Client;
  para_sdk.ParaEvmSigner? _signer;
  
  String? _balance;
  String _messageToSign = '';
  bool _isLoading = false;
  
  // Sepolia testnet configuration
  static const String _rpcUrl = 'https://sepolia.infura.io/v3/961364684c7346c080994baab1469ea8';
  static const int _chainId = 11155111;
  static const String _testAddress = '0x301d75d850c878b160ad9e1e3f6300202de9e97f';
  
  final List<String> _faucetUrls = [
    'https://sepoliafaucet.com',
    'https://www.alchemy.com/faucets/ethereum-sepolia',
    'https://faucets.chain.link/sepolia',
  ];
  
  @override
  void initState() {
    super.initState();
    // Debug: wallet initialization
    // print('EVMWalletView initState - wallet id: ${widget.wallet.id}');
    // print('EVMWalletView initState - address: ${widget.wallet.address}');
    _initializeWeb3();
  }
  
  Future<void> _initializeWeb3() async {
    _web3Client = Web3Client(_rpcUrl, Client());
    
    try {
      _signer = para_sdk.ParaEvmSigner(
        para: para,
        walletId: widget.wallet.id,
      );
      
      if (widget.wallet.address != null) {
        setState(() {
          _balance = '0.0000 ETH'; // Set default balance
        });
        await _fetchBalance();
      } else {
        // Debug: no address found
        // print('EVMWalletView - No address found, wallet might need initialization');
        setState(() {
          _isLoading = false;
        });
      }
    } catch (e) {
      // Debug: initialization error
      // print('EVMWalletView - Error initializing: $e');
      _showResult('Error', 'Failed to initialize EVM signer: $e');
      setState(() {
        _isLoading = false;
      });
    }
  }
  
  @override
  void dispose() {
    _web3Client.dispose();
    super.dispose();
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
    final address = widget.wallet.address;
    if (address != null) {
      Clipboard.setData(ClipboardData(text: address));
      _showResult('Success', 'Address copied to clipboard');
    } else {
      _showResult('Error', 'No address to copy');
    }
  }
  
  Future<void> _fetchBalance() async {
    if (widget.wallet.address == null) {
      // Debug: no address for balance fetch
      // print('EVMWalletView - Cannot fetch balance: no address');
      setState(() => _balance = 'No address available');
      return;
    }
    
    setState(() => _isLoading = true);
    try {
      // Debug: fetching balance
      // print('EVMWalletView - Fetching balance for address: ${widget.wallet.address}');
      final address = EthereumAddress.fromHex(widget.wallet.address!);
      final balance = await _web3Client.getBalance(address);
      final ethBalance = balance.getValueInUnit(EtherUnit.ether);
      setState(() => _balance = '${ethBalance.toStringAsFixed(4)} ETH');
      // Debug: balance fetched
      // print('EVMWalletView - Balance fetched: $_balance');
    } catch (e) {
      // Debug: balance fetch error
      // print('EVMWalletView - Error fetching balance: $e');
      setState(() => _balance = '0.0000 ETH');
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
    final transaction = _createTestTransaction(value: BigInt.from(1000000000));
    if (transaction == null || _signer == null) return;
    
    setState(() => _isLoading = true);
    final startTime = DateTime.now();
    
    try {
      await _signer!.signTransaction(
        transaction,
        chainId: _chainId,
      );
      
      final duration = DateTime.now().difference(startTime).inMilliseconds / 1000;
      _showResult(
        'Success', 
        'Transaction signed successfully\nDuration: ${duration.toStringAsFixed(2)}s',
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
    // Check balance before sending
    if (_balance != null) {
      final balanceValue = double.tryParse(
        _balance!.replaceAll(' ETH', '')
      ) ?? 0;
      
      const requiredETH = 0.0001 + 0.00006; // Transaction + gas
      if (balanceValue < requiredETH) {
        _showResult(
          'Insufficient Balance',
          'You need at least ${requiredETH.toStringAsFixed(6)} ETH to send this transaction.\n\n'
          'Current balance: $_balance\n'
          'Transaction amount: 0.0001 ETH\n'
          'Estimated gas fee: 0.00006 ETH\n\n'
          'To fund your wallet on Sepolia:\n'
          '1. Copy your wallet address\n'
          '2. Visit a Sepolia faucet\n'
          '3. Request test ETH',
        );
        return;
      }
    }
    
    final transaction = _createTestTransaction(value: BigInt.from(100000000000000));
    if (transaction == null || _signer == null) return;
    
    setState(() => _isLoading = true);
    final startTime = DateTime.now();
    
    try {
      final signedTx = await _signer!.signTransaction(
        transaction,
        chainId: _chainId,
      );
      
      final txHash = await _web3Client.sendRawTransaction(signedTx);
      
      final duration = DateTime.now().difference(startTime).inMilliseconds / 1000;
      _showResult(
        'Success', 
        'Transaction sent successfully\nTx Hash: $txHash\nDuration: ${duration.toStringAsFixed(2)}s',
      );
      
      // Refresh balance after successful transaction
      await _fetchBalance();
    } catch (e) {
      final duration = DateTime.now().difference(startTime).inMilliseconds / 1000;
      final errorMessage = e.toString();
      
      if (errorMessage.contains('insufficient') || 
          errorMessage.contains('balance') || 
          errorMessage.contains('funds')) {
        _showResult(
          'Insufficient Balance',
          'Transaction failed due to insufficient balance.\n\n'
          'To fund your wallet on Sepolia:\n'
          '${_faucetUrls.asMap().entries.map((e) => '${e.key + 1}. ${e.value}').join('\n')}\n\n'
          'Duration: ${duration.toStringAsFixed(2)}s',
        );
      } else {
        _showResult(
          'Error', 
          'Failed to send transaction: $errorMessage\nDuration: ${duration.toStringAsFixed(2)}s',
        );
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }
  
  Transaction? _createTestTransaction({required BigInt value}) {
    if (_signer == null) {
      _showResult('Error', 'EVM signer not initialized');
      return null;
    }
    
    try {
      return Transaction(
        to: EthereumAddress.fromHex(_testAddress),
        value: EtherAmount.fromBigInt(EtherUnit.wei, value),
        gasPrice: EtherAmount.fromBigInt(EtherUnit.gwei, BigInt.from(3)),
        maxGas: 21000,
        nonce: 3, // This should be fetched dynamically in production
      );
    } catch (e) {
      _showResult('Error', 'Failed to create transaction: $e');
      return null;
    }
  }
  
  
  void _showFundingInstructions() {
    final address = widget.wallet.address;
    if (address != null) {
      Clipboard.setData(ClipboardData(text: address));
      _showResult(
        'Wallet Address Copied',
        'Your address has been copied to clipboard.\n\n'
        'To fund your wallet on Sepolia:\n'
        '${_faucetUrls.asMap().entries.map((e) => '${e.key + 1}. ${e.value}').join('\n')}\n\n'
        'Note: Sepolia ETH has no real value',
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
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surface,
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.surface,
        elevation: 0,
        iconTheme: IconThemeData(color: Theme.of(context).colorScheme.onSurface),
        title: Text(
          'EVM Wallet',
          style: TextStyle(color: Theme.of(context).colorScheme.onSurface),
        ),
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                // Address Card
                _buildCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Wallet Address',
                        style: TextStyle(
                          fontSize: 14, 
                          color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.6),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Theme.of(context).colorScheme.surfaceContainerHighest,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: Text(
                                widget.wallet.address ?? 'No address',
                                style: TextStyle(
                                  fontFamily: 'SF Mono',
                                  fontSize: 12,
                                  color: widget.wallet.address != null 
                                    ? Theme.of(context).colorScheme.onSurface
                                    : Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.6),
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
                            style: TextStyle(
                              color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.7),
                            ),
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
                              label: const Text('Fund Wallet (Sepolia)'),
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
                ),
                const SizedBox(height: 16),
                // Message Signing Card
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
                        onChanged: (value) => setState(() => _messageToSign = value),
                        style: TextStyle(
                          fontSize: 16,
                          color: Theme.of(context).colorScheme.onSurface,
                        ),
                        decoration: InputDecoration(
                          hintText: 'Enter a message to sign',
                          hintStyle: TextStyle(
                            color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.5),
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
                          child: Text(
                            'Sign Message',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: _isLoading || _messageToSign.isEmpty
                                  ? Colors.grey[600]
                                  : Colors.white,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                // Transaction Operations Card
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
                ),
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