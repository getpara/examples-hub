import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:web3dart/web3dart.dart';
import 'package:solana/solana.dart' as solana;
import 'package:solana/encoder.dart';
import '../features/auth/models/external_wallet_provider.dart';
import '../client/para.dart';

class ExternalWalletDemoScreen extends StatefulWidget {
  final ExternalWalletProvider provider;
  final String address;

  const ExternalWalletDemoScreen({
    super.key,
    required this.provider,
    required this.address,
  });

  @override
  State<ExternalWalletDemoScreen> createState() => _ExternalWalletDemoScreenState();
}

class _ExternalWalletDemoScreenState extends State<ExternalWalletDemoScreen> {
  bool _isSigning = false;
  bool _isSending = false;
  String? _signature;
  String? _transactionHash;
  String? _error;

  String get _walletName {
    switch (widget.provider) {
      case ExternalWalletProvider.metamask:
        return 'MetaMask';
      case ExternalWalletProvider.phantom:
        return 'Phantom';
      case ExternalWalletProvider.other:
        return 'Wallet';
    }
  }

  String _formatAddress(String address) {
    if (address.length <= 12) return address;
    return '${address.substring(0, 6)}...${address.substring(address.length - 4)}';
  }

  Future<void> _signMessage() async {
    setState(() {
      _isSigning = true;
      _error = null;
      _signature = null;
    });

    try {
      const message = 'Hello World from Para Flutter!';
      
      String signature;
      if (widget.provider == ExternalWalletProvider.phantom) {
        signature = await phantomConnector.signMessage(message);
      } else if (widget.provider == ExternalWalletProvider.metamask) {
        signature = await metamaskConnector.signMessage(message, widget.address);
      } else {
        throw Exception('Unsupported wallet provider');
      }

      setState(() {
        _signature = signature;
      });

      _showSuccessDialog('Message Signed', 'Message: "$message"\n\nSignature: $signature');
    } catch (e) {
      setState(() {
        _error = 'Failed to sign message: $e';
      });
      _showErrorDialog('Sign Message Failed', e.toString());
    } finally {
      setState(() {
        _isSigning = false;
      });
    }
  }

  Future<void> _sendTransaction() async {
    setState(() {
      _isSending = true;
      _error = null;
      _transactionHash = null;
    });

    try {
      if (widget.provider == ExternalWalletProvider.phantom) {
        // For Phantom (Solana), build transaction following main app pattern
        try {
          // Same test address as Swift SDK and main app
          const testAddress = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM';
          const lamports = 1000000; // 0.001 SOL
          
          // Initialize Solana client
          final solanaClient = solana.SolanaClient(
            rpcUrl: Uri.parse('https://api.devnet.solana.com'),
            websocketUrl: Uri.parse('wss://api.devnet.solana.com'),
          );
          
          // Create public keys
          final fromPubkey = solana.Ed25519HDPublicKey.fromBase58(widget.address);
          final toPubkey = solana.Ed25519HDPublicKey.fromBase58(testAddress);
          
          // Get recent blockhash
          final recentBlockhash = await solanaClient.rpcClient.getLatestBlockhash();
          
          // Create transfer instruction
          final transferInstruction = solana.SystemInstruction.transfer(
            fundingAccount: fromPubkey,
            recipientAccount: toPubkey,
            lamports: lamports,
          );
          
          // Create message with recent blockhash
          final message = solana.Message(
            instructions: [transferInstruction],
          );
          
          // Compile message
          final compiledMessage = message.compile(
            recentBlockhash: recentBlockhash.value.blockhash,
            feePayer: fromPubkey,
          );
          
          // Create unsigned transaction
          // Phantom expects a transaction with empty signatures
          final dummySignature = solana.Signature(
            List.filled(64, 0), // 64 zero bytes for empty signature
            publicKey: fromPubkey,
          );
          
          final unsignedTx = solana.SignedTx(
            compiledMessage: compiledMessage,
            signatures: [dummySignature], // Empty signature for Phantom to fill
          );
          
          // Serialize the transaction
          final serializedMessage = unsignedTx.encode();
          
          // Debug: Log transaction details
          print('Transaction details:');
          print('  From: ${widget.address}');
          print('  To: $testAddress');
          print('  Amount: $lamports lamports (0.001 SOL)');
          print('  Blockhash: ${recentBlockhash.value.blockhash}');
          print('  Serialized size: ${serializedMessage.length} bytes');
          
          // Send via Phantom connector using the new method
          final signature = await phantomConnector.signAndSendTransactionBytes(serializedMessage);
          
          setState(() {
            _transactionHash = signature;
          });

          _showSuccessDialog(
            'Transaction Sent!', 
            'Real Solana transaction sent successfully!\n\n'
            'To: $testAddress\n'
            'Amount: 0.001 SOL\n'
            'Network: Solana Devnet\n\n'
            'Transaction Signature:\n$signature\n\n'
            '⚠️ This is a real transaction on Solana Devnet.'
          );
        } catch (e) {
          // Handle errors
          String errorMessage = e.toString();
          
          if (errorMessage.contains('user rejected')) {
            _showErrorDialog('Transaction Cancelled', 'You rejected the transaction in Phantom wallet.');
          } else if (errorMessage.contains('insufficient') || errorMessage.contains('0x1')) {
            _showErrorDialog('Insufficient Balance', 
              'You need SOL in your wallet to pay for transaction fees.\n\n'
              'Visit https://faucet.solana.com to get free devnet SOL.');
          } else if (errorMessage.contains('RangeError')) {
            // This is expected with the current solana_web3 package limitations
            _showErrorDialog('Phantom Transaction', 
              'The Phantom connector is working, but the solana_web3 package '
              'has limitations with transaction deserialization.\n\n'
              'In a production app, you would:\n'
              '1. Build the transaction (✓ working)\n'
              '2. Pass it to Phantom differently\n'
              '3. Or use Para SDK\'s native wallet instead\n\n'
              'Error: $errorMessage');
          } else {
            _showErrorDialog('Transaction Failed', errorMessage);
          }
        }
        return;
      }

      // For MetaMask (Ethereum), create real transaction
      // Para SDK expects a proper Transaction object from web3dart package
      final transaction = Transaction(
        from: EthereumAddress.fromHex(widget.address), // Sender address (required for serialization)
        to: EthereumAddress.fromHex('0x13158486860B81Dee9e43Dd0391e61c2F82B577F'), // Test address
        value: EtherAmount.fromBigInt(EtherUnit.wei, BigInt.from(1000000000000000)), // 0.001 ETH in wei
        gasPrice: EtherAmount.fromBigInt(EtherUnit.gwei, BigInt.from(20)), // 20 gwei
        maxGas: 21000, // Standard gas limit for ETH transfer
        nonce: 0, // Placeholder nonce (MetaMask will determine actual nonce)
      );

      final txHash = await metamaskConnector.sendTransaction(transaction, widget.address);
      
      setState(() {
        _transactionHash = txHash;
      });

      _showSuccessDialog(
        'Transaction Sent!', 
        'Real Ethereum transaction sent successfully!\n\n'
        'To: 0x13158486860B81Dee9e43Dd0391e61c2F82B577F\n'
        'Amount: 0.001 ETH\n'
        'Gas Price: 20 gwei\n'
        'Gas Limit: 21,000\n\n'
        'Transaction Hash:\n$txHash\n\n'
        '⚠️ This is a real transaction on the network you have selected in MetaMask. '
        'Make sure you are on a testnet if you don\'t want to spend real ETH.'
      );
    } catch (e) {
      setState(() {
        _error = 'Failed to send transaction: $e';
      });
      
      // Provide more specific error messages
      String errorMessage = e.toString();
      if (widget.provider == ExternalWalletProvider.phantom) {
        if (errorMessage.contains('user rejected')) {
          errorMessage = 'Transaction was rejected by user in Phantom';
        } else if (errorMessage.contains('insufficient funds')) {
          errorMessage = 'Insufficient funds to complete transaction (need SOL for fees)';
        } else if (errorMessage.contains('network')) {
          errorMessage = 'Network error - please check your Phantom connection';
        }
      } else {
        if (errorMessage.contains('user rejected')) {
          errorMessage = 'Transaction was rejected by user in MetaMask';
        } else if (errorMessage.contains('insufficient funds')) {
          errorMessage = 'Insufficient funds to complete transaction (need ETH for gas)';
        } else if (errorMessage.contains('network')) {
          errorMessage = 'Network error - please check your MetaMask connection';
        }
      }
      
      _showErrorDialog('Transaction Failed', errorMessage);
    } finally {
      setState(() {
        _isSending = false;
      });
    }
  }

  Future<void> _disconnect() async {
    try {
      if (widget.provider == ExternalWalletProvider.phantom) {
        await phantomConnector.disconnect();
      } else if (widget.provider == ExternalWalletProvider.metamask) {
        // MetaMask connector may not have a disconnect method
        // Just clear the connection by navigating back
        debugPrint('MetaMask disconnect - clearing connection');
      }
      
      if (mounted) {
        Navigator.pop(context);
      }
    } catch (e) {
      _showErrorDialog('Disconnect Failed', e.toString());
    }
  }

  void _showSuccessDialog(String title, String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _showErrorDialog(String title, String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }


  void _copyAddress() {
    Clipboard.setData(ClipboardData(text: widget.address));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Address copied to clipboard')),
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
        title: Text(
          '$_walletName Demo',
          style: const TextStyle(
            color: Colors.black,
            fontWeight: FontWeight.w600,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _disconnect,
            tooltip: 'Disconnect',
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Connected Address Card
            _buildCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Connected Address',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: Colors.black,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.grey[100],
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                _formatAddress(widget.address),
                                style: const TextStyle(
                                  fontFamily: 'SF Mono',
                                  fontSize: 16,
                                  fontWeight: FontWeight.w500,
                                  color: Colors.black,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                widget.address,
                                style: TextStyle(
                                  fontFamily: 'SF Mono',
                                  fontSize: 12,
                                  color: Colors.grey[600],
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.copy, size: 20),
                          onPressed: _copyAddress,
                          tooltip: 'Copy address',
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            
            // Message Signing Card
            _buildCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Message Signing',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: Colors.black,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Test message signing with your connected wallet',
                    style: TextStyle(
                      color: Colors.grey[600],
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _isSigning ? null : _signMessage,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.black,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: _isSigning
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                              ),
                            )
                          : const Text(
                              'Sign Message',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                    ),
                  ),
                  if (_signature != null) ...[
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.green[50],
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.green[200]!),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.check_circle, color: Colors.green[600], size: 16),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'Signature: ${_signature!.length > 20 ? '${_signature!.substring(0, 20)}...' : _signature!}',
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.green[800],
                                fontFamily: 'SF Mono',
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 24),
            
            // Transaction Sending Card
            _buildCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Send Transaction',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: Colors.black,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    widget.provider == ExternalWalletProvider.phantom 
                      ? 'Send a REAL Solana transaction (0.001 SOL)'
                      : 'Send a REAL Ethereum transaction (0.001 ETH)',
                    style: TextStyle(
                      color: Colors.orange[700],
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.orange[50],
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.orange[200]!),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.warning, color: Colors.orange[600], size: 16),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            widget.provider == ExternalWalletProvider.phantom
                              ? 'This will send a real transaction on your selected Solana network. Use devnet to avoid spending real SOL.'
                              : 'This will send a real transaction on your selected network. Use testnet to avoid spending real ETH.',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.orange[800],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _isSending ? null : _sendTransaction,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.grey[300],
                        foregroundColor: Colors.black,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: _isSending
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(Colors.black),
                              ),
                            )
                          : const Text(
                              'Send Transaction',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                    ),
                  ),
                  if (_transactionHash != null) ...[
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.blue[50],
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.blue[200]!),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.receipt, color: Colors.blue[600], size: 16),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'TX Hash: ${_transactionHash!.length > 20 ? '${_transactionHash!.substring(0, 20)}...' : _transactionHash!}',
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.blue[800],
                                fontFamily: 'SF Mono',
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
            
            if (_error != null) ...[
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.red[50],
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.red[200]!),
                ),
                child: Row(
                  children: [
                    Icon(Icons.error, color: Colors.red[600], size: 16),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _error!,
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.red[800],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildCard({required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: child,
    );
  }
}