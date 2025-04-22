import { CpslButton, CpslInput } from '@getpara/react-components';
import { Modal } from '../../../components/Modal/Modal';
import { useDeleteUser } from '../../../hooks/api/mutations/useDeleteUser';
import { triggerToast } from '../../../utils/toasts';
import { useParams } from 'react-router-dom';
import { useDeletePregenWallet } from '../../../hooks/api/mutations/useDeletePregenWallet';

interface DeleteUserModalProps {
  open: boolean;
  userId: string | null;
  walletId: string | null;
  userEmail: string;
  onClose: () => void;
  onExited: () => void;
}

export const DeleteUserModal = ({ open, userEmail, userId, walletId, onClose, onExited }: DeleteUserModalProps) => {
  const { apiKey, env, projectId } = useParams();
  const { mutate: deleteUser } = useDeleteUser();
  const { mutate: deletePregenWallet } = useDeletePregenWallet();

  const handleDeleteClick = () => {
    if (walletId) {
      deletePregenWallet(
        { projectId: projectId!, walletId, env: env!, keyId: apiKey! },
        {
          onSuccess: () => {
            onClose();
            triggerToast({
              variant: 'success',
              title: 'Pregen Wallet Deleted!',
            });
          },
          onError: () => {
            triggerToast({
              variant: 'error',
              title: 'Failed to Delete Wallet',
              body: 'Please try again. If the problem persists, contact Para support.',
            });
          },
        },
      );

      return;
    }
    if (userId) {
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
              body: 'Please try again. If the problem persists, contact Para support.',
            });
          },
        },
      );
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      onExited={onExited}
      title={`Delete ${walletId ? 'Pregen Wallet' : 'User'}`}
      titleColor="var(--cpsl-color-text-error)"
      subtitle={`Are you sure you want to delete this ${walletId ? 'pregen wallet' : 'user'}?`}
    >
      <>
        <CpslInput placeholder={userEmail} disabled />
        <CpslButton variant="destructive" fullWidth onClick={handleDeleteClick}>
          Delete {walletId ? 'Pregen Wallet' : 'User'}
        </CpslButton>
      </>
    </Modal>
  );
};
