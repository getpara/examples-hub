import { useStore } from '../../stores/useStore.js';

/**
 * Hook for controlling the Para modal
 */
export const useModal = () => {
  const isOpen = useStore(state => state.isOpen);
  const setIsOpen = useStore(state => state.setIsOpen);

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return { isOpen, openModal, closeModal };
};
