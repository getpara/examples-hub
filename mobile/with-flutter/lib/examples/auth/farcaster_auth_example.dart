// ignore_for_file: unused_field, unused_local_variable
import 'dart:async';
import 'package:para_flutter/widgets/demo_home.dart';
import 'package:flutter/material.dart';
import 'package:para/para.dart';
import 'package:para_flutter/client/para.dart';
import 'package:flutter_svg/flutter_svg.dart';

class ParaFarcasterAuthExample extends StatefulWidget {
  const ParaFarcasterAuthExample({super.key});

  @override
  State<ParaFarcasterAuthExample> createState() =>
      _ParaFarcasterAuthExampleState();
}

class _ParaFarcasterAuthExampleState extends State<ParaFarcasterAuthExample> {
  bool _isLoading = false;
  String? _loadingProvider;
  Wallet? _wallet;
  String? _address;
  String? _recoveryShare;

  @override
  void initState() {
    super.initState();
    _checkLoginStatus();
  }

  Future<void> _checkLoginStatus() async {
    try {
      final isLoggedIn = await para.isFullyLoggedIn();
      if (isLoggedIn && mounted) {
        final wallets = await para.getWallets();
        if (wallets.isNotEmpty) {
          setState(() {
            _wallet = wallets.values.first;
            _address = wallets.values.first.address;
            _recoveryShare = "";
          });
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text('Error checking login status: ${e.toString()}')));
      }
    }
  }

  Future<void> _handleFarcasterLogin() async {
    if (!mounted) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final farcasterResponse = await para.farcasterConnect();

      if (farcasterResponse.userExists) {
        await _handlePasskeyLogin(farcasterResponse.username);
      } else {
        await _handleNewUserSetup(farcasterResponse.username);
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: ${e.toString()}')),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _handleNewUserSetup(String identifier) async {
    final biometricsId = await para.verifyOAuth();
    await para.generatePasskey(identifier, biometricsId);
    final result = await para.createWallet(skipDistribute: false);

    if (!mounted) return;

    setState(() {
      _wallet = result.wallet;
      _address = result.wallet.address;
      _recoveryShare = result.recoveryShare;
    });

    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => const DemoHome()),
    );
  }

  Future<void> _handlePasskeyLogin(String farcasterUsername) async {
    setState(() => _isLoading = true);

    try {
      final wallet = await para.login(farcasterUsername: farcasterUsername);

      if (!mounted) return;

      setState(() {
        _wallet = wallet;
        _address = wallet.address;
        _recoveryShare = "";
      });

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

  Widget _buildFarcasterButton() {
    final isLoading = _isLoading;
    dynamic icon = 'lib/assets/farcaster.svg';
    final backgroundColor = const Color(0xFF855DCD);
    final textColor = Colors.white;

    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: ElevatedButton(
        onPressed: _isLoading ? null : () => _handleFarcasterLogin(),
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
                colorFilter: ColorFilter.mode(textColor, BlendMode.srcIn),
              ),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                'Continue with Farcaster',
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
        title: const Text('Alternate Example'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'Alternate Authentication',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Example implementation of alternate authentication using Para SDK with various providers.',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.black87,
                ),
              ),
              const SizedBox(height: 48),
              _buildFarcasterButton(),
            ],
          ),
        ),
      ),
    );
  }
}
