import { Col, Divider, Row, Text } from '@nextui-org/react';

import RequesDetailsCard from '@/components/RequestDetailsCard';
import ModalStore from '@/store/ModalStore';
import { approveRequest, rejectRequest } from '@/utils/CapsuleRequestHandlerUtil';
import { getSignParamsMessage, styledToast } from '@/utils/HelperUtil';
import { walletKit } from '@/utils/WalletConnectUtil';
import RequestModal from '../RequestModal';

import * as Styled from './styles';
import { useSelectedWallet } from '@/hooks/useSelectedWallet';

export default function SessionSignModal() {
  // Get request and wallet data from store
  const requestEvent = ModalStore.state.data?.requestEvent;
  const requestSession = ModalStore.state.data?.requestSession;
  const { wallet } = useSelectedWallet();

  // Ensure request and wallet are defined
  if (!requestEvent || !requestSession) {
    return <Text>Missing request data</Text>;
  }

  // Get required request data
  const { topic, params } = requestEvent;
  const { request, chainId } = params;

  // Get message, convert it to UTF8 string if it is valid hex
  const message = getSignParamsMessage(request.params);

  // Handle approve action (logic varies based on request method)
  async function onApprove() {
    if (requestEvent) {
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
  }

  // Handle reject action
  async function onReject() {
    if (requestEvent) {
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
  }

  return (
    <RequestModal
      intention="request a signature"
      metadata={requestSession.peer.metadata}
      onApprove={onApprove}
      onReject={onReject}
    >
      <RequesDetailsCard chains={[chainId ?? '']} protocol={requestSession.relay.protocol} />
      <Divider y={1} />
      <Row>
        <Col>
          <Styled.LabelText>Message</Styled.LabelText>
          <Styled.BodyText data-testid="request-message-text">{message}</Styled.BodyText>
        </Col>
      </Row>
    </RequestModal>
  );
}
