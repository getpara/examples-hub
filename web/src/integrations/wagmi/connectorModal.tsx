import ReactDOM from 'react-dom';

import { Capsule } from '../../Capsule';
import { CoreCapsule } from '../../core/CoreCapsule';
import { CapsuleModal } from '../../modal/CapsuleModal';
import { darkTheme } from '../../modal/theme';

export function renderModal(capsule: Capsule | CoreCapsule, appName: string, onCloseArg: () => void): void {
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
      theme={darkTheme}
    />,
    container
  );
}
