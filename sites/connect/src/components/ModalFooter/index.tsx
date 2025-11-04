import { Modal, Row } from '@nextui-org/react';
import { Flex } from 'rebass';
import Button from '../base/Button';

interface Props {
  onApprove: () => void;
  onReject: () => void;
  infoBoxCondition?: boolean;
  infoBoxText?: string;
  disabledApprove?: boolean;
}

export default function ModalFooter({ onApprove, onReject, infoBoxCondition, infoBoxText }: Props) {
  return (
    <Modal.Footer>
      {infoBoxCondition && (
        <Row style={{ textAlign: 'initial' }}>
          <span>{infoBoxText || ''}</span>
        </Row>
      )}
      <Row justify="space-between">
        <Flex flex={1} mr="10px">
          <Button secondary isFullWidth onClick={onReject} data-testid="session-reject-button">
            Reject
          </Button>
        </Flex>
        <Flex flex={1} ml="10px">
          <Button isFullWidth onClick={onApprove} data-testid="session-approve-button">
            Approve
          </Button>
        </Flex>
      </Row>
    </Modal.Footer>
  );
}
