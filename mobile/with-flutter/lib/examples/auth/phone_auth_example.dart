// /Users/tyson/dev/examples-hub/mobile/with-flutter/lib/examples/auth/phone_auth_example.dart
// ignore_for_file: unused_field, unused_local_variable, use_build_context_synchronously

import 'dart:async'; // Keep for Future
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart'; // Added import

// Import the SDK package
import 'package:para/para.dart';
import 'package:para_flutter/client/para.dart'; // Assuming 'para' instance is globally available or passed via context
import 'package:para_flutter/util/random.dart';
import 'package:para_flutter/widgets/choose_signup_method.dart'; // Needed for signup flow
import 'package:para_flutter/widgets/demo_home.dart';
import 'package:para_flutter/widgets/demo_otp_verification.dart';

class ParaPhoneExample extends StatefulWidget {
  const ParaPhoneExample({super.key});

  @override
  State<ParaPhoneExample> createState() => _ParaPhoneExampleState();
}

class _ParaPhoneExampleState extends State<ParaPhoneExample> {
  final _formKey = GlobalKey<FormState>();
  final _phoneController = TextEditingController();
  final _countryCodeController = TextEditingController(text: '1');
  bool _isLoading = false;
  // Keep track of the AuthState for multi-step flows
  AuthState? _currentAuthState;

  // Wallet info
  Wallet? _wallet;
  String? _address;

  // InAppBrowser instance for password flow
  final InAppBrowser _browser = InAppBrowser();

  @override
  void initState() {
    super.initState();
    _phoneController.text = randomTestPhone();
    _checkLoginStatus();
  }

  @override
  void dispose() {
    _phoneController.dispose();
    _countryCodeController.dispose();
    super.dispose();
  }

  // Helper for logging within the state
  void _log(String message, {bool isWarning = false}) {
    debugPrint('ParaPhoneExample: ${isWarning ? "WARNING: " : ""}$message');
  }

  // Helper to get the fully formatted phone number using the SDK utility
  // Returns null if formatting fails.
  String? get _formattedPhoneNumber {
    // Use the SDK's formatter
    return para.formatPhoneNumber(_phoneController.text, _countryCodeController.text);
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

  // Helper to update wallet state consistently
  void _updateWalletState(Wallet wallet) {
    setState(() {
      _wallet = wallet;
      _address = wallet.address;
    });
  }

  // Renamed function to reflect V2 flow
  Future<void> _handlePhoneAuth() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);
    final formattedPhone = _formattedPhoneNumber; // Use the formatted number

    // Handle null case from formatter
    if (formattedPhone == null) {
      _log('Invalid phone number or country code entered.', isWarning: true);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Invalid phone number or country code.')),
        );
      }
      setState(() => _isLoading = false);
      return;
    }

    try {
      // Step 1: Call signUpOrLogIn
      _log("Calling signUpOrLogIn for phone: $formattedPhone");
      final authState = await para.signUpOrLogIn(auth: {'phone': formattedPhone});
      _currentAuthState = authState;

      _log("signUpOrLogIn returned stage: ${authState.stage}");

      // Step 2: Handle the returned AuthState
      switch (authState.stage) {
        case AuthStage.verify:
          _log("Navigating to OTP verification screen.");
          if (!mounted) return;
          final bool verificationSuccess = await Navigator.push<bool>(
                context,
                MaterialPageRoute(
                  builder: (context) => DemoOtpVerification(
                    onVerify: _handlePhoneOtpVerification,
                    onResendCode: _handleResendVerificationCode, // Pass resend handler
                  ),
                ),
              ) ??
              false;

          if (verificationSuccess) {
            _log("OTP Verification successful, flow continues in ChooseSignupMethod.");
            // Navigation to DemoHome is handled within ChooseSignupMethod
          } else {
            _log("OTP Verification failed or was cancelled.");
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Verification failed or cancelled.')),
              );
            }
          }
          break;

        case AuthStage.login:
          _log("User exists, proceeding with login.");

          // Check if password login is available via passwordUrl
          if (authState.passwordUrl != null) {
            _log("Password login available. URL: ${authState.passwordUrl}");
            _log("Launching password web view...");

            bool passwordFlowCompleted = false;
            try {
              // --- Launch Password Web View using InAppBrowser ---
              await _browser.openUrlRequest(
                urlRequest: URLRequest(url: WebUri(authState.passwordUrl!)),
                settings: InAppBrowserClassSettings(
                  browserSettings: InAppBrowserSettings(
                    presentationStyle: ModalPresentationStyle.PAGE_SHEET,
                  ),
                  webViewSettings: InAppWebViewSettings(
                      // Add any webview specific settings if needed
                      ),
                ),
              );
              passwordFlowCompleted = true;
              _log("Password web view closed.");
            } catch (e) {
              _log("Error launching/handling password browser: $e", isWarning: true);
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Password login failed: $e')),
                );
              }
              setState(() => _isLoading = false);
              return;
            }

            // --- Check Login Status After Web View ---
            if (passwordFlowCompleted) {
              _log("Checking login status after password flow...");
              setState(() => _isLoading = true);
              bool loggedIn = false;
              int attempts = 0;
              while (attempts < 20 && !loggedIn) {
                // Poll for ~40 seconds
                await Future.delayed(const Duration(seconds: 2));
                try {
                  loggedIn = await para.isFullyLoggedIn();
                  _log("Polling login status: $loggedIn");
                } catch (pollError) {
                  _log("Error polling login status: $pollError", isWarning: true);
                }
                attempts++;
              }

              if (loggedIn) {
                _log("Login successful after password flow.");
                final wallets = await para.fetchWallets();
                if (wallets.isNotEmpty) _updateWalletState(wallets.first);
                if (mounted) {
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(builder: (context) => const DemoHome()),
                  );
                }
              } else {
                _log("Login did not complete after password flow.", isWarning: true);
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Login timed out after password entry.')),
                  );
                }
              }
            }
            // Check if passkey login is available
          } else if (authState.passkeyUrl != null || authState.passkeyKnownDeviceUrl != null) {
            _log("Password URL not found, attempting passkey login.");
            try {
              // Use the actual SDK method
              final wallet = await para.loginWithPasskey(
                // Provide phone auth info as a hint if needed by SDK, otherwise null
                authInfo: PhoneAuthInfo(phone: formattedPhone, countryCode: _countryCodeController.text),
              );
              _log("Passkey login successful.");
              _updateWalletState(wallet);
              if (mounted) {
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(builder: (context) => const DemoHome()),
                );
              }
            } catch (passkeyError) {
              _log("Passkey login failed: $passkeyError", isWarning: true);
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Passkey login failed: $passkeyError')),
                );
              }
            }
          } else {
            _log("No password URL or passkey options found in AuthState.", isWarning: true);
            throw Exception("No available login methods found for this user.");
          }
          break; // End of AuthStage.login case

        case AuthStage.signup:
          _log("Received unexpected 'signup' stage from signUpOrLogIn.", isWarning: true);
          throw Exception("Unexpected authentication stage: signup received directly from signUpOrLogIn.");
      }
    } catch (e) {
      _log('Error during phone auth: ${e.toString()}', isWarning: true);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  // Handle resending verification code
  Future<bool> _handleResendVerificationCode() async {
    setState(() => _isLoading = true);
    try {
      // Use the specific phone resend method if available, otherwise generic
      // Assuming generic resend works for phone too based on SDK structure
      await para.resendVerificationCode();
      _log("Resend code request sent.");
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Resend request sent.')));
      }
      setState(() => _isLoading = false);
      return true;
    } catch (e) {
      _log("Error resending code: $e", isWarning: true);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error resending code: $e')));
      }
      setState(() => _isLoading = false);
      return false;
    }
  }

  // Separate handler for OTP verification logic for phone
  Future<bool> _handlePhoneOtpVerification(String code) async {
    // No need to set _isLoading here, DemoOtpVerification handles its own state
    final formattedPhone = _formattedPhoneNumber; // Get formatted number again

    // Handle null case from formatter
    if (formattedPhone == null) {
      _log('Cannot verify OTP, invalid phone number or country code stored.', isWarning: true);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Internal error: Invalid phone number.')),
        );
      }
      return false; // Indicate failure
    }

    try {
      _log("Calling verifyNewAccount with code: $code");
      final authState = await para.verifyNewAccount(verificationCode: code);
      _log("verifyNewAccount returned stage: ${authState.stage}");

      if (authState.stage == AuthStage.signup) {
        _log("Navigating to ChooseSignupMethod screen.");
        // Navigate to the security method selection screen
        if (mounted) {
          await Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => ChooseSignupMethod(
                authState: authState, // Pass the AuthState from verification
              ),
            ),
          );
          // Assume flow completed or cancelled after ChooseSignupMethod pops
          return true; // Signal success to DemoOtpVerification
        }
        return false; // Should not happen if mounted check passes
      } else {
        _log("Unexpected stage after verifyNewAccount: ${authState.stage}", isWarning: true);
        throw Exception("Verification succeeded but resulted in unexpected stage: ${authState.stage}");
      }
    } catch (e) {
      _log("Error during OTP verification/signup: ${e.toString()}", isWarning: true);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Verification Error: $e')),
        );
      }
      return false; // Indicate failure
    }
  }

  Future<void> _handlePasskeyLogin() async {
    setState(() => _isLoading = true);

    try {
      _log("Attempting generic passkey login...");
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
        SnackBar(content: Text('Passkey Login Error: $e')),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Phone + Passkey Example'),
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
                  Icons.phone_android_outlined,
                  size: 50,
                  color: Colors.green, // Or use Theme color
                ),
                const SizedBox(height: 24),
                const Text(
                  'Phone Authentication',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 12),
                const Text(
                  'Sign in or register with your phone number.', // Updated text
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.black87, // Or use Theme color
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 48),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start, // Align items top
                  children: [
                    SizedBox(
                      // Constrain width of country code
                      width: 80,
                      child: TextFormField(
                        controller: _countryCodeController,
                        decoration: const InputDecoration(
                          labelText: 'Code',
                          prefixText: '+',
                          border: OutlineInputBorder(),
                        ),
                        keyboardType: TextInputType.phone,
                        inputFormatters: [
                          FilteringTextInputFormatter.digitsOnly,
                          LengthLimitingTextInputFormatter(4), // Limit length
                        ],
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Req'; // Short error
                          }
                          return null;
                        },
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: TextFormField(
                        controller: _phoneController,
                        decoration: const InputDecoration(
                          labelText: 'Phone Number',
                          hintText: 'Enter your phone number',
                          prefixIcon: Icon(Icons.phone),
                          border: OutlineInputBorder(),
                        ),
                        keyboardType: TextInputType.phone,
                        inputFormatters: [
                          FilteringTextInputFormatter.digitsOnly,
                        ],
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please enter a phone number';
                          }
                          // Basic length check, adjust as needed
                          if (value.length < 7) {
                            return 'Please enter a valid phone number';
                          }
                          return null;
                        },
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  onPressed: _isLoading ? null : _handlePhoneAuth,
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : const Text('Continue with Phone'),
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
                  icon: const Icon(Icons.fingerprint),
                  label: const Text('Login with Any Passkey'),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    side: BorderSide(
                      color: Theme.of(context).colorScheme.primary,
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
