import 'dart:async';

import 'package:flutter/material.dart';
import 'package:para/para.dart';
import 'client/para.dart';
import 'screens/launch_screen.dart';
import 'screens/auth_screen.dart';
import 'screens/home_screen.dart';
import 'config/deep_link_constants.dart';
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
  late final VoidCallback _sessionStatusListener;

  @override
  void initState() {
    super.initState();
    _sessionStatusListener =
        () => _handleSessionStatus(para.sessionStatus.value);
    para.sessionStatus.addListener(_sessionStatusListener);
    _handleSessionStatus(para.sessionStatus.value);
    _initializeDeepLinks();
  }

  @override
  void dispose() {
    para.sessionStatus.removeListener(_sessionStatusListener);
    _deepLinkService.dispose();
    super.dispose();
  }

  void _handleSessionStatus(SessionStatus status) {
    if (!mounted) return;
    AppState nextState;
    switch (status) {
      case SessionStatus.restoring:
        nextState = AppState.launch;
        break;
      case SessionStatus.authenticated:
        // AuthScreen owns the final transition while an interactive auth flow is
        // in progress. Moving to Home immediately can mount WalletsScreen before
        // the SDK has finished waiting for signup/login session details.
        nextState = _state == AppState.auth ? AppState.auth : AppState.home;
        break;
      case SessionStatus.needsAuth:
        nextState = AppState.auth;
        break;
    }
    if (_state != nextState) {
      setState(() => _state = nextState);
    }
  }

  Future<void> _initializeDeepLinks() async {
    await _deepLinkService.initialize(
      onDeepLinkReceived: _handleDeepLink,
    );
  }

  void _handleDeepLink(Uri uri) {
    // Validate the scheme first
    if (uri.scheme != DeepLinkConstants.appScheme) {
      return;
    }

    try {
      // Handle wallet connection URLs
      if (DeepLinkService.isWalletConnectionCallback(uri)) {
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

  void _onAuthSuccess() {
    setState(() => _state = AppState.home);
  }

  void _onLogout() async {
    await para.logout();
    if (!mounted) return;
    setState(() => _state = AppState.auth);
  }

  void _onDeleteAccount() {
    if (!mounted) return;
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
            AppState.home => HomeScreen(
                onLogout: _onLogout,
                onDeleteAccount: _onDeleteAccount,
              ),
          },
          // Launch screen overlay
          if (_showLaunchScreen)
            LaunchScreen(onAnimationComplete: _onLaunchAnimationComplete),
        ],
      ),
    );
  }
}
