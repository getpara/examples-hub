import { metaMaskWallet } from './metaMask/metaMask.js';
import { rainbowWallet } from './rainbow/rainbow.js';
import { walletConnectWallet } from './walletConnect/walletConnect.js';
import { coinbaseWallet } from './coinbase/coinbase.js';
import { zerionWallet } from './zerion/zerion.js';
import { rabbyWallet } from './rabby/rabby.js';
import { safeWallet } from './safe/safe.js';

export { metaMaskWallet, rainbowWallet, walletConnectWallet, coinbaseWallet, zerionWallet, rabbyWallet, safeWallet };

export const allWallets = [
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
  coinbaseWallet,
  zerionWallet,
  rabbyWallet,
  safeWallet,
];
