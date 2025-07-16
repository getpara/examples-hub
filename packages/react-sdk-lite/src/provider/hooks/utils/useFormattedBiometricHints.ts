import { useQuery } from '@tanstack/react-query';
import { useModalStore } from '../../../modal/stores/index.js';
import { formatBiometricHints } from '@getpara/react-common';
import { useClient } from './useClient.js';

const queryKey = ['FORMATTED_BIOMETRIC_HINTS'];

/**
 * Hook for getting formatted biometric hints
 */
export const useFormattedBiometricHints = () => {
  const client = useClient();
  const loginState = useModalStore(state => state.getLoginState());

  return useQuery({
    queryKey: [...queryKey, loginState?.biometricHints ?? 'undefined'],
    queryFn: async () => {
      if (!client || !loginState?.biometricHints) {
        return null;
      }

      const isPasskeySupported = await client.isPasskeySupported();

      return formatBiometricHints(loginState.biometricHints, isPasskeySupported);
    },
  });
};
