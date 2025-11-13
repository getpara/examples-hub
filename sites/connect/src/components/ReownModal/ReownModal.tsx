import { useSnapshot } from 'valtio';
import ModalStore from '@/store/ModalStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  useIsMobile,
} from '@getpara/react-component-library';
import { useMemo } from 'react';
import { SessionProposal } from './components/SessionProposal';
import { useState } from 'react';
import { ScamWarning } from './components/ScamWarning';
import { SessionSignPersonal } from './components/SessionSignPersonal';
import { SessionSignTypedData } from './components/SessionSignTypedData';
import { SessionSendTransaction } from './components/SessionSendTransaction';
import { SessionSwitchChains } from './components/SessionSwitchChains';
import { SessionUnsupportedMethod } from './components/SessionUnsupportedMethod';
import { SessionAuthenticate } from './components/SessionAuthenticate';
import { SessionCosmosSign } from './components/SessionCosmosSign';

export const ReownModal = () => {
  const { open, view } = useSnapshot(ModalStore.state);
  const isMobile = useIsMobile();

  const [ackScam, setAckScam] = useState(false);

  const content = useMemo(() => {
    const isScam = ModalStore.isScam();
    const isDomainMismatch = ModalStore.isDomainMismatch();

    if ((isScam || isDomainMismatch) && !ackScam) {
      return (
        <ScamWarning
          onProceed={() => {
            setAckScam(true);
          }}
          onReject={() => {}}
          isMismatch={isDomainMismatch}
        />
      );
    }

    switch (view) {
      case 'SessionProposalModal':
        return <SessionProposal />;
      case 'SessionSignModal':
        return <SessionSignPersonal />;
      case 'SessionSignTypedDataModal':
        return <SessionSignTypedData />;
      case 'SessionSendTransactionModal':
        return <SessionSendTransaction />;
      case 'SwitchChainModal':
        return <SessionSwitchChains />;
      case 'AuthRequestModal':
        return <SessionAuthenticate />;
      case 'SessionSignCosmosModal':
        return <SessionCosmosSign />;
      case 'SessionUnsupportedMethodModal':
      default:
        return <SessionUnsupportedMethod />;
    }
  }, [view, ackScam]);

  if (!isMobile) {
    return (
      <Dialog open={open}>
        <DialogContent
          className="para:px-4 para:py-6 para:gap-6 para:z-[1000] para:max-h-[90dvh] para:overflow-auto para:!outline-none"
          noClose
        >
          <DialogTitle className="para:sr-only">{view}</DialogTitle>
          <DialogDescription className="para:sr-only">{view}</DialogDescription>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} dismissible={false}>
      <DrawerContent noHandle className="para:px-4 para:py-6 para:z-[1000] para:!max-h-[90dvh] para:!mt-0">
        <DrawerTitle className="para:sr-only">{view}</DrawerTitle>
        <DrawerDescription className="para:sr-only">{view}</DrawerDescription>
        <div className="para:flex para:flex-col para:items-center para:gap-6 para:overflow-auto">{content}</div>
      </DrawerContent>
    </Drawer>
  );
};
