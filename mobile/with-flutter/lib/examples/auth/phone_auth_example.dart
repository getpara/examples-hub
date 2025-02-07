// ignore_for_file: unused_field, unused_local_variable
import 'package:para_flutter/util/random.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:para/para.dart';
import 'package:para_flutter/client/para.dart';
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
  Wallet? _wallet;
  String? _address;
  String? _recoveryShare;

  @override
  void initState() {
    super.initState();
    _countryCodeController.text = '1';
    _phoneController.text = randomTestPhone();
    _checkLoginStatus();
  }

  @override
  void dispose() {
    _phoneController.dispose();
    _countryCodeController.dispose();
    super.dispose();
  }

  String get _fullPhoneNumber => '+${_countryCodeController.text}${_phoneController.text}';

  Future<void> _checkLoginStatus() async {
    try {
      final isLoggedIn = await para.isFullyLoggedIn();
      if (isLoggedIn && mounted) {
        final wallets = await para.getWallets();

        if (wallets.isNotEmpty) {
          setState(() {
            _wallet = wallets.values.first;
            _address = wallets.values.first.address;
            _recoveryShare = "";
          });
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error checking login status: ${e.toString()}')),
        );
      }
    }
  }

  Future<void> _handleCreateNewUser() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final phoneNumber = _phoneController.text;
      final countryCode = '+${_countryCodeController.text}';
      if (await para.checkIfUserExistsByPhone(phoneNumber, countryCode)) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('User already exists, please use passkey login')),
        );
        return;
      }

      await para.createUserByPhone(phoneNumber, countryCode);
      if (!mounted) return;

      final bool verified = await Navigator.push<bool>(
            context,
            MaterialPageRoute(
              builder: (context) => DemoOtpVerification(
                onVerify: (String code) async {
                  try {
                    final biometricsId = await para.verifyPhone(code);
                    await para.generatePasskey(_fullPhoneNumber, biometricsId);
                    final result = await para.createWallet(skipDistribute: false);

                    if (!mounted) return false;
                    setState(() {
                      _wallet = result.wallet;
                      _address = result.wallet.address;
                      _recoveryShare = result.recoveryShare;
                    });
                    return true;
                  } catch (e) {
                    return false;
                  }
                },
                onResendCode: () async {
                  try {
                    await para.resendVerificationCodeByPhone();
                    return true;
                  } catch (e) {
                    return false;
                  }
                },
              ),
            ),
          ) ??
          false;

      if (verified && mounted) {
        await Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const DemoHome()),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: ${e.toString()}')),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _handlePasskeyLogin() async {
    setState(() => _isLoading = true);

    try {
      final wallet = await para.login();

      if (!mounted) return;

      setState(() {
        _wallet = wallet;
        _address = wallet.address;
        _recoveryShare = "";
      });

      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const DemoHome()),
      );
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: ${e.toString()}')),
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
                  'Example implementation of phone-based authentication using Para SDK with passkey support.',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.black87,
                  ),
                ),
                const SizedBox(height: 48),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(
                      width: 100,
                      child: TextFormField(
                        controller: _countryCodeController,
                        decoration: const InputDecoration(
                          hintText: '1',
                          prefixIcon: Icon(Icons.add),
                        ),
                        keyboardType: TextInputType.phone,
                        textInputAction: TextInputAction.next,
                        inputFormatters: [
                          FilteringTextInputFormatter.digitsOnly,
                          LengthLimitingTextInputFormatter(3),
                        ],
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Required';
                          }
                          return null;
                        },
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextFormField(
                        controller: _phoneController,
                        decoration: const InputDecoration(
                          hintText: 'Enter your phone number',
                          prefixIcon: Icon(Icons.phone_outlined),
                        ),
                        keyboardType: TextInputType.phone,
                        textInputAction: TextInputAction.done,
                        inputFormatters: [
                          FilteringTextInputFormatter.digitsOnly,
                          LengthLimitingTextInputFormatter(15),
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
                  onPressed: _isLoading ? null : _handleCreateNewUser,
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('Create New User'),
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
                      : const Text('Login with Passkey'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
