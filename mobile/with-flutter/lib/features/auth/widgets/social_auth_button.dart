import 'package:flutter/material.dart';

enum SocialProvider { google, apple, discord }

class SocialAuthButton extends StatelessWidget {
  final SocialProvider provider;
  final bool isLoading;
  final VoidCallback onPressed;

  const SocialAuthButton({
    super.key,
    required this.provider,
    required this.isLoading,
    required this.onPressed,
  });

  String get _iconAsset {
    return switch (provider) {
      SocialProvider.google => 'lib/assets/google.png',
      SocialProvider.apple => 'lib/assets/apple.png',
      SocialProvider.discord => 'lib/assets/discord.png',
    };
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 110,
      height: 83,
      child: ElevatedButton(
        onPressed: isLoading ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: Theme.of(context).colorScheme.surface.withValues(alpha: 0.1),
          foregroundColor: Theme.of(context).colorScheme.onSurface,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          padding: EdgeInsets.zero,
        ),
        child: isLoading
            ? const SizedBox(
                width: 24,
                height: 24,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            : Image.asset(
                _iconAsset,
                width: 32,
                height: 32,
              ),
      ),
    );
  }
}