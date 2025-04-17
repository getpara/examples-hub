// ignore_for_file: unused_field, unused_local_variable, use_build_context_synchronously

// Import the SDK package
import 'package:para/para.dart';
import 'package:para_flutter/client/para.dart'; // Assuming 'para' instance is globally available or passed via context
import 'package:para_flutter/util/random.dart';
import 'package:para_flutter/widgets/demo_home.dart';
import 'package:para_flutter/widgets/demo_otp_verification.dart';
import 'package:flutter/material.dart';
// No need to import 'package:para/para.dart' again if already imported above

class ParaEmailExample extends StatefulWidget {
  const ParaEmailExample({super.key});

  @override
  State<ParaEmailExample> createState() => _ParaEmailExampleState();
}

class _ParaEmailExampleState extends State<ParaEmailExample> {
  final _emailController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;
  // Keep track of the AuthState for multi-step flows
  AuthState? _currentAuthState;

  // Wallet info - maybe manage this in a separate state manager (Riverpod, Provider, etc.)
  Wallet? _wallet;
  String? _address;
  // CreateWalletResult might contain recoveryShare, handle if needed
  // String? _recoveryShare;

  @override
  void initState() {
    super.initState();
    _emailController.text = randomTestEmail();
    _checkLoginStatus();
  }

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _checkLoginStatus() async {
    // Check if already logged in when the screen loads
    setState(() => _isLoading = true);
    try {
      final isLoggedIn = await para.isFullyLoggedIn(); // Await the ParaFuture
      if (isLoggedIn && mounted) {
        final wallets =
            await para.fetchWallets(); // Use fetchWallets for consistency

        if (wallets.isNotEmpty) {
          _updateWalletState(wallets.first); // Use helper to update state
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

  // Helper to update wallet state consistently
  void _updateWalletState(Wallet wallet) {
    setState(() {
      _wallet = wallet;
      _address = wallet.address;
      // If CreateWalletResult was used and had recoveryShare:
      // _recoveryShare = createResult.recoveryShare;
    });
  }

  // Helper for logging within the state
  void _log(String message, {bool isWarning = false}) {
    debugPrint('ParaEmailExample: ${isWarning ? "WARNING: " : ""}$message');
  }

  // Renamed function to reflect V2 flow (handles signup or login)
  Future<void> _handleEmailAuth() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);
    final email = _emailController.text.trim();

    try {
      // Step 1: Call signUpOrLogIn
      _log("Calling signUpOrLogIn for email: $email");
      // Corrected method name
      final authState = await para.signUpOrLogIn(email: email);
      _currentAuthState = authState;

      _log("signUpOrLogIn returned stage: ${authState.stage}");

      // Step 2: Handle the returned AuthState
      switch (authState.stage) {
        case AuthStage.verify: // Correct enum usage
          _log("Navigating to OTP verification screen.");
          if (!mounted) return;
          final bool verificationSuccess = await Navigator.push<bool>(
                context,
                MaterialPageRoute(
                  builder: (context) => DemoOtpVerification(
                    onVerify: _handleOtpVerification,
                  ),
                ),
              ) ??
              false;

          if (verificationSuccess) {
            _log("OTP Verification successful, navigating home.");
            if (mounted) {
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (context) => const DemoHome()),
              );
            }
          } else {
            _log("OTP Verification failed or was cancelled.");
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                    content: Text('Verification failed or cancelled.')),
              );
            }
          }
          break;

        case AuthStage.login: // Correct enum usage
          _log("User exists, proceeding with passkey login.");
          // Correct method name and usage
          final wallet = await para.loginWithPasskey(
            authInfo: EmailAuthInfo(email: email), // Correct type usage
          );
          _log("Passkey login successful.");
          _updateWalletState(wallet);
          if (mounted) {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (context) => const DemoHome()),
            );
          }
          break;

        case AuthStage.signup: // Correct enum usage
          _log("Received unexpected 'signup' stage from signUpOrLogIn.",
              isWarning: true);
          throw Exception(
              "Unexpected authentication stage: signup received directly from signUpOrLogIn.");
      }
    } catch (e) {
      _log('Error during email auth: ${e.toString()}', isWarning: true);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: ${e.toString()}')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  // Separate handler for OTP verification logic
  Future<bool> _handleOtpVerification(String code) async {
    setState(() => _isLoading = true);
    final email = _emailController.text.trim();
    try {
      _log("Calling verifyNewAccount with code: $code");
      // Correct method name and usage
      final authState = await para.verifyNewAccount(verificationCode: code);
      _log("verifyNewAccount returned stage: ${authState.stage}");

      // Correct enum usage
      if (authState.stage == AuthStage.signup) {
        if (authState.passkeyId == null) {
          throw Exception("Signup stage reached, but no passkeyId provided.");
        }
        _log("Proceeding to generate passkey with id: ${authState.passkeyId}");
        // Correct method call with named arguments
        await para.generatePasskey(
          identifier: email,
          biometricsId: authState.passkeyId!,
        );
        _log("Passkey generated, creating wallet...");
        // Correct handling of createWallet result
        final createResult = await para.createWallet(skipDistribute: false);
        _log("Wallet created successfully.");
        _updateWalletState(
            createResult); // Pass the Wallet object from the result
        setState(() => _isLoading = false);
        return true;
      } else {
        _log("Unexpected stage after verifyNewAccount: ${authState.stage}",
            isWarning: true);
        throw Exception(
            "Verification succeeded but resulted in unexpected stage: ${authState.stage}");
      }
    } catch (e) {
      _log("Error during OTP verification/signup: ${e.toString()}",
          isWarning: true);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Verification Error: ${e.toString()}')),
        );
      }
      setState(() => _isLoading = false);
      return false;
    }
  }

  Future<void> _handlePasskeyLogin() async {
    setState(() => _isLoading = true);

    try {
      _log("Attempting generic passkey login...");
      // Correct method name
      final wallet = await para.loginWithPasskey(authInfo: null);
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
        SnackBar(content: Text('Passkey Login Error: ${e.toString()}')),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    // ... rest of the build method remains the same ...
    return Scaffold(
      appBar: AppBar(
        title: const Text('Email + Passkey Example (V2)'), // Updated title
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'Email Authentication',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'Example implementation of email-based authentication using Para SDK V2.', // Updated description
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.black87,
                  ),
                ),
                const SizedBox(height: 48),
                TextFormField(
                  controller: _emailController,
                  decoration: const InputDecoration(
                    labelText: 'Email Address',
                    hintText: 'Enter your email',
                    prefixIcon: Icon(Icons.email_outlined),
                  ),
                  keyboardType: TextInputType.emailAddress,
                  textInputAction: TextInputAction.done,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter an email address';
                    }
                    if (!value.contains('@') || !value.contains('.')) {
                      return 'Please enter a valid email address';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  // Updated onPressed handler and text
                  onPressed: _isLoading ? null : _handleEmailAuth,
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('Continue with Email'), // Updated text
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
                OutlinedButton(
                  onPressed: _isLoading ? null : _handlePasskeyLogin,
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(
                      color: Theme.of(context).colorScheme.primary,
                    ),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('Login with Any Passkey'), // Clarified text
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
