import { Divider, Text } from '@nextui-org/react';
import React from 'react';

import RequestDataCard from '@/components/RequestDataCard';
import RequesDetailsCard from '@/components/RequestDetailsCard';
import RequestMethodCard from '@/components/RequestMethodCard';
import ModalStore from '@/store/ModalStore';
import { approveRequest, rejectRequest } from '@/utils/CapsuleRequestHandlerUtil';
import { getSignTypedDataParamsData, styledToast } from '@/utils/HelperUtil';
import { web3wallet } from '@/utils/WalletConnectUtil';
import RequestModal from './RequestModal';
import { useSelectedWallet } from '@/hooks/useSelectedWallet';

export default function SessionSignTypedDataModal() {
  const { wallet } = useSelectedWallet();
  // Get request and wallet data from store
  const requestEvent = ModalStore.state.data?.requestEvent;
  const requestSession = ModalStore.state.data?.requestSession;

  // Ensure request and wallet are defined
  if (!requestEvent || !requestSession) {
    return <Text>Missing request data</Text>;
  }

  // Get required request data
  const { topic, params } = requestEvent;
  const { request, chainId } = params;

  // Get data
  const data = getSignTypedDataParamsData(request.params);

  // Handle approve action (logic varies based on request method)
  async function onApprove() {
    if (requestEvent) {
      const response = await approveRequest(requestEvent, wallet?.id);
      try {
        await web3wallet.respondSessionRequest({
          topic,
          response,
        });
      } catch (e) {
        styledToast((e as Error).message, 'error');
        return;
      }
      ModalStore.close();
    }
  }

  // Handle reject action
  async function onReject() {
    if (requestEvent) {
      const response = rejectRequest(requestEvent);
      try {
        await web3wallet.respondSessionRequest({
          topic,
          response,
        });
      } catch (e) {
        styledToast((e as Error).message, 'error');
        return;
      }
      ModalStore.close();
    }
  }
  return (
    <RequestModal
      intention="sign a message"
      metadata={requestSession.peer.metadata}
      onApprove={onApprove}
      onReject={onReject}
    >
      <RequesDetailsCard chains={[chainId ?? '']} protocol={requestSession.relay.protocol} />
      <Divider y={1} />
      <RequestDataCard data={data} />
      <Divider y={1} />
      <RequestMethodCard methods={[request.method]} />
    </RequestModal>
  );
}
