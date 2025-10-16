import { useMutation } from '@tanstack/react-query';
import { useClient } from '../utils/index.js';
import { CoreMethodParams } from '@getpara/web-sdk';
import { exportPrivateKey } from '../../actions/index.js';
import { useWallet } from '../queries/useWallet.js';

export const EXPORT_PRIVATE_KEY_KEY = 'EXPORT_PRIVATE_KEY';

/**
 * React hook for the `exportPrivateKey` mutation.
 *
 * @example
 * const { mutateAsync: exportPrivateKeyAsync } = useExportPrivateKey();
 * await exportPrivateKeyAsync({ walletId: '...' });
 */
export const useExportPrivateKey = () => {
  const para = useClient();
  const { data: activeWallet } = useWallet();

  return useMutation({
    mutationKey: [EXPORT_PRIVATE_KEY_KEY],
    mutationFn: async (args?: CoreMethodParams<'exportPrivateKey'>) => {
      try {
        const result = await exportPrivateKey(para, {
          walletId: activeWallet?.id,
          shouldOpenPopup: true,
          ...args,
        });
        return result;
      } catch (error) {
        throw error;
      }
    },
  });
};
