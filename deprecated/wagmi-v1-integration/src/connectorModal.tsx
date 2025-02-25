import ParaWeb, { ParaModal } from '@getpara/react-sdk';
import { ParaModalPropsForInit } from './ParaEIP1193Provider.js';

export function renderModal(para: ParaWeb, modalProps: Partial<ParaModalPropsForInit>, onCloseArg: () => void): void {
  const existingContainer = document.getElementById('para-modal');
  const container = existingContainer ?? document.createElement('div');
  container.id = 'para-modal';

  if (!existingContainer) {
    document.body.appendChild(container); // Add the container to the DOM
  }

  const onClose = () => {
    onCloseArg();
    modalProps.onClose && modalProps.onClose();
    render(false);
  };

  const render = async (isOpen: boolean) => {
    const Modal = <ParaModal {...modalProps} onClose={onClose} para={para} isOpen={isOpen} />;

    try {
      const client = await import('react-dom/client');
      const root = client.createRoot(container);
      root.render(Modal);
    } catch (e) {
      const ReactDOM = await import('react-dom');
      ReactDOM.render(Modal, container);
    }
  };

  render(true);
}
