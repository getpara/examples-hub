import { CpslButton, CpslSelect, CpslSelectItem, CpslText } from '@getpara/react-components';
import { CpslSelectCustomEvent } from '@getpara/core-components';
import { Modal } from '../../../components/Modal/Modal';
import { useUpdateApiKey } from '../../../hooks/api/mutations/useUpdateApiKey';
import { useParams } from 'react-router-dom';
import { useFormContext } from 'react-hook-form';
import { triggerToast } from '../../../utils/toasts';
import { useState } from 'react';
import { CapitalizedText, EnvIcon } from '../../../components/common';
import { useGetAllOrganizationKeys } from '../../../hooks/api/queries/useOrganizationKeys';
import { Loader } from '../../../components/Loader';
import styled from 'styled-components';
import { Environment } from '../../../types/environment';
import { formatEnvName } from '../../../utils/apiKey';
import { UpdateApiKeyBody } from '../../../types/api';
import { truncateApiKey } from '../utils/truncateApiKey';

interface CopyToModalProps {
  open: boolean;
  onClose: () => void;
}

export const CopyToModal = ({ open, onClose }: CopyToModalProps) => {
  const { projectId, apiKey } = useParams();
  const { data: apiKeys, isLoading: isApiKeysLoading } = useGetAllOrganizationKeys(projectId ?? '');
  const { mutate: saveChanges, isPending } = useUpdateApiKey();
  const [destinationKeyId, setDestinationKeyId] = useState<string>();

  const {
    formState: { isValid, defaultValues },
    reset,
  } = useFormContext();

  const canCopy = isValid;

  const destinationKey = apiKeys?.find(key => key.id === destinationKeyId);
  const keyOptions = apiKeys?.filter(key => key.id !== apiKey);

  const handleDestKeyChange = (e: CpslSelectCustomEvent<string>) => {
    setDestinationKeyId(e.detail);
  };

  const handleConfirmClick = () => {
    if (canCopy && projectId && destinationKey) {
      saveChanges(
        {
          projectId,
          keyId: destinationKey.id,
          env: destinationKey.environment,
          // Using default values here so we don't copy unsaved changes
          data: defaultValues as UpdateApiKeyBody,
        },
        {
          onSuccess: () => {
            onClose();
            triggerToast({
              variant: 'success',
              title: 'Key Config Copied!',
            });
          },
          onError: () => {
            triggerToast({
              variant: 'error',
              title: 'Failed to Copy Key Config',
              body: 'Please try again. If the problem persists, contact Para support.',
            });
          },
        },
      );
    }
  };

  const handleExited = () => {
    reset(defaultValues);
    setDestinationKeyId(undefined);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      onExited={handleExited}
      title="Copy Configuration"
      subtitle="Choose another key to copy the configuration settings to. The configuration settings currently on the destination key will be overridden."
    >
      {isApiKeysLoading ? (
        <Loader />
      ) : (
        <>
          <CpslSelect
            label="Destination Key"
            placeholder="Select Destination Key"
            onCpslSelectValueChange={handleDestKeyChange}
            selectedValue={destinationKeyId}
            showFormattedSelectedItem
          >
            {destinationKey && (
              <KeyItemContainer slot="selected-item">
                <EnvIcon $environment={destinationKey.environment as Environment} />
                <CpslText>
                  {truncateApiKey(destinationKey.apiKey)}{' '}
                  <EnvText>({formatEnvName(destinationKey.environment as Environment)})</EnvText>
                </CpslText>
              </KeyItemContainer>
            )}
            {keyOptions?.map(key => (
              <CpslSelectItem key={key.id} slot="items" value={key.id}>
                <KeyItemContainer>
                  <EnvIcon $environment={key.environment} />
                  <CpslText>
                    {truncateApiKey(key.apiKey)} <EnvText>({formatEnvName(key.environment as Environment)})</EnvText>
                  </CpslText>
                </KeyItemContainer>
              </CpslSelectItem>
            ))}
          </CpslSelect>
          <CpslButton disabled={!canCopy || isPending} fullWidth onClick={handleConfirmClick}>
            Confirm
          </CpslButton>
        </>
      )}
    </Modal>
  );
};

const KeyItemContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const EnvText = styled(CapitalizedText)`
  display: inline-block;
`;
