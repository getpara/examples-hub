import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class DemoOtpVerification extends StatefulWidget {
  final Future<bool> Function(String code) onVerify;
  final Future<bool> Function()? onResendCode;

  const DemoOtpVerification({
    super.key,
    required this.onVerify,
    this.onResendCode,
  });

  @override
  State<DemoOtpVerification> createState() => _DemoOtpVerificationState();
}

class _DemoOtpVerificationState extends State<DemoOtpVerification> {
  final _otpController = TextEditingController();
  bool _isLoading = false;
  bool _isRetrying = false;
  String? _error;

  static const int _otpLength = 6;

  @override
  void initState() {
    super.initState();
    // _otpController.text = randomTestOTP(length: _otpLength, allowZeroStart: true);
    _otpController.text = '123456'; // Set the OTP code directly
  }

  @override
  void dispose() {
    _otpController.dispose();
    super.dispose();
  }

  Future<void> _handleVerification() async {
    if (_otpController.text.length != _otpLength) return;

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final success = await widget.onVerify(_otpController.text);

      if (!mounted) return;

      if (success) {
        Navigator.pop(context, true);
      } else {
        setState(() => _error = 'Invalid verification code');
      }
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _handleRetry() async {
    if (widget.onResendCode == null) return;

    setState(() {
      _isRetrying = true;
      _error = null;
    });

    try {
      final success = await widget.onResendCode!();
      if (!mounted) return;

      if (!success) {
        setState(() => _error = 'Failed to resend code');
      }
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _isRetrying = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Verification'),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'Enter Verification Code',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Please enter the verification code sent to your device.',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.black87,
                ),
              ),
              const SizedBox(height: 32),
              TextFormField(
                controller: _otpController,
                decoration: InputDecoration(
                  labelText: 'Verification Code',
                  hintText: '000000',
                  errorText: _error,
                  prefixIcon: const Icon(Icons.lock_outline),
                ),
                keyboardType: TextInputType.number,
                textInputAction: TextInputAction.done,
                inputFormatters: [
                  FilteringTextInputFormatter.digitsOnly,
                  LengthLimitingTextInputFormatter(_otpLength),
                ],
                onChanged: (value) {
                  setState(() => _error = null);
                  if (value.length == _otpLength) {
                    _handleVerification();
                  }
                },
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _isLoading || _otpController.text.length != _otpLength ? null : _handleVerification,
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('Verify'),
              ),
              if (widget.onResendCode != null) ...[
                const SizedBox(height: 16),
                TextButton(
                  onPressed: _isRetrying ? null : _handleRetry,
                  child: _isRetrying
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('Resend Code'),
                ),
              ],
              if (_error != null) ...[
                const SizedBox(height: 16),
                Text(
                  _error!,
                  style: TextStyle(
                    color: Theme.of(context).colorScheme.error,
                    fontSize: 14,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
