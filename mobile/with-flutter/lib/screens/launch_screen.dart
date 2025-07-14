import 'package:flutter/material.dart';

class LaunchScreen extends StatefulWidget {
  final VoidCallback onAnimationComplete;
  
  const LaunchScreen({
    super.key,
    required this.onAnimationComplete,
  });

  @override
  State<LaunchScreen> createState() => _LaunchScreenState();
}

class _LaunchScreenState extends State<LaunchScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    _fadeAnimation = Tween<double>(
      begin: 1.0,
      end: 0.0,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOut,
    ));

    // Start fade out after a brief delay
    Future.delayed(const Duration(milliseconds: 800), () {
      _controller.forward().then((_) {
        widget.onAnimationComplete();
      });
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _fadeAnimation,
      builder: (context, child) {
        return Opacity(
          opacity: _fadeAnimation.value,
          child: Container(
            color: const Color(0xFFFBF9F7), // Match Swift light background
            child: Center(
              child: Image.asset(
                'lib/assets/app_icon.png',
                width: 120,
                height: 120,
              ),
            ),
          ),
        );
      },
    );
  }
}