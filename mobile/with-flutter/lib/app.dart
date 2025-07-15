import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'client/para.dart';
import 'screens/launch_screen.dart';
import 'screens/auth_screen.dart';
import 'screens/home_screen.dart';

enum AppState { launch, auth, home }

class ParaApp extends StatefulWidget {
  const ParaApp({super.key});

  @override
  State<ParaApp> createState() => _ParaAppState();
}

class _ParaAppState extends State<ParaApp> {
  AppState _state = AppState.launch;
  bool _showLaunchScreen = true;

  @override
  void initState() {
    super.initState();
    _initializePara();
    _checkAuthStatus();
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
    return Stack(
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
    );
  }
}