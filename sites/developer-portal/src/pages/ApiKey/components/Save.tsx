import { useFormContext } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useUpdateApiKey } from '../../../hooks/api/mutations/useUpdateApiKey';
import { triggerToast } from '../../../utils/toasts';
import { CpslButton } from '@usecapsule/react-components';
import styled from 'styled-components';
import { useGetOrganizationKey } from '../../../hooks/api/queries/useOrganizationKeys';
import { Environment } from '../../../types/environment';
import { useGetSelectedOrganizationIsValid } from '../../../hooks/api/queries/useOrganizations';

export const Save = () => {
  const { apiKey, env, projectId } = useParams();
  const { data: apiKeyData } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', env as Environment);
  const { mutate: updateKey, isPending } = useUpdateApiKey();
  const { data: orgValid } = useGetSelectedOrganizationIsValid();

  const {
    formState: { isDirty, isValid },
    getValues,
    reset,
  } = useFormContext();

  const canSave = isDirty && isValid && !apiKeyData?.archived;

  const handleSave = () => {
    if (orgValid && projectId && apiKey && env && canSave) {
      const values = getValues();

      if (values.onRampAssets && Object.keys(values.onRampAssets).length === 0) {
        values.onRampAssets = null;
      }

      if ('origins' in values) {
        values.origins = (values.origins as string)?.split(',').map(o => o.trim()) ?? [];
        console.log('🚀 ~ handleSave ~ values.origins:', values.origins);
      }

      updateKey(
        { projectId, keyId: apiKey, env, data: values },
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
              body: 'Please correct any errors. If the problem persists, contact Capsule support.',
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
