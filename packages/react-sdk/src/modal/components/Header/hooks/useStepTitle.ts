import { useMemo } from 'react';
import { useModalStore } from '../../../stores/modal/useModalStore.js';
import { ModalStep } from '../../../utils/steps.js';
import { useExternalWallets } from '../../../providers/ExternalWalletContext.js';
import { useThemeStore } from '../../../stores/index.js';

export const useStepTitle = () => {
  const hideWallets = useThemeStore(state => state.hideWallets);
  const isLogin = useModalStore(state => state.isLogin());
  const currentStep = useModalStore(state => state.step);
  const { chainId } = useExternalWallets();

  const titles = useMemo(
    () => ({
      [ModalStep.AUTH_MAIN]: '',
      [ModalStep.AUTH_MORE]: 'Sign Up or Log In',
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
    }),
    [isLogin, chainId, hideWallets],
  );

  return { title: titles[currentStep] };
};
