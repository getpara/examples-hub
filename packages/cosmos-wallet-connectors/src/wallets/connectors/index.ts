import { keplrWallet } from './keplr/keplr.js';
import { leapWallet } from './leap/leap.js';
import { cosmostationWallet } from './cosmostation/cosmostation.js';

export { keplrWallet, leapWallet, cosmostationWallet };

export const allWallets = [keplrWallet, leapWallet, cosmostationWallet];
