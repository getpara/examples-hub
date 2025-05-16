// /Users/tyson/dev/examples-hub/mobile/with-flutter/lib/examples/auth/email_auth_example.dart
// ignore_for_file: unused_field, unused_local_variable, use_build_context_synchronously

import 'dart:async'; // Keep for Future and async operations
import 'package:flutter/material.dart';

// Import the SDK package with all necessary exports
import 'package:para/para.dart';
import 'package:para_flutter/client/para.dart'; // Assuming 'para' instance is globally available or passed via context
import 'package:para_flutter/util/random.dart';
import 'package:para_flutter/widgets/choose_signup_method.dart';
import 'package:para_flutter/widgets/demo_home.dart';
import 'package:para_flutter/widgets/demo_otp_verification.dart';

class ParaEmailExample extends StatefulWidget {
  const ParaEmailExample({super.key});

  @override
  State<ParaEmailExample> createState() => _ParaEmailExampleState();
}

class _ParaEmailExampleState extends State<ParaEmailExample> {
  final _emailController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;
  AuthState? _currentAuthState;
  Wallet? _wallet;
  String? _address;

  // Define your app's custom URL scheme
  final String _callbackScheme = 'com.usecapsule.example.flutter://';

  // Add instance of FlutterWebAuthSession
  late final FlutterWebAuthSession _webAuthSession;

  @override
  void initState() {
    super.initState();
    _emailController.text = randomTestEmail();
    // Initialize FlutterWebAuthSession
    _webAuthSession = FlutterWebAuthSession(callbackUrlScheme: _callbackScheme.split('://').first);
    _checkLoginStatus();
  }

  @override
  void dispose() {
    _emailController.dispose();
    // Cancel the subscription when the widget is disposed
    // _browserEventsSubscription?.cancel();
    super.dispose();
  }

  Future<void> _checkLoginStatus() async {
    setState(() => _isLoading = true);
    try {
      final isLoggedIn = await para.isFullyLoggedIn();
      if (isLoggedIn && mounted) {
        final wallets = await para.fetchWallets();
        if (wallets.isNotEmpty) {
          _updateWalletState(wallets.first);
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (context) => const DemoHome()),
          );
        } else {
          _log("Logged in but no wallets found.");
        }
      }
    } catch (e) {
      _log('Error checking login status: ${e.toString()}', isWarning: true);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _updateWalletState(Wallet wallet) {
    setState(() {
      _wallet = wallet;
      _address = wallet.address;
    });
  }

  void _log(String message, {bool isWarning = false}) {
    String prefix = 'ParaEmailExample: ';
    if (isWarning) {
      prefix += 'WARNING: ';
    }
    debugPrint(prefix + message);
  }

  Future<void> _handleEmailAuth() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);
    final email = _emailController.text.trim();

    try {
      _log("Starting auth flow with para.initiateAuthFlow for email: $email");
      // Use Auth.email constructor and the SDK's initiateAuthFlow
      final authState = await para.initiateAuthFlow(auth: Auth.email(email));
      _currentAuthState = authState; // Keep track of current auth state if needed elsewhere

      _log("Auth flow initiated. Resulting stage: ${authState.stage}");

      switch (authState.stage) {
        case AuthStage.verify:
          _log("Navigating to OTP verification screen for new user.");
          if (!mounted) return;
          final bool verificationSuccess = await Navigator.push<bool>(
                context,
                MaterialPageRoute(
                  builder: (context) => DemoOtpVerification(
                    onVerify: _handleOtpVerification, // _handleOtpVerification will now pass _webAuthSession
                    onResendCode: _handleResendVerificationCode,
                  ),
                ),
              ) ??
              false;

          if (verificationSuccess) {
            // Successfully verified and navigated to ChooseSignupMethod which handled the rest
            _log("OTP Verification and subsequent signup/login handled.");
          } else {
            _log("OTP Verification failed or was cancelled, or subsequent flow did not complete.");
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Verification or signup failed or cancelled.')),
              );
            }
          }
          break;

        case AuthStage.login:
          _log("User exists, proceeding with login using para.handleLogin.");
          // Use the SDK's handleLogin method
          await para.handleLogin(
            authState: authState,
            webAuthenticationSession: _webAuthSession, // Pass the session instance
          );
          _log("handleLogin successful.");

          // After successful login, fetch wallets and navigate
          final wallets = await para.fetchWallets();
          if (wallets.isNotEmpty && mounted) {
            _updateWalletState(wallets.first);
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (context) => const DemoHome()),
            );
          }
          break;

        case AuthStage.signup:
          // This case should ideally not be hit directly from initiateAuthFlow.
          // It's typically reached after verifyNewAccount.
          // If it is hit, it implies an unexpected state or that the user somehow
          // got to a signup stage without prior verification in this specific UI flow.
          // For robustness, we could navigate to ChooseSignupMethod,
          // but it might indicate a logic flaw if reached here.
          _log("Unexpected 'signup' stage from initiateAuthFlow. Navigating to ChooseSignupMethod.", isWarning: true);
          if (mounted) {
            // Ensure _currentAuthState is up-to-date from the initiateAuthFlow call
            if (_currentAuthState != null && _currentAuthState!.stage == AuthStage.signup) {
              await Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => ChooseSignupMethod(
                    authState: _currentAuthState!, // Use the fresh authState
                    webAuthenticationSession: _webAuthSession, // Pass the session
                  ),
                ),
              );
            } else {
              _log("Cannot navigate to ChooseSignupMethod, authState is not in signup stage or is null.",
                  isWarning: true);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Cannot proceed to signup method selection.')),
              );
            }
          }
          break;
      }
    } catch (e) {
      _log('Error during email auth: ${e.toString()}', isWarning: true);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<bool> _handleResendVerificationCode() async {
    // This function remains largely the same
    setState(() => _isLoading = true);
    try {
      await para.resendVerificationCode();
      _log("Resend verification code request successful.");
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Verification code resent.')),
        );
      }
      setState(() => _isLoading = false);
      return true;
    } catch (e) {
      _log("Error resending verification code: $e", isWarning: true);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error resending code: $e')),
        );
      }
      setState(() => _isLoading = false);
      return false;
    }
  }

  Future<bool> _handleOtpVerification(String code) async {
    // This function remains largely the same
    try {
      _log("Verifying code: $code");
      final authState = await para.verifyNewAccount(verificationCode: code);
      _log("Verification successful. Stage: ${authState.stage}");

      if (authState.stage == AuthStage.signup) {
        _log("Navigating to ChooseSignupMethod screen.");
        _currentAuthState = authState; // Update current auth state
        if (mounted) {
          // Pass the webAuthSession to ChooseSignupMethod
          final signupResult = await Navigator.push<bool>(
            context,
            MaterialPageRoute(
              builder: (context) => ChooseSignupMethod(
                authState: authState,
                webAuthenticationSession: _webAuthSession, // Pass the session
              ),
            ),
          );
          return signupResult ?? false; // Return whether signup was successful
        }
        return false;
      } else {
        _log("Unexpected stage after verification: ${authState.stage}", isWarning: true);
        throw Exception("Verification resulted in unexpected state: ${authState.stage}");
      }
    } catch (e) {
      _log("Error during verification: $e", isWarning: true);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Verification error: $e')),
        );
      }
      return false;
    }
  }

  Future<void> _handlePasskeyLogin() async {
    // This function remains the same
    setState(() => _isLoading = true);
    try {
      _log("Attempting generic passkey login...");
      final wallet = await para.loginWithPasskey();
      _log("Generic passkey login successful.");
      if (!mounted) return;
      _updateWalletState(wallet);
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const DemoHome()),
      );
    } catch (e) {
      _log('Error during passkey login: ${e.toString()}', isWarning: true);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Passkey Login Error: $e')),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    // Build method remains the same
    return Scaffold(
      appBar: AppBar(
        title: const Text('Email Authentication'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Icon(
                  Icons.email_outlined,
                  size: 50,
                  color: Colors.blue, // Or use Theme color
                ),
                const SizedBox(height: 24),
                const Text(
                  'Email Authentication',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 12),
                const Text(
                  'Sign in or register with your email address.',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.black87, // Or use Theme color
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 48),
                TextFormField(
                  controller: _emailController,
                  decoration: const InputDecoration(
                    labelText: 'Email Address',
                    hintText: 'Enter your email',
                    prefixIcon: Icon(Icons.email_outlined),
                    border: OutlineInputBorder(), // Added border for clarity
                  ),
                  keyboardType: TextInputType.emailAddress,
                  textInputAction: TextInputAction.done,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter an email address';
                    }
                    // Basic email validation, can be improved with regex
                    if (!value.contains('@') || !value.contains('.')) {
                      return 'Please enter a valid email address';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16), // Make button taller
                  ),
                  onPressed: _isLoading ? null : _handleEmailAuth,
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : const Text('Continue'),
                ),
                const SizedBox(height: 32),
                const Row(
                  children: [
                    Expanded(child: Divider()),
                    Padding(
                      padding: EdgeInsets.symmetric(horizontal: 16),
                      child: Text(
                        'OR',
                        style: TextStyle(
                          color: Colors.grey,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    Expanded(child: Divider()),
                  ],
                ),
                const SizedBox(height: 32),
                OutlinedButton.icon(
                  icon: const Icon(Icons.fingerprint), // Added icon
                  label: const Text('Login with Any Passkey'),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16), // Make button taller
                    side: BorderSide(
                      color: _isLoading ? Colors.grey : Theme.of(context).colorScheme.primary, // Visual feedback
                    ),
                  ),
                  onPressed: _isLoading ? null : _handlePasskeyLogin,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
