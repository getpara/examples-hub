import 'package:flutter/material.dart';

class AuthScreen extends StatelessWidget {
  final VoidCallback onSuccess;

  const AuthScreen({
    super.key,
    required this.onSuccess,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                'Para',
                style: Theme.of(context).textTheme.headlineLarge,
              ),
              const SizedBox(height: 48),
              // Placeholder - will be replaced in Phase 3
              ElevatedButton(
                onPressed: onSuccess,
                child: const Text('Continue (Placeholder)'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}