import { ParaModalProps } from '@getpara/react-sdk-lite';
import { ParaConnectorOpts as ParaConnectorOptsBase, createParaConnector } from '@getpara/wagmi-v2-connector';
import { renderModal } from './connectorModal.js';
import { QueryClient } from '@tanstack/react-query';

export type ParaModalPropsForInit = Omit<ParaModalProps, 'isOpen' | 'para'> & { appName: string };

type ParaConnectorOpts = Partial<ParaModalPropsForInit> & ParaConnectorOptsBase & { queryClient: QueryClient };

export const paraConnector = ({
  para,
  chains: _chains,
  disableModal,
  storageOverride,
  options,
  iconOverride,
  nameOverride,
  idOverride,
  transports,
  appName,
  queryClient,
  ...modalProps
}: ParaConnectorOpts) => {
  return createParaConnector({
    para,
    chains: _chains,
    disableModal,
    storageOverride,
    options,
    iconOverride,
    nameOverride,
    idOverride,
    transports,
    appName,
    renderModal: onClose => renderModal(para, { ...modalProps, appName }, onClose, queryClient),
  });
};
