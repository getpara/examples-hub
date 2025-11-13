import { useSnapshot } from 'valtio';
import ModalStore from '../../../store/ModalStore';
import { Header } from './Header';
import { SessionTypes, SignClientTypes } from '@walletconnect/types';
import { useSelectedWallet } from '../../../hooks/useSelectedWallet';
import { SessionEventChainData } from './SessionEventChainData';
import { SessionEventMethod } from './SessionEventMethod';
import { Button, Separator, Typography } from '@getpara/react-component-library';

export const SessionUnsupportedMethod = () => {
  const { data } = useSnapshot(ModalStore.state);
  const { wallet } = useSelectedWallet();

  const event = data?.requestEvent as SignClientTypes.EventArguments['session_request'];
  const session = data?.requestSession as SessionTypes.Struct;

  if (!event || !session || !wallet) return null;

  return (
    <>
      <Header metadata={session.peer.metadata} verifyContext={event.verifyContext} />
      <Typography className="para:text-xl para:font-semibold para:leading-none para:text-center">
        Method Not Supported
      </Typography>
      <Separator />
      <SessionEventMethod />
      <SessionEventChainData />
      <Button className="para:w-full" variant="neutral" onClick={ModalStore.close} size="lg">
        Close
      </Button>
    </>
  );
};
