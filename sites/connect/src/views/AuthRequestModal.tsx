import { useSnapshot } from 'valtio';
import { Col, Row, Text, Code } from '@nextui-org/react';
import { buildAuthObject, getSdkError, populateAuthPayload } from '@walletconnect/utils';
import ModalStore from '@/store/ModalStore';
import SettingsStore from '@/store/SettingsStore';
import { walletKit } from '@/utils/WalletConnectUtil';
import RequestModal from './RequestModal';
import { approveAuthRequest } from '@/utils/CapsuleRequestHandlerUtil';
import { useSelectedWallet } from '@/hooks/useSelectedWallet';
import { EIP155_CHAINS, EIP155_SIGNING_METHODS } from '../data/EIP155Data';

export default function AuthRequestModal() {
  const { capsuleAddress } = useSnapshot(SettingsStore.state);
  const { wallet } = useSelectedWallet();
  // Get request and wallet data from store
  const payload = ModalStore.state.data?.sessionAuthenticatePayload;
  // Ensure request and wallet are defined
  if (!payload) {
    return <Text>Missing request data</Text>;
  }

  const address = capsuleAddress;
  const iss = `eip155:1:${address}`;

  // Populate the authentication payload with the supported chains and methods
  const authPayload = populateAuthPayload({
    authPayload: payload.params.authPayload,
    chains: Object.keys(EIP155_CHAINS),
    methods: Object.values(EIP155_SIGNING_METHODS),
  });

  const message = walletKit.formatAuthMessage({ request: authPayload, iss });

  // Handle approve action (logic varies based on request method)
  async function onApprove() {
    if (payload) {
      const signature = await approveAuthRequest(message, wallet?.id);

      // Build the authentication object(s)
      const auth = buildAuthObject(
        authPayload,
        {
          t: 'eip191',
          s: signature,
        },
        iss,
      );
      console.log('🚀 ~ onApprove ~ auth:', auth);

      // Approve
      await walletKit.approveSessionAuthenticate({
        id: payload.id,
        auths: [auth],
      });

      ModalStore.close();
    }
  }

  // Handle reject action
  async function onReject() {
    if (payload) {
      await walletKit.rejectSessionAuthenticate({
        id: payload.id,
        reason: getSdkError('USER_REJECTED'),
      });
      ModalStore.close();
    }
  }
  return (
    <RequestModal
      intention="request a signature"
      metadata={payload.params.requester.metadata}
      onApprove={onApprove}
      onReject={onReject}
    >
      <Row>
        <Col>
          <Text h5>Message</Text>
          <Code>
            <Text color="$gray400">{message}</Text>
          </Code>
        </Col>
      </Row>
    </RequestModal>
  );
}
