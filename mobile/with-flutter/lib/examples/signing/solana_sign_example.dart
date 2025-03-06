import 'package:para_flutter/client/para.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:para/para.dart';
import 'package:solana/solana.dart' as web3;

Uri devnetRpcUrl = Uri.parse('https://api.devnet.solana.com');
Uri devnetWsUrl = Uri.parse('wss://api.devnet.solana.com');

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
  late final web3.SolanaClient _solanaClient;
  late final ParaSolanaWeb3Signer _solanaSigner;
  bool _isLoading = false;
  String? _lastSignature;
  String? _error;
  double? _balanceSol;

  @override
  void dispose() {
    _recipientController.dispose();
    _amountController.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();

    _solanaClient =
        web3.SolanaClient(rpcUrl: devnetRpcUrl, websocketUrl: devnetWsUrl);
    _solanaSigner =
        ParaSolanaWeb3Signer(para: para, solanaClient: _solanaClient);

    _checkBalance();
  }

  void _checkBalance() async {
    final balance =
        await _solanaClient.rpcClient.getBalance(widget.wallet.address!);

    setState(() {
      _balanceSol = balance.value / web3.lamportsPerSol;
    });
  }

// This method assumes usage of solana (https://pub.dev/packages/solana) package.
  Future<void> _signTransaction() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _lastSignature = null;
      _error = null;
    });

    try {
      final publicKey =
          web3.Ed25519HDPublicKey.fromBase58(widget.wallet.address!);
      final blockhash =
          (await _solanaClient.rpcClient.getLatestBlockhash()).value;
      final lamports =
          web3.lamportsPerSol * double.parse(_amountController.text);

      final instruction = web3.SystemInstruction.transfer(
          fundingAccount: publicKey,
          recipientAccount:
              web3.Ed25519HDPublicKey.fromBase58(_recipientController.text),
          lamports: lamports.toInt());

      final message = web3.Message(instructions: [instruction]);
      final compiledMessage = message.compile(
          recentBlockhash: blockhash.blockhash, feePayer: publicKey);
      final signedTransaction =
          await _solanaSigner.signTransaction(compiledMessage);

      setState(() {
        _lastSignature = signedTransaction.signatures.first.toString();
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _sendTransaction() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _lastSignature = null;
      _error = null;
    });

    try {
      final publicKey =
          web3.Ed25519HDPublicKey.fromBase58(widget.wallet.address!);
      final blockhash =
          (await _solanaClient.rpcClient.getLatestBlockhash()).value;
      final lamports =
          web3.lamportsPerSol * double.parse(_amountController.text);

      final instruction = web3.SystemInstruction.transfer(
          fundingAccount: publicKey,
          recipientAccount:
              web3.Ed25519HDPublicKey.fromBase58(_recipientController.text),
          lamports: lamports.toInt());

      final message = web3.Message(instructions: [instruction]);
      final compiledMessage = message.compile(
          recentBlockhash: blockhash.blockhash, feePayer: publicKey);
      final signedTransaction =
          await _solanaSigner.signTransaction(compiledMessage);

      final sendTransaction =
          await _solanaSigner.sendTransaction(signedTransaction);

      setState(() {
        _lastSignature = signedTransaction.signatures.first.toString();
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
                  ),
                ),
                const SizedBox(height: 12),
                TextButton(
                  onPressed: _checkBalance,
                  child: Text(
                    'Balance: ${_balanceSol ?? 'Loading...'} SOL',
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
                      web3.Ed25519HDPublicKey.fromBase58(value);
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
                  keyboardType:
                      const TextInputType.numberWithOptions(decimal: true),
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
                const SizedBox(height: 12),
                ElevatedButton(
                  onPressed: _isLoading ? null : _sendTransaction,
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('Send Transaction'),
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
                              Clipboard.setData(
                                  ClipboardData(text: _lastSignature!));
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                    content:
                                        Text('Signature copied to clipboard')),
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
