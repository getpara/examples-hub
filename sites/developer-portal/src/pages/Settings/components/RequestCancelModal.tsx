import { CpslButton, CpslText } from '@usecapsule/react-components';
import { Modal } from '../../../components/Modal/Modal';
import { useCancelPlan } from '../../../hooks/api/mutations/useCancelPlan';
import { triggerToast } from '../../../utils/toasts';

interface RequestCancelModalProps {
  open: boolean;
  onClose: () => void;
}

export const RequestCancelModal = ({ open, onClose }: RequestCancelModalProps) => {
  const { mutate: cancelPlan } = useCancelPlan();

  const handleCancelClick = () => {
    cancelPlan(null, {
      onSettled: () => {
        onClose();
        triggerToast({
          variant: 'success',
          title: 'Cancel Request Sent!',
        });
      },
      onError: () => {
        triggerToast({
          variant: 'error',
          title: 'Failed to Send Cancel Request',
          body: 'Please try again. If the problem persists, contact Capsule support.',
        });
      },
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Send Cancellation Request"
      titleColor="var(--cpsl-color-text-error)"
      subtitle="Are you sure you want to cancel your plan?"
    >
      <>
        <CpslText color="secondary">
          We will notify you when your plan has been cancelled. This process typically takes 24hrs and you will no longer
          have access to your Capsule instance.
        </CpslText>
        <CpslButton variant="destructive" fullWidth onClick={handleCancelClick}>
          Cancel Plan
        </CpslButton>
      </>
    </Modal>
  );
};
