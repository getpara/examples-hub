import { useSnapshot } from 'valtio';
import ModalStore from '../../../store/ModalStore';
import { Header } from './Header';
import { SessionTypes, SignClientTypes } from '@walletconnect/types';
import { Footer } from './Footer';
import { useSelectedWallet } from '../../../hooks/useSelectedWallet';
import { SessionEventChainData } from './SessionEventChainData';
import { SessionEventMethod } from './SessionEventMethod';
import SettingsStore from '../../../store/SettingsStore';
import { styledToast } from '../../../utils/HelperUtil';
import { formatJsonRpcResult } from '@json-rpc-tools/utils';
import { updateSignClientChainId, walletKit } from '../../../utils/WalletConnectUtil';
import { rejectRequest } from '../../../utils/CapsuleRequestHandlerUtil';

export const SessionSwitchChains = () => {
  const { data } = useSnapshot(ModalStore.state);
  const { wallet } = useSelectedWallet();

  const event = data?.requestEvent as SignClientTypes.EventArguments['session_request'];
  const session = data?.requestSession as SessionTypes.Struct;

  if (!event || !session || !wallet) return null;

  const handleApprove = async (): Promise<void> => {
    if (!event || !event.topic) return;

    const hexChain = (event.params.request.params as Array<{ chainId: string }>)[0].chainId;

    SettingsStore.setActiveChainId(hexChain);
    try {
      await updateSignClientChainId(`eip155:${parseInt(hexChain)}`, wallet?.address ?? '');
      await new Promise(resolve => setTimeout(resolve, 1000));
      await walletKit.respondSessionRequest({
        topic: event.topic,
        response: formatJsonRpcResult(event.id, {}),
      });
      styledToast(`You can return to ${session.peer.metadata.name}`, 'success');
    } catch (e) {
      styledToast((e as Error).message, 'error');
    } finally {
      ModalStore.close();
    }
  };

  const handleReject = async (): Promise<void> => {
    if (!event || !event.topic) return;

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
  };

  return (
    <>
      <Header metadata={session.peer.metadata} intention="switch chains" verifyContext={event.verifyContext} />
      <SessionEventMethod />
      <SessionEventChainData isForChainSwitch />
      <Footer onApprove={handleApprove} onReject={handleReject} />
    </>
  );
};
