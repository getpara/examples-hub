// ignore_for_file: unused_field, unused_local_variable
import 'dart:async';
import 'package:para_flutter/widgets/demo_meta_mask.dart';
import 'package:para_flutter/widgets/demo_phantom.dart';
import 'package:flutter/material.dart';
import 'package:para/para.dart' as para;
import 'package:para_flutter/client/para.dart';
import 'package:flutter_svg/flutter_svg.dart';

enum ExternalWalletProvider { phantom, metamask, other }

class ParaExternalWalletExample extends StatefulWidget {
  const ParaExternalWalletExample({super.key});

  @override
  State<ParaExternalWalletExample> createState() => _ParaExternalWalletExampleState();
}

class _ParaExternalWalletExampleState extends State<ParaExternalWalletExample> {
  bool _isLoading = false;
  String? _loadingProvider;
  para.Wallet? _wallet;
  String? _address;
  String? _recoveryShare;

  @override
  void initState() {
    super.initState();
  }

  Future<void> _handleExternalWalletLogin(ExternalWalletProvider provider) async {
    if (!mounted) return;

    setState(() {
      _isLoading = true;
    });

    try {
      if (provider == ExternalWalletProvider.phantom) {
        await phantomConnector.connect();
        if (!mounted) return;
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const DemoPhantom()),
        );
      }

      if (provider == ExternalWalletProvider.metamask) {
        await metamaskConnector.connect();
        if (!mounted) return;
        setState(() {
          _isLoading = false;
        });

        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const DemoMetaMask()),
        );
      }

      if (provider == ExternalWalletProvider.other) {}
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: ${e.toString()}')),
      );
    }
  }

  Widget _buildExternalWalletButton({
    required ExternalWalletProvider provider,
    required String label,
    required dynamic icon,
    required Color backgroundColor,
    required Color textColor,
  }) {
    final isLoading = _isLoading;

    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: ElevatedButton(
        onPressed: _isLoading ? null : () => _handleExternalWalletLogin(provider),
        style: ElevatedButton.styleFrom(
          backgroundColor: backgroundColor,
          foregroundColor: textColor,
          elevation: 1,
          padding: const EdgeInsets.symmetric(
            horizontal: 24,
            vertical: 16,
          ),
        ),
        child: Row(
          children: [
            if (icon is IconData)
              Icon(icon)
            else if (icon is String)
              SvgPicture.asset(
                icon,
                width: 24,
                height: 24,
              ),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                'Continue with $label',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            if (isLoading)
              const SizedBox(
                height: 20,
                width: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                ),
              ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('OAuth Example'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'External Wallet Authentication',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Example implementation of external wallet authentication using Capsule SDK with various providers.',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.black87,
                ),
              ),
              const SizedBox(height: 48),
              _buildExternalWalletButton(
                provider: ExternalWalletProvider.phantom,
                label: 'Phantom',
                icon: "lib/assets/phantom_icon.svg",
                backgroundColor: const Color(0xFFAB9FF2),
                textColor: Colors.white,
              ),
              _buildExternalWalletButton(
                provider: ExternalWalletProvider.metamask,
                label: 'MetaMask',
                icon: "lib/assets/metamask_icon.svg",
                backgroundColor: const Color(0xFFFFFFFF),
                textColor: Colors.black,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
