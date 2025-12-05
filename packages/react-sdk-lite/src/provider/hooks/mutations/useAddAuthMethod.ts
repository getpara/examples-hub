import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useClient } from '../utils/index.js';
import { CoreMethodResponse, CoreMethodParams } from '@getpara/web-sdk';
import { renameMutations } from '../../utils/renameMutations.js';
import { addCredential } from '../../actions/index.js';
import { Compute } from '../../types/utils.js';
import { openPopup as openPopupFn } from '../../../modal/index.js';
import { ACCOUNT_BASE_KEY } from '../queries/useAccount.js';
import { validatePortalOrigin } from '../../../modal/utils/validatePortalOrigin.js';

export const ADD_CREDENTIAL_KEY = 'ADD_CREDENTIAL';

type HookParams = CoreMethodParams<'addCredential'>;

/**
 * React hook to add a new auth method to a user's account. Useful for move a user's account away from basic login.
 *
 * Returns a mutation result object with all standard fields from `useMutation`, except:
 * - `mutate` and `mutateAsync` are replaced by:
 *   - `addAuthMethod`: function to trigger the mutation (same as `mutate`)
 *   - `addAuthMethodAsync`: async function to trigger the mutation (same as `mutateAsync`)
 *
 * @example
 * const { addAuthMethod, addAuthMethodAsync } = useAddAuthMethod();
 * // sync and with defined auth method to add
 * addAuthMethod({ authMethod: 'PASSKEY' });
 * // or async and without defined auth method to add (gives the user the option to choose)
 * await addAuthMethodAsync();
 */
export const useAddAuthMethod = ({ openPopup }: { openPopup: boolean } = { openPopup: true }) => {
  const para = useClient();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: [ADD_CREDENTIAL_KEY],
    mutationFn: async (args: HookParams = {}) => {
      try {
        const result = await addCredential(para, args);

        if (result && openPopup) {
          openPopupFn({ url: result, target: 'ParaAddAuthCredential', type: 'ADD_CREDENTIAL' });

          // If we're opening the popup, start a listener to refetch the account once the flow completes, else the one opening the popup will need to handle this
          if (typeof window !== 'undefined' && para) {
            const handleMessage = (event: MessageEvent) => {
              if (!validatePortalOrigin(event, para.ctx)) {
                return; // Ignore messages from untrusted origins
              }

              if (event.data?.type === 'CLOSE_WINDOW') {
                // Handle your event
                if (event.data.success) {
                  queryClient.refetchQueries({ queryKey: [ACCOUNT_BASE_KEY] });
                }
                // Remove the listener and clear timeout
                window.removeEventListener('message', handleMessage);
                clearTimeout(timeoutId);
              }
            };

            const timeoutId = setTimeout(
              () => {
                window.removeEventListener('message', handleMessage);
              },
              1000 * 60 * 3,
            ); // Remove after 3 minutes

            window.addEventListener('message', handleMessage);
          }
        }

        return result;
      } catch (error) {
        throw error;
      }
    },
  });

  return renameMutations<
    Compute<Awaited<CoreMethodResponse<'addCredential'>>>,
    Error,
    Compute<HookParams> | void,
    unknown,
    'addAuthMethod'
  >(mutation, 'addAuthMethod');
};
