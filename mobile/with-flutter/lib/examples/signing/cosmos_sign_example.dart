import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:para_flutter/client/para.dart';
import 'package:para/para.dart' as para_sdk;

enum CosmosTransactionType {
  message,
  bankSend,
}

class CosmosSignExample extends StatefulWidget {
  final para_sdk.Wallet wallet;

  const CosmosSignExample({
    super.key,
    required this.wallet,
  });

  @override
  State<CosmosSignExample> createState() => _CosmosSignExampleState();
}

class _CosmosSignExampleState extends State<CosmosSignExample> {
  final _formKey = GlobalKey<FormState>();
  final _recipientController = TextEditingController();
  final _amountController = TextEditingController();
  final _messageController = TextEditingController();
  late final para_sdk.ParaCosmosSigner _cosmosSigner;
  bool _isLoading = false;
  String? _signatureResult;
  String? _error;
  String? _balance;

  CosmosTransactionType _selectedTxType = CosmosTransactionType.bankSend;
  para_sdk.CosmosSigningMethod _signingMethod = para_sdk.CosmosSigningMethod.amino;

  @override
  void dispose() {
    _recipientController.dispose();
    _amountController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();

    _cosmosSigner = para_sdk.ParaCosmosSigner(
      para: para,
      walletId: widget.wallet.id,
    );

    // Pre-fill recipient address for bank send
    _recipientController.text = 'cosmos1hsk6jryyqjfhp5dhc55tc9jtckygx0eph6dd02';
    
    _initializeSigner();
  }

  Future<void> _initializeSigner() async {
    try {
      await _cosmosSigner.initialize();
      _checkBalance();
    } catch (e) {
      setState(() {
        _error = 'Failed to initialize Cosmos signer: $e';
      });
    }
  }

  Future<void> _checkBalance() async {
    try {
      final balance = await _cosmosSigner.getBalance();
      setState(() {
        _balance = balance;
      });
    } catch (e) {
      // Silently handle balance check errors for now
      setState(() {
        _balance = 'Unable to fetch balance';
      });
    }
  }

  Future<void> _signMessage() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _signatureResult = null;
      _error = null;
    });

    try {
      final message = _messageController.text;
      final signature = await _cosmosSigner.signMessage(message);
      
      final result = {
        'message': message,
        'signature': base64Encode(signature),
        'address': _cosmosSigner.getAddressSafe() ?? 'unknown',
      };

      setState(() {
        _signatureResult = const JsonEncoder.withIndent('  ').convert(result);
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _signBankSendTransaction() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _signatureResult = null;
      _error = null;
    });

    try {
      final recipient = _recipientController.text;
      final amount = _amountController.text;
      
      // Convert amount to micro units (1 ATOM = 1,000,000 uatom)
      final amountInMicroUnits = (double.parse(amount) * 1000000).toInt().toString();

      final result = await _cosmosSigner.signTransaction(
        toAddress: recipient,
        amount: amountInMicroUnits,
        denom: 'uatom',
        memo: 'Sent via Para Flutter SDK',
        signingMethod: _signingMethod,
      );

      setState(() {
        _signatureResult = const JsonEncoder.withIndent('  ').convert(result);
        _isLoading = false;
      });

      _checkBalance();
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _executeTransaction() async {
    switch (_selectedTxType) {
      case CosmosTransactionType.message:
        await _signMessage();
        break;
      case CosmosTransactionType.bankSend:
        await _signBankSendTransaction();
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Cosmos Sign Example'),
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
                  'Cosmos Signing Demo',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'Example of signing messages and transactions using Para SDK.',
                  style: TextStyle(
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 16),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                'Cosmos Address: ${_cosmosSigner.getAddressSafe() ?? 'Loading...'}',
                                style: const TextStyle(fontFamily: 'monospace'),
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.copy),
                              onPressed: () {
                                final address = _cosmosSigner.getAddressSafe();
                                if (address != null) {
                                  Clipboard.setData(ClipboardData(text: address));
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text('Address copied to clipboard')),
                                  );
                                }
                              },
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        TextButton(
                          onPressed: _checkBalance,
                          child: Text(
                            'Balance: ${_balance ?? 'Loading...'} uatom',
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                const Text(
                  'Transaction Type',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                SegmentedButton<CosmosTransactionType>(
                  segments: const [
                    ButtonSegment(
                      value: CosmosTransactionType.message,
                      label: Text('Sign Message'),
                    ),
                    ButtonSegment(
                      value: CosmosTransactionType.bankSend,
                      label: Text('Bank Send'),
                    ),
                  ],
                  selected: {_selectedTxType},
                  onSelectionChanged: (Set<CosmosTransactionType> selection) {
                    setState(() {
                      _selectedTxType = selection.first;
                    });
                  },
                  multiSelectionEnabled: false,
                  showSelectedIcon: false,
                ),
                const SizedBox(height: 16),
                if (_selectedTxType == CosmosTransactionType.bankSend) ...[
                  const Text(
                    'Signing Method',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 8),
                  SegmentedButton<para_sdk.CosmosSigningMethod>(
                    segments: const [
                      ButtonSegment(
                        value: para_sdk.CosmosSigningMethod.amino,
                        label: Text('Amino'),
                      ),
                      ButtonSegment(
                        value: para_sdk.CosmosSigningMethod.proto,
                        label: Text('Proto'),
                      ),
                    ],
                    selected: {_signingMethod},
                    onSelectionChanged: (Set<para_sdk.CosmosSigningMethod> selection) {
                      setState(() {
                        _signingMethod = selection.first;
                      });
                    },
                    multiSelectionEnabled: false,
                    showSelectedIcon: false,
                  ),
                  const SizedBox(height: 16),
                ],
                if (_selectedTxType == CosmosTransactionType.message) ...[
                  TextFormField(
                    controller: _messageController,
                    decoration: const InputDecoration(
                      labelText: 'Message to Sign',
                      hintText: 'Enter any message to sign',
                      prefixIcon: Icon(Icons.message),
                    ),
                    maxLines: 3,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter a message to sign';
                      }
                      return null;
                    },
                  ),
                ] else ...[
                  TextFormField(
                    controller: _recipientController,
                    decoration: const InputDecoration(
                      labelText: 'Recipient Address',
                      hintText: 'Enter Cosmos address (cosmos...)',
                      prefixIcon: Icon(Icons.account_balance_wallet_outlined),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter a recipient address';
                      }
                      if (!value.startsWith('cosmos1')) {
                        return 'Invalid Cosmos address (should start with cosmos1)';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _amountController,
                    decoration: const InputDecoration(
                      labelText: 'Amount (ATOM)',
                      hintText: 'Enter amount in ATOM',
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
                ],
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: _isLoading ? null : _executeTransaction,
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : Text(_selectedTxType == CosmosTransactionType.message ? 'Sign Message' : 'Sign Transaction'),
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
                if (_signatureResult != null) ...[
                  const SizedBox(height: 24),
                  const Text(
                    'Signature Result:',
                    style: TextStyle(fontWeight: FontWeight.bold),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Expanded(
                                child: Text(
                                  _signatureResult!,
                                  style: const TextStyle(fontFamily: 'monospace', fontSize: 12),
                                ),
                              ),
                              IconButton(
                                icon: const Icon(Icons.copy),
                                onPressed: () {
                                  Clipboard.setData(ClipboardData(text: _signatureResult!));
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text('Signature result copied to clipboard')),
                                  );
                                },
                              ),
                            ],
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
