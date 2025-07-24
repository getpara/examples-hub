import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:para/para.dart' as para_sdk;
import 'package:solana/solana.dart' as solana;
import 'package:solana/encoder.dart';
import '../../../../client/para.dart';
import '../../widgets/wallet_management_card.dart';

class SolanaWalletView extends StatefulWidget {
  final para_sdk.Wallet wallet;

  const SolanaWalletView({
    super.key,
    required this.wallet,
  });

  @override
  State<SolanaWalletView> createState() => _SolanaWalletViewState();
}

class _SolanaWalletViewState extends State<SolanaWalletView> {
  late solana.SolanaClient _solanaClient;
  para_sdk.ParaSolanaWeb3Signer? _signer;
  
  String? _balance;
  String _messageToSign = '';
  bool _isLoading = false;
  
  // Solana devnet configuration
  static const String _rpcUrl = 'https://api.devnet.solana.com';
  static const String _testAddress = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM';
  
  final List<String> _faucetUrls = [
    'https://faucet.solana.com',
  ];
  
  @override
  void initState() {
    super.initState();
    // Debug: wallet initialization
    // print('SolanaWalletView initState - wallet id: ${widget.wallet.id}');
    // print('SolanaWalletView initState - address: ${widget.wallet.address}');
    _initializeSolana();
  }
  
  Future<void> _initializeSolana() async {
    _solanaClient = solana.SolanaClient(
      rpcUrl: Uri.parse(_rpcUrl),
      websocketUrl: Uri.parse(_rpcUrl.replaceFirst('https', 'wss')),
    );
    
    try {
      _signer = para_sdk.ParaSolanaWeb3Signer(
        para: para,
        solanaClient: _solanaClient,
        walletId: widget.wallet.id,
      );
      
      if (widget.wallet.address != null) {
        setState(() {
          _balance = '0.0000 SOL'; // Set default balance
        });
        await _fetchBalance();
      } else {
        // Debug: no address found
        // print('SolanaWalletView - No address found, wallet might need initialization');
        setState(() {
          _isLoading = false;
        });
      }
    } catch (e) {
      // Debug: initialization error
      // print('SolanaWalletView - Error initializing: $e');
      _showResult('Error', 'Failed to initialize Solana signer: $e');
      setState(() {
        _isLoading = false;
      });
    }
  }
  
  @override
  void dispose() {
    // SolanaClient doesn't have a dispose method
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
      // print('SolanaWalletView - Cannot fetch balance: no address');
      setState(() => _balance = 'No address available');
      return;
    }
    
    setState(() => _isLoading = true);
    try {
      // Debug: fetching balance
      // print('SolanaWalletView - Fetching balance for address: ${widget.wallet.address}');
      final pubKey = solana.Ed25519HDPublicKey.fromBase58(widget.wallet.address!);
      final lamports = await _solanaClient.rpcClient.getBalance(pubKey.toBase58());
      final solBalance = lamports.value / solana.lamportsPerSol;
      setState(() => _balance = '${solBalance.toStringAsFixed(4)} SOL');
      // Debug: balance fetched
      // print('SolanaWalletView - Balance fetched: $_balance');
    } catch (e) {
      // Debug: balance fetch error
      // print('SolanaWalletView - Error fetching balance: $e');
      setState(() => _balance = '0.0000 SOL');
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
    final message = await _createTestTransaction(lamports: 1000000);
    if (message == null || _signer == null) return;
    
    setState(() => _isLoading = true);
    final startTime = DateTime.now();
    
    try {
      await _signer!.signTransaction(message);
      
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
        _balance!.replaceAll(' SOL', '')
      ) ?? 0;
      
      const requiredSOL = 0.0001 + 0.000005; // Transaction + fee
      if (balanceValue < requiredSOL) {
        _showResult(
          'Insufficient Balance',
          'You need at least ${requiredSOL.toStringAsFixed(6)} SOL to send this transaction.\n\n'
          'Current balance: $_balance\n\n'
          'To fund your wallet on Solana Devnet:\n'
          '1. Copy your wallet address\n'
          '2. Visit https://faucet.solana.com\n'
          '3. Paste your address and request SOL',
        );
        return;
      }
    }
    
    final message = await _createTestTransaction(lamports: 100000);
    if (message == null || _signer == null) return;
    
    setState(() => _isLoading = true);
    final startTime = DateTime.now();
    
    try {
      final signedTx = await _signer!.signTransaction(message);
      final signature = await _signer!.sendTransaction(
        signedTx,
        commitment: solana.Commitment.confirmed,
      );
      
      final duration = DateTime.now().difference(startTime).inMilliseconds / 1000;
      _showResult(
        'Success', 
        'Transaction sent successfully\nSignature: $signature\nDuration: ${duration.toStringAsFixed(2)}s',
      );
      
      // Refresh balance after successful transaction
      await _fetchBalance();
    } catch (e) {
      final duration = DateTime.now().difference(startTime).inMilliseconds / 1000;
      final errorMessage = e.toString();
      
      if (errorMessage.contains('insufficient') || errorMessage.contains('0x1')) {
        _showResult(
          'Insufficient Balance',
          'Transaction failed due to insufficient balance.\n\n'
          'To fund your wallet on Solana Devnet:\n'
          '1. Copy your wallet address\n'
          '2. Visit https://faucet.solana.com\n'
          '3. Paste your address and request SOL\n\n'
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
  
  Future<CompiledMessage?> _createTestTransaction({required int lamports}) async {
    if (widget.wallet.address == null) {
      _showResult('Error', 'No wallet address found');
      return null;
    }
    
    try {
      final fromPubkey = solana.Ed25519HDPublicKey.fromBase58(widget.wallet.address!);
      final toPubkey = solana.Ed25519HDPublicKey.fromBase58(_testAddress);
      
      // Get recent blockhash
      final recentBlockhash = await _solanaClient.rpcClient.getLatestBlockhash();
      
      // Create transfer instruction
      final transferInstruction = solana.SystemInstruction.transfer(
        fundingAccount: fromPubkey,
        recipientAccount: toPubkey,
        lamports: lamports,
      );
      
      // Create message
      final message = solana.Message(
        instructions: [transferInstruction],
      );
      
      // Compile message
      return message.compile(
        recentBlockhash: recentBlockhash.value.blockhash,
        feePayer: fromPubkey,
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
        'To fund your wallet on Solana Devnet:\n'
        '${_faucetUrls.asMap().entries.map((e) => '${e.key + 1}. ${e.value}').join('\n')}\n\n'
        'Note: Devnet SOL has no real value',
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
          'Solana Wallet',
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
                      if (_shouldShowFundButton()) ...[
                        const SizedBox(height: 8),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: _showFundingInstructions,
                            icon: const Icon(Icons.add_circle_outline),
                            label: const Text('Fund Wallet (Devnet)'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.purple,
                              foregroundColor: Colors.white,
                            ),
                          ),
                        ),
                      ],
                      if (_balance == null) ...[
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