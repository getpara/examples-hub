import 'package:para/para.dart';
import 'package:flutter/material.dart';

enum WalletChain { evm, solana, cosmos }

extension WalletChainExtension on WalletChain {
  String get displayName {
    switch (this) {
      case WalletChain.evm:
        return 'EVM';
      case WalletChain.solana:
        return 'SOLANA';
      case WalletChain.cosmos:
        return 'COSMOS';
    }
  }

  Color get color {
    switch (this) {
      case WalletChain.evm:
        return const Color(0xFF627EEA); // Ethereum Blue
      case WalletChain.solana:
        return const Color(0xFF9945FF); // Solana Purple
      case WalletChain.cosmos:
        return const Color(0xFF502D82); // Cosmic Purple
    }
  }

  LinearGradient get gradient {
    switch (this) {
      case WalletChain.evm:
        return const LinearGradient(
          colors: [Color(0xFF627EEA), Color(0xFF3B5998)],
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
        );
      case WalletChain.solana:
        return const LinearGradient(
          colors: [Color(0xFF9945FF), Color(0xFF14F195)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        );
      case WalletChain.cosmos:
        return const LinearGradient(
          colors: [Color(0xFF2E1A47), Color(0xFFB249C8)],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        );
    }
  }
}

// Extension to convert Para WalletType to our WalletChain
extension WalletTypeExtension on WalletType {
  WalletChain get toChain {
    switch (this) {
      case WalletType.evm:
        return WalletChain.evm;
      case WalletType.solana:
        return WalletChain.solana;
      case WalletType.cosmos:
        return WalletChain.cosmos;
    }
  }
}

// Extension to help format wallet addresses
extension WalletAddressFormatting on Wallet {
  String get formattedAddress {
    final addr = type == WalletType.cosmos
        ? (addressSecondary ?? address ?? 'unknown')
        : (address ?? 'unknown');
    
    if (addr.length <= 12) return addr;
    final prefix = addr.substring(0, 8);
    final suffix = addr.substring(addr.length - 6);
    return '$prefix...$suffix';
  }
}