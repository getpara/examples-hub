import ReactDOM from 'react-dom';

import CapsuleWeb, { CapsuleModal, CapsuleModalProps } from '@usecapsule/react-sdk';

export function renderModal(capsule: CapsuleWeb, modalProps: Partial<CapsuleModalProps>, onCloseArg: () => void): void {
  const existingContainer = document.getElementById('capsule-modal');
  const container = existingContainer ?? document.createElement('div');
  container.id = 'capsule-modal';

  if (!existingContainer) {
    document.body.appendChild(container); // Add the container to the DOM
  }

  const onClose = () => {
    onCloseArg();
    render(false);
  };

  const render = async (isOpen: boolean) => {
    ReactDOM.render(<CapsuleModal onClose={onClose} capsule={capsule} isOpen={isOpen} {...modalProps} />, container);
  };

  render(true);
}
