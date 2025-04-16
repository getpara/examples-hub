// lib/examples/auth/email_auth_example.dart

// ignore_for_file: unused_field, unused_local_variable, avoid_print

import 'package:para_flutter/client/para.dart';
import 'package:para_flutter/util/random.dart';
import 'package:para_flutter/widgets/demo_home.dart';
import 'package:para_flutter/widgets/demo_otp_verification.dart';
import 'package:flutter/material.dart';
import 'package:para/para.dart'; // Ensure all necessary para models are imported

class ParaEmailExample extends StatefulWidget {
  const ParaEmailExample({super.key});

  @override
  State<ParaEmailExample> createState() => _ParaEmailExampleState();
}

class _ParaEmailExampleState extends State<ParaEmailExample> {
  final _emailController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;
  String? _errorMessage; // For displaying errors to the user

  @override
  void initState() {
    super.initState();
    // Pre-fill with a random email for easier testing
    _emailController.text = randomTestEmail();
    // Removed _checkLoginStatus to align with the focused auth flow example
  }

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  // --- Main Authentication Handler ---
  Future<void> _handleContinueWithEmail() async {
    if (!_formKey.currentState!.validate() || _isLoading) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final email = _emailController.text.trim();

    try {
      // Step 1: Call signUpOrLogIn
      print("Calling signUpOrLogIn for email: $email");
      final authState = await para.signUpOrLogIn(email: email);
      print("signUpOrLogIn returned stage: ${authState.stage}");

      if (!mounted) return;

      // Step 2: Handle the returned stage
      switch (authState.stage) {
        case AuthStage.verify:
          print("Navigating to OTP verification for: $email");
          // Navigate to OTP screen
          final bool verifiedAndSetup = await Navigator.push<bool>(
                context,
                MaterialPageRoute(
                  builder: (context) => DemoOtpVerification(
                    onVerify: (code) => _handleVerifyCode(code, email),
                    onResendCode: _handleResendCode,
                  ),
                ),
              ) ??
              false;

          if (verifiedAndSetup) {
            print("Verification and setup successful, navigating home.");
            // Navigate to home after successful verification and setup
            _navigateToHome();
          } else {
            print("Verification process incomplete or failed.");
            // Error message should be handled within _handleVerifyCode or if user backs out
            if (_errorMessage == null && mounted) {
              // Only set if no specific error was already set by the callback
              // setState(() => _errorMessage = 'Verification cancelled or failed.');
            }
          }
          break;

        case AuthStage.login:
          print("User exists, initiating passkey login for: $email");
          // User exists, initiate passkey login
          await _handlePasskeyLogin(email: email);
          break;

        case AuthStage.signup:
          // This stage should typically be reached *after* verification
          print(
              "Error: Unexpected signup stage returned directly from signUpOrLogIn.");
          setState(() {
            _errorMessage = 'Unexpected server response. Please try again.';
          });
          break;
      }
    } on ParaBridgeException catch (e) {
      print(
          "ParaBridgeException during continueWithEmail: ${e.code} - ${e.message}");
      if (!mounted) return;
      setState(() {
        _errorMessage = 'Error (${e.code ?? 'UNKNOWN'}): ${e.message}';
      });
    } catch (e) {
      print("Unexpected error during continueWithEmail: ${e.toString()}");
      if (!mounted) return;
      setState(() {
        _errorMessage = 'An unexpected error occurred: ${e.toString()}';
      });
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  // --- OTP Verification Handler ---
  Future<bool> _handleVerifyCode(String code, String email) async {
    // Note: Loading state is primarily managed on the OTP screen itself,
    // but we can set our internal error message if verification fails here.
    setState(() {
      _errorMessage = null; // Clear previous errors from this screen
    });
    print("Attempting to verify code: $code for email: $email");

    try {
      // Step 3: Call verifyNewAccount
      final authState = await para.verifyNewAccount(verificationCode: code);
      print("verifyNewAccount returned stage: ${authState.stage}");

      if (!mounted) return false;

      // Step 4: Check the stage after verification
      if (authState.stage == AuthStage.signup) {
        print("Verification successful, proceeding to passkey generation.");
        // Verification successful, now setup passkey and wallet
        if (authState.passkeyId == null) {
          print("Error: Missing passkeyId after successful verification.");
          setState(() => _errorMessage =
              'Verification successful, but setup failed (missing ID).');
          return false; // Indicate failure back to OTP screen
        }

        // Use email from AuthState if available, otherwise fallback to passed email
        final identifier = authState.email ?? email;
        print(
            "Generating passkey for identifier: $identifier with biometricsId: ${authState.passkeyId!}");

        // Step 5: Generate Passkey
        await para.generatePasskey(
            identifier: identifier, biometricsId: authState.passkeyId!);
        print("Passkey generated successfully.");

        // Step 6: Create Wallet
        print("Creating wallet...");
        // Use the new direct Wallet return type
        final Wallet createdWallet =
            await para.createWallet(skipDistribute: false);
        print("Wallet created successfully: ${createdWallet.id}");

        // Setup complete
        return true; // Signal success to DemoOtpVerification
      } else {
        // Unexpected stage after verification
        print(
            "Error: Verification failed or returned unexpected stage: ${authState.stage}");
        setState(() => _errorMessage =
            'Verification failed. Code might be incorrect or expired.');
        return false; // Indicate failure back to OTP screen
      }
    } on ParaBridgeException catch (e) {
      print("ParaBridgeException during verifyCode: ${e.code} - ${e.message}");
      if (!mounted) return false;
      setState(() => _errorMessage = 'Verification Error: ${e.message}');
      return false; // Indicate failure
    } catch (e) {
      print("Unexpected error during verifyCode: ${e.toString()}");
      if (!mounted) return false;
      setState(() => _errorMessage = 'Verification Error: ${e.toString()}');
      return false; // Indicate failure
    }
    // Note: No finally block setting _isLoading here, as it's managed by the caller screen.
  }

  // --- Resend Code Handler ---
  Future<bool> _handleResendCode() async {
    print("Attempting to resend verification code.");
    try {
      await para.resendVerificationCode();
      print("Resend code request successful.");
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Verification code resent.')),
        );
      }
      return true;
    } on ParaBridgeException catch (e) {
      print("ParaBridgeException during resendCode: ${e.code} - ${e.message}");
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to resend code: ${e.message}')),
        );
      }
      return false;
    } catch (e) {
      print("Unexpected error during resendCode: ${e.toString()}");
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to resend code: ${e.toString()}')),
        );
      }
      return false;
    }
  }

  // --- Passkey Login Handler ---
  Future<void> _handlePasskeyLogin({String? email}) async {
    if (_isLoading) return;
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    print(
        "Initiating passkey login${email != null ? " for email: $email" : " (no email hint)"}");

    try {
      // Step 7: Call loginWithPasskey
      // Pass EmailAuthInfo if email is provided, otherwise null for generic passkey prompt
      final AuthInfo? authInfo =
          email != null ? EmailAuthInfo(email: email) : null;
      await para.loginWithPasskey(authInfo: authInfo);
      print("Passkey login successful.");

      if (!mounted) return;

      _navigateToHome();
    } on ParaBridgeException catch (e) {
      print(
          "ParaBridgeException during passkeyLogin: ${e.code} - ${e.message}");
      if (!mounted) return;
      // Handle specific cancellation error
      if (e.code == 'passkey_cancelled') {
        setState(() {
          _errorMessage = 'Passkey login cancelled.';
        });
      } else {
        setState(() {
          _errorMessage = 'Passkey Login Error: ${e.message}';
        });
      }
    } catch (e) {
      print("Unexpected error during passkeyLogin: ${e.toString()}");
      if (!mounted) return;
      setState(() {
        _errorMessage = 'Passkey Login Error: ${e.toString()}';
      });
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  // --- Navigation Helper ---
  void _navigateToHome() {
    // Ensure navigation happens only if the widget is still mounted
    if (mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const DemoHome()),
      );
    }
  }

  // --- Build Method ---
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Email + Passkey Example'),
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
                  'Enter your email to sign up or log in using Para and Passkeys.',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.black87, // Consider using Theme colors
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
                  autofillHints: const [AutofillHints.email],
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter an email address';
                    }
                    // Basic regex for email format validation
                    if (!RegExp(r'^[^@]+@[^@]+\.[^@]+').hasMatch(value)) {
                      return 'Please enter a valid email address';
                    }
                    return null;
                  },
                ),
                // Display error message if any
                if (_errorMessage != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 16.0),
                    child: Text(
                      _errorMessage!,
                      style:
                          TextStyle(color: Theme.of(context).colorScheme.error),
                      textAlign: TextAlign.center,
                    ),
                  ),
                const SizedBox(height: 24),
                // "Continue with Email" Button
                ElevatedButton(
                  onPressed: _isLoading ? null : _handleContinueWithEmail,
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: Colors.white),
                        )
                      : const Text('Continue with Email'),
                ),
                const SizedBox(height: 32),
                // "OR" Divider
                const Row(
                  children: [
                    Expanded(child: Divider()),
                    Padding(
                      padding: EdgeInsets.symmetric(horizontal: 16),
                      child: Text(
                        'OR',
                        style: TextStyle(
                          color: Colors.grey, // Consider using Theme colors
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    Expanded(child: Divider()),
                  ],
                ),
                const SizedBox(height: 32),
                // "Login with Existing Passkey" Button
                OutlinedButton(
                  // Calls _handlePasskeyLogin without email hint
                  onPressed: _isLoading ? null : () => _handlePasskeyLogin(),
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
                      : const Text('Login with Existing Passkey'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
