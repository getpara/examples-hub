// ignore_for_file: unused_field, unused_local_variable
import 'dart:async';
import 'package:para_flutter/widgets/demo_home.dart';
import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:para/para.dart';
import 'package:para_flutter/client/para.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:url_launcher/url_launcher.dart';

class ParaOAuthExample extends StatefulWidget {
  const ParaOAuthExample({super.key});

  @override
  State<ParaOAuthExample> createState() => _ParaOAuthExampleState();
}

class _ParaOAuthExampleState extends State<ParaOAuthExample> {
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
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('Error checking login status: ${e.toString()}')));
      }
    }
  }

  Future<void> _handleOAuthLogin(OAuthMethod provider) async {
    if (!mounted) return;

    setState(() {
      _isLoading = true;
      _loadingProvider = provider.value;
    });

    final chromeSafariBrowser = ChromeSafariBrowser();
    final isFarcaster = provider == OAuthMethod.farcaster;

    try {
      final authUrl = isFarcaster ? await para.getFarcasterConnectURL() : await para.getOAuthURL(provider);

      final authStatusFuture = isFarcaster ? para.waitForFarcasterStatus() : para.waitForOAuth();

      if (isFarcaster) {
        print('Opening Farcaster URL: $authUrl');
        if (!await launchUrl(Uri.parse(authUrl), mode: LaunchMode.externalApplication)) {
          throw Exception('Could not launch Farcaster URL');
        }
      } else {
        await chromeSafariBrowser.open(
          url: WebUri(authUrl),
          settings: ChromeSafariBrowserSettings(),
        );
      }

      final authResult = await authStatusFuture;

      if (!isFarcaster && chromeSafariBrowser.isOpened()) {
        await chromeSafariBrowser.close();
      }

      if (isFarcaster) {
        final farcasterResult = authResult as FarcasterStatus;
        if (!farcasterResult.userExists) {
          await _handleNewUserSetup(farcasterResult.username);
        } else {
          await _handlePasskeyLogin();
        }
      } else {
        final oauthResult = authResult as OAuthResponse;

        if (oauthResult.isError == true) {
          throw Exception('OAuth authentication failed');
        }

        if (oauthResult.userExists) {
          await _handlePasskeyLogin();
        } else {
          if (oauthResult.email == null) {
            throw Exception('Email is required for new user registration');
          }
          await _handleNewUserSetup(oauthResult.email!);
        }
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
          _loadingProvider = null;
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

  Future<void> _handlePasskeyLogin() async {
    setState(() => _isLoading = true);

    try {
      final wallet = await para.login();

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

  Widget _buildOAuthButton({
    required OAuthMethod provider,
    required String label,
    required dynamic icon,
    required Color backgroundColor,
    required Color textColor,
  }) {
    final isLoading = _isLoading && _loadingProvider == provider.value;

    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: ElevatedButton(
        onPressed: _isLoading ? null : () => _handleOAuthLogin(provider),
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
                'OAuth Authentication',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Example implementation of OAuth authentication using Para SDK with various providers.',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.black87,
                ),
              ),
              const SizedBox(height: 48),
              _buildOAuthButton(
                provider: OAuthMethod.google,
                label: 'Google',
                icon: FontAwesomeIcons.google,
                backgroundColor: const Color(0xFF4285F4),
                textColor: Colors.white,
              ),
              _buildOAuthButton(
                provider: OAuthMethod.apple,
                label: 'Apple',
                icon: FontAwesomeIcons.apple,
                backgroundColor: Colors.white,
                textColor: Colors.black87,
              ),
              _buildOAuthButton(
                provider: OAuthMethod.twitter,
                label: 'X.com',
                icon: FontAwesomeIcons.xTwitter,
                backgroundColor: const Color(0xFF1DA1F2),
                textColor: Colors.white,
              ),
              _buildOAuthButton(
                provider: OAuthMethod.discord,
                label: 'Discord',
                icon: FontAwesomeIcons.discord,
                backgroundColor: const Color(0xFF5865F2),
                textColor: Colors.white,
              ),
              _buildOAuthButton(
                provider: OAuthMethod.farcaster,
                label: 'Farcaster',
                icon: 'lib/assets/farcaster.svg',
                backgroundColor: const Color(0xFF855DCD),
                textColor: Colors.white,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
