import 'dart:convert';

import 'package:cpsl_flutter/client/capsule.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:capsule/capsule.dart';
import 'package:solana_web3/solana_web3.dart' as web3;
import 'package:solana_web3/programs.dart' as programs;

class SolanaSignExample extends StatefulWidget {
  final Wallet wallet;

  const SolanaSignExample({
    super.key,
    required this.wallet,
  });

  @override
  State<SolanaSignExample> createState() => _SolanaSignExampleState();
}

class _SolanaSignExampleState extends State<SolanaSignExample> {
  final _formKey = GlobalKey<FormState>();
  final _recipientController = TextEditingController();
  final _amountController = TextEditingController();
  bool _isLoading = false;
  String? _lastSignature;
  String? _error;

  @override
  void dispose() {
    _recipientController.dispose();
    _amountController.dispose();
    super.dispose();
  }

// This method assumes usage of solan_web3 (https://pub.dev/packages/solana_web3) package but can be adapted to other Solana libraries like the solana package (https://pub.dev/packages/solana). The key when signing a transaction is to first construct the transaction and then sign on the raw message bytes by calling the signMessage method on the Capsule client. The message bytes can be obtained by serializing the transaction message. The signature returned by the signMessage method can then be added to the transaction object. The transaction can then be sent to the Solana network.
  Future<void> _signTransaction() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _lastSignature = null;
      _error = null;
    });

    try {
      final connection = web3.Connection(web3.Cluster.devnet);

      final publicKey = web3.Pubkey.fromBase58(widget.wallet.address!);

      final blockhash = await connection.getLatestBlockhash();

      final lamports = web3.solToLamports(double.parse(_amountController.text));

      final transaction = web3.Transaction.v0(
        payer: publicKey,
        recentBlockhash: blockhash.blockhash,
        instructions: [
          programs.SystemProgram.transfer(
            fromPubkey: publicKey,
            toPubkey: web3.Pubkey.fromBase58(_recipientController.text),
            lamports: lamports,
          ),
        ],
      );

      final message = Uint8List.fromList(transaction.serializeMessage().toList());

      final messageBase64 = base64Encode(message);

      final result = await capsuleClient.signMessage(
        walletId: widget.wallet.id!,
        messageBase64: messageBase64,
      );

      late final Uint8List signature;
      if (result is SuccessfulSignatureResult) {
        signature = base64.decode(result.signature);
      } else if (result is DeniedSignatureResultWithUrl) {
        throw Exception('Signature denied: ${result.transactionReviewUrl}');
      } else {
        throw Exception('Signature denied');
      }

      transaction.addSignature(publicKey, signature);

      final signatureString = web3.base58.encode(transaction.signature!);

      setState(() {
        _lastSignature = signatureString;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

// This method
  Future<void> _signWithSolanaWeb3Adaptter() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _lastSignature = null;
      _error = null;
    });

    try {
      final connection = web3.Connection(web3.Cluster.devnet);

      final solanaWeb3Signer = CapsuleSolanaWeb3Signer(capsule: capsuleClient, connection: connection);

      final publicKey = web3.Pubkey.fromBase58(widget.wallet.address!);

      final blockhash = await connection.getLatestBlockhash();

      final lamports = web3.solToLamports(double.parse(_amountController.text));

      final transaction = web3.Transaction.v0(
        payer: publicKey,
        recentBlockhash: blockhash.blockhash,
        instructions: [
          programs.SystemProgram.transfer(
            fromPubkey: publicKey,
            toPubkey: web3.Pubkey.fromBase58(_recipientController.text),
            lamports: lamports,
          ),
        ],
      );

      final signedTransaction = await solanaWeb3Signer.signTransaction(transaction);

      setState(() {
        _lastSignature = signedTransaction.signature.toString();
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Solana Sign Example'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'Sign Solana Transaction',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'Example of signing a transfer transaction on Solana.',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.black87,
                  ),
                ),
                const SizedBox(height: 32),
                TextFormField(
                  controller: _recipientController,
                  decoration: const InputDecoration(
                    labelText: 'Recipient Address',
                    hintText: 'Enter Solana address',
                    prefixIcon: Icon(Icons.account_balance_wallet_outlined),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter a recipient address';
                    }
                    try {
                      web3.Pubkey.fromBase58(value);
                      return null;
                    } catch (_) {
                      return 'Invalid Solana address';
                    }
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _amountController,
                  decoration: const InputDecoration(
                    labelText: 'Amount (SOL)',
                    hintText: 'Enter amount in SOL',
                    prefixIcon: Icon(Icons.attach_money),
                  ),
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  inputFormatters: [
                    FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d*$')),
                  ],
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter an amount';
                    }
                    final amount = double.tryParse(value);
                    if (amount == null || amount <= 0) {
                      return 'Please enter a valid amount';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: _isLoading ? null : _signTransaction,
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('Sign Transaction'),
                ),
                if (_error != null) ...[
                  const SizedBox(height: 24),
                  Text(
                    _error!,
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.error,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
                if (_lastSignature != null) ...[
                  const SizedBox(height: 24),
                  const Text(
                    'Transaction Signature:',
                    style: TextStyle(fontWeight: FontWeight.bold),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        children: [
                          Expanded(
                            child: Text(
                              _lastSignature!,
                              style: const TextStyle(fontFamily: 'monospace'),
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.copy),
                            onPressed: () {
                              Clipboard.setData(ClipboardData(text: _lastSignature!));
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Signature copied to clipboard')),
                              );
                            },
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
