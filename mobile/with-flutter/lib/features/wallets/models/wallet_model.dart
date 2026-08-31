import 'package:para/para.dart';
import 'package:flutter/material.dart';

enum WalletChain { evm, solana, cosmos, stellar, sui }

extension WalletChainExtension on WalletChain {
  String get displayName {
    switch (this) {
      case WalletChain.evm:
        return 'EVM';
      case WalletChain.solana:
        return 'SOLANA';
      case WalletChain.cosmos:
        return 'COSMOS';
      case WalletChain.stellar:
        return 'STELLAR';
      case WalletChain.sui:
        return 'SUI';
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
      case WalletChain.stellar:
        return const Color(0xFF111827); // Stellar Black
      case WalletChain.sui:
        return const Color(0xFF4DA2FF); // Sui Blue
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
      case WalletChain.stellar:
        return const LinearGradient(
          colors: [Color(0xFF111827), Color(0xFF6B7280)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        );
      case WalletChain.sui:
        return const LinearGradient(
          colors: [Color(0xFF4DA2FF), Color(0xFF6FBCF0)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        );
    }
  }
}

// Extension to convert the Bridge chain identity to our presentation model.
extension BridgeChainTypeExtension on BridgeChainType {
  WalletChain get toChain {
    switch (this) {
      case BridgeChainType.evm:
        return WalletChain.evm;
      case BridgeChainType.solana:
        return WalletChain.solana;
      case BridgeChainType.cosmos:
        return WalletChain.cosmos;
      case BridgeChainType.stellar:
        return WalletChain.stellar;
      case BridgeChainType.sui:
        return WalletChain.sui;
    }
  }
}

// Extension to help format wallet addresses
extension WalletAddressFormatting on Wallet {
  String get formattedAddress {
    if (chainType == BridgeChainType.sui && addressSui == null) {
      return 'Sui address unavailable';
    }

    final addr = switch (chainType) {
      BridgeChainType.cosmos => addressSecondary ?? address ?? 'unknown',
      BridgeChainType.stellar => stellarAddress,
      BridgeChainType.sui => addressSui!,
      _ => address ?? 'unknown',
    };

    if (addr.length <= 12) return addr;
    final prefix = addr.substring(0, 8);
    final suffix = addr.substring(addr.length - 6);
    return '$prefix...$suffix';
  }

  String get stellarAddress {
    final rawAddress = address;
    if (rawAddress != null && rawAddress.startsWith('G')) {
      return rawAddress;
    }
    if (publicKey != null && publicKey!.isNotEmpty) {
      try {
        return getStellarAddress(publicKey!);
      } catch (_) {}
    }
    if (rawAddress != null && rawAddress.isNotEmpty) {
      try {
        return getStellarAddressFromSolana(rawAddress);
      } catch (_) {}
    }
    return rawAddress ?? 'unknown';
  }
}
