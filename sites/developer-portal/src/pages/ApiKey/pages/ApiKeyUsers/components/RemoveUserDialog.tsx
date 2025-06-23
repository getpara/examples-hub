import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  toast,
  Typography,
} from '@getpara/react-component-library';
import { AxiosError } from 'axios';
import { useDeleteUser } from '../../../../../hooks/api/mutations/useDeleteUser';
import { FlatCard } from '../../../../../components/FlatCard';
import { UsersTableData } from '../../../../../types/api';
import { useParams } from 'react-router-dom';
import { formatErrorMessage } from '../../../../../utils/formatErrorMessage';
import { Environment } from '../../../../../types/environment';
import { useDeletePregenWallet } from '../../../../../hooks/api/mutations/useDeletePregenWallet';

type RemoveUserDialogProps = {
  user?: UsersTableData;
  open: boolean;
  setOpen: (_: boolean) => void;
  onSuccess: () => void;
};
export const RemoveUserDialog = ({ user, open, setOpen, onSuccess }: RemoveUserDialogProps) => {
  const { apiKey, env, projectId } = useParams();
  const { mutate: deleteUser, isPending: isDeletingUser } = useDeleteUser();
  const { mutate: deletePregen, isPending: isDeletingPregen } = useDeletePregenWallet();

  const onOpenChange = (open: boolean) => {
    setOpen(open);
  };

  const handleRemoveClick = () => {
    if (projectId && apiKey && env) {
      const deleteFn = user?.pregenWalletId ? deletePregen : deleteUser;
      const id = user?.pregenWalletId ?? user?.userId ?? '';

      deleteFn(
        {
          projectId,
          keyId: apiKey,
          env,
          id,
        },
        {
          onSuccess: () => {
            setOpen(false);
            onSuccess();
          },
          onError: err => {
            const message =
              ((err as AxiosError).response?.data as string) ?? 'If the problem persists, contact Para support.';

            toast.error('Failed to Delete User', {
              description: formatErrorMessage(message),
            });
          },
        },
      );
    }
  };

  if (!user || (env as Environment) === Environment.PROD) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete User</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>Are you sure you want to delete this user?</DialogDescription>
        </DialogHeader>
        <FlatCard className="para:flex-row para:p-2 para:lg:p-2">
          <Typography className="para:text-sm" color="muted">
            {user.userId ?? user.pregenWalletId ?? ''}
          </Typography>
          <Typography className="para:font-semibold">
            {user.email ?? user.phoneNumber ?? user.farcasterUsername ?? user.userId ?? user.pregenIdentifier ?? ''}
          </Typography>
        </FlatCard>
        <DialogFooter>
          <div>
            <Button
              disabled={isDeletingUser || isDeletingPregen}
              isLoading={isDeletingUser || isDeletingPregen}
              variant="destructive"
              onClick={handleRemoveClick}
            >
              Confirm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
