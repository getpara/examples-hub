import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../models/external_wallet_provider.dart';

class ExternalWalletButton extends StatelessWidget {
  final ExternalWalletProvider provider;
  final bool isLoading;
  final VoidCallback onPressed;

  const ExternalWalletButton({
    super.key,
    required this.provider,
    required this.isLoading,
    required this.onPressed,
  });

  String get _iconAsset {
    return switch (provider) {
      ExternalWalletProvider.metamask => 'lib/assets/metamask_icon.svg',
      ExternalWalletProvider.phantom => 'lib/assets/phantom_icon.svg',
      ExternalWalletProvider.other => 'lib/assets/app_icon.png',
    };
  }

  String get _label {
    return switch (provider) {
      ExternalWalletProvider.metamask => 'MetaMask',
      ExternalWalletProvider.phantom => 'Phantom',
      ExternalWalletProvider.other => 'Other',
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
            : Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  provider == ExternalWalletProvider.other
                      ? Image.asset(
                          _iconAsset,
                          width: 32,
                          height: 32,
                        )
                      : SvgPicture.asset(
                          _iconAsset,
                          width: 32,
                          height: 32,
                        ),
                  const SizedBox(height: 8),
                  Text(
                    _label,
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}