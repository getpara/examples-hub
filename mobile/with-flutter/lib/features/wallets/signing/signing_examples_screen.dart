import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:para/para.dart';

import '../../../client/para.dart';
import 'signing_example.dart';
import 'signing_example_catalog.dart';

class SigningExamplesScreen extends StatelessWidget {
  final Wallet wallet;
  final SigningExampleClient? client;

  const SigningExamplesScreen({
    super.key,
    required this.wallet,
    this.client,
  });

  @override
  Widget build(BuildContext context) {
    final List<SigningExampleAction> actions;
    try {
      actions = buildSigningExampleCatalog(
        client: client ?? ParaSigningExampleClient(para),
        wallet: wallet,
      );
    } catch (error) {
      return Scaffold(
        key: const Key('signingExamplesScreen'),
        appBar: AppBar(
          title: Text(
            '${wallet.chainType?.value ?? 'Wallet'} signing examples',
          ),
        ),
        body: _SigningUnavailable(message: error.toString()),
      );
    }

    return Scaffold(
      key: const Key('signingExamplesScreen'),
      appBar: AppBar(
        title: Text(
          '${wallet.chainType?.value ?? 'Wallet'} signing examples',
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const _SigningNotice(),
          const SizedBox(height: 20),
          _SigningSection(
            title: 'Messages',
            actions: actions
                .where((action) =>
                    action.definition.operation == SigningOperation.message)
                .toList(),
          ),
          const SizedBox(height: 24),
          _SigningSection(
            title: 'Transactions',
            actions: actions
                .where((action) =>
                    action.definition.operation == SigningOperation.transaction)
                .toList(),
          ),
        ],
      ),
    );
  }
}

class SigningExamplesActionButton extends StatelessWidget {
  final Wallet wallet;

  const SigningExamplesActionButton({
    super.key,
    required this.wallet,
  });

  @override
  Widget build(BuildContext context) {
    return IconButton(
      key: const Key('openSigningExamplesButton'),
      tooltip: 'Signing examples',
      icon: const Icon(Icons.draw_outlined),
      onPressed: () => Navigator.of(context).push(
        MaterialPageRoute(
            builder: (_) => SigningExamplesScreen(wallet: wallet)),
      ),
    );
  }
}

class _SigningNotice extends StatelessWidget {
  const _SigningNotice();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.primaryContainer,
        borderRadius: BorderRadius.circular(12),
      ),
      child: const Text(
        'These examples sign only. They never broadcast. Use the returned signed payload with your chain client after validation.',
        key: Key('signingExamplesNotice'),
      ),
    );
  }
}

class _SigningUnavailable extends StatelessWidget {
  final String message;

  const _SigningUnavailable({required this.message});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.warning_amber_rounded, size: 40),
            const SizedBox(height: 12),
            Text(
              'Signing examples unavailable',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Text(message, textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}

class _SigningSection extends StatelessWidget {
  final String title;
  final List<SigningExampleAction> actions;

  const _SigningSection({required this.title, required this.actions});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 12),
        for (final action in actions) ...[
          _SigningExampleCard(action: action),
          const SizedBox(height: 12),
        ],
      ],
    );
  }
}

class _SigningExampleCard extends StatefulWidget {
  final SigningExampleAction action;

  const _SigningExampleCard({required this.action});

  @override
  State<_SigningExampleCard> createState() => _SigningExampleCardState();
}

class _SigningExampleCardState extends State<_SigningExampleCard> {
  late final TextEditingController _payloadController;
  bool _isSigning = false;

  @override
  void initState() {
    super.initState();
    _payloadController =
        TextEditingController(text: widget.action.initialInput);
  }

  @override
  void dispose() {
    _payloadController.dispose();
    super.dispose();
  }

  Future<void> _sign() async {
    setState(() => _isSigning = true);
    try {
      final result = await widget.action.sign(
        input: widget.action.requiresInput ? _payloadController.text : null,
      );
      if (!mounted) return;
      await _showResult(
          'Signed', const JsonEncoder.withIndent('  ').convert(result.toMap()));
    } catch (error) {
      if (!mounted) return;
      await _showResult('Signing failed', error.toString());
    } finally {
      if (mounted) setState(() => _isSigning = false);
    }
  }

  Future<void> _showResult(String title, String message) => showDialog<void>(
        context: context,
        builder: (context) => AlertDialog(
          title: Text(title),
          content: SingleChildScrollView(child: SelectableText(message)),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Done'),
            ),
          ],
        ),
      );

  @override
  Widget build(BuildContext context) {
    final definition = widget.action.definition;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(definition.title,
                style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 6),
            Text(definition.description),
            if (widget.action.requiresInput) ...[
              const SizedBox(height: 12),
              TextField(
                key: Key('${definition.id}-input'),
                controller: _payloadController,
                minLines: 2,
                maxLines: 4,
                autocorrect: false,
                enableSuggestions: false,
                textInputAction: TextInputAction.done,
                onSubmitted: (_) => FocusScope.of(context).unfocus(),
                onTapOutside: (_) => FocusScope.of(context).unfocus(),
                decoration: InputDecoration(
                  labelText: widget.action.inputLabel,
                  border: OutlineInputBorder(),
                ),
              ),
            ],
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                key: Key(definition.id),
                onPressed: _isSigning ? null : _sign,
                child: _isSigning
                    ? const SizedBox.square(
                        dimension: 18,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : Text('Sign ${definition.title}'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
