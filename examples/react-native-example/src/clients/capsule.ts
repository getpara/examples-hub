import {CapsuleMobile, Environment, WalletType} from '@usecapsule/react-native-wallet';

export const capsule = new CapsuleMobile(Environment.BETA, '<YOUR_API_KEY>', undefined, {
  supportedWalletTypes: [WalletType.EVM, WalletType.SOLANA]
});
