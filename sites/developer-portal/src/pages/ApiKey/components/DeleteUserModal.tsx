import { CpslButton, CpslInput } from '@usecapsule/react-components';
import { Modal } from '../../../components/Modal/Modal';
import { useDeleteUser } from '../../../hooks/api/mutations/useDeleteUser';
import { triggerToast } from '../../../utils/toasts';
import { useParams } from 'react-router-dom';

interface DeleteUserModalProps {
  open: boolean;
  userId: string;
  userEmail: string;
  onClose: () => void;
  onExited: () => void;
}

export const DeleteUserModal = ({ open, userEmail, userId, onClose, onExited }: DeleteUserModalProps) => {
  const { apiKey, env, projectId } = useParams();
  const { mutate: deleteUser } = useDeleteUser();

  const handleDeleteClick = () => {
    deleteUser(
      { projectId: projectId!, userId, env: env!, keyId: apiKey! },
      {
        onSuccess: () => {
          onClose();
          triggerToast({
            variant: 'success',
            title: 'User Deleted!',
          });
        },
        onError: () => {
          triggerToast({
            variant: 'error',
            title: 'Failed to Delete User',
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
      title="Delete User"
      titleColor="var(--cpsl-color-text-error)"
      subtitle="Are your sure you want to delete this user?"
    >
      <>
        <CpslInput value={userEmail} disabled />
        <CpslButton variant="destructive" fullWidth onClick={handleDeleteClick}>
          Delete User
        </CpslButton>
      </>
    </Modal>
  );
};
