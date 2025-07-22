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
import 'wallet_creation_loading_screen.dart';
import 'external_wallet_demo_screen.dart';

class AuthScreen extends StatefulWidget {
  final VoidCallback onSuccess;

  const AuthScreen({
    super.key,
    required this.onSuccess,
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
    _webAuthSession = FlutterWebAuthSession(callbackUrlScheme: 'paraflutter');
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
        appScheme: 'paraflutter',
      );

      if (authState.stage == AuthStage.login) {
        widget.onSuccess();
      }
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
    setState(() => _isProcessing = true);

    try {
      // Small delay to ensure Para bridge is ready
      await Future.delayed(const Duration(milliseconds: 500));
      
      final auth = isPhone ? Auth.phone(value) : Auth.email(value);
      final authState = await para.initiateAuthFlow(auth: auth);

      if (authState.stage == AuthStage.verify && mounted) {
        // Show OTP verification and await result
        final result = await showOTPVerificationSheet(
          context: context,
          identifier: value,
          onVerify: (otp) => _handleOTPVerification(authState, otp),
          onResend: () => _resendOTP(auth),
        );
        
        // Handle navigation based on result
        if (result is AuthState && result.stage == AuthStage.signup && mounted) {
          // Navigate to wallet creation loading screen
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (context) => WalletCreationLoadingScreen(
                onComplete: widget.onSuccess,
              ),
            ),
          );
          
          // Start wallet creation
          _handleWalletCreation(result);
        }
      } else if (authState.stage == AuthStage.login) {
        // Existing user - try to login
        await _handleLogin(authState);
      }
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

  Future<AuthState?> _handleOTPVerification(AuthState authState, String otp) async {
    try {
      final verifiedState = await para.verifyOtp(
        otp: otp,
      );
      
      if (verifiedState.stage == AuthStage.signup && mounted) {
        // Return the verified state so AuthScreen can handle navigation
        return verifiedState;
      } else if (verifiedState.stage == AuthStage.login && mounted) {
        // For existing users, handle login and complete authentication
        await _handleLogin(verifiedState);
        return null; // Login handled, no further action needed
      }
      return null;
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Invalid code: ${e.toString()}')),
        );
      }
      return null;
    }
  }

  Future<void> _handleWalletCreation(AuthState verifiedState) async {
    try {
      // Create wallets using passkey signup method
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

  Future<void> _handleLogin(AuthState authState) async {
    try {
      // Use handleLogin for existing users
      await para.handleLogin(
        authState: authState,
        webAuthenticationSession: _webAuthSession,
      );
      widget.onSuccess();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Login failed: ${e.toString()}')),
        );
      }
    }
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

  Future<void> _handleExternalWalletAuth(ExternalWalletProvider provider) async {
    try {
      String? address;
      if (provider == ExternalWalletProvider.phantom) {
        address = await phantomConnector.connect();
      } else if (provider == ExternalWalletProvider.metamask) {
        await metamaskConnector.connect();
        address = metamaskConnector.accounts.isNotEmpty ? metamaskConnector.accounts.first : null;
      }
      
      // Success - close sheet and navigate to demo view
      if (mounted && address != null) {
        Navigator.pop(context); // Close the sheet
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ExternalWalletDemoScreen(
              provider: provider,
              address: address!,
            ),
          ),
        );
      } else if (mounted && address == null) {
        // No address returned - close sheet and show error
        Navigator.pop(context); // Close the sheet
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('No wallet address found')),
        );
      }
    } catch (e) {
      if (mounted) {
        Navigator.pop(context); // Close the sheet
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('External wallet connection failed: ${e.toString()}')),
        );
      }
    }
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
                        onPressed: () => _handleSocialAuth(SocialProvider.apple),
                      ),
                    ),
                  if (Platform.isIOS) const SizedBox(width: 8),
                  Flexible(
                    child: SocialAuthButton(
                      provider: SocialProvider.discord,
                      isLoading: _loadingProvider == SocialProvider.discord,
                      onPressed: () => _handleSocialAuth(SocialProvider.discord),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              // Email/Phone input
              EmailPhoneInput(
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