import * as actions from '../../actions/index.js';
import { generateCoreQueryHook } from './utils.js';

export const useLinkedAccounts = generateCoreQueryHook('getLinkedAccounts', actions.getLinkedAccounts, {
  defaultParams: { withMetadata: false },
});
export const useAccountLinkInProgress = generateCoreQueryHook(
  'accountLinkInProgress',
  actions.accountLinkInProgress as unknown as any,
  { isGetter: true },
);
