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
} from '@getpara/react-component-library';
import { AxiosError } from 'axios';
import { useDeleteUsers } from '../../../hooks/api/mutations/useDeleteUsers';
import { useParams } from 'react-router-dom';
import { formatErrorMessage } from '../../../utils/formatErrorMessage';
import { Environment } from '../../../types/environment';
import { useOrganizationKeyUsersTotalRows } from '../../../hooks/api/queries/useOrganizationKeyUsersTableData';
import { PAGE_SIZE } from '../pages/ApiKeyUsers/components/UsersTable';
import { pluralize } from '../../../utils/pluralize';

type RemoveUserDialogProps = {
  open: boolean;
  setOpen: (_: boolean) => void;
};
export const RemoveAllUsersDialog = ({ open, setOpen }: RemoveUserDialogProps) => {
  const { apiKey, env, projectId } = useParams();
  const { mutate: deleteUsers, isPending: isDeletingUsers } = useDeleteUsers();
  const { data: totalUsersRows, isLoading: isLoadingTotal } = useOrganizationKeyUsersTotalRows(
    projectId ?? '',
    apiKey ?? '',
    env ?? '',
    0,
    PAGE_SIZE,
  );

  if ((env as Environment) === Environment.PROD) {
    return null;
  }

  const hasUsers = (totalUsersRows ?? 0) > 0;

  const onOpenChange = (open: boolean) => {
    setOpen(open);
  };

  const handleRemoveClick = () => {
    if (hasUsers && projectId && apiKey && env) {
      deleteUsers(
        {
          projectId,
          keyId: apiKey,
          env,
        },
        {
          onSuccess: () => {
            setOpen(false);
          },
          onError: err => {
            const message =
              ((err as AxiosError).response?.data as string) ?? 'If the problem persists, contact Para support.';

            toast.error('Failed to Delete Users', {
              description: formatErrorMessage(message),
            });
          },
        },
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="destructive" disabled={!hasUsers}>
          Delete All Users
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete All Development Environment Users</DialogTitle>
          <DialogDescription>{`Are you sure you want to delete ${isLoadingTotal ? '-' : totalUsersRows} ${pluralize(totalUsersRows ?? 0, 'user')}?`}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <div>
            <Button
              disabled={isDeletingUsers || !hasUsers}
              isLoading={isDeletingUsers}
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
