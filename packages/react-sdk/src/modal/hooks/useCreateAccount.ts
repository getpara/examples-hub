import { useWaitForAccountCreation } from '../../provider/index.js';
import { DEFAULTS } from '../constants/defaults.js';
import { useModalStore } from '../stores/index.js';
import { openPopup } from '../utils/openPopup.js';
import { ModalStep } from '../utils/steps.js';
import { useGoBack } from './useGoBack.js';

export function useCreateAccount(): { withPasskey: () => void; withPassword: () => void } {
  const { waitForAccountCreation } = useWaitForAccountCreation();
  const goBack = useGoBack();
  const refs = useModalStore(state => state.refs);
  const setStep = useModalStore(state => state.setStep);
  const webAuthURLForCreate = useModalStore(state => state.webAuthURLForCreate);
  const setWebAuthURLForCreate = useModalStore(state => state.setWebAuthURLForCreate);
  const setIFrameUrl = useModalStore(state => state.setIFrameUrl);

  const awaitWalletCreationTransition = () => {
    waitForAccountCreation(
      { popupWindow: refs.popupWindow.current },
      {
        onSuccess: isComplete => {
          if (isComplete) {
            setWebAuthURLForCreate('');
            setIFrameUrl('');
            setStep(ModalStep.AWAITING_WALLET_CREATION);
          }
        },
        onSettled: () => {
          window.clearTimeout(refs.poll.current?.timeout);
          refs.poll.current = null;
          refs.popupWindow.current = null;

          if (refs.currentStep.current === ModalStep.AWAITING_BIOMETRIC_CREATION) {
            goBack();
          }
        },
      },
    );
  };

  return {
    withPasskey: () => {
      if (!webAuthURLForCreate || refs.poll.current?.action === 'createPasskey') {
        return;
      }

      clearTimeout(refs.poll.current?.timeout);
      refs.popupWindow.current = openPopup({
        url: webAuthURLForCreate,
        target: 'ParaPasskey',
        type: 'CREATE_PASSKEY',
        current: refs.popupWindow.current,
      });

      refs.poll.current = {
        action: 'createPasskey',
        timeout: window.setTimeout(awaitWalletCreationTransition, DEFAULTS.POLLING_INTERVAL_MS),
      };

      if (refs.currentStep.current !== ModalStep.AWAITING_BIOMETRIC_CREATION) {
        setStep(ModalStep.AWAITING_BIOMETRIC_CREATION);
      }
    },
    withPassword: () => {
      if (refs.poll.current?.action === 'createPassword') {
        return;
      }

      clearTimeout(refs.poll.current?.timeout);

      refs.poll.current = {
        action: 'createPassword',
        timeout: window.setTimeout(awaitWalletCreationTransition, DEFAULTS.POLLING_INTERVAL_MS),
      };

      if (refs.currentStep.current !== ModalStep.PASSWORD_CREATION) {
        setStep(ModalStep.PASSWORD_CREATION);
      }
    },
  };
}
