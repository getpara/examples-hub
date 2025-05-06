// /Users/tyson/dev/examples-hub/mobile/with-flutter/lib/widgets/choose_signup_method.dart
import 'dart:async'; // Added for Completer
import 'package:flutter/material.dart';
import 'package:para/para.dart'; // Added import for SDK types
import 'package:para_flutter/client/para.dart';
import 'package:para_flutter/widgets/demo_home.dart';

// SignupMethod enum is now imported from 'package:para/para.dart'
// enum SignupMethod { passkey, password }

class ChooseSignupMethod extends StatefulWidget {
  final AuthState authState;
  final WebAuthenticationSession webAuthenticationSession;

  const ChooseSignupMethod({
    super.key,
    required this.authState,
    required this.webAuthenticationSession,
  });

  @override
  State<ChooseSignupMethod> createState() => _ChooseSignupMethodState();
}

class _ChooseSignupMethodState extends State<ChooseSignupMethod> {
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void dispose() {
    super.dispose();
  }

  void _log(String message, {bool isWarning = false}) {
    debugPrint('ChooseSignupMethod: ${isWarning ? "WARN: " : ""}$message');
  }

  Future<void> _setupAccount(SignupMethod method /* This will now be the SDK's SignupMethod */) async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    if (widget.authState.stage != AuthStage.signup) {
      setState(() {
        _errorMessage = 'Invalid state: Expected signup stage.';
        _isLoading = false;
      });
      _log('Error: Incorrect AuthStage (${widget.authState.stage}) passed to ChooseSignupMethod.');
      return;
    }

    try {
      _log('Starting setup for method: $method using para.handleSignup');
      await para.handleSignup(
        authState: widget.authState,
        method: method,
        webAuthenticationSession: widget.webAuthenticationSession,
      );
      _log('para.handleSignup successful for method: $method. Navigating to DemoHome.');
      if (mounted) {
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (context) => const DemoHome()),
          (Route<dynamic> route) => false,
        );
      }
    } catch (e) {
      _log('Error caught during setup with para.handleSignup: $e', isWarning: true);
      setState(() {
        _errorMessage = 'Setup failed: $e';
      });
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Widget _buildSecurityOptionButton({
    required IconData icon,
    required String title,
    required String description,
    required VoidCallback onTap,
    required bool isDisabled,
  }) {
    // This widget remains the same
    return Opacity(
      opacity: isDisabled ? 0.5 : 1.0,
      child: Material(
        color: Colors.grey.shade200, // Or use Theme color
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          onTap: isDisabled || _isLoading ? null : onTap,
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Icon(
                  icon,
                  size: 30,
                  color: isDisabled ? Colors.grey : Theme.of(context).colorScheme.primary,
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: isDisabled ? Colors.grey.shade600 : Colors.black87,
                        ),
                      ),
                      Text(
                        description,
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey.shade600,
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(
                  Icons.chevron_right,
                  color: isDisabled ? Colors.grey.shade400 : Colors.grey.shade600,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Build method remains largely the same
    final isSignupStage = widget.authState.stage == AuthStage.signup;
    final isPasskeyAvailable = isSignupStage && para.isSignupMethodAvailable(SignupMethod.passkey, widget.authState);
    final isPasswordAvailable = isSignupStage && para.isSignupMethodAvailable(SignupMethod.password, widget.authState);

    _log('Build - Auth State Stage: ${widget.authState.stage}');
    _log('Build - Passkey Available: $isPasskeyAvailable');
    _log('Build - Password Available: $isPasswordAvailable');

    return Scaffold(
      appBar: AppBar(
        title: const Text('Secure Your Account'),
        automaticallyImplyLeading: !_isLoading,
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const Icon(
                Icons.check_circle,
                size: 80,
                color: Colors.green,
              ),
              const SizedBox(height: 16),
              const Text(
                'Account Verified!',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Choose how to secure your new account',
                style: TextStyle(
                  color: Colors.black54,
                  fontSize: 16,
                ),
                textAlign: TextAlign.center,
              ),
              if (_errorMessage != null) ...[
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.red.shade50,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    _errorMessage!,
                    style: TextStyle(
                      color: Colors.red.shade800,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ],
              if (_isLoading) ...[
                const SizedBox(height: 24),
                const CircularProgressIndicator(),
                const SizedBox(height: 8),
                const Text("Setting up account..."),
              ],
              const SizedBox(height: 32),
              _buildSecurityOptionButton(
                icon: Icons.fingerprint,
                title: 'Use Biometrics (Passkey)',
                description: 'Quick and secure biometric login',
                isDisabled: !isPasskeyAvailable || _isLoading, // Disable while loading
                onTap: () => _setupAccount(SignupMethod.passkey),
              ),
              const SizedBox(height: 16),
              _buildSecurityOptionButton(
                icon: Icons.password,
                title: 'Use Password',
                description: 'Traditional password-based login',
                isDisabled: !isPasswordAvailable || _isLoading, // Disable while loading
                onTap: () => _setupAccount(SignupMethod.password),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
