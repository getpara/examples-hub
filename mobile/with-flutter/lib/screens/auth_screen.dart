import 'dart:io';
import 'package:flutter/material.dart';
import 'package:para/para.dart';
import '../client/para.dart';
import '../features/auth/widgets/social_auth_button.dart';
import '../features/auth/widgets/email_phone_input.dart';
import '../features/auth/widgets/otp_verification_sheet.dart';
import '../features/auth/widgets/connect_wallet_button.dart';
import '../features/auth/widgets/external_wallet_selection_sheet.dart';
import '../features/auth/models/external_wallet_provider.dart';
import '../config/deep_link_constants.dart';
import 'wallet_creation_loading_screen.dart';
import 'external_wallet_demo_screen.dart';

enum _AuthFlow {
  emailOrPhone,
  oauth,
}

class AuthScreen extends StatefulWidget {
  final VoidCallback onSuccess;
  final Future<AuthState> Function({required Auth auth})? initiateAuthFlow;

  const AuthScreen({
    super.key,
    required this.onSuccess,
    this.initiateAuthFlow,
  });

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  SocialProvider? _loadingProvider;
  bool _isProcessing = false;
  late final FlutterWebAuthSession _webAuthSession;

  @override
  void initState() {
    super.initState();
    _webAuthSession = FlutterWebAuthSession(
      callbackUrlScheme: DeepLinkConstants.appScheme,
    );
  }

  Future<void> _handleSocialAuth(SocialProvider provider) async {
    setState(() => _loadingProvider = provider);

    try {
      final oauthMethod = switch (provider) {
        SocialProvider.google => OAuthMethod.google,
        SocialProvider.apple => OAuthMethod.apple,
        SocialProvider.discord => OAuthMethod.discord,
      };

      final authState = await para.verifyOAuth(
        provider: oauthMethod,
        appScheme: DeepLinkConstants.appScheme,
      );

      await _continueAuth(authState, flow: _AuthFlow.oauth);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Authentication failed: ${e.toString()}')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _loadingProvider = null);
      }
    }
  }

  Future<void> _handleEmailPhone(String value, bool isPhone) async {
    if (_isProcessing) {
      return;
    }

    setState(() => _isProcessing = true);

    try {
      final auth = isPhone ? Auth.phone(value) : Auth.email(value);
      final initiateAuthFlow = widget.initiateAuthFlow ?? para.initiateAuthFlow;
      final authState = await initiateAuthFlow(auth: auth);

      await _continueAuth(
        authState,
        flow: _AuthFlow.emailOrPhone,
        authForResend: auth,
        identifier: value,
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: ${e.toString()}')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isProcessing = false);
      }
    }
  }

  Future<void> _continueAuth(
    AuthState authState, {
    required _AuthFlow flow,
    Auth? authForResend,
    String? identifier,
  }) async {
    if (await _handleOneClick(authState)) {
      return;
    }

    switch (authState.stage) {
      case AuthStage.verify:
        if (authForResend == null || identifier == null) {
          return;
        }

        final verifiedState = await _promptOtp(
          identifier: identifier,
          auth: authForResend,
        );

        if (verifiedState != null) {
          await _continueAuth(
            verifiedState,
            flow: flow,
            authForResend: authForResend,
            identifier: identifier,
          );
        }
        break;
      case AuthStage.login:
        if (flow == _AuthFlow.oauth) {
          await _finalizeOAuthLogin();
        } else {
          await _completeLogin(authState);
        }
        break;
      case AuthStage.signup:
        await _startSignup(authState);
        break;
    }
  }

  Future<AuthState?> _promptOtp({
    required String identifier,
    required Auth auth,
  }) async {
    final result = await showOTPVerificationSheet(
      context: context,
      identifier: identifier,
      onVerify: _verifyOtp,
      onResend: () => _resendOTP(auth),
    );

    return result is AuthState ? result : null;
  }

  Future<AuthState?> _verifyOtp(String otp) async {
    try {
      return await para.verifyOtp(
        otp: otp,
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Invalid code: ${e.toString()}')),
        );
      }
      return null;
    }
  }

  Future<void> _startSignup(AuthState authState) async {
    final chosen = await _chooseSignupMethod();
    if (!mounted || chosen == null) {
      return;
    }

    if (chosen == SignupMethod.passkey) {
      await _startPasskeySignup(authState);
    } else if (chosen == SignupMethod.password) {
      await _startPasswordSignup(authState);
    }
  }

  Future<void> _startPasskeySignup(AuthState authState) async {
    if (!mounted) return;

    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => WalletCreationLoadingScreen(
          onComplete: widget.onSuccess,
        ),
      ),
    );

    await _completePasskeySignup(authState);
  }

  Future<void> _startPasswordSignup(AuthState authState) async {
    try {
      setState(() => _isProcessing = true);
      await para.handleSignup(
        authState: authState,
        signupMethod: SignupMethod.password,
        webAuthenticationSession: _webAuthSession,
      );
      if (!mounted) return;
      widget.onSuccess();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Password setup failed: ${e.toString()}')),
        );
      }
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  Future<void> _completePasskeySignup(AuthState verifiedState) async {
    try {
      await para.handleSignup(
        authState: verifiedState,
        signupMethod: SignupMethod.passkey,
        webAuthenticationSession: _webAuthSession,
      );

      // Success - the loading screen will handle navigation via onComplete
      if (mounted) {
        Navigator.of(context).pop(); // Close loading screen
        widget.onSuccess();
      }
    } catch (e) {
      if (mounted) {
        Navigator.of(context).pop(); // Close loading screen
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Wallet creation failed: ${e.toString()}')),
        );
      }
    }
  }

  Future<void> _finalizeOAuthLogin() async {
    try {
      await para.touchSession();
    } catch (_) {
      // Session touch is best effort for OAuth callbacks
    }

    await para.fetchWallets();

    if (mounted) {
      widget.onSuccess();
    }
  }

  Future<void> _completeLogin(AuthState authState) async {
    try {
      await para.handleLogin(
        authState: authState,
        webAuthenticationSession: _webAuthSession,
      );
      if (mounted) {
        widget.onSuccess();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Login failed: ${e.toString()}')),
        );
      }
    }
  }

  Future<bool> _handleOneClick(AuthState authState) async {
    final url = authState.loginUrl;
    if (url?.isNotEmpty != true) {
      return false;
    }

    try {
      await para.presentAuthUrl(
        url: url!,
        webAuthenticationSession: _webAuthSession,
      );

      final nextStage = authState.effectiveNextStage;
      if (nextStage == AuthStage.signup) {
        await para.waitForSignup();
      } else {
        await para.waitForLogin();
      }

      await para.touchSession();
      await para.fetchWallets();

      if (mounted) {
        widget.onSuccess();
      }

      return true;
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Authentication failed: ${e.toString()}')),
        );
      }

      return false;
    }
  }

  Future<SignupMethod?> _chooseSignupMethod() async {
    return showDialog<SignupMethod>(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        return AlertDialog(
          title: const Text('Choose Authentication Method'),
          content: const Text('How would you like to secure your account?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(SignupMethod.passkey),
              child: const Text('Use Passkey'),
            ),
            TextButton(
              onPressed: () => Navigator.of(context).pop(SignupMethod.password),
              child: const Text('Use Password'),
            ),
          ],
        );
      },
    );
  }

  Future<void> _resendOTP(Auth auth) async {
    try {
      await para.initiateAuthFlow(auth: auth);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Code resent')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to resend: ${e.toString()}')),
        );
      }
    }
  }

  void _showExternalWalletSelection() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      useSafeArea: true,
      builder: (context) => ExternalWalletSelectionSheet(
        onWalletSelected: _handleExternalWalletAuth,
      ),
    );
  }

  Future<void> _handleExternalWalletAuth(
      ExternalWalletProvider provider) async {
    if (!mounted) return;

    try {
      final address = await _connectExternalWallet(provider);

      if (!mounted) return;

      Navigator.pop(context);

      if (address != null) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ExternalWalletDemoScreen(
              provider: provider,
              address: address,
            ),
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('No wallet address found')),
        );
      }
    } catch (e) {
      if (mounted) {
        Navigator.pop(context); // Close the sheet
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content:
                  Text('External wallet connection failed: ${e.toString()}')),
        );
      }
    }
  }

  Future<String?> _connectExternalWallet(
      ExternalWalletProvider provider) async {
    if (provider == ExternalWalletProvider.phantom) {
      return phantomConnector.connect();
    }

    if (provider == ExternalWalletProvider.metamask) {
      await metamaskConnector.connect();
      return metamaskConnector.accounts.isNotEmpty
          ? metamaskConnector.accounts.first
          : null;
    }

    return null;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFBF9F7), // Match Swift light background
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const SizedBox(height: 60),
              // Logo
              Image.asset(
                'lib/assets/para.png',
                width: 85,
                height: 85,
              ),
              const SizedBox(height: 60),
              // Title
              Text(
                'Sign Up or Log In',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: Colors.black,
                    ),
              ),
              const SizedBox(height: 32),
              // Social login buttons
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Flexible(
                    child: SocialAuthButton(
                      provider: SocialProvider.google,
                      isLoading: _loadingProvider == SocialProvider.google,
                      onPressed: () => _handleSocialAuth(SocialProvider.google),
                    ),
                  ),
                  const SizedBox(width: 8),
                  if (Platform.isIOS)
                    Flexible(
                      child: SocialAuthButton(
                        provider: SocialProvider.apple,
                        isLoading: _loadingProvider == SocialProvider.apple,
                        onPressed: () =>
                            _handleSocialAuth(SocialProvider.apple),
                      ),
                    ),
                  if (Platform.isIOS) const SizedBox(width: 8),
                  Flexible(
                    child: SocialAuthButton(
                      provider: SocialProvider.discord,
                      isLoading: _loadingProvider == SocialProvider.discord,
                      onPressed: () =>
                          _handleSocialAuth(SocialProvider.discord),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              // Email/Phone input
              EmailPhoneInput(
                key: const Key('emailPhoneInput'),
                onSubmit: _isProcessing ? (_, __) {} : _handleEmailPhone,
              ),
              const SizedBox(height: 20),
              // Divider
              Row(
                children: [
                  Expanded(
                    child: Container(
                      height: 1,
                      color: Colors.grey[300],
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    child: Text(
                      'or',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey[600],
                      ),
                    ),
                  ),
                  Expanded(
                    child: Container(
                      height: 1,
                      color: Colors.grey[300],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              // External Wallet button
              ConnectWalletButton(
                onPressed: _showExternalWalletSelection,
              ),
              const SizedBox(height: 48),
              // Footer
              Column(
                children: [
                  Text(
                    'By logging in you agree to our Terms & Conditions',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        'Powered by',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey[600],
                        ),
                      ),
                      const SizedBox(width: 4),
                      const Text(
                        'Para',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: Colors.black,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
