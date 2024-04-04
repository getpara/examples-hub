import ReactDOM from 'react-dom';

import CapsuleWeb, { CapsuleModal, CapsuleModalV2Props } from '@usecapsule/react-sdk';

export function renderModal(
  capsule: CapsuleWeb,
  modalProps: CapsuleModalV2Props,
  onCloseArg: () => void,
): void {
  const container = document.createElement('div');
  document.body.appendChild(container); // Add the container to the DOM

  const onClose = () => {
    ReactDOM.unmountComponentAtNode(container); // Unmount the component
    container.remove(); // Remove the container from the DOM
    onCloseArg();
  };

  ReactDOM.render(
    <CapsuleModal
      onClose={onClose}
      capsule={capsule}
      isOpen={true}
      {...modalProps}
    />,
    container,
  );
}
