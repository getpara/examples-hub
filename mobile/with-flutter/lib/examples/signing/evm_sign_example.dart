import 'package:flutter/material.dart';
import 'package:para/para.dart';

class EVMSignExample extends StatefulWidget {
  final Wallet wallet;

  const EVMSignExample({
    super.key,
    required this.wallet,
  });

  @override
  State<EVMSignExample> createState() => _EVMSignExampleState();
}

class _EVMSignExampleState extends State<EVMSignExample> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('EVM Sign Example'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'EVM Signing',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Example of signing messages and transactions on EVM chains.',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.black87,
                ),
              ),
              const SizedBox(height: 32),
              const Center(
                child: Text('Coming soon: EVM signing examples'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
