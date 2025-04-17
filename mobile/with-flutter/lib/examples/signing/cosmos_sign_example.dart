import 'package:flutter/material.dart';
import 'package:para/para.dart';

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
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Cosmos Sign Example'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'Cosmos Signing',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Example of signing messages and transactions on Cosmos.',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.black87,
                ),
              ),
              const SizedBox(height: 32),
              const Center(
                child: Text('Coming soon: Cosmos signing examples'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
