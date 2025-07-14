import 'dart:io';
import 'package:flutter/material.dart';
import 'package:para/para.dart';
import '../client/para.dart';
import '../features/auth/widgets/social_auth_button.dart';
import '../features/auth/widgets/email_phone_input.dart';
import '../features/auth/widgets/otp_verification_sheet.dart';

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
      final auth = isPhone ? Auth.phone(value) : Auth.email(value);
      final authState = await para.initiateAuthFlow(auth: auth);

      if (authState.stage == AuthStage.verify && mounted) {
        // Show OTP verification
        showOTPVerificationSheet(
          context: context,
          identifier: value,
          onVerify: (otp) => _handleOTPVerification(authState, otp),
          onResend: () => _resendOTP(auth),
        );
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

  Future<void> _handleOTPVerification(AuthState authState, String otp) async {
    try {
      final verifiedState = await para.verifyAuth(
        authState: authState,
        otp: otp,
      );
      
      if (verifiedState.stage == AuthStage.signup && mounted) {
        // Need to choose signup method
        Navigator.of(context).pop(); // Close bottom sheet
        // For now, automatically choose passkey
        await para.handleSignup(
          authState: verifiedState,
          signupMethod: SignupMethod.passkey,
          webAuthenticationSession: _webAuthSession,
        );
        widget.onSuccess();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Invalid code: ${e.toString()}')),
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

  void _showWalletSelection() {
    // Will be implemented in a future phase
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Wallet connection coming soon')),
    );
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
                'lib/assets/app_icon.png',
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
                  SocialAuthButton(
                    provider: SocialProvider.google,
                    isLoading: _loadingProvider == SocialProvider.google,
                    onPressed: () => _handleSocialAuth(SocialProvider.google),
                  ),
                  const SizedBox(width: 12),
                  if (Platform.isIOS)
                    SocialAuthButton(
                      provider: SocialProvider.apple,
                      isLoading: _loadingProvider == SocialProvider.apple,
                      onPressed: () => _handleSocialAuth(SocialProvider.apple),
                    ),
                  if (Platform.isIOS) const SizedBox(width: 12),
                  SocialAuthButton(
                    provider: SocialProvider.discord,
                    isLoading: _loadingProvider == SocialProvider.discord,
                    onPressed: () => _handleSocialAuth(SocialProvider.discord),
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
              // Connect Wallet button
              SizedBox(
                width: double.infinity,
                height: 50,
                child: OutlinedButton(
                  onPressed: _showWalletSelection,
                  style: OutlinedButton.styleFrom(
                    backgroundColor: Colors.grey[100],
                    foregroundColor: Colors.black,
                    side: BorderSide.none,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text(
                    'Connect Wallet',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 16,
                    ),
                  ),
                ),
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
                      Image.asset(
                        'lib/assets/app_icon.png',
                        width: 12,
                        height: 12,
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