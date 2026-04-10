import { sepolia } from 'viem/chains';

export const ALCHEMY_API_KEY = process.env.EXPO_PUBLIC_ALCHEMY_API_KEY ?? '';
export const GAS_POLICY_ID = process.env.EXPO_PUBLIC_ALCHEMY_GAS_POLICY_ID ?? '';
export const CHAIN = sepolia;
export const BURN_ADDRESS = '0x000000000000000000000000000000000000dEaD' as const;

if (!ALCHEMY_API_KEY) {
  console.warn('EXPO_PUBLIC_ALCHEMY_API_KEY is not set. Smart Account features will not work.');
}

if (!GAS_POLICY_ID) {
  console.warn('EXPO_PUBLIC_ALCHEMY_GAS_POLICY_ID is not set. Gas sponsorship will not work.');
}
