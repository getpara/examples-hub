import { phantomWallet } from './phantom/phantom.js';
import { glowWallet } from './glow/glow.js';
import { backpackWallet } from './backpack/backpack.js';

export { phantomWallet, glowWallet, backpackWallet };

export const allWallets = [phantomWallet, glowWallet, backpackWallet];
