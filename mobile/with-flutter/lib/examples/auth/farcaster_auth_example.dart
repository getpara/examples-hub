// ignore_for_file:

import 'dart:async';
// Import the SDK package
import 'package:para/para.dart';
import 'package:para_flutter/client/para.dart'; // Assuming 'para' instance is globally available or passed via context
import 'package:para_flutter/widgets/demo_home.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:qr_flutter/qr_flutter.dart'; // Import a QR code package
import 'package:url_launcher/url_launcher.dart';

class ParaFarcasterAuthExample extends StatefulWidget {
  const ParaFarcasterAuthExample({super.key});

  @override
  State<ParaFarcasterAuthExample> createState() =>
      _ParaFarcasterAuthExampleState();
}

class _ParaFarcasterAuthExampleState extends State<ParaFarcasterAuthExample> {
  bool _isLoading = false;
  // Wallet info

  // --- Farcaster Specific State ---
  String? _farcasterConnectUri; // To store the URI for the QR code
  bool _farcasterFlowCancelled = false; // Flag to signal cancellation

  @override
  void initState() {
    super.initState();
    _checkLoginStatus();
  }

  // Helper for logging within the state
  void _log(String message, {bool isWarning = false}) {
    debugPrint(
        'ParaFarcasterAuthExample: ${isWarning ? "WARNING: " : ""}$message');
  }

  Future<void> _checkLoginStatus() async {
    setState(() => _isLoading = true);
    try {
      final isLoggedIn = await para.isFullyLoggedIn();
      if (isLoggedIn && mounted) {
        final wallets = await para.fetchWallets();
        if (wallets.isNotEmpty) {
          _updateWalletState(wallets.first);
          // Optionally navigate home if already logged in
          // Navigator.pushReplacement(
          //   context,
          //   MaterialPageRoute(builder: (context) => const DemoHome()),
          // );
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
    setState(() {});
  }

  // Updated Farcaster handler for V2 SDK
  Future<void> _verifyFarcasterAuth() async {
    if (!mounted) return;

    setState(() {
      _isLoading = true;
      _farcasterConnectUri = null; // Reset QR code state
      _farcasterFlowCancelled = false; // Reset cancellation flag
    });

    try {
      _log("Starting Farcaster V2 flow...");

      // Step 1: Get the Farcaster connect URI
      final connectUri = await para.getFarcasterConnectUri();

      if (!mounted) return;

      setState(() {
        _farcasterConnectUri = connectUri;
      });

      _log("Displaying QR code with Farcaster connect URI");

      // Step 2: Use the SDK's handleFarcaster method, but we need to launch the URI automatically
      // since we're displaying it as a QR code
      AuthState? authState;

      try {
        // We need to use the SDK's built-in polling for verification
        authState = await para.verifyFarcaster(
          // We just use the isCanceled callback to check our local state
          isCanceled: () => _farcasterFlowCancelled,
        );
      } catch (e) {
        // Catch any errors from verifyFarcaster
        if (_farcasterFlowCancelled) {
          throw Exception('Farcaster authentication canceled by user');
        } else {
          rethrow;
        }
      }

      _log(
          "Farcaster authentication successful, stage: ${authState.stage.name}");

      // Process the authentication result based on the stage
      if (authState.stage == AuthStage.login) {
        _log("Processing Farcaster LOGIN stage");
        if (authState.passkeyUrl != null) {
          // Open the passkey URL in an external browser
          final passkeyUri = Uri.parse(authState.passkeyUrl!);
          await launchUrl(passkeyUri, mode: LaunchMode.externalApplication);

          // Wait for login to complete using the para SDK method
          await para.waitForLogin(
            isCanceled: () => _farcasterFlowCancelled,
          );
        }
      } else if (authState.stage == AuthStage.signup) {
        _log("Processing Farcaster SIGNUP stage");
        if (authState.passkeyUrl != null) {
          // Open the passkey URL in an external browser
          final passkeyUri = Uri.parse(authState.passkeyUrl!);
          await launchUrl(passkeyUri, mode: LaunchMode.externalApplication);

          // Wait for wallet creation using the para SDK method
          await para.waitForWalletCreation(
            isCanceled: () => _farcasterFlowCancelled,
          );
        }
      }

      // Fetch wallets to update state after successful login/signup
      final wallets = await para.fetchWallets();
      if (wallets.isNotEmpty) {
        _updateWalletState(wallets.first);
      } else {
        _log("Farcaster successful but no wallets found after flow.",
            isWarning: true);
      }

      if (mounted) {
        // Navigate to home screen after successful flow
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const DemoHome()),
        );
      }
    } catch (e) {
      _log('Error during Farcaster auth: ${e.toString()}', isWarning: true);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Farcaster Error: ${e.toString()}')),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _farcasterConnectUri = null; // Clear QR code on finish/error
        });
      }
    }
  }

  Widget _buildFarcasterButton() {
    final isLoading = _isLoading;
    dynamic icon = 'lib/assets/farcaster.svg'; // Ensure this asset exists
    final backgroundColor = const Color(0xFF855DCD);
    final textColor = Colors.white;

    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: ElevatedButton(
        // Calls the new V2 handler
        onPressed: _isLoading ? null : _verifyFarcasterAuth,
        style: ElevatedButton.styleFrom(
          backgroundColor: backgroundColor,
          foregroundColor: textColor,
          elevation: 1,
          padding: const EdgeInsets.symmetric(
            horizontal: 24,
            vertical: 16,
          ),
          shape: RoundedRectangleBorder(
            // Added for consistency
            borderRadius: BorderRadius.circular(8.0),
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (icon is IconData)
              Icon(icon, size: 20)
            else if (icon is String)
              SvgPicture.asset(
                icon,
                width: 20,
                height: 20,
                colorFilter: ColorFilter.mode(textColor, BlendMode.srcIn),
              ),
            const SizedBox(width: 12),
            const Expanded(
              child: Text(
                'Continue with Farcaster',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            if (isLoading)
              Container(
                // Ensure indicator doesn't push text
                alignment: Alignment.centerRight,
                width: 32, // Give indicator space
                child: const SizedBox(
                  height: 20,
                  width: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                  ),
                ),
              )
            else
              const SizedBox(width: 32), // Keep space consistent
          ],
        ),
      ),
    );
  }

  // Widget to display the QR Code
  Widget _buildQrCodeDisplay() {
    if (_farcasterConnectUri == null) {
      return const SizedBox.shrink(); // Don't show anything if no URI
    }
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text("Scan with Warpcast App", style: TextStyle(fontSize: 16)),
          const SizedBox(height: 16),
          QrImageView(
            // Use qr_flutter package
            data: _farcasterConnectUri!,
            version: QrVersions.auto,
            size: 200.0,
            gapless: false,
          ),
          const SizedBox(height: 16),
          TextButton(
            onPressed: () {
              // Signal cancellation and hide QR code
              setState(() {
                _farcasterFlowCancelled = true;
                _farcasterConnectUri = null;
              });
            },
            child: const Text("Cancel", style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Farcaster Example (V2)'), // Updated title
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'Farcaster Authentication', // Updated title
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Example implementation of Farcaster authentication using Para SDK V2.', // Updated description
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.black87,
                ),
              ),
              const SizedBox(height: 48),
              // Show QR code if URI is available, otherwise show button
              if (_farcasterConnectUri != null)
                _buildQrCodeDisplay()
              else
                _buildFarcasterButton(),

              // Display loading indicator separately if needed, or handle within button
              if (_isLoading &&
                  _farcasterConnectUri ==
                      null) // Show general loading only if QR isn't shown
                const Padding(
                  padding: EdgeInsets.only(top: 16.0),
                  child: Center(child: CircularProgressIndicator()),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
