import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'client/para.dart';
import 'screens/launch_screen.dart';
import 'screens/auth_screen.dart';
import 'screens/home_screen.dart';
import 'services/deep_link_service.dart';

enum AppState { launch, auth, home }

class ParaApp extends StatefulWidget {
  const ParaApp({super.key});

  @override
  State<ParaApp> createState() => _ParaAppState();
}

class _ParaAppState extends State<ParaApp> {
  AppState _state = AppState.launch;
  bool _showLaunchScreen = true;
  final _deepLinkService = DeepLinkService();

  @override
  void initState() {
    super.initState();
    _initializePara();
    _checkAuthStatus();
    _initializeDeepLinks();
  }
  
  @override
  void dispose() {
    _deepLinkService.dispose();
    super.dispose();
  }
  
  Future<void> _initializePara() async {
    // Initialize Para by making a simple call to trigger bridge setup
    try {
      await para.currentUser();
    } catch (_) {
      // Ignore errors - we just want to trigger initialization
    }
  }

  Future<void> _checkAuthStatus() async {
    // Quick check of stored auth state (like Swift)
    final prefs = await SharedPreferences.getInstance();
    final isAuthenticated = prefs.getBool('isAuthenticated') ?? false;
    
    // Set initial state immediately based on stored value
    setState(() {
      _state = isAuthenticated ? AppState.home : AppState.auth;
    });
  }
  
  Future<void> _initializeDeepLinks() async {
    await _deepLinkService.initialize(
      onDeepLinkReceived: _handleDeepLink,
    );
  }
  
  void _handleDeepLink(Uri uri) {
    // Validate the scheme first
    if (uri.scheme != 'paraflutter') {
      return;
    }
    
    try {
      // Handle Para callback URLs
      if (DeepLinkService.isParaCallback(uri)) {
        // Para SDK should handle these automatically through web view
        _showSnackBar('Processing authentication callback...');
      }
      
      // Handle wallet connection URLs
      else if (DeepLinkService.isWalletConnectionCallback(uri)) {
        // Validate and extract address parameter
        final address = uri.queryParameters['address'];
        if (address != null && address.isNotEmpty) {
          _showSnackBar('Connecting to wallet: ${_truncateAddress(address)}');
        } else {
          _showSnackBar('Invalid wallet connection link');
        }
      }
      
      // Handle other custom deep links
      else {
        _showSnackBar('Unrecognized deep link');
      }
    } catch (e) {
      _showSnackBar('Error processing link');
    }
  }
  
  String _truncateAddress(String address) {
    if (address.length <= 12) return address;
    return '${address.substring(0, 6)}...${address.substring(address.length - 4)}';
  }
  
  void _showSnackBar(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _onLaunchAnimationComplete() {
    setState(() {
      _showLaunchScreen = false;
    });
  }

  void _onAuthSuccess() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('isAuthenticated', true);
    setState(() => _state = AppState.home);
  }

  void _onLogout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('isAuthenticated', false);
    await para.logout();
    setState(() => _state = AppState.auth);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Main app content
          switch (_state) {
            AppState.launch => const SizedBox.shrink(),
            AppState.auth => AuthScreen(onSuccess: _onAuthSuccess),
            AppState.home => HomeScreen(onLogout: _onLogout),
          },
          // Launch screen overlay
          if (_showLaunchScreen)
            LaunchScreen(onAnimationComplete: _onLaunchAnimationComplete),
        ],
      ),
    );
  }
}