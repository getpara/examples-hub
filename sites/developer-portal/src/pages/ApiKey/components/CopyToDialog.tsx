import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  toast,
} from '@getpara/react-component-library';
import { useParams } from 'react-router-dom';
import { useGetActiveOrganizationKeys, useGetOrganizationKey } from '../../../hooks/api/queries/useOrganizationKeys';
import { useUpdateApiKey } from '../../../hooks/api/mutations/useUpdateApiKey';
import { useState } from 'react';
import { formatEnvName } from '../../../utils/apiKey';
import { getApiKeyCopyValues } from '../../../utils/getApiKeyCopyValues';
import { EnvIcon } from '../../../components/EnvIcon';
import { Environment } from '../../../types/environment';
import { useGetOrganizationHasNativePasskeyAccess } from '../../../hooks/api/queries/useOrganizationSubscription';

interface CopyToDialogProps {
  open: boolean;
  setIsOpen: (_: boolean) => void;
}

export const CopyToDialog = ({ open, setIsOpen }: CopyToDialogProps) => {
  const { projectId, apiKey, env } = useParams();
  const { data: apiKeyData } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', env as Environment);
  const { data: apiKeys, isLoading: isApiKeysLoading } = useGetActiveOrganizationKeys(projectId ?? '');
  const { data: hasNativePasskeyAccess } = useGetOrganizationHasNativePasskeyAccess();
  const { mutate: saveChanges, isPending: isUpdatingKey } = useUpdateApiKey();
  const [destinationKeyId, setDestinationKeyId] = useState<string>();

  const destinationKey = apiKeys?.find(key => key.id === destinationKeyId);
  const keyOptions = apiKeys?.filter(key => key.id !== apiKey);

  const handleDestKeyChange = (value: string) => {
    setDestinationKeyId(value);
  };

  const handleConfirmClick = () => {
    if (projectId && destinationKey && apiKeyData) {
      saveChanges(
        {
          projectId,
          keyId: destinationKey.id,
          env: destinationKey.environment,
          data: getApiKeyCopyValues({ key: apiKeyData, nextEnv: destinationKey.environment, hasNativePasskeyAccess }),
        },
        {
          onSuccess: () => {
            setIsOpen(false);
            toast.success('Key Copied!');
          },
          onError: () => {
            toast.error('Failed to Create Key', {
              description: 'Please try again. If the problem persists, contact Para support.',
            });
          },
        },
      );
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={open => {
        setIsOpen(open);
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="para:text-left para:text-foreground">Copy Configuration</DialogTitle>
          <DialogDescription className="para:text-left">
            Choose another key to copy the configuration settings to. The current configuration settings on the destination
            key will be overridden.
          </DialogDescription>
        </DialogHeader>
        <div className="para:flex para:flex-col para:gap-2">
          <Label htmlFor="destination-key-select">Destination Key</Label>
          <Select onValueChange={handleDestKeyChange} disabled={isApiKeysLoading}>
            <SelectTrigger id="destination-key-select" className="para:w-full">
              <SelectValue placeholder="Select a key" />
            </SelectTrigger>
            <SelectContent>
              {keyOptions?.map(key => (
                <SelectItem key={key.id} value={key.id}>
                  <EnvIcon environment={key.environment} />
                  {formatEnvName(key.environment)}
                  {/* If there are multiple keys available with the same env, append the last 4 of the key to distinguish them */}
                  {!!keyOptions.find(k => k.environment === key.environment && k.id !== key.id)
                    ? ` (${key.apiKey.slice(-4)})`
                    : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <div className="para:ml-auto">
            <Button onClick={handleConfirmClick} disabled={isUpdatingKey} isLoading={isUpdatingKey}>
              Confirm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
