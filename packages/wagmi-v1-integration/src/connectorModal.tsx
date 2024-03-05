import ReactDOM from 'react-dom';

import CapsuleWeb, { CapsuleModal, newTheme } from '@usecapsule/react-sdk';

export function renderModal(capsule: CapsuleWeb, appName: string, onCloseArg: () => void): void {
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
      appName={appName}
      theme={newTheme}
    />,
    container
  );
}
