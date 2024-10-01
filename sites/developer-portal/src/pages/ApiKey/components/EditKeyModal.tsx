import { CpslButton, CpslIcon, CpslText } from '@usecapsule/react-components';
import { Modal } from '../../../components/Modal/Modal';
import { useUpdateApiKey } from '../../../hooks/api/mutations/useUpdateApiKey';
import { useParams } from 'react-router-dom';
import { useRotateKey } from '../../../hooks/api/mutations/useRotateKey';
import { useArchiveKey } from '../../../hooks/api/mutations/useArchiveKey';
import { triggerToast } from '../../../utils/toasts';
import { useGetAvailableKeyEnvs, useGetOrganizationKey } from '../../../hooks/api/queries/useOrganizationKeys';
import { Environment } from '../../../types/environment';
import { formatEnvName } from '../../../utils/apiKey';
import { useGetSelectedOrganizationIsValid } from '../../../hooks/api/queries/useOrganizations';

interface EditKeyModalProps {
  open: boolean;
  onClose: () => void;
}

export const EditKeyModal = ({ open, onClose }: EditKeyModalProps) => {
  const { apiKey, env, projectId } = useParams();
  const { mutate: unArchiveKey } = useUpdateApiKey();
  const { mutate: rotateKey } = useRotateKey();
  const { mutate: archiveKey } = useArchiveKey();
  const { data: apiKeyData } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', env as Environment);
  const { data: availableEnvs } = useGetAvailableKeyEnvs(projectId ?? '');
  const { data: orgValid } = useGetSelectedOrganizationIsValid();

  const canUnarchive = availableEnvs?.includes(apiKeyData?.environment.toUpperCase() as Environment);

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

  const handleUnArchiveKey = () => {
    if (canUnarchive && projectId && apiKey && env) {
      unArchiveKey(
        { projectId, keyId: apiKey, env, data: { archived: false } },
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

  if (!orgValid) {
    return null;
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit API Key" subtitle="Make changes to your API Key">
      <>
        <CpslButton fullWidth onClick={handleRefreshKey} variant="secondary" disabled={apiKeyData?.archived}>
          <CpslIcon slot="start" icon="refresh" />
          Refresh API Key
        </CpslButton>
        <CpslButton
          fullWidth
          onClick={apiKeyData?.archived ? handleUnArchiveKey : handleArchiveKey}
          variant="secondary"
          disabled={apiKeyData?.archived && !canUnarchive}
        >
          <CpslIcon slot="start" icon={apiKeyData?.archived ? 'cubeOutline' : 'cube03'} />
          {apiKeyData?.archived ? 'Unarchive' : 'Archive'} API Key
        </CpslButton>
        {apiKeyData?.archived && !canUnarchive && (
          <CpslText color="error">
            Please archive your current {formatEnvName(apiKeyData?.environment)} key to unarchive this key.
          </CpslText>
        )}
      </>
    </Modal>
  );
};
