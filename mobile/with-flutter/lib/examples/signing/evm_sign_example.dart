import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:para_flutter/client/para.dart';
import 'package:para/para.dart' as para_sdk;
import 'package:web3dart/crypto.dart';
import 'package:web3dart/web3dart.dart';
import 'package:http/http.dart';
import 'contract_definitions.dart';

enum TransactionType {
  legacy,
  eip1559,
  contract,
}

class EvmSignExample extends StatefulWidget {
  final para_sdk.Wallet wallet;

  const EvmSignExample({
    super.key,
    required this.wallet,
  });

  @override
  State<EvmSignExample> createState() => _EvmSignExampleState();
}

class _EvmSignExampleState extends State<EvmSignExample> {
  final _formKey = GlobalKey<FormState>();
  final _recipientController = TextEditingController();
  final _amountController = TextEditingController();
  late final Web3Client _web3Client;
  late final Client _httpClient;
  late final para_sdk.ParaEvmSigner _evmSigner;
  bool _isLoading = false;
  String? _signature;
  String? _error;
  String? _txHash;
  EtherAmount? _balance;

  // Track which transaction type is selected
  TransactionType _selectedTxType = TransactionType.eip1559;

  @override
  void dispose() {
    _recipientController.dispose();
    _amountController.dispose();
    _web3Client.dispose();
    _httpClient.close();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();

    _httpClient = Client();
    _web3Client = Web3Client('https://ethereum-holesky-rpc.publicnode.com', _httpClient);
    _evmSigner = para_sdk.ParaEvmSigner(
      para: para,
      walletId: widget.wallet.id,
    );

    _checkBalance();
  }

  Future<void> _checkBalance() async {
    try {
      final balance = await _web3Client.getBalance(
        EthereumAddress.fromHex(widget.wallet.address!),
      );
      setState(() {
        _balance = balance;
      });
    } catch (e) {
      // Silently handle balance check errors
    }
  }

  /// Send ETH using a legacy transaction (pre-EIP-1559)
  Future<void> _sendLegacyTransaction() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _signature = null;
      _txHash = null;
      _error = null;
    });

    try {
      final EthereumAddress toAddress = EthereumAddress.fromHex(_recipientController.text);
      final amountInEther = double.parse(_amountController.text);
      final amount = EtherAmount.fromBigInt(EtherUnit.wei, BigInt.from(amountInEther * 1000000000000000000));

      final chainId = await _web3Client.getChainId();
      final fromAddress = EthereumAddress.fromHex(widget.wallet.address!);
      final nonce = await _web3Client.getTransactionCount(fromAddress);
      final gasPrice = await _web3Client.getGasPrice();

      final transaction = Transaction(
        from: fromAddress,
        to: toAddress,
        value: amount,
        maxGas: 21000,
        nonce: nonce,
        gasPrice: gasPrice,
        data: Uint8List(0),
      );

      final signedTransaction = await _evmSigner.signTransaction(
        transaction,
        chainId: chainId.toInt(),
        client: _web3Client,
      );

      final txHash = await _web3Client.sendRawTransaction(signedTransaction);

      setState(() {
        _signature = bytesToHex(signedTransaction, include0x: true);
        _txHash = txHash;
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

  /// Send ETH using an EIP-1559 transaction (gas-optimized)
  Future<void> _sendEip1559Transaction() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _signature = null;
      _txHash = null;
      _error = null;
    });

    try {
      final EthereumAddress toAddress = EthereumAddress.fromHex(_recipientController.text);
      final amountInEther = double.parse(_amountController.text);
      final amount = EtherAmount.fromBigInt(EtherUnit.wei, BigInt.from(amountInEther * 1000000000000000000));

      final chainId = await _web3Client.getChainId();
      final fromAddress = EthereumAddress.fromHex(widget.wallet.address!);
      final nonce = await _web3Client.getTransactionCount(fromAddress);

      // For EIP-1559, get the current block to estimate fees
      final blockInformation = await _web3Client.getBlockInformation();
      final baseFeePerGas = blockInformation.baseFeePerGas;

      // Set maxPriorityFeePerGas (miner tip)
      final maxPriorityFeePerGas = EtherAmount.inWei(BigInt.from(1500000000)); // 1.5 Gwei

      // Calculate maxFeePerGas = (2 * baseFeePerGas) + maxPriorityFeePerGas
      final maxFeePerGas = EtherAmount.inWei(
          (baseFeePerGas?.getInWei ?? BigInt.from(0)) * BigInt.from(2) + maxPriorityFeePerGas.getInWei);

      final transaction = Transaction(
        from: fromAddress,
        to: toAddress,
        value: amount,
        maxGas: 21000, // Standard gas for ETH transfer
        nonce: nonce,
        data: Uint8List(0),
        maxPriorityFeePerGas: maxPriorityFeePerGas,
        maxFeePerGas: maxFeePerGas,
      );

      final signedTransaction = await _evmSigner.signTransaction(
        transaction,
        chainId: chainId.toInt(),
        client: _web3Client,
      );

      final txHash = await _web3Client.sendRawTransaction(signedTransaction);

      setState(() {
        _signature = bytesToHex(signedTransaction, include0x: true);
        _txHash = txHash;
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

  /// Mint tokens using a contract call
  Future<void> _mintTokens([String amount = '1']) async {
    setState(() {
      _isLoading = true;
      _signature = null;
      _txHash = null;
      _error = null;
    });

    try {
      final contractAddress = EthereumAddress.fromHex('0x83cC70475A0d71EF1F2F61FeDE625c8C7E90C3f2');

      // Create contract instance using loaded ABI
      final contract =
          DeployedContract(ContractAbi.fromJson(jsonEncode(paraTestTokenAbi), paraTestTokenName), contractAddress);

      // Get function reference for mint
      final mintFunction = contract.function('mint');

      // Convert amount to Wei
      final amountInWei = EtherAmount.fromBase10String(EtherUnit.ether, amount).getInWei;

      // Get chain ID
      final chainId = await _web3Client.getChainId();
      final fromAddress = EthereumAddress.fromHex(widget.wallet.address!);
      final nonce = await _web3Client.getTransactionCount(fromAddress);

      // Get current gas price or use EIP-1559 parameters
      final blockInformation = await _web3Client.getBlockInformation();
      final baseFeePerGas = blockInformation.baseFeePerGas;
      final maxPriorityFeePerGas = EtherAmount.inWei(BigInt.from(1500000000)); // 1.5 Gwei
      final maxFeePerGas = EtherAmount.inWei(
          (baseFeePerGas?.getInWei ?? BigInt.from(0)) * BigInt.from(2) + maxPriorityFeePerGas.getInWei);

      // Estimate gas
      final gasEstimate = await _web3Client.estimateGas(
        sender: fromAddress,
        to: contractAddress,
        data: mintFunction.encodeCall([amountInWei]),
      );

      // Add 20% buffer to gas estimate
      final maxGas = (gasEstimate * BigInt.from(12) ~/ BigInt.from(10)).toInt();

      // Create contract transaction
      final transaction = Transaction(
        from: fromAddress,
        to: contractAddress,
        value: EtherAmount.zero(),
        maxGas: maxGas,
        nonce: nonce,
        data: mintFunction.encodeCall([amountInWei]),
        maxPriorityFeePerGas: maxPriorityFeePerGas,
        maxFeePerGas: maxFeePerGas,
      );

      // Sign transaction
      final signedTransaction = await _evmSigner.signTransaction(
        transaction,
        chainId: chainId.toInt(),
        client: _web3Client,
      );

      // Send transaction
      final txHash = await _web3Client.sendRawTransaction(signedTransaction);

      setState(() {
        _signature = bytesToHex(signedTransaction, include0x: true);
        _txHash = txHash;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  // Execute the selected transaction type
  Future<void> _executeTransaction() async {
    switch (_selectedTxType) {
      case TransactionType.legacy:
        await _sendLegacyTransaction();
        break;
      case TransactionType.eip1559:
        await _sendEip1559Transaction();
        break;
      case TransactionType.contract:
        await _mintTokens(_amountController.text.isEmpty ? '1' : _amountController.text);
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Ethereum Sign Example'),
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
                  'Ethereum Signing Demo',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'Example of signing transactions using Para SDK.',
                  style: TextStyle(
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 16),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        Expanded(
                          child: Text(
                            'Wallet Address: ${widget.wallet.address}',
                            style: const TextStyle(fontFamily: 'monospace'),
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.copy),
                          onPressed: () {
                            Clipboard.setData(ClipboardData(text: widget.wallet.address!));
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Address copied to clipboard')),
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                TextButton(
                  onPressed: _checkBalance,
                  child: Text(
                    'Balance: ${_balance != null ? '${_balance!.getValueInUnit(EtherUnit.ether)} ETH' : 'Loading...'}',
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
                SegmentedButton<TransactionType>(
                  segments: const [
                    ButtonSegment(
                      value: TransactionType.legacy,
                      label: Text('Legacy'),
                    ),
                    ButtonSegment(
                      value: TransactionType.eip1559,
                      label: Text('EIP-1559'),
                    ),
                    ButtonSegment(
                      value: TransactionType.contract,
                      label: Text('Mint Token'),
                    ),
                  ],
                  selected: {_selectedTxType},
                  onSelectionChanged: (Set<TransactionType> selection) {
                    setState(() {
                      _selectedTxType = selection.first;
                    });
                  },
                  multiSelectionEnabled: false,
                  showSelectedIcon: false,
                ),
                const SizedBox(height: 24),
                if (_selectedTxType != TransactionType.contract) ...[
                  TextFormField(
                    controller: _recipientController,
                    decoration: const InputDecoration(
                      labelText: 'Recipient Address',
                      hintText: 'Enter Ethereum address',
                      prefixIcon: Icon(Icons.account_balance_wallet_outlined),
                    ),
                    validator: (value) {
                      if (_selectedTxType == TransactionType.contract) {
                        return null;
                      }
                      if (value == null || value.isEmpty) {
                        return 'Please enter a recipient address';
                      }
                      try {
                        EthereumAddress.fromHex(value);
                        return null;
                      } catch (_) {
                        return 'Invalid Ethereum address';
                      }
                    },
                  ),
                  const SizedBox(height: 12),
                ],
                TextFormField(
                  controller: _amountController,
                  decoration: InputDecoration(
                    labelText: _selectedTxType == TransactionType.contract ? 'Token Amount' : 'Amount (ETH)',
                    hintText:
                        _selectedTxType == TransactionType.contract ? 'Enter token amount' : 'Enter amount in ETH',
                    prefixIcon: const Icon(Icons.attach_money),
                  ),
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  inputFormatters: [
                    FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d*$')),
                  ],
                  validator: (value) {
                    if (_selectedTxType == TransactionType.contract && (value == null || value.isEmpty)) {
                      return null; // Optional for contract calls, will use default
                    }
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
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: _isLoading ? null : _executeTransaction,
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : Text(_selectedTxType == TransactionType.contract ? 'Mint Tokens' : 'Send Transaction'),
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
                if (_signature != null) ...[
                  const SizedBox(height: 24),
                  const Text(
                    'Signed Transaction:',
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
                              _signature!,
                              style: const TextStyle(fontFamily: 'monospace'),
                              overflow: TextOverflow.ellipsis,
                              maxLines: 4,
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.copy),
                            onPressed: () {
                              Clipboard.setData(ClipboardData(text: _signature!));
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Signed transaction copied to clipboard')),
                              );
                            },
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
                if (_txHash != null) ...[
                  const SizedBox(height: 24),
                  const Text(
                    'Transaction Hash:',
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
                              _txHash!,
                              style: const TextStyle(fontFamily: 'monospace'),
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.copy),
                            onPressed: () {
                              Clipboard.setData(ClipboardData(text: _txHash!));
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Transaction hash copied')),
                              );
                            },
                          ),
                          IconButton(
                            icon: const Icon(Icons.open_in_new),
                            onPressed: () {
                              // Open transaction in block explorer
                              final url = 'https://holesky.etherscan.io/tx/$_txHash';
                              // Launch URL using url_launcher or other method
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
