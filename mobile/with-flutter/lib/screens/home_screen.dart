import 'package:flutter/material.dart';
import '../client/para.dart';
import '../features/wallets/screens/wallets_screen.dart';

class HomeScreen extends StatefulWidget {
  final VoidCallback onLogout;

  const HomeScreen({
    super.key,
    required this.onLogout,
  });

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    _validateSession();
  }

  Future<void> _validateSession() async {
    try {
      // Background validation using currentUser
      final user = await para.currentUser();
      if (!user.isLoggedIn) {
        // Session invalid, logout
        if (mounted) {
          widget.onLogout();
        }
      }
    } catch (_) {
      // Error checking user, logout
      if (mounted) {
        widget.onLogout();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    // Directly show the WalletsScreen since this is the main home screen
    return WalletsScreen(onLogout: widget.onLogout);
  }
}