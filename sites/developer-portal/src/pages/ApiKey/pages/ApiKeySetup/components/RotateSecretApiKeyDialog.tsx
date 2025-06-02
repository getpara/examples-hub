import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  toast,
} from '@getpara/react-component-library';
import { useParams } from 'react-router-dom';
import { Environment } from '../../../../../types/environment';
import { useRotateSecretKey } from '../../../../../hooks/api/mutations/useRotateSecretKey';
import { useSecretKeyStore } from '../hooks/useSecretKeyStore';

type RotateSecretApiKeyDialogProps = {
  isOpen: boolean;
  setIsOpen: (_: boolean) => void;
};

export const RotateSecretApiKeyDialog = ({ isOpen, setIsOpen }: RotateSecretApiKeyDialogProps) => {
  const { projectId, apiKey, env } = useParams();
  const { mutate: rotateKey, isPending: isRotatingKey } = useRotateSecretKey();
  const setSecretKey = useSecretKeyStore(state => state.setSecretKey);

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
          setSecretKey(data);
          setIsOpen(false);
        },
        onError: () => {
          toast.error('Failed to Rotate Secret Key', {
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
          <DialogTitle>Rotate Secret Key</DialogTitle>
          <DialogDescription>
            Rotating your Secret Key will immediately invalidate the previous key.
            <br />
            <br />
            Please save your Secret Key immediately. It will not be shown to you again.
          </DialogDescription>
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
