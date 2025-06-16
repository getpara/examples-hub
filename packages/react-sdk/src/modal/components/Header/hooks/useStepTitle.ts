import { useMemo } from 'react';
import { useModalStore } from '../../../stores/modal/useModalStore.js';
import { ModalStep } from '../../../utils/steps.js';
import { useExternalWallets } from '../../../../provider/providers/ExternalWalletProvider.js';
import { useStore } from '../../../../provider/stores/useStore.js';
import { useAccountLinking } from '../../../../provider/providers/AccountLinkProvider.js';

export const useStepTitle = () => {
  const hideWallets = useStore(state => state.modalConfig?.hideWallets);
  const isLogin = useModalStore(state => state.isLogin());
  const currentStep = useModalStore(state => state.step);
  const { chainId } = useExternalWallets();
  const { isEnabled: isAccountLinkingEnabled } = useAccountLinking();

  const titles = useMemo(
    () => ({
      [ModalStep.AUTH_MAIN]: '',
      [ModalStep.AUTH_MORE]: 'Sign Up or Log In',
      [ModalStep.AUTH_GUEST_SIGNUP]: 'Complete Account Setup',
      [ModalStep.EX_WALLET_MORE]: 'Connect Wallet',
      [ModalStep.VERIFICATIONS]: 'Sign Up',
      [ModalStep.AWAITING_OAUTH]: isLogin ? 'Login' : 'Sign Up',
      [ModalStep.FARCASTER_OAUTH]: isLogin ? 'Login' : 'Sign Up',
      [ModalStep.BIOMETRIC_CREATION]: 'Sign Up',
      [ModalStep.PASSWORD_CREATION]: 'Sign Up',
      [ModalStep.AWAITING_BIOMETRIC_CREATION]: 'Sign Up',
      [ModalStep.AWAITING_WALLET_CREATION]: isLogin ? 'Login' : 'Sign Up',
      [ModalStep.AWAITING_PASSWORD_CREATION]: 'Sign Up',
      [ModalStep.WALLET_CREATION_DONE]: hideWallets ? 'Account Created' : 'Wallet Created',
      [ModalStep.SECRET]: isLogin ? 'Login' : 'Sign Up',
      [ModalStep.BIOMETRIC_LOGIN]: 'Login',
      [ModalStep.EMBEDDED_PASSWORD_LOGIN]: 'Login',
      [ModalStep.AWAITING_PASSWORD_LOGIN]: 'Login',
      [ModalStep.AWAITING_BIOMETRIC_LOGIN]: 'Login',
      [ModalStep.LOGIN_DONE]: '',
      [ModalStep.SETUP_2FA]: '2FA',
      [ModalStep.VERIFY_2FA]: '2FA',
      [ModalStep.TWO_FACTOR_DONE]: '2FA',
      [ModalStep.ADD_FUNDS_BUY]: '',
      [ModalStep.ADD_FUNDS_RECEIVE]: '',
      [ModalStep.ADD_FUNDS_WITHDRAW]: '',
      [ModalStep.ADD_FUNDS_AWAITING]: '',
      [ModalStep.ADD_FUNDS_SUCCESS]: '',
      [ModalStep.ADD_FUNDS_FAILURE]: '',
      [ModalStep.ACCOUNT_MAIN]: '',
      [ModalStep.CHAIN_SWITCH]: '',
      [ModalStep.ACCOUNT_PROFILE]: isAccountLinkingEnabled ? 'Profile' : 'Settings',
      [ModalStep.ACCOUNT_PROFILE_LIST]: 'Link Account',
      [ModalStep.ACCOUNT_PROFILE_ADD]: 'Link Account',
      [ModalStep.ACCOUNT_PROFILE_REMOVE]: 'Unlink Account',
    }),
    [isLogin, chainId, hideWallets],
  );

  return { title: titles[currentStep] };
};
