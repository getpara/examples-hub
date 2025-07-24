import 'package:flutter/material.dart';
import 'package:para/para.dart';
import '../models/wallet_model.dart';

class WalletCard extends StatelessWidget {
  final Wallet wallet;
  final VoidCallback onTap;

  const WalletCard({
    super.key,
    required this.wallet,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final chain = wallet.type?.toChain ?? WalletChain.evm;
    
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 150,
        decoration: BoxDecoration(
          gradient: chain.gradient,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: chain.color.withAlpha((255 * 0.3).round()),
              blurRadius: 8,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                wallet.formattedAddress,
                style: const TextStyle(
                  fontFamily: 'SF Mono',
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                wallet.type?.value ?? 'unknown',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: Colors.white.withAlpha((255 * 0.9).round()),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class AddWalletCard extends StatelessWidget {
  final VoidCallback onTap;

  const AddWalletCard({
    super.key,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 150,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: Colors.grey.withAlpha((255 * 0.3).round()),
            width: 1,
          ),
        ),
        child: Center(
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.add_circle_outline,
                color: Colors.grey[600],
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                'Add Wallet',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.grey[600],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}