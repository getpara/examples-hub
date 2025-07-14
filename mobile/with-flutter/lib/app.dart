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

  @override
  void initState() {
    super.initState();
    _checkAuthStatus();
  }

  Future<void> _checkAuthStatus() async {
    await Future.delayed(const Duration(seconds: 1)); // Brief launch screen
    
    final prefs = await SharedPreferences.getInstance();
    final hasSession = prefs.getString('para_session') != null;
    
    if (hasSession) {
      try {
        // Try to fetch wallets to validate session
        await para.fetchWallets();
        setState(() => _state = AppState.home);
        return;
      } catch (_) {
        // Session invalid, clear it
        await prefs.remove('para_session');
      }
    }
    
    setState(() => _state = AppState.auth);
  }

  void _onAuthSuccess() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('para_session', 'active');
    setState(() => _state = AppState.home);
  }

  void _onLogout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('para_session');
    await para.logout();
    setState(() => _state = AppState.auth);
  }

  @override
  Widget build(BuildContext context) {
    return switch (_state) {
      AppState.launch => const LaunchScreen(),
      AppState.auth => AuthScreen(onSuccess: _onAuthSuccess),
      AppState.home => HomeScreen(onLogout: _onLogout),
    };
  }
}