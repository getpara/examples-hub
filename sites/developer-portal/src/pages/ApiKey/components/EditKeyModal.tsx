import { CpslButton, CpslIcon, CpslInput } from '@usecapsule/react-components';
import { Modal } from '../../../components/Modal/Modal';
import { useUpdateApiKey } from '../../../hooks/api/mutations/useUpdateApiKey';
import { useNavigate, useParams } from 'react-router-dom';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useRotateKey } from '../../../hooks/api/mutations/useRotateKey';
import { useArchiveKey } from '../../../hooks/api/mutations/useArchiveKey';
import { triggerToast } from '../../../utils/toasts';

interface EditKeyModalProps {
  open: boolean;
  name?: string;
  onClose: () => void;
}

export const EditKeyModal = ({ open, name, onClose }: EditKeyModalProps) => {
  const navigate = useNavigate();
  const { apiKey, env, projectId } = useParams();
  const { mutate: saveChanges } = useUpdateApiKey();
  const { mutate: rotateKey } = useRotateKey();
  const { mutate: archiveKey } = useArchiveKey();

  const {
    control,
    formState: { isDirty, isValid },
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      keyName: name ?? '',
    },
  });

  const keyName = useWatch({
    control,
    name: 'keyName',
  });

  const handleRefreshKey = () => {
    if (projectId && apiKey && env) {
      rotateKey(
        { projectId, keyId: apiKey, env },
        {
          onSuccess: () => {
            onClose();
            triggerToast({
              variant: 'success',
              title: 'Key Rotated!',
              body: 'Please ensure you update all Capsule instances with the new key.',
            });
          },
          onError: () => {
            triggerToast({
              variant: 'error',
              title: 'Failed to Rotate Key',
              body: 'Please try again. If the problem persists, contact Capsule support.',
            });
          },
        },
      );
    }
  };

  const handleArchiveKey = () => {
    if (projectId && apiKey && env) {
      archiveKey(
        { projectId, keyId: apiKey, env },
        {
          onSuccess: () => {
            onClose();
            navigate('/');
            triggerToast({
              variant: 'success',
              title: 'Key Archived!',
            });
          },
          onError: () => {
            triggerToast({
              variant: 'error',
              title: 'Failed to Archive Key',
              body: 'Please try again. If the problem persists, contact Capsule support.',
            });
          },
        },
      );
    }
  };

  const handleSaveClick = () => {
    if (projectId && apiKey && env) {
      saveChanges(
        { projectId, keyId: apiKey, env, data: { displayName: keyName } },
        {
          onSuccess: () => {
            onClose();
            triggerToast({
              variant: 'success',
              title: 'Key Updated!',
            });
          },
          onError: () => {
            triggerToast({
              variant: 'error',
              title: 'Failed to Update Key',
              body: 'Please try again. If the problem persists, contact Capsule support.',
            });
          },
        },
      );
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit API Key" subtitle="Make changes to your API Key">
      <>
        <Controller
          name="keyName"
          control={control}
          rules={{
            required: 'Key name is required',
          }}
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <CpslInput
              placeholder="Key Name"
              onCpslInput={e => {
                onChange(e.detail.value);
              }}
              onCpslBlur={onBlur}
              value={value}
              errorText={error?.message}
            />
          )}
        />
        <CpslButton disabled={!isDirty || !isValid} fullWidth onClick={handleSaveClick}>
          Save Changes
        </CpslButton>
        <CpslButton fullWidth onClick={handleRefreshKey} variant="secondary">
          <CpslIcon slot="start" icon="refresh" />
          Refresh API Key
        </CpslButton>
        <CpslButton fullWidth onClick={handleArchiveKey} variant="secondary">
          <CpslIcon slot="start" icon="cube" />
          Archive API Key
        </CpslButton>
      </>
    </Modal>
  );
};
