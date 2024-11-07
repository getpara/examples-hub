import ReactDOM from 'react-dom';

import CapsuleWeb, { CapsuleModal } from '@usecapsule/react-sdk';
import { CapsuleModalPropsForInit } from './CapsuleEIP1193Provider.js';

export function renderModal(
  capsule: CapsuleWeb,
  modalProps: Partial<CapsuleModalPropsForInit>,
  onCloseArg: () => void,
): void {
  const existingContainer = document.getElementById('capsule-modal');
  const container = existingContainer ?? document.createElement('div');
  container.id = 'capsule-modal';

  if (!existingContainer) {
    document.body.appendChild(container); // Add the container to the DOM
  }

  const onClose = () => {
    onCloseArg();
    modalProps.onClose && modalProps.onClose();
    render(false);
  };

  const render = async (isOpen: boolean) => {
    ReactDOM.render(<CapsuleModal {...modalProps} onClose={onClose} capsule={capsule} isOpen={isOpen} />, container);
  };

  render(true);
}
