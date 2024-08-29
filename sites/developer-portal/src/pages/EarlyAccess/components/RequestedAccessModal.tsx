import { CpslButton } from '@usecapsule/react-components';
import { Modal } from '../../../components/Modal/Modal';

interface RequestedAccessModalProps {
  open: boolean;
  onClose: () => void;
}

export const RequestedAccessModal = ({ open, onClose }: RequestedAccessModalProps) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Request Received"
      subtitle="We will review your request and notify you via email when you have access to this feature!"
    >
      <CpslButton fullWidth onClick={onClose}>
        Ok, got it!
      </CpslButton>
    </Modal>
  );
};
