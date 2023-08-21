import ReactDOMClient from 'react-dom/client'

import { Capsule } from '../../Capsule';
import { CapsuleModal } from '../../modal/CapsuleModal';
import { newTheme } from '../../modal/theme';

export function renderModal(capsule: Capsule, appName: string, onCloseArg: () => void): void {
  const container = document.createElement('div');
  const root = ReactDOMClient.createRoot(container);
  const onClose = () => {
    root.unmount();
    container.remove();
    onCloseArg();
  };

  root.render(
    <CapsuleModal
      onClose={onClose}
      capsule={capsule}
      isOpen={true}
      appName={appName}
      theme={newTheme}
    />,
  );
}
