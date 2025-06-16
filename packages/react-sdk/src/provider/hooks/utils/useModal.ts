import { ModalStep } from '../../../modal/index.js';
import { useModalStore } from '../../../modal/stores/index.js';
import { useStore } from '../../stores/useStore.js';

/**
 * Hook for controlling the Para modal
 */
export const useModal = () => {
  const isOpen = useStore(state => state.isOpen);
  const setIsOpen = useStore(state => state.setIsOpen);
  const openedToStep = useStore(state => state.openedToStep);
  const setStep = useModalStore(state => state.setStep);

  const openModal = ({ step }: { step?: ModalStep } = {}) => {
    if (step) {
      openedToStep.current = step;
      setStep(step);
    }

    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const closeModal = () => {
    openedToStep.current = null;
    setIsOpen(false);
  };

  return { isOpen, openModal, closeModal };
};
