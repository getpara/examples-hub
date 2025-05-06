// /Users/tyson/dev/examples-hub/mobile/with-flutter/lib/examples/auth/email_auth_example.dart
// ignore_for_file: unused_field, unused_local_variable, use_build_context_synchronously

import 'dart:async'; // Keep for Future and async operations
import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart'; // Added import

// Import the SDK package with all necessary exports
import 'package:para/para.dart';
import 'package:para_flutter/client/para.dart'; // Assuming 'para' instance is globally available or passed via context
import 'package:para_flutter/util/random.dart';
import 'package:para_flutter/widgets/choose_signup_method.dart';
import 'package:para_flutter/widgets/demo_home.dart';
import 'package:para_flutter/widgets/demo_otp_verification.dart';

// --- Define the custom InAppBrowser class ---
class MyAuthBrowser extends InAppBrowser {
  final Completer<bool> completer;
  final String callbackScheme;
  final VoidCallback? onExitCallback; // Optional callback for exit logic
  final Function(String, {bool isWarning}) logCallback; // For logging
  bool flowCompletedViaCallback = false;

  MyAuthBrowser({
    required this.completer,
    required this.callbackScheme,
    required this.logCallback,
    this.onExitCallback, // Pass optional exit callback
    super.webViewEnvironment, // Pass environment if needed
    super.windowId, // Pass windowId if needed
  });

  @override
  Future<void> onLoadStop(Uri? url) async {
    logCallback("Browser onLoadStop: ${url ?? '''null'''}");
    if (url?.scheme == callbackScheme) {
      logCallback("Callback URL detected!");
      if (!completer.isCompleted) {
        flowCompletedViaCallback = true;
        await close(); // Close the browser programmatically
        completer.complete(true); // Signal success
      }
    }
  }

  @override
  void onExit() {
    logCallback("Browser onExit event.");
    // Call the optional exit callback if provided
    onExitCallback?.call();
    if (!completer.isCompleted) {
      logCallback("Browser closed without callback.");
      completer.complete(false); // Signal manual close / failure
    }
  }

  // Optional: Override other methods if needed, e.g., onBrowserCreated, onLoadStart
  // @override
  // Future<void> onBrowserCreated() async {
  //   logCallback("Custom Browser Created!");
  // }

  // @override
  // Future<void> onLoadStart(Uri? url) async {
  //   logCallback("Custom Browser Started $url");
  // }

  // @override
  // void onReceivedError(WebResourceRequest request, WebResourceError error) {
  //   logCallback("Custom Browser Can't load ${request.url}.. Error: ${error.description}", isWarning: true);
  //   if (!completer.isCompleted) {
  //     completer.completeError(WebResourceError); // Or complete with false? Decide error handling
  //   }
  // }
}
// --- End of custom InAppBrowser class ---

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

  @override
  void initState() {
    super.initState();
    _emailController.text = randomTestEmail();
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

  // --- Helper to add callback URL ---
  Uri _prepareUrlWithCallback(String originalUrl) {
    final uri = Uri.parse(originalUrl);
    final queryParams = Map<String, String>.from(uri.queryParameters);
    // Add the nativeCallbackUrl parameter expected by the web app
    queryParams['nativeCallbackUrl'] = _callbackScheme;
    return uri.replace(queryParameters: queryParams);
  }

  // --- Function to launch browser and listen for callback ---
  Future<bool> _launchPasswordWebView(String url) async {
    // _passwordFlowCompletedViaCallback = false; // Reset flag - Handled in MyAuthBrowser instance
    final completer = Completer<bool>();
    final finalUrl = _prepareUrlWithCallback(url);

    // Create instance of our custom browser class
    final myAuthBrowser = MyAuthBrowser(
      completer: completer,
      callbackScheme: _callbackScheme,
      logCallback: _log, // Pass the state's log function
      // Optional: Add onExitCallback if specific state cleanup is needed on exit
      // onExitCallback: () {
      //   // e.g., setState(() => someUiFlag = false);
      // },
    );

    bool browserOpenedSuccessfully = false;
    try {
      _log("Opening browser with URL: $finalUrl");
      await myAuthBrowser.openUrlRequest(
        urlRequest: URLRequest(url: WebUri.uri(finalUrl)),
        settings: InAppBrowserClassSettings(
          browserSettings: InAppBrowserSettings(
            presentationStyle: ModalPresentationStyle.PAGE_SHEET,
          ),
          webViewSettings: InAppWebViewSettings(
              // Add any webview specific settings if needed, e.g.:
              // javaScriptEnabled: true,
              ),
        ),
      );
      browserOpenedSuccessfully = true;
      // Don't complete the completer here, wait for onLoadStop or onExit in MyAuthBrowser
    } catch (e) {
      _log("Error opening browser: $e", isWarning: true);
      if (!completer.isCompleted) {
        completer.completeError(e); // Signal error
      }
    }

    // Wait for the completer (callback detected or browser closed via MyAuthBrowser overrides)
    final result = await completer.future;

    // // Clean up listeners/handlers - REMOVED (No listeners/handlers assigned directly here anymore)
    // _browser.onLoadStop = null;
    // _browser.onExit = null;

    // The result directly reflects if the flow completed via callback,
    // using the flag set within MyAuthBrowser instance
    return browserOpenedSuccessfully && result && myAuthBrowser.flowCompletedViaCallback;
  }

  Future<void> _handleEmailAuth() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);
    final email = _emailController.text.trim();

    try {
      _log("Starting auth flow for email: $email");
      final authState = await para.signUpOrLogIn(auth: {'email': email});
      _currentAuthState = authState;

      _log("Auth flow initiated. Resulting stage: ${authState.stage}");

      switch (authState.stage) {
        case AuthStage.verify:
          _log("Navigating to OTP verification screen for new user.");
          if (!mounted) return;
          final bool verificationSuccess = await Navigator.push<bool>(
                context,
                MaterialPageRoute(
                  builder: (context) => DemoOtpVerification(
                    onVerify: _handleOtpVerification,
                    onResendCode: _handleResendVerificationCode,
                  ),
                ),
              ) ??
              false;

          if (verificationSuccess) {
            _log("OTP Verification successful, flow continues in ChooseSignupMethod.");
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

          if (authState.passwordUrl != null) {
            _log("Password login available. Launching web view...");
            // --- Launch Password Web View and wait for callback ---
            final bool loginSuccess = await _launchPasswordWebView(authState.passwordUrl!);

            if (loginSuccess) {
              _log("Password flow successful via callback. Verifying login status...");
              // Short delay might be needed for backend session propagation
              await Future.delayed(const Duration(milliseconds: 500));
              bool loggedIn = await para.isFullyLoggedIn();

              if (loggedIn) {
                _log("Login confirmed after password flow.");
                final wallets = await para.fetchWallets();
                if (wallets.isNotEmpty) _updateWalletState(wallets.first);
                if (mounted) {
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(builder: (context) => const DemoHome()),
                  );
                }
              } else {
                _log("Login status check failed after password callback.", isWarning: true);
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Login verification failed after password entry.')),
                  );
                }
              }
            } else {
              _log("Password flow did not complete successfully (closed without callback).");
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Password login cancelled or failed.')),
                );
              }
            }
          } else if (authState.passkeyUrl != null || authState.passkeyKnownDeviceUrl != null) {
            _log("Password URL not found, attempting passkey login.");
            try {
              final wallet = await para.loginWithPasskey(authInfo: EmailAuthInfo(email: email));
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
          break;

        case AuthStage.signup:
          _log("Received unexpected 'signup' stage from auth flow", isWarning: true);
          throw Exception("Unexpected authentication stage: signup received directly from auth flow");
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
        if (mounted) {
          await Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => ChooseSignupMethod(
                authState: authState,
              ),
            ),
          );
          return true;
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
