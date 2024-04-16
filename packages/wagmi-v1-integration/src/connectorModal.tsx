import ReactDOM from 'react-dom';

import CapsuleWeb, {
  CapsuleModal,
  CapsuleModalV2Props,
} from '@usecapsule/react-sdk';

export function renderModal(
  capsule: CapsuleWeb,
  modalProps: Partial<CapsuleModalV2Props>,
  onCloseArg: () => void,
): void {
  const existingContainer = document.getElementById('capsule-modal');
  const container = existingContainer ?? document.createElement('div');
  container.id = 'capsule-modal';

  if (!existingContainer) {
    document.body.appendChild(container); // Add the container to the DOM
  }

  const onClose = () => {
    render(false);
    onCloseArg();
  };

  const render = (isOpen: boolean) => {
    ReactDOM.render(
      <CapsuleModal
        onClose={onClose}
        capsule={capsule}
        isOpen={isOpen}
        {...modalProps}
      />,
      container,
    );
  };

  render(true);
}
