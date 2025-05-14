import { CpslButton, CpslText } from '@getpara/react-components';
import { Modal } from '../../../components/Modal/Modal';
import { useCancelPlan } from '../../../hooks/api/mutations/useCancelPlan';
import { toast } from '@getpara/react-component-library';

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
        toast.success('Cancel Request Sent!');
      },
      onError: () => {
        toast.error('Failed to Send Cancel Request', {
          description: 'Please try again. If the problem persists, contact Para support.',
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
          have access to your Para instance.
        </CpslText>
        <CpslButton variant="destructive" fullWidth onClick={handleCancelClick}>
          Cancel Plan
        </CpslButton>
      </>
    </Modal>
  );
};
