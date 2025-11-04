import RequestMethodCard from '@/components/RequestMethodCard';
import ModalStore from '@/store/ModalStore';
import SettingsStore from '@/store/SettingsStore';
import { updateSignClientChainId, walletKit } from '@/utils/WalletConnectUtil';
import { Divider, Text } from '@nextui-org/react';
import { rejectRequest } from '@/utils/CapsuleRequestHandlerUtil';
import { styledToast } from '@/utils/HelperUtil';
import RequesDetailsCard from '@/components/RequestDetailsCard';
import { useSelectedWallet } from '@/hooks/useSelectedWallet';
import { formatJsonRpcResult } from '@json-rpc-tools/utils';
import RequestModal from './RequestModal';

export default function SwitchChainModal() {
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
  const { request } = params;
  const hexChain = (params.request.params as Array<{ chainId: string }>)[0].chainId;

  // Handle approve action (logic varies based on request method)
  async function onApprove() {
    if (requestEvent) {
      SettingsStore.setActiveChainId(hexChain);
      try {
        await updateSignClientChainId(`eip155:${parseInt(hexChain)}`, wallet?.address ?? '');
        await new Promise(resolve => setTimeout(resolve, 1000));
        await walletKit.respondSessionRequest({
          topic,
          response: formatJsonRpcResult(requestEvent.id, {}),
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
      intention="change chains"
      metadata={requestSession.peer.metadata}
      onApprove={onApprove}
      onReject={onReject}
    >
      <RequesDetailsCard chains={[`eip155:${parseInt(hexChain)}`]} protocol={requestSession.relay.protocol} />
      <Divider y={1} />
      <RequestMethodCard methods={[request.method]} />
    </RequestModal>
  );
}
