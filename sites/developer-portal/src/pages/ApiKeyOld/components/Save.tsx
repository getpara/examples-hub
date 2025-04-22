import { useFormContext } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useUpdateApiKey } from '../../../hooks/api/mutations/useUpdateApiKey';
import { triggerToast } from '../../../utils/toasts';
import { CpslButton } from '@getpara/react-components';
import styled from 'styled-components';
import { useGetOrganizationKey } from '../../../hooks/api/queries/useOrganizationKeys';
import { Environment } from '../../../types/environment';
import { useGetSelectedOrganizationIsValid } from '../../../hooks/api/queries/useOrganizations';
import { UpdateApiKeyBody, UpdateApiKeyFormData } from '../../../types/api';

export const Save = () => {
  const { apiKey, env, projectId } = useParams();
  const { data: apiKeyData } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', env as Environment);
  const { mutate: updateKey, isPending } = useUpdateApiKey();
  const { data: orgValid } = useGetSelectedOrganizationIsValid();

  const {
    formState: { isDirty, isValid },
    getValues,
    reset,
  } = useFormContext<Partial<UpdateApiKeyFormData>>();

  const canSave = isDirty && isValid && !apiKeyData?.archived;

  const handleSave = () => {
    if (orgValid && projectId && apiKey && env && canSave) {
      const values = getValues();
      const formattedValues: UpdateApiKeyBody = values as UpdateApiKeyBody;

      if (values.onRampAssets && Object.keys(values.onRampAssets).length === 0) {
        formattedValues.onRampAssets = null;
      }

      if ('origins' in values) {
        formattedValues.origins = values.origins?.split(',').map(o => o.trim()) ?? [];
      }

      if ('androidSha256CertFingerprints' in values) {
        formattedValues.androidSha256CertFingerprints =
          values.androidSha256CertFingerprints?.split(',').map(o => o.trim()) ?? [];
      }

      updateKey(
        { projectId, keyId: apiKey, env, data: formattedValues },
        {
          onSuccess: () => {
            reset(getValues());
            triggerToast({
              variant: 'success',
              title: 'Config Saved!',
            });
          },
          onError: () => {
            triggerToast({
              variant: 'error',
              title: 'Failed to Save Config',
              body: 'Please correct any errors. If the problem persists, contact Para support.',
            });
          },
        },
      );
    }
  };

  return (
    <SaveButton fullWidth disabled={!canSave || isPending || !orgValid} onClick={handleSave}>
      {!isDirty ? 'No Unsaved Changes' : 'Save'}
    </SaveButton>
  );
};

const SaveButton = styled(CpslButton)`
  &::part(button-native) {
    min-width: 140px;
  }
`;
