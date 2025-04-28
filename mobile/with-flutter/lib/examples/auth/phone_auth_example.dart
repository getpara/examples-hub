// ignore_for_file: unused_field, unused_local_variable, use_build_context_synchronously

import 'package:para_flutter/util/random.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
// Import the SDK package
import 'package:para/para.dart';
import 'package:para_flutter/client/para.dart'; // Assuming 'para' instance is globally available or passed via context
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
  // String? _recoveryShare; // Adjust if needed based on createWallet V2 result

  @override
  void initState() {
    super.initState();
    // _countryCodeController.text = '1'; // Already set in declaration
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
    return para.formatPhoneNumber(
        _phoneController.text, _countryCodeController.text);
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
      // If CreateWalletResult was used and had recoveryShare:
      // _recoveryShare = createResult.recoveryShare;
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
          const SnackBar(
              content: Text('Invalid phone number or country code.')),
        );
      }
      setState(() => _isLoading = false);
      return;
    }

    try {
      // Step 1: Call signUpOrLogIn
      _log("Calling signUpOrLogIn for phone: $formattedPhone");
      final authState =
          await para.signUpOrLogIn(auth: {'phone': formattedPhone});
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
                    // Pass the correct resend function
                    onResendCode: () async {
                      try {
                        // Use the generic resend method (confirm if phone-specific exists/is needed)
                        await para.resendVerificationCode();
                        _log("Resend code request sent.");
                        if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                  content: Text('Resend request sent.')));
                        }
                        return true;
                      } catch (e) {
                        _log("Error resending code: $e", isWarning: true);
                        if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                              content: Text('Error resending code: $e')));
                        }
                        return false;
                      }
                    },
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

        case AuthStage.login:
          _log("User exists, proceeding with passkey login.");
          final wallet = await para.loginWithPasskey(
            // Provide phone auth info as a hint
            authInfo: PhoneAuthInfo(
                phone: _phoneController
                    .text, // Pass unformatted phone? Check SDK needs
                countryCode: _countryCodeController.text),
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

        case AuthStage.signup:
          _log("Received unexpected 'signup' stage from signUpOrLogIn.",
              isWarning: true);
          throw Exception(
              "Unexpected authentication stage: signup received directly from signUpOrLogIn.");
      }
    } catch (e) {
      _log('Error during phone auth: ${e.toString()}', isWarning: true);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: ${e.toString()}')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  // Separate handler for OTP verification logic for phone
  Future<bool> _handlePhoneOtpVerification(String code) async {
    setState(() => _isLoading = true);
    final formattedPhone = _formattedPhoneNumber; // Get formatted number again

    // Handle null case from formatter
    if (formattedPhone == null) {
      _log('Cannot verify OTP, invalid phone number or country code stored.',
          isWarning: true);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text('Internal error: Invalid phone number.')),
        );
      }
      setState(() => _isLoading = false);
      return false;
    }

    try {
      _log("Calling verifyNewAccount with code: $code");
      final authState = await para.verifyNewAccount(verificationCode: code);
      _log("verifyNewAccount returned stage: ${authState.stage}");

      if (authState.stage == AuthStage.signup) {
        if (authState.passkeyId == null) {
          throw Exception("Signup stage reached, but no passkeyId provided.");
        }
        _log("Proceeding to generate passkey with id: ${authState.passkeyId}");
        // Use formatted phone number as the identifier for passkey registration
        await para.generatePasskey(
          identifier: formattedPhone,
          biometricsId: authState.passkeyId!,
        );
        _log("Passkey generated, creating wallet...");
        final createResult = await para.createWallet(skipDistribute: false);
        _log("Wallet created successfully.");
        _updateWalletState(createResult); // Pass the Wallet object
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
                const Text(
                  'Phone Authentication',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'Example implementation of phone authentication using Para SDK.',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.black87,
                  ),
                ),
                const SizedBox(height: 48),
                Row(
                  children: [
                    Expanded(
                      flex: 2,
                      child: TextFormField(
                        controller: _countryCodeController,
                        decoration: const InputDecoration(
                          labelText: 'Country Code',
                          prefixText: '+',
                        ),
                        keyboardType: TextInputType.phone,
                        inputFormatters: [
                          FilteringTextInputFormatter.digitsOnly,
                        ],
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Required';
                          }
                          return null;
                        },
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      flex: 8,
                      child: TextFormField(
                        controller: _phoneController,
                        decoration: const InputDecoration(
                          labelText: 'Phone Number',
                          hintText: 'Enter your phone number',
                          prefixIcon: Icon(Icons.phone),
                        ),
                        keyboardType: TextInputType.phone,
                        inputFormatters: [
                          FilteringTextInputFormatter.digitsOnly,
                        ],
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please enter a phone number';
                          }
                          if (value.length < 10) {
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
                  onPressed: _isLoading ? null : _handlePhoneAuth,
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('Continue with Phone'),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: _isLoading ? null : _handlePasskeyLogin,
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('Continue with Passkey'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
