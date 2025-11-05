import ParaWeb, { setIsOpen } from '@getpara/react-sdk-lite';
import React from 'react';
import { type QueryClient } from '@tanstack/react-query';
import { ParaModalProps } from './connector.js';

type Root = { render(node: React.ReactNode): void; unmount(): void };

let rendererPromise: Promise<{
  createRoot?: (el: HTMLElement) => Root;
  legacyRender?: (node: React.ReactNode, el: HTMLElement) => void;
  legacyUnmount?: (el: HTMLElement) => void;
}> | null = null;

function getRenderer() {
  if (!rendererPromise) {
    rendererPromise = (async () => {
      try {
        const { createRoot } = await import('react-dom/client');
        return { createRoot: (el: HTMLElement) => createRoot(el) };
      } catch {
        const ReactDOM = await import('react-dom');
        return {
          legacyRender: ReactDOM.render,
          legacyUnmount: ReactDOM.unmountComponentAtNode,
        };
      }
    })();
  }
  return rendererPromise;
}

const wrap = (ctx: string, err: unknown, extraInfo?: string): never => {
  const baseMsg = `connectorModal error in ${ctx}: ${(err as Error).message}`;
  const fullMsg = extraInfo ? `${baseMsg}. Additional details: ${extraInfo}` : baseMsg;
  throw new Error(fullMsg);
};

export async function renderModal(
  para: ParaWeb,
  modalProps: Partial<ParaModalProps> | undefined,
  onCloseArg: () => void,
  queryClient: QueryClient,
): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }
  const props = modalProps ?? {};
  const containerId = 'para-modal';
  let container = document.getElementById(containerId) as HTMLElement | null;
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    document.body.appendChild(container);
  }
  try {
    const renderer = await getRenderer();
    let root: Root | null = (container as any).__paraRoot ?? null;
    if (!root && renderer.createRoot) {
      root = renderer.createRoot(container);
      (container as any).__paraRoot = root;
    }
    const { ParaProvider } = await import('@getpara/react-sdk-lite');
    const { QueryClientProvider } = await import('@tanstack/react-query');
    const handleClose = () => {
      onCloseArg();
      props.onClose?.();
      setIsOpen(false);
      if (root) {
        root.unmount();
      } else {
        renderer.legacyUnmount?.(container!);
      }
      container?.remove();
    };
    const element = (
      <QueryClientProvider client={queryClient}>
        <ParaProvider
          paraClientConfig={para}
          config={{ appName: props.appName ?? '' }}
          paraModalConfig={{ ...props, onClose: handleClose }}
        />
      </QueryClientProvider>
    );
    if (root) {
      root.render(element);
    } else {
      renderer.legacyRender?.(element, container!);
    }
    setIsOpen(true);
  } catch (err) {
    container?.remove();
    throw wrap('renderModal', err, `containerId: ${containerId}, modalProps: ${JSON.stringify(props)}`);
  }
}
