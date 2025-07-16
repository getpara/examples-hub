import ParaWeb, { setIsOpen } from '@getpara/react-sdk-lite';
import { type ParaModalPropsForInit } from './paraConnector.js';
import { type QueryClient } from '@tanstack/react-query';

let Root;

export function renderModal(
  para: ParaWeb,
  modalProps: Partial<ParaModalPropsForInit>,
  onCloseArg: () => void,
  queryClient: QueryClient,
): { openModal: () => void } {
  if (typeof window === 'undefined') {
    return { openModal: () => {} };
  }

  const onClose = () => {
    onCloseArg();
    modalProps.onClose && modalProps.onClose();
    setIsOpen(false);
  };

  const render = async () => {
    const { ParaProvider } = await import('@getpara/react-sdk-lite');
    const { QueryClientProvider } = await import('@tanstack/react-query');

    const existingContainer = document.getElementById('para-modal');
    const container = existingContainer ?? document.createElement('div');
    container.id = 'para-modal';

    if (!existingContainer) {
      document.body.insertAdjacentElement('beforeend', container); // Add the container to the DOM
    }

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

  return { openModal: () => setIsOpen(true) };
}
