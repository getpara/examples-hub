import { farcasterWallet } from './farcaster/farcaster.js';
import { phantomWallet } from './phantom/phantom.js';
import { glowWallet } from './glow/glow.js';
import { backpackWallet } from './backpack/backpack.js';
import { solflareWallet } from './solflare/solflare.js';

export { farcasterWallet, phantomWallet, glowWallet, backpackWallet, solflareWallet };

export const allWallets = [phantomWallet, glowWallet, backpackWallet, solflareWallet];
