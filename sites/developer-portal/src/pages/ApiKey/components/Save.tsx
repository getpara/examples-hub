import { useFormContext } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useUpdateApiKey } from '../../../hooks/api/mutations/useUpdateApiKey';
import { triggerToast } from '../../../utils/toasts';
import { CpslButton } from '@usecapsule/react-components';
import styled from 'styled-components';

export const Save = () => {
  const { apiKey, env, projectId } = useParams();
  const { mutate: updateKey, isPending } = useUpdateApiKey();
  const {
    formState: { isDirty, isValid },
    getValues,
    reset,
  } = useFormContext();

  const canSave = isDirty && isValid;

  const handleSave = () => {
    if (projectId && apiKey && env && canSave) {
      updateKey(
        { projectId, keyId: apiKey, env, data: getValues() },
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
              title: 'Failed to Save Branding Config',
              body: 'Please correct any errors. If the problem persists, contact Capsule support.',
            });
          },
        },
      );
    }
  };

  return (
    <SaveButton fullWidth disabled={!canSave || isPending} onClick={handleSave}>
      Save
    </SaveButton>
  );
};

const SaveButton = styled(CpslButton)`
  align-self: flex-end;
  width: 140px;
`;
