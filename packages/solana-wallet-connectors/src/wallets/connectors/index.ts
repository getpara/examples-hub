import { phantomWallet } from './phantom/phantom.js';
import { glowWallet } from './glow/glow.js';
import { backpackWallet } from './backpack/backpack.js';
import { solflareWallet } from './solflare/solflare.js';

export { phantomWallet, glowWallet, backpackWallet, solflareWallet };

export const allWallets = [phantomWallet, glowWallet, backpackWallet, solflareWallet];
