import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  toast,
  useFormContext,
} from '@getpara/react-component-library';
import { useParams } from 'react-router-dom';
import { useRotateKey } from '../../../../../hooks/api/mutations/useRotateKey';
import { Environment } from '../../../../../types/environment';
import { SetupForm } from '../hooks/useSetupForm';

type RotateApiKeyDialogProps = {
  isOpen: boolean;
  setIsOpen: (_: boolean) => void;
};

export const RotateApiKeyDialog = ({ isOpen, setIsOpen }: RotateApiKeyDialogProps) => {
  const form = useFormContext<SetupForm>();
  const { projectId, apiKey, env } = useParams();
  const { mutate: rotateKey, isPending: isRotatingKey } = useRotateKey();

  const handleConfirmClick = () => {
    if (!projectId || !apiKey) {
      return;
    }

    rotateKey(
      {
        projectId,
        keyId: apiKey,
        env: env as Environment,
      },
      {
        onSuccess: data => {
          form.setValue('apiKey', data);
          setIsOpen(false);
        },
        onError: () => {
          toast.error('Failed to Rotate Key', {
            description: 'Please try again. If the problem persists, contact Para support.',
          });
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rotate API Key</DialogTitle>
          <DialogDescription>Rotating your API key will immediately invalidate the previous key.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleConfirmClick} disabled={isRotatingKey} isLoading={isRotatingKey}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
