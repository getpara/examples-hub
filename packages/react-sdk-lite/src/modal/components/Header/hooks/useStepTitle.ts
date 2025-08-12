import { useMemo } from 'react';
import { useModalStore } from '../../../stores/modal/useModalStore.js';
import { ModalStep } from '../../../utils/steps.js';
import { useExternalWallets } from '../../../../provider/providers/ExternalWalletProvider.js';
import { useStore } from '../../../../provider/stores/useStore.js';
import { useAccountLinking } from '../../../../provider/providers/AccountLinkProvider.js';
import { useWallet } from '../../../../provider/index.js';

export const signUpOrLogInTitle = 'Sign Up or Login';

export const connectWalletTitle = 'Connect Wallet';

export const useStepTitle = () => {
  const logo = useStore(state => state.modalConfig?.logo);
  const hideWallets = useStore(state => state.modalConfig?.hideWallets);
  const isLogin = useModalStore(state => state.isLogin());
  const currentStep = useModalStore(state => state.step);
  const authLayout = useModalStore(state => state.authLayout) || [];
  const { data: activeWallet } = useWallet();

  const [isAuthFirst, isAuthCondensed, isExternalFirst, isExternalCondensed, isBothCondensed] = [
    authLayout[0]?.includes('AUTH'),
    authLayout.includes('AUTH:CONDENSED'),
    authLayout[0]?.includes('EXTERNAL'),
    authLayout.includes('EXTERNAL:CONDENSED'),
    authLayout.includes('AUTH:CONDENSED') && authLayout.includes('EXTERNAL:CONDENSED'),
  ];

  const authStepTitle = isBothCondensed
    ? null
    : isAuthFirst && !isAuthCondensed
      ? signUpOrLogInTitle
      : isExternalFirst && !isExternalCondensed
        ? connectWalletTitle
        : '';

  const { chainId } = useExternalWallets();
  const { isEnabled: isAccountLinkingEnabled } = useAccountLinking();

  const titles = useMemo(
    () => ({
      [ModalStep.AUTH_MAIN]: authStepTitle,
      [ModalStep.AUTH_MORE]: signUpOrLogInTitle,
      [ModalStep.AUTH_GUEST_SIGNUP]: 'Complete Account Setup',
      [ModalStep.EX_WALLET_MORE]: connectWalletTitle,
      [ModalStep.VERIFICATIONS]: 'Sign Up',
      [ModalStep.AWAITING_OAUTH]: signUpOrLogInTitle,
      [ModalStep.FARCASTER_OAUTH]: signUpOrLogInTitle,
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
      [ModalStep.ADD_FUNDS_BUY]: 'Add Funds',
      [ModalStep.ADD_FUNDS_RECEIVE]: 'Add Funds',
      [ModalStep.ADD_FUNDS_WITHDRAW]: 'Withdraw',
      [ModalStep.ADD_FUNDS_AWAITING]: 'Add Funds',
      [ModalStep.ADD_FUNDS_SUCCESS]: 'Add Funds',
      [ModalStep.ADD_FUNDS_FAILURE]: 'Add Funds',
      [ModalStep.ACCOUNT_MAIN]: '',
      [ModalStep.CHAIN_SWITCH]: '',
      [ModalStep.ACCOUNT_PROFILE]: isAccountLinkingEnabled ? 'Profile' : 'Settings',
      [ModalStep.ACCOUNT_PROFILE_LIST]: 'Link Account',
      [ModalStep.ACCOUNT_PROFILE_ADD]: 'Link Account',
      [ModalStep.ACCOUNT_PROFILE_REMOVE]: 'Unlink Account',
      [ModalStep.AWAITING_IFRAME]: isLogin ? 'Login' : 'Sign Up',
    }),
    [isLogin, chainId, hideWallets, authStepTitle],
  );

  const title = useMemo(() => {
    if (titles[currentStep]?.length > 0) {
      return titles[currentStep];
    }

    return null;
  }, [currentStep, titles]);

  const isControls = useMemo(() => {
    return (
      activeWallet?.isExternal &&
      activeWallet?.type === 'EVM' &&
      [ModalStep.ACCOUNT_MAIN, ModalStep.CHAIN_SWITCH].includes(currentStep)
    );
  }, [activeWallet, currentStep]);

  const isTitleDisplayed = useMemo(() => {
    return !isControls && (currentStep !== ModalStep.AUTH_MAIN || !logo);
  }, [isControls, currentStep, logo]);

  return { title, isTitleDisplayed, isControls };
};
