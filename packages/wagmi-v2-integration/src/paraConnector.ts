import { ParaModalProps, setIsOpen } from '@getpara/react-sdk';
import { ParaConnectorOpts as ParaConnectorOptsBase, createParaConnector } from '@getpara/wagmi-v2-connector';
import { renderModal } from './connectorModal.js';

export type ParaModalPropsForInit = Omit<ParaModalProps, 'isOpen' | 'para'> & { appName: string };

type ParaConnectorOpts = Partial<ParaModalPropsForInit> & ParaConnectorOptsBase;

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
    renderModal: onClose => renderModal(para, { ...modalProps, appName }, onClose),
    openModal: () => {
      setIsOpen(true);
    },
  });
};
