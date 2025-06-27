import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:para/para.dart';
import 'package:para_flutter/client/para.dart';
import 'package:para_flutter/widgets/cosmos_widgets.dart';

class CosmosSignExample extends StatefulWidget {
  final Wallet wallet;

  const CosmosSignExample({
    super.key,
    required this.wallet,
  });

  @override
  State<CosmosSignExample> createState() => _CosmosSignExampleState();
}

class _CosmosSignExampleState extends State<CosmosSignExample> {
  // State variables matching Swift implementation
  final TextEditingController _messageController = TextEditingController();
  String? _cosmosAddress;
  String? _balance;
  String _selectedChain = "cosmoshub-4";
  String _customChainId = "";
  String _customPrefix = "";
  String _customRpcUrl = "";
  bool _useCustomConfig = false;
  bool _isLoading = false;
  ParaCosmosSigner? _paraCosmosSigner;
  

  // Constants
  static const String _defaultAmount = "1000000"; // 1 token in micro units
  static const String _defaultRpcUrl = "https://cosmos-rpc.publicnode.com";

  final List<(String, String, String, String)> _commonChains = [
    ("Cosmos Hub", "cosmoshub-4", "cosmos", "https://cosmos-rpc.publicnode.com"),
    ("Osmosis", "osmosis-1", "osmo", "https://osmosis-rpc.publicnode.com"),
    ("Juno", "juno-1", "juno", "https://rpc-juno.itastakers.com"),
    ("Stargaze", "stargaze-1", "stars", "https://rpc.stargaze-apis.com"),
    ("Cosmos Testnet", "provider", "cosmos", "https://rpc.provider-state-sync-01.rs-testnet.polypore.xyz"),
    ("Osmosis Testnet", "osmo-test-5", "osmo", "https://rpc.testnet.osmosis.zone"),
  ];

  final Map<String, String> _testAddresses = {
    "provider": "cosmos1v9yrqx8aaddlna29zxngr4ye3jnxtpprk8s7c2",
    "osmo-test-5": "osmo1v9yrqx8aaddlna29zxngr4ye3jnxtpprrej532",
    "cosmoshub-4": "cosmos1v9yrqx8aaddlna29zxngr4ye3jnxtpprk8s7c2",
    "osmosis-1": "osmo1v9yrqx8aaddlna29zxngr4ye3jnxtpprrej532",
    "juno-1": "juno1v9yrqx8aaddlna29zxngr4ye3jnxtpprlpedst",
    "stargaze-1": "stars1v9yrqx8aaddlna29zxngr4ye3jnxtppryhszrs",
  };

  final Map<String, String> _denomMappings = {
    "provider": "uatom",
    "osmo-test-5": "uosmo",
    "cosmoshub-4": "uatom",
    "osmosis-1": "uosmo",
    "juno-1": "ujuno",
    "stargaze-1": "ustars",
  };

  @override
  void initState() {
    super.initState();
    _initializeSigner();
  }

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Cosmos Wallet'),
      ),
      body: Stack(
        children: [
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _buildWalletAddressCard(),
                  const SizedBox(height: 24),
                  _buildChainConfigurationCard(),
                  const SizedBox(height: 24),
                  _buildMessageSigningCard(),
                  const SizedBox(height: 24),
                  _buildTransactionOperationsCard(),
                  const SizedBox(height: 24),
                  _buildWalletManagementCard(),
                  const SizedBox(height: 24),
                  _buildLogoutButton(),
                ],
              ),
            ),
          ),
          if (_isLoading) _buildLoadingOverlay(),
        ],
      ),
    );
  }

  // UI Components

  Widget _buildWalletAddressCard() {
    return CardView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Wallet Address',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surfaceContainerHighest.withValues(alpha: 0.3),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    _cosmosAddress ?? 'Loading...',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      fontFamily: 'monospace',
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.copy, size: 16),
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
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                ),
                Text(
                  '$_balance ${_getCurrentDenom()}',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    fontFamily: 'monospace',
                  ),
                ),
              ],
            ),
          ],
          const SizedBox(height: 8),
          TextButton(
            onPressed: _isLoading ? null : _fetchBalance,
            child: const Text('Fetch Balance'),
          ),
        ],
      ),
    );
  }

  Widget _buildChainConfigurationCard() {
    return CardView(
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
              setState(() {
                _useCustomConfig = value;
              });
              _reinitializeSigner();
            },
            contentPadding: EdgeInsets.zero,
          ),
          const SizedBox(height: 16),
          if (_useCustomConfig)
            _buildCustomConfigurationFields()
          else
            _buildPresetChainPicker(),
        ],
      ),
    );
  }

  Widget _buildCustomConfigurationFields() {
    return Column(
      children: [
        ConfigField(
          title: 'Chain ID',
          text: _customChainId,
          placeholder: 'e.g., cosmoshub-4',
          onChanged: (value) => setState(() => _customChainId = value),
        ),
        const SizedBox(height: 12),
        ConfigField(
          title: 'Address Prefix',
          text: _customPrefix,
          placeholder: 'e.g., cosmos',
          onChanged: (value) => setState(() => _customPrefix = value),
        ),
        const SizedBox(height: 12),
        ConfigField(
          title: 'RPC URL (Optional)',
          text: _customRpcUrl,
          placeholder: 'https://rpc.cosmos.network',
          keyboardType: TextInputType.url,
          onChanged: (value) => setState(() => _customRpcUrl = value),
        ),
        const SizedBox(height: 16),
        OutlinedButton(
          onPressed: (_customChainId.isEmpty || _customPrefix.isEmpty) ? null : _reinitializeSigner,
          child: const Text('Apply Configuration'),
        ),
      ],
    );
  }

  Widget _buildPresetChainPicker() {
    return DropdownButtonFormField<String>(
      value: _selectedChain,
      decoration: const InputDecoration(
        labelText: 'Select Chain',
        contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      ),
      items: _commonChains.map((chain) {
        return DropdownMenuItem(
          value: chain.$2,
          child: Text(chain.$1),
        );
      }).toList(),
      onChanged: (value) {
        if (value != null) {
          setState(() {
            _selectedChain = value;
          });
          _reinitializeSigner();
        }
      },
    );
  }

  Widget _buildMessageSigningCard() {
    return CardView(
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
            controller: _messageController,
            decoration: const InputDecoration(
              hintText: 'Enter a message to sign',
            ),
            autocorrect: false,
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: _signMessage,
            child: const Text('Sign Message'),
          ),
        ],
      ),
    );
  }

  Widget _buildTransactionOperationsCard() {
    return CardView(
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
                child: OutlinedButton(
                  onPressed: (_isLoading || _paraCosmosSigner == null) ? null : _testSignDirect,
                  child: const Text('Sign Proto'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OutlinedButton(
                  onPressed: (_isLoading || _paraCosmosSigner == null) ? null : _testSignAmino,
                  child: const Text('Sign Amino'),
                ),
              ),
            ],
          ),
          if (_paraCosmosSigner != null) ...[
            const SizedBox(height: 8),
            Text(
              'Current Chain: ${_getCurrentChainInfo()}',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildWalletManagementCard() {
    return CardView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Wallet Management',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: _isLoading ? null : _checkSession,
                  child: const Text('Check Session'),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: OutlinedButton(
                  onPressed: _isLoading ? null : _fetchWallets,
                  child: const Text('Fetch Wallets'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLogoutButton() {
    return OutlinedButton(
      onPressed: _isLoading ? null : _logout,
      style: OutlinedButton.styleFrom(
        foregroundColor: Colors.red,
        side: const BorderSide(color: Colors.red),
      ),
      child: const Text('Logout'),
    );
  }

  Widget _buildLoadingOverlay() {
    return Container(
      color: Colors.black.withValues(alpha: 0.2),
      child: const Center(
        child: CircularProgressIndicator(),
      ),
    );
  }

  // Actions

  void _copyAddress() {
    if (_cosmosAddress == null) {
      _showResult('Error', 'No address to copy');
      return;
    }
    Clipboard.setData(ClipboardData(text: _cosmosAddress!));
    _showResult('Success', 'Address copied to clipboard');
  }

  Future<void> _fetchBalance() async {
    await _performAsyncOperation((signer) async {
      final amount = await signer.getBalance();
      setState(() {
        _balance = amount;
      });
      _showResult('Success', 'Balance fetched successfully');
    });
  }

  Future<void> _signMessage() async {
    await _performAsyncOperation((signer) async {
      await signer.signMessage(_messageController.text);
      _showResult('Success', 'Message signed successfully');
    });
  }

  Future<void> _testSignDirect() async {
    await _performAsyncOperation((signer) async {
      final sampleSignDocBase64 = _createSampleProtoSignDoc();
      final result = await signer.signDirect(signDocBase64: sampleSignDocBase64);

      if (result['signature'] is Map<String, dynamic>) {
        final signature = result['signature'] as Map<String, dynamic>;
        if (signature['signature'] is String) {
          final signatureData = signature['signature'] as String;
          _showResult(
            '✅ Proto Signed',
            'Direct signing completed!\n\n🔗 Chain: ${_getCurrentChainInfo()}\n🔐 Signature: ${signatureData.substring(0, 20.clamp(0, signatureData.length))}...',
          );
          return;
        }
      }
      _showResult('✅ Proto Signed', 'Direct signing completed!\n\n🔗 Chain: ${_getCurrentChainInfo()}');
    });
  }

  Future<void> _testSignAmino() async {
    await _performAsyncOperation((signer) async {
      final sampleSignDocBase64 = _createSampleAminoSignDoc();
      final result = await signer.signAmino(signDocBase64: sampleSignDocBase64);

      if (result['signature'] is Map<String, dynamic>) {
        final signature = result['signature'] as Map<String, dynamic>;
        if (signature['signature'] is String) {
          final signatureData = signature['signature'] as String;
          _showResult(
            '✅ Amino Signed',
            'Legacy signing completed!\n\n🔗 Chain: ${_getCurrentChainInfo()}\n🔐 Signature: ${signatureData.substring(0, 20.clamp(0, signatureData.length))}...',
          );
          return;
        }
      }
      _showResult('✅ Amino Signed', 'Legacy signing completed!\n\n🔗 Chain: ${_getCurrentChainInfo()}');
    });
  }

  Future<void> _checkSession() async {
    setState(() => _isLoading = true);
    try {
      final active = await para.isSessionActive();
      _showResult('Session Status', 'Session Active: $active');
    } catch (e) {
      _showResult('Error', 'Failed to check session: ${e.toString()}');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _fetchWallets() async {
    setState(() => _isLoading = true);
    try {
      final wallets = await para.fetchWallets();
      final addresses = wallets.map((w) => w.address ?? 'No Address').join('\n');
      _showResult('Wallets', addresses);
    } catch (e) {
      _showResult('Error', 'Failed to fetch wallets: ${e.toString()}');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _logout() async {
    setState(() => _isLoading = true);
    try {
      await para.logout();
      if (mounted) {
        Navigator.of(context).popUntil((route) => route.isFirst);
      }
    } catch (e) {
      _showResult('Error', 'Failed to logout: ${e.toString()}');
      setState(() => _isLoading = false);
    }
  }

  // Helper Methods

  Future<void> _performAsyncOperation(Future<void> Function(ParaCosmosSigner) operation) async {
    if (_paraCosmosSigner == null) {
      _showResult('Error', 'Cosmos signer not initialized');
      return;
    }

    setState(() => _isLoading = true);
    try {
      await operation(_paraCosmosSigner!);
    } catch (e) {
      _showResult('Error', 'Operation failed: ${e.toString()}');
    } finally {
      setState(() => _isLoading = false);
    }
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

  String _getCurrentDenom() {
    final (chainId, _, _) = _getChainConfig();
    return _denomMappings[chainId] ?? 'uatom';
  }

  String _getTestAddress(String chainId) {
    return _testAddresses[chainId] ?? _testAddresses['provider']!;
  }

  Future<void> _initializeSigner() async {
    setState(() => _isLoading = true);
    try {
      final (chainId, prefix, rpcUrl) = _getChainConfig();

      final signer = ParaCosmosSigner(
        para: para,
        chainId: chainId,
        rpcUrl: rpcUrl.isEmpty ? _defaultRpcUrl : rpcUrl,
        prefix: prefix,
      );

      await signer.selectWallet(widget.wallet.id!);
      final chainSpecificAddress = await signer.getAddress();

      setState(() {
        _paraCosmosSigner = signer;
        _cosmosAddress = chainSpecificAddress;
      });
    } catch (e) {
      _showResult('Error', 'Failed to initialize Cosmos signer: ${e.toString()}');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _reinitializeSigner() {
    _paraCosmosSigner = null;
    _initializeSigner();
  }

  (String, String, String) _getChainConfig() {
    if (_useCustomConfig) {
      return (_customChainId, _customPrefix, _customRpcUrl);
    } else {
      final chain = _commonChains.firstWhere(
        (c) => c.$2 == _selectedChain,
        orElse: () => ("Cosmos Hub", "cosmoshub-4", "cosmos", "https://cosmos-rpc.publicnode.com"),
      );
      return (chain.$2, chain.$3, chain.$4);
    }
  }

  String _getCurrentChainInfo() {
    final (chainId, prefix, _) = _getChainConfig();
    final chainName = _commonChains
        .firstWhere(
          (c) => c.$2 == chainId,
          orElse: () => (chainId, chainId, prefix, ""),
        )
        .$1;
    return '$chainName (${prefix}1...)';
  }

  String _createSampleProtoSignDoc() {
    // Create a minimal but valid SignDoc structure
    // SignDoc has: body_bytes (field 1), auth_info_bytes (field 2), chain_id (field 3), account_number (field 4)
    final (chainId, _, _) = _getChainConfig();

    // Manually construct a minimal protobuf SignDoc
    final protobufBytes = BytesBuilder();

    // body_bytes (empty)
    protobufBytes.addByte(0x0A); // tag
    protobufBytes.addByte(0x00); // length 0

    // auth_info_bytes (empty)
    protobufBytes.addByte(0x12); // tag
    protobufBytes.addByte(0x00); // length 0

    // chain_id
    protobufBytes.addByte(0x1A); // tag
    final chainIdBytes = utf8.encode(chainId);
    protobufBytes.addByte(chainIdBytes.length); // length
    protobufBytes.add(chainIdBytes); // chain ID string

    // account_number (0)
    protobufBytes.addByte(0x20); // tag
    protobufBytes.addByte(0x00); // value 0

    return base64Encode(protobufBytes.toBytes());
  }

  String _createSampleAminoSignDoc() {
    final (chainId, _, _) = _getChainConfig();
    final denom = _getCurrentDenom();
    final toAddress = _getTestAddress(chainId);

    // Simulate an amino SignDoc structure
    final aminoSignDoc = {
      "chain_id": chainId,
      "account_number": "0",
      "sequence": "0",
      "fee": {
        "amount": [
          {"denom": denom, "amount": "5000"}
        ],
        "gas": "200000",
      },
      "msgs": [
        {
          "type": "cosmos-sdk/MsgSend",
          "value": {
            "from_address": "demo_from_address",
            "to_address": toAddress,
            "amount": [
              {"denom": denom, "amount": _defaultAmount}
            ],
          },
        }
      ],
      "memo": "Demo amino signing from Para Flutter SDK",
    };

    try {
      final jsonString = jsonEncode(aminoSignDoc);
      return base64Encode(utf8.encode(jsonString));
    } catch (e) {
      // Fallback to a simple base64 string for demo
      return "eyJ0ZXN0IjoidHJ1ZSJ9"; // {"test":"true"} in base64
    }
  }
}