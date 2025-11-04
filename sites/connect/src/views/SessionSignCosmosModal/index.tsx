import { Divider, Text } from '@nextui-org/react';
import { useCallback } from 'react';

import RequestDataCard from '@/components/RequestDataCard';
import RequesDetailsCard from '@/components/RequestDetailsCard';
import RequestMethodCard from '@/components/RequestMethodCard';
import ModalStore from '@/store/ModalStore';
import { approveRequest, rejectRequest } from '@/utils/CapsuleRequestHandlerUtil';
import { styledToast } from '@/utils/HelperUtil';
import { walletKit } from '@/utils/WalletConnectUtil';
import RequestModal from '../RequestModal';
import { useSelectedWallet } from '@/hooks/useSelectedWallet';

export default function SessionSignCosmosModal() {
  const { wallet } = useSelectedWallet();
  // Get request and wallet data from store
  const requestEvent = ModalStore.state.data?.requestEvent;
  const requestSession = ModalStore.state.data?.requestSession;

  // Get required request data

  // Handle approve action (logic varies based on request method)
  const onApprove = useCallback(async () => {
    if (requestEvent) {
      const { topic } = requestEvent;
      const response = await approveRequest(requestEvent, wallet?.id);
      try {
        await walletKit.respondSessionRequest({
          topic,
          response,
        });
      } catch (e) {
        styledToast((e as Error).message, 'error');
        return;
      }
      ModalStore.close();
    }
  }, [requestEvent]);

  // Handle reject action
  const onReject = useCallback(async () => {
    if (requestEvent) {
      const { topic } = requestEvent;
      const response = rejectRequest(requestEvent);
      try {
        await walletKit.respondSessionRequest({
          topic,
          response,
        });
      } catch (e) {
        styledToast((e as Error).message, 'error');
        return;
      }
      ModalStore.close();
    }
  }, [requestEvent]);

  // Ensure request and wallet are defined
  if (!requestEvent || !requestSession) {
    return <Text>Missing request data</Text>;
  }

  // Get required request data
  const { params } = requestEvent;
  const { chainId, request } = params;

  return (
    <RequestModal
      intention="Sign Cosmos transaction"
      metadata={requestSession.peer.metadata}
      onApprove={onApprove}
      onReject={onReject}
    >
      <RequesDetailsCard chains={[chainId ?? '']} protocol={requestSession.relay.protocol} />
      <Divider y={1} />
      <RequestDataCard data={params} />
      <Divider y={1} />
      <RequestMethodCard methods={[request.method]} />
    </RequestModal>
  );
}
