import { generateStateHook } from './utils.js';

export * from './core.js';
export * from './useLinkAccount.js';

export const useCreateGuestWalletsState = generateStateHook('createGuestWallets');
