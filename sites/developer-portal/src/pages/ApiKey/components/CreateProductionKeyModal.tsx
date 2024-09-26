import { CpslAlert, CpslButton, CpslInput } from '@usecapsule/react-components';
import { Modal } from '../../../components/Modal/Modal';
import { useNavigate, useParams } from 'react-router-dom';
import { Controller, useFormContext } from 'react-hook-form';
import { triggerToast } from '../../../utils/toasts';
import { useGetAvailableKeyEnvs } from '../../../hooks/api/queries/useOrganizationKeys';
import { Environment } from '../../../types/environment';
import { UpdateApiKeyBody } from '../../../types/api';
import { useCreateApiKey } from '../../../hooks/api/mutations/useCreateApiKey';
import { IS_PROD } from '../../../utils/constants';
import { useCanCreateProdKeys } from '../../../hooks/permissions/useCanCreateProdKeys';
import { GradientCTAButton } from '../../../components/GradientCTAButton/GradientCTAButton';
import styled from 'styled-components';
import { HTTPS_URL_REGEX } from '../../../utils/regex';

interface CopyToModalProps {
  open: boolean;
  onClose: () => void;
}

export const CreateProductionKeyModal = ({ open, onClose }: CopyToModalProps) => {
  const { projectId } = useParams();
  const { data: availableKeyEnvs } = useGetAvailableKeyEnvs(projectId ?? '');
  const { mutate: createApiKey, isPending } = useCreateApiKey();
  const { canCreateProdKeys } = useCanCreateProdKeys();
  const navigate = useNavigate();

  const {
    control,
    formState: { isValid, defaultValues },
    reset,
  } = useFormContext();

  const canCopy = isValid;
  const isVisible = availableKeyEnvs?.includes(IS_PROD ? Environment.PROD : Environment.BETA);

  const handleConfirmClick = () => {
    if (isVisible && canCopy && projectId) {
      createApiKey(
        {
          projectId,
          env: IS_PROD ? Environment.PROD : Environment.BETA,
          // Using default values here so we don't copy unsaved changes
          data: defaultValues as UpdateApiKeyBody,
        },
        {
          onSuccess: () => {
            onClose();
            triggerToast({
              variant: 'success',
              title: 'Key Created!',
            });
          },
          onError: () => {
            triggerToast({
              variant: 'error',
              title: 'Failed to Create Key',
              body: 'Please try again. If the problem persists, contact Capsule support.',
            });
          },
        },
      );
    }
  };

  const handleUpgradeClick = () => {
    navigate('/billing');
  };

  const handleExited = () => {
    reset(defaultValues);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      onExited={handleExited}
      title={`Create ${IS_PROD ? 'Production' : 'Beta'} Key`}
      subtitle={`This will create a ${IS_PROD ? 'Production' : 'Beta'} API key with all the settings of the current ${IS_PROD ? 'Beta' : 'Sandbox'} API Key.`}
    >
      <>
        {canCreateProdKeys ? (
          <>
            <Controller
              name="homepageUrl"
              control={control}
              rules={{
                required: 'Website URL is required',
                pattern: {
                  value: HTTPS_URL_REGEX,
                  message: 'Must be a secure (https) url',
                },
              }}
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <CpslInput
                  label="Website URL"
                  placeholder="https://www.yourwebsite.com"
                  onCpslInput={e => {
                    onChange(e.detail.value);
                  }}
                  onCpslBlur={onBlur}
                  value={value}
                  errorText={error?.message}
                />
              )}
            />
            <CpslButton disabled={!canCopy || isPending} fullWidth onClick={handleConfirmClick}>
              Create
            </CpslButton>
          </>
        ) : (
          <>
            <StyledAlert variant="error">{`${IS_PROD ? 'Production' : 'Beta'} API Keys are only available on paid plans. Please upgrade.`}</StyledAlert>
            <GradientCTAButton fullWidth onClick={handleUpgradeClick}>
              Upgrade
            </GradientCTAButton>
          </>
        )}
      </>
    </Modal>
  );
};

const StyledAlert = styled(CpslAlert)`
  --container-justify-content: flex-start;

  --title-container-align-items: flex-start;
`;
