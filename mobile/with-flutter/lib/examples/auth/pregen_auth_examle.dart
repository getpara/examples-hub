// ignore_for_file: unused_field, unused_local_variable

import 'package:flutter/material.dart';
import 'package:para/para.dart';
import 'package:para_flutter/client/para.dart';
import 'package:para_flutter/widgets/demo_home.dart';

class ParaPregenExample extends StatefulWidget {
  const ParaPregenExample({super.key});

  @override
  State<ParaPregenExample> createState() => _ParaPregenExampleState();
}

class _ParaPregenExampleState extends State<ParaPregenExample> {
  final _formKey = GlobalKey<FormState>();
  final _identifierController = TextEditingController();
  bool _isLoading = false;
  Wallet? _wallet;
  String? _address;
  String? _userShare;
  PregenIdentifierType _selectedType = PregenIdentifierType.email;

  @override
  void initState() {
    super.initState();
    _checkExistingWallet();
  }

  @override
  void dispose() {
    _identifierController.dispose();
    super.dispose();
  }

  Future<void> _checkExistingWallet() async {
    try {
      final wallets = await para.getWallets();
      if (wallets.isNotEmpty) {
        setState(() {
          _wallet = wallets.values.first;
          _address = wallets.values.first.address;
          _userShare = "";
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error checking wallet status: ${e.toString()}')),
        );
      }
    }
  }

  final _phoneController = TextEditingController();
  final _countryCodeController = TextEditingController(text: '1');

  String? _validateIdentifier(String? value) {
    if (value == null || value.isEmpty) {
      return 'Please enter an identifier';
    }

    switch (_selectedType) {
      case PregenIdentifierType.email:
        if (!value.contains('@') || !value.contains('.')) {
          return 'Please enter a valid email';
        }
      case PregenIdentifierType.phone:
        return null;
      case PregenIdentifierType.customId:
        if (value.length < 3) {
          return 'Custom ID must be at least 3 characters';
        }
      case PregenIdentifierType.discord:
      case PregenIdentifierType.twitter:
        return null;
    }
    return null;
  }

  Future<void> _handleCreateOrLoad() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final identifier = _selectedType == PregenIdentifierType.phone
          ? '+${_countryCodeController.text}${_phoneController.text}'
          : _identifierController.text.trim();
      final hasWallet = await para.hasPregenWallet(
        pregenIdentifier: identifier,
        pregenIdentifierType: _selectedType,
      );

      if (hasWallet) {
        await para.setUserShare(_userShare);
      } else {
        final wallet = await para.createWalletPreGen(
          type: WalletType.evm,
          pregenIdentifier: identifier,
          pregenIdentifierType: _selectedType,
        );

        final userShare = await para.getUserShare();
        setState(() {
          _wallet = wallet;
          _address = wallet.address;
          _userShare = userShare;
        });
      }

      if (!mounted) return;

      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const DemoHome()),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: ${e.toString()}')),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Pregen Example'),
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
                  'Pregen Wallet',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'Example implementation of pregen wallet creation and loading using Para SDK.',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.black87,
                  ),
                ),
                const SizedBox(height: 48),
                DropdownButtonFormField<PregenIdentifierType>(
                  value: _selectedType,
                  decoration: const InputDecoration(
                    labelText: 'Identifier Type',
                    prefixIcon: Icon(Icons.category_outlined),
                  ),
                  items: PregenIdentifierType.values.map((type) {
                    return DropdownMenuItem(
                      value: type,
                      child: Text(type.name.toUpperCase()),
                    );
                  }).toList(),
                  onChanged: (PregenIdentifierType? value) {
                    if (value != null) {
                      setState(() {
                        _selectedType = value;
                        _identifierController.clear();
                      });
                    }
                  },
                ),
                const SizedBox(height: 16),
                if (_selectedType == PregenIdentifierType.phone)
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SizedBox(
                        width: 100,
                        child: TextFormField(
                          controller: _countryCodeController,
                          decoration: const InputDecoration(
                            labelText: 'Code',
                            hintText: '1',
                            prefixIcon: Icon(Icons.add),
                          ),
                          keyboardType: TextInputType.phone,
                          textInputAction: TextInputAction.next,
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Required';
                            }
                            return null;
                          },
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextFormField(
                          controller: _phoneController,
                          decoration: const InputDecoration(
                            labelText: 'Phone Number',
                            hintText: 'Enter phone number',
                            prefixIcon: Icon(Icons.phone_outlined),
                          ),
                          keyboardType: TextInputType.phone,
                          textInputAction: TextInputAction.done,
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Please enter a phone number';
                            }
                            if (value.length < 10) {
                              return 'Please enter a valid phone number';
                            }
                            return null;
                          },
                        ),
                      ),
                    ],
                  )
                else
                  TextFormField(
                    controller: _identifierController,
                    decoration: InputDecoration(
                      labelText: 'Username or Email',
                      hintText: 'Enter ${_selectedType.name} identifier',
                      prefixIcon: const Icon(Icons.person_outline),
                    ),
                    keyboardType: TextInputType.text,
                    textInputAction: TextInputAction.done,
                    validator: _validateIdentifier,
                  ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: _isLoading ? null : _handleCreateOrLoad,
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('Continue with Pregen Wallet'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
