import { Button, Modal, Text, Avatar, Col, Row } from '@nextui-org/react';
import { Fragment, useEffect } from 'react';

import { SignClientTypes } from '@walletconnect/types';
import RequestModalContainer from '@/components/RequestModalContainer';
import ModalStore from '@/store/ModalStore';
import { rejectRequest } from '@/utils/CapsuleRequestHandlerUtil';
import { walletKit } from '@/utils/WalletConnectUtil';
import { styledToast } from '@/utils/HelperUtil';

interface IProps {
  metadata: SignClientTypes.Metadata;
  intention?: string;
}

function ProjectInfoCard({ metadata }: IProps) {
  const { icons, name } = metadata;

  return (
    <div style={{ textAlign: 'center' }}>
      <Row>
        <Col>
          <Avatar style={{ margin: 'auto' }} src={icons[0]} size={'xl'} />
        </Col>
      </Row>
      <Row align="center">
        <Col>
          <Text h3 data-testid="session-info-card-text">
            Session has expired for {name}. Please log back in.
          </Text>
        </Col>
      </Row>
    </div>
  );
}

export default function SessionRegenerateModal() {
  // Get request and wallet data from store
  const requestEvent = ModalStore.state.data?.requestEvent;
  const requestSession = ModalStore.state.data?.requestSession;

  // Get required request data

  useEffect(() => {
    const rejectSessionRequest = async () => {
      if (!requestEvent) return;
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
    };

    rejectSessionRequest();
  }, []);

  // Ensure request and wallet are defined
  if (!requestEvent || !requestSession) {
    return <Text>Missing request data</Text>;
  }

  return (
    <Fragment>
      <RequestModalContainer title="Session Expiration">
        <ProjectInfoCard metadata={requestSession.peer.metadata} />
      </RequestModalContainer>
      <Modal.Footer>
        <Button
          auto
          flat
          color="error"
          onClick={() => {
            ModalStore.close();
            window.location.reload();
          }}
        >
          Close
        </Button>
      </Modal.Footer>
    </Fragment>
  );
}
