import { useSnapshot } from 'valtio';
import ModalStore from '../../../store/ModalStore';
import { Header } from './Header';
import { SessionTypes, SignClientTypes } from '@walletconnect/types';
import { Footer } from './Footer';
import { useSelectedWallet } from '../../../hooks/useSelectedWallet';
import { SessionEventChainData } from './SessionEventChainData';
import { SessionEventMethod } from './SessionEventMethod';
import { SessionEventData } from './SessionEventData';
import { approveRequest, rejectRequest } from '../../../utils/CapsuleRequestHandlerUtil';
import { walletKit } from '../../../utils/WalletConnectUtil';
import { styledToast } from '../../../utils/HelperUtil';

export const SessionSignTypedData = () => {
  const { data } = useSnapshot(ModalStore.state);
  const { wallet } = useSelectedWallet();

  const event = data?.requestEvent as SignClientTypes.EventArguments['session_request'];
  const session = data?.requestSession as SessionTypes.Struct;

  if (!event || !session || !wallet) return null;

  // Handle approve action (logic varies based on request method)
  const handleApprove = async () => {
    if (event) {
      const response = await approveRequest(event, wallet?.id);
      try {
        await walletKit.respondSessionRequest({
          topic: event.topic,
          response,
        });
        styledToast(`You can return to ${session.peer.metadata.name}`, 'success');
      } catch (e) {
        styledToast((e as Error).message, 'error');
      } finally {
        ModalStore.close();
      }
    }
  };

  // Handle reject action
  const handleReject = async () => {
    if (event) {
      const response = rejectRequest(event);
      try {
        await walletKit.respondSessionRequest({
          topic: event.topic,
          response,
        });
      } catch (e) {
        styledToast((e as Error).message, 'error');
      } finally {
        ModalStore.close();
      }
    }
  };

  return (
    <>
      <Header metadata={session.peer.metadata} intention="sign a message" verifyContext={event.verifyContext} />
      <SessionEventData />
      <SessionEventMethod />
      <SessionEventChainData />
      <Footer onApprove={handleApprove} onReject={handleReject} />
    </>
  );
};
