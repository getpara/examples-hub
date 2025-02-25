import ParaWeb, { ParaProvider, setIsOpen } from '@getpara/react-sdk';
import { ParaModalPropsForInit } from './paraConnector.js';
import { QueryClient } from '@tanstack/react-query';
import { QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

let Root;

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
    setIsOpen(false);
  };

  const render = async () => {
    const Modal = (
      <QueryClientProvider client={queryClient}>
        <ParaProvider
          paraClientConfig={para}
          config={{ appName: modalProps.appName ?? '' }}
          paraModalConfig={{ ...modalProps, onClose }}
        />
      </QueryClientProvider>
    );

    try {
      const client = await import('react-dom/client');
      if (!Root) {
        Root = client.createRoot(container);
      }
      Root.render(Modal);
    } catch (e) {
      const ReactDOM = await import('react-dom');
      ReactDOM.render(Modal, container);
    }
  };

  render();
}
