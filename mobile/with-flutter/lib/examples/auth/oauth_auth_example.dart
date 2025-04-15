// ignore_for_file: unused_field, unused_local_variable, use_build_context_synchronously

import 'dart:async';
// Import the SDK package
import 'package:para/para.dart';
import 'package:para_flutter/client/para.dart'; // Assuming 'para' instance is globally available or passed via context
import 'package:para_flutter/widgets/demo_home.dart';
import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:flutter_svg/flutter_svg.dart'; // Keep for icons

class ParaOAuthExample extends StatefulWidget {
  const ParaOAuthExample({super.key});

  @override
  State<ParaOAuthExample> createState() => _ParaOAuthExampleState();
}

class _ParaOAuthExampleState extends State<ParaOAuthExample> {
  bool _isLoading = false;
  String? _loadingProvider;
  // Wallet info
  Wallet? _wallet;
  String? _address;
  // String? _recoveryShare; // Adjust if needed

  @override
  void initState() {
    super.initState();
    _checkLoginStatus();
  }

  // Helper for logging within the state
  void _log(String message, {bool isWarning = false}) {
     debugPrint('ParaOAuthExample: ${isWarning ? "WARNING: " : ""}$message');
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
     setState(() {
        _wallet = wallet;
        _address = wallet.address;
        // If CreateWalletResult was used and had recoveryShare:
        // _recoveryShare = createResult.recoveryShare;
     });
  }

  // Updated OAuth handler using V2 SDK method
  Future<void> _handleOAuthLogin(OAuthMethod provider) async {
    if (!mounted) return;

    setState(() {
      _isLoading = true;
      _loadingProvider = provider.value; // Keep track of which button is loading
    });

    try {
      _log("Starting OAuth flow with provider: ${provider.value}");
      // Call the single V2 method.
      // "paraflutter" should be your registered URL scheme.
      final AuthState authState = await para.handleOAuth(
        provider: provider,
        deeplinkUrl: "paraflutter", // Replace with your actual registered scheme if different
        // No need to pass AuthController/WebAuthSession here, SDK handles it
      );

      _log("OAuth flow completed successfully. Final stage: ${authState.stage}");

      // Fetch wallets to update state after successful login/signup
      final wallets = await para.fetchWallets();
      if (wallets.isNotEmpty) {
         _updateWalletState(wallets.first);
      } else {
         _log("OAuth successful but no wallets found after flow.", isWarning: true);
         // This might happen if wallet creation failed silently, investigate SDK logs if necessary
      }

      if (mounted) {
        // Navigate to home screen after successful OAuth flow
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const DemoHome()),
        );
      }

    } catch (e) {
      _log('Error during OAuth: ${e.toString()}', isWarning: true);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('OAuth Error: ${e.toString()}')),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _loadingProvider = null; // Clear loading provider
        });
      }
    }
  }

  // --- Farcaster Logic (Commented out - Requires V2 Refactor in SDK) ---
  /*
  Future<void> _handleFarcasterLogin() async {
    if (!mounted) return;

    setState(() {
      _isLoading = true;
      _loadingProvider = 'Farcaster'; // Use a unique identifier
    });

    try {
      _log("Starting Farcaster connect...");
      // TODO: Replace with V2 Farcaster flow when available in SDK
      final farcasterResponse = await para.farcasterConnect();
      _log("Farcaster connect finished. User exists: ${farcasterResponse.userExists}");

      // TODO: The logic below needs replacement with V2 AuthState handling
      if (farcasterResponse.userExists) {
        // await _handlePasskeyLogin(farcasterResponse.username); // Old V1 helper
         _log("Farcaster login path needs V2 update.");
         throw UnimplementedError("Farcaster login path needs V2 update.");
      } else {
        // await _handleNewUserSetup(farcasterResponse.username); // Old V1 helper
         _log("Farcaster signup path needs V2 update.");
         throw UnimplementedError("Farcaster signup path needs V2 update.");
      }
       // Fetch wallets and navigate home on success...
    } catch (e) {
      _log('Error during Farcaster connect: ${e.toString()}', isWarning: true);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Farcaster Error: ${e.toString()}')),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _loadingProvider = null;
        });
      }
    }
  }
  */

  // --- Removed V1 Helper Functions ---
  // _handleNewUserSetup and _handlePasskeyLogin(String email) are no longer needed
  // as their logic is encapsulated within para.handleOAuth

  Widget _buildOAuthButton({
    required OAuthMethod provider,
    required String label,
    required dynamic icon, // Can be IconData or String asset path
    required Color backgroundColor,
    required Color textColor,
  }) {
    final isLoading = _isLoading && _loadingProvider == provider.value;

    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: ElevatedButton(
        onPressed: _isLoading ? null : () => _handleOAuthLogin(provider),
        style: ElevatedButton.styleFrom(
          backgroundColor: backgroundColor,
          foregroundColor: textColor,
          elevation: 1,
          padding: const EdgeInsets.symmetric(
            horizontal: 24,
            vertical: 16,
          ),
          shape: RoundedRectangleBorder( // Added for consistency
            borderRadius: BorderRadius.circular(8.0),
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center, // Center content
          children: [
            if (icon is IconData)
              Icon(icon, size: 20) // Slightly smaller icon
            else if (icon is String)
              SvgPicture.asset(
                icon,
                width: 20, // Slightly smaller icon
                height: 20,
                colorFilter: ColorFilter.mode(textColor, BlendMode.srcIn),
              ),
            const SizedBox(width: 12), // Adjusted spacing
            Expanded(
              child: Text(
                'Continue with $label',
                textAlign: TextAlign.center, // Center text
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            // Keep loading indicator at the end
            if (isLoading)
              Container( // Ensure indicator doesn't push text
                alignment: Alignment.centerRight,
                width: 32, // Give indicator space
                child: const SizedBox(
                  height: 20,
                  width: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation<Color>(Colors.white), // Assuming white text
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('OAuth Example (V2)'), // Updated title
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'OAuth Authentication',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Example implementation of OAuth authentication using Para SDK V2.', // Updated description
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.black87,
                ),
              ),
              const SizedBox(height: 48),
              _buildOAuthButton(
                provider: OAuthMethod.google,
                label: 'Google',
                icon: FontAwesomeIcons.google,
                backgroundColor: const Color(0xFF4285F4),
                textColor: Colors.white,
              ),
              _buildOAuthButton(
                provider: OAuthMethod.apple,
                label: 'Apple',
                icon: FontAwesomeIcons.apple,
                backgroundColor: Colors.black, // Common Apple button style
                textColor: Colors.white,
              ),
              // _buildOAuthButton( // Twitter/X might not be supported or need specific setup
              //   provider: OAuthMethod.twitter,
              //   label: 'X.com',
              //   icon: FontAwesomeIcons.xTwitter,
              //   backgroundColor: const Color(0xFF000000), // Updated X color
              //   textColor: Colors.white,
              // ),
              _buildOAuthButton(
                provider: OAuthMethod.discord,
                label: 'Discord',
                icon: FontAwesomeIcons.discord,
                backgroundColor: const Color(0xFF5865F2),
                textColor: Colors.white,
              ),
              // --- Farcaster Button (Commented out) ---
              /*
              const SizedBox(height: 32),
              const Row(
                children: [
                  Expanded(child: Divider()),
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16),
                    child: Text('OR', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.w500)),
                  ),
                  Expanded(child: Divider()),
                ],
              ),
              const SizedBox(height: 32),
              ElevatedButton.icon(
                 icon: const Icon(Icons.qr_code), // Example icon
                 label: const Text('Connect with Farcaster'),
                 onPressed: _isLoading ? null : _handleFarcasterLogin,
                 style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                 ),
              ),
              if (_isLoading && _loadingProvider == 'Farcaster')
                 const Padding(
                    padding: EdgeInsets.only(top: 8.0),
                    child: Center(child: CircularProgressIndicator()),
                 ),
              */
            ],
          ),
        ),
      ),
    );
  }
}