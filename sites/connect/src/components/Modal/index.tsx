import ModalStore from '@/store/ModalStore';
import SessionProposalModal from '@/views/SessionProposalModal';
import SessionSendTransactionModal from '@/views/SessionSendTransactionModal';
import SessionRequestModal from '@/views/SessionSignModal';
import SessionSignTypedDataModal from '@/views/SessionSignTypedDataModal';
import SessionUnsuportedMethodModal from '@/views/SessionUnsuportedMethodModal';
import { useSnapshot } from 'valtio';
import { useCallback } from 'react';
import AuthRequestModal from '@/views/AuthRequestModal';
import SessionSignCosmosModal from '@/views/SessionSignCosmosModal';

import * as Styled from './styles';
import useIsMobile from '@/hooks/MobileContext';
import SwitchChainModal from '@/views/SwitchChainModal';

export default function Modal() {
  const isMobile = useIsMobile();
  const { open, view } = useSnapshot(ModalStore.state);
  // handle the modal being closed by click outside
  const onClose = useCallback(() => {
    if (open) {
      ModalStore.close();
    }
  }, [open]);

  return (
    <Styled.CustomModal
      width={isMobile ? '312px' : '552px'}
      style={{ paddingTop: '30px' }}
      blur
      onClose={onClose}
      open={open}
    >
      {view === 'SessionProposalModal' && <SessionProposalModal />}
      {view === 'SessionSignModal' && <SessionRequestModal />}
      {view === 'SessionSignTypedDataModal' && <SessionSignTypedDataModal />}
      {view === 'SessionSendTransactionModal' && <SessionSendTransactionModal />}
      {view === 'SessionUnsuportedMethodModal' && <SessionUnsuportedMethodModal />}
      {view === 'SessionSignCosmosModal' && <SessionSignCosmosModal />}
      {view === 'AuthRequestModal' && <AuthRequestModal />}
      {view === 'SwitchChainModal' && <SwitchChainModal />}
    </Styled.CustomModal>
  );
}
