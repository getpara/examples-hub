import { CpslButton, CpslInput } from '@usecapsule/react-components';
import { Modal } from '../../../components/Modal/Modal';
import { useRemoveMember } from '../../../hooks/api/mutations/useRemoveMember';
import { triggerToast } from '../../../utils/toasts';

interface RemoveMemberModalProps {
  open: boolean;
  memberId: string;
  memberEmail: string;
  onClose: () => void;
  onExited: () => void;
}

export const RemoveMemberModal = ({ open, memberEmail, memberId, onClose, onExited }: RemoveMemberModalProps) => {
  const { mutate: removeMember } = useRemoveMember();

  const handleRemoveClick = () => {
    removeMember(
      { memberId },
      {
        onSuccess: () => {
          onClose();
          triggerToast({
            variant: 'success',
            title: 'Member Removed!',
          });
        },
        onError: () => {
          triggerToast({
            variant: 'error',
            title: 'Failed to Remove Member',
            body: 'Please try again. If the problem persists, contact Capsule support.',
          });
        },
      },
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      onExited={onExited}
      title="Remove Member"
      titleColor="var(--cpsl-color-text-error)"
      subtitle="Are your sure you want to remove this member?"
    >
      <>
        <CpslInput value={memberEmail} disabled />
        <CpslButton variant="destructive" fullWidth onClick={handleRemoveClick}>
          Remove Member
        </CpslButton>
      </>
    </Modal>
  );
};
