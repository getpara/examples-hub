import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../models/external_wallet_provider.dart';

class ExternalWalletSelectionSheet extends StatefulWidget {
  final Function(ExternalWalletProvider) onWalletSelected;

  const ExternalWalletSelectionSheet({
    super.key,
    required this.onWalletSelected,
  });

  @override
  State<ExternalWalletSelectionSheet> createState() => _ExternalWalletSelectionSheetState();
}

class _ExternalWalletSelectionSheetState extends State<ExternalWalletSelectionSheet> {
  ExternalWalletProvider? _loadingProvider;
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle bar
          Container(
            margin: const EdgeInsets.only(top: 12),
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey[300],
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 24),
          // Title
          const Text(
            'Connect External Wallet',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w600,
              color: Colors.black,
            ),
          ),
          const SizedBox(height: 32),
          // Wallet options
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Column(
              children: [
                _buildWalletOption(
                  provider: ExternalWalletProvider.metamask,
                  title: 'MetaMask',
                  subtitle: 'Connect with MetaMask wallet',
                  iconPath: 'lib/assets/metamask_icon.svg',
                ),
                const SizedBox(height: 16),
                _buildWalletOption(
                  provider: ExternalWalletProvider.phantom,
                  title: 'Phantom',
                  subtitle: 'Connect with Phantom wallet',
                  iconPath: 'lib/assets/phantom_icon.svg',
                ),
              ],
            ),
          ),
          const SizedBox(height: 32),
          // Cancel button
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: SizedBox(
              width: double.infinity,
              child: TextButton(
                onPressed: () => Navigator.pop(context),
                style: TextButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: const Text(
                  'Cancel',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey,
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  Widget _buildWalletOption({
    required ExternalWalletProvider provider,
    required String title,
    required String subtitle,
    required String iconPath,
  }) {
    final isLoading = _loadingProvider == provider;
    
    return GestureDetector(
      onTap: isLoading ? null : () {
        setState(() {
          _loadingProvider = provider;
        });
        widget.onWalletSelected(provider);
      },
      child: Semantics(
        button: true,
        label: 'Connect with $title wallet',
        child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey[300]!),
          borderRadius: BorderRadius.circular(12),
          color: isLoading ? Colors.grey[50] : Colors.white,
        ),
        child: Row(
          children: [
            // Wallet icon
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(8),
              ),
              child: Center(
                child: SvgPicture.asset(
                  iconPath,
                  width: 32,
                  height: 32,
                  colorFilter: provider == ExternalWalletProvider.phantom 
                    ? const ColorFilter.mode(Color(0xFFAB9FF2), BlendMode.srcIn)
                    : null,
                ),
              ),
            ),
            const SizedBox(width: 16),
            // Wallet info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: Colors.black,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
            ),
            // Loading indicator or arrow
            if (isLoading)
              const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.black),
                ),
              )
            else
              Icon(
                Icons.arrow_forward_ios,
                size: 16,
                color: Colors.grey[400],
              ),
          ],
        ),
        ),
      ),
    );
  }
}