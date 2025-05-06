// /Users/tyson/dev/examples-hub/mobile/with-flutter/lib/widgets/choose_signup_method.dart
import 'dart:async'; // Added for Completer
import 'package:flutter/foundation.dart'; // Added for defaultTargetPlatform
import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart'; // Added import
import 'package:para/para.dart'; // Added import for SDK types
import 'package:para_flutter/client/para.dart';
import 'package:para_flutter/widgets/demo_home.dart';

// Define SignupMethod enum locally if not exported by SDK
enum SignupMethod { passkey, password }

class ChooseSignupMethod extends StatefulWidget {
  final AuthState authState;

  const ChooseSignupMethod({
    super.key,
    required this.authState,
  });

  @override
  State<ChooseSignupMethod> createState() => _ChooseSignupMethodState();
}

// --- Custom InAppBrowser for Password Setup ---
class _PasswordSetupBrowser extends InAppBrowser {
  final Completer<bool> completer;
  final String callbackScheme;
  final Function(String, {bool isWarning}) logCallback;
  bool passwordFlowCompleted =
      false; // This flag indicates if the browser logic detected a successful callback

  _PasswordSetupBrowser({
    required this.completer,
    required this.callbackScheme,
    required this.logCallback,
    super.webViewEnvironment, // Pass environment if needed
  });

  @override
  Future<void> onLoadStop(Uri? url) async {
    logCallback("Browser onLoadStop: ${url?.toString() ?? 'null'}");
    if (url?.scheme == callbackScheme) {
      logCallback("Callback URL $url detected directly in onLoadStop!");
      if (!completer.isCompleted) {
        passwordFlowCompleted = true;
        close(); // Close the browser
        completer.complete(true);
      }
    }
  }

  @override
  void onExit() {
    logCallback("Browser onExit event.");
    if (!completer.isCompleted) {
      logCallback(
          "Browser closed before callback or recognized redirect. Completing with false.");
      completer.complete(false); // Complete with false if closed manually
    }
  }

  @override
  Future<void> onLoadError(Uri? url, int code, String message) async {
    logCallback(
        "Browser onLoadError: Url: ${url?.toString()}, Code: $code, Message: $message",
        isWarning: true);

    if (url?.scheme == callbackScheme) {
      if (defaultTargetPlatform == TargetPlatform.iOS && code == -1002) {
        logCallback(
            "iOS: Detected expected -1002 error for callback scheme $url. Treating as successful redirect.");
        if (!completer.isCompleted) {
          passwordFlowCompleted = true;
          close();
          completer.complete(true);
        }
        return; // iOS specific handling done
      } else if (defaultTargetPlatform == TargetPlatform.android &&
          code == -10 /* типичный код для ERR_UNKNOWN_URL_SCHEME */) {
        logCallback(
            "Android: Detected error $code for callback scheme $url. Allowing onReceivedError or onLoadStop to handle.");
        // Do NOT complete here for Android. Let onReceivedError or onLoadStop handle it,
        // as the intent filter should ideally prevent this from being a fatal webview error page.
        return; // Android specific pass-through
      }
      // For other platforms or other error codes for our callback scheme not specifically handled above
      logCallback(
          "Callback scheme $url encountered an error (Code: $code, Platform: ${defaultTargetPlatform.toString()}). Completing with false.",
          isWarning: true);
      if (!completer.isCompleted) {
        completer.complete(false);
      }
      return; // Processed callback scheme error
    }

    // For any other errors not related to our callback scheme
    if (!completer.isCompleted) {
      logCallback(
          "Error for unrelated URL ${url?.toString()} (Code: $code). Completing with false.");
      completer.complete(false);
    }
  }

  @override
  void onReceivedError(WebResourceRequest request, WebResourceError error) {
    final requestUri = request.url; // WebUri
    logCallback(
        "Browser onReceivedError: URL: ${requestUri.toString()}, Type: ${error.type.toString()}, Desc: ${error.description}",
        isWarning: true);

    if (requestUri.scheme == callbackScheme) {
      // This is a key handler, especially after an intent filter allows the OS to recognize the scheme.
      // WebResourceErrorType.UNSUPPORTED_SCHEME is a common way this manifests.
      if (error.type == WebResourceErrorType.UNSUPPORTED_SCHEME) {
        logCallback(
            "Detected UNSUPPORTED_SCHEME error for callback scheme ${requestUri.toString()}. Treating as successful redirect.");
        if (!completer.isCompleted) {
          passwordFlowCompleted = true;
          close();
          completer.complete(true);
        }
      } else {
        logCallback(
            "Callback scheme ${requestUri.toString()} received an unexpected error type: ${error.type.toString()}. Completing with false.",
            isWarning: true);
        if (!completer.isCompleted) {
          completer.complete(false);
        }
      }
      return; // Processed callback scheme error
    }

    // For other URLs/resources that are not our callback scheme.
    if (!completer.isCompleted) {
      logCallback(
          "Error for unrelated resource ${requestUri.toString()} (Type: ${error.type.toString()}). Completing with false.");
      completer.complete(false);
    }
  }
}

class _ChooseSignupMethodState extends State<ChooseSignupMethod> {
  bool _isLoading = false;
  String? _errorMessage;

  bool _passwordFlowCompletedViaCallback = false;
  final String _callbackScheme = 'com.usecapsule.example.flutter';

  @override
  void dispose() {
    super.dispose();
  }

  void _log(String message, {bool isWarning = false}) {
    debugPrint('ChooseSignupMethod: ${isWarning ? "WARN: " : ""}$message');
  }

  // --- Helper to add callback URL ---
  Uri _prepareUrlWithCallback(String originalUrl) {
    final uri = Uri.parse(originalUrl);
    final queryParams = Map<String, String>.from(uri.queryParameters);
    queryParams['nativeCallbackUrl'] = 'com.usecapsule.example.flutter://';
    return uri.replace(queryParameters: queryParams);
  }

  // --- Function to launch browser and listen for callback ---
  Future<bool> _launchPasswordSetupWebView(String url) async {
    final completer = Completer<bool>();
    final finalUrl = _prepareUrlWithCallback(url);

    // Create instance of the custom browser
    final browser = _PasswordSetupBrowser(
      completer: completer,
      callbackScheme: _callbackScheme,
      logCallback: _log, // Pass the log function
    );

    try {
      _log("Opening browser with URL: $finalUrl");
      await browser.openUrlRequest(
        urlRequest: URLRequest(url: WebUri.uri(finalUrl)),
        options: InAppBrowserClassOptions(
          crossPlatform: InAppBrowserOptions(),
          ios: IOSInAppBrowserOptions(
            presentationStyle: IOSUIModalPresentationStyle.PAGE_SHEET,
          ),
        ),
      );
    } catch (e) {
      _log("Error opening browser: $e", isWarning: true);
      if (!completer.isCompleted) {
        completer.completeError(e); // Propagate error
      }
    }

    // Await the completer result (which is completed by onLoadStop or onExit)
    final result = await completer.future;

    // Use the flag from the browser instance if needed, or just the result
    _passwordFlowCompletedViaCallback = browser.passwordFlowCompleted;

    _log(
        "Password setup flow completed with result: $result, via callback: $_passwordFlowCompletedViaCallback");

    // Return true only if completed successfully AND via the callback
    return result && _passwordFlowCompletedViaCallback;
  }

  Future<void> _setupAccount(SignupMethod method) async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    if (widget.authState.stage != AuthStage.signup) {
      setState(() {
        _errorMessage = 'Invalid state: Expected signup stage.';
        _isLoading = false;
      });
      _log(
          'Error: Incorrect AuthStage (${widget.authState.stage}) passed to ChooseSignupMethod.');
      return;
    }

    try {
      _log('Starting setup for method: $method');
      Wallet? createdWallet; // To store the result

      if (method == SignupMethod.passkey) {
        if (widget.authState.passkeyId == null) {
          throw Exception(
              'Passkey signup option unavailable (missing passkeyId)');
        }
        _log('Generating passkey with ID: ${widget.authState.passkeyId}');
        await para.generatePasskey(
          identifier: widget.authState.auth.value,
          biometricsId: widget.authState.passkeyId!,
        );
        _log('Passkey generated. Creating wallet...');
        createdWallet = await para.createWallet(
            type: WalletType.evm, skipDistribute: false);
        _log(
            'Wallet created successfully (Passkey). Wallet ID: ${createdWallet.id}');
      } else if (method == SignupMethod.password) {
        if (widget.authState.passwordUrl == null) {
          throw Exception(
              'Password signup option unavailable (missing passwordUrl)');
        }
        _log('Password URL found: ${widget.authState.passwordUrl}');
        _log('Launching password setup web view...');

        // --- Launch Password Setup Web View and wait for callback ---
        final bool setupSuccess =
            await _launchPasswordSetupWebView(widget.authState.passwordUrl!);

        if (setupSuccess) {
          _log('Password setup successful via callback. Creating wallet...');
          // Add a small delay in case the backend needs a moment
          await Future.delayed(const Duration(milliseconds: 500));
          createdWallet = await para.createWallet(
              type: WalletType.evm, skipDistribute: false);
          _log(
              'Wallet created successfully (Password). Wallet ID: ${createdWallet.id}');
        } else {
          _log(
              'Password setup flow did not complete successfully (closed without callback or error).');
          // Check if an error message was already set by the browser error handlers
          if (_errorMessage == null) {
            setState(() {
              _errorMessage = "Password setup cancelled or failed.";
            });
          }
          // No need to throw here, just let it proceed to the 'wallet not created' check
        }
      }

      // --- Navigate Home on Success (if wallet was created) ---
      if (createdWallet != null) {
        _log('Setup successful, navigating to DemoHome.');
        if (mounted) {
          Navigator.pushAndRemoveUntil(
            context,
            MaterialPageRoute(builder: (context) => const DemoHome()),
            (Route<dynamic> route) => false,
          );
        }
      } else {
        // This handles both the case where setupSuccess was false,
        // and any other unexpected case where wallet wasn't created.
        _log('Wallet was not created, setup incomplete.', isWarning: true);
        setState(() {
          // Keep existing error message if set, otherwise use generic one
          _errorMessage ??= 'Account setup incomplete. Please try again.';
          _isLoading = false; // Ensure loading is stopped
        });
      }
    } catch (e) {
      _log('Error caught during setup: ${e.toString()}', isWarning: true);
      setState(() {
        _errorMessage = 'Setup failed: ${e.toString()}';
        _isLoading = false;
      });
    } finally {
      if (mounted && _isLoading) {
        // Ensure loading state is reset if component still mounted
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
                  color: isDisabled
                      ? Colors.grey
                      : Theme.of(context).colorScheme.primary,
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
                          color: isDisabled
                              ? Colors.grey.shade600
                              : Colors.black87,
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
                  color:
                      isDisabled ? Colors.grey.shade400 : Colors.grey.shade600,
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
    final isPasskeyAvailable =
        isSignupStage && widget.authState.passkeyId != null;
    final isPasswordAvailable =
        isSignupStage && widget.authState.passwordUrl != null;

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
                isDisabled:
                    !isPasskeyAvailable || _isLoading, // Disable while loading
                onTap: () => _setupAccount(SignupMethod.passkey),
              ),
              const SizedBox(height: 16),
              _buildSecurityOptionButton(
                icon: Icons.password,
                title: 'Use Password',
                description: 'Traditional password-based login',
                isDisabled:
                    !isPasswordAvailable || _isLoading, // Disable while loading
                onTap: () => _setupAccount(SignupMethod.password),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
