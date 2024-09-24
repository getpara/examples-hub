import { CpslButton, CpslSelect, CpslSelectItem, CpslText } from '@usecapsule/react-components';
import styled from 'styled-components';
import { CpslSelectCustomEvent } from '@usecapsule/core-components';
import { Environment } from '../../../types/environment';
import { formatEnvName, getKeyColor } from '../../../utils/apiKey';
import { Modal } from '../../../components/Modal/Modal';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useCreateApiKey } from '../../../hooks/api/mutations/useCreateApiKey';
import { ENV_VARS, IS_BETA, IS_PROD } from '../../../utils/constants';
import { triggerToast } from '../../../utils/toasts';
import { useParams } from 'react-router-dom';

interface CreateKeyModalProps {
  open: boolean;
  onClose: () => void;
}

const ENVIRONMENT_OPTIONS: Environment[] = IS_PROD
  ? [Environment.PROD, Environment.BETA]
  : IS_BETA
    ? [Environment.BETA, Environment.SANDBOX]
    : [ENV_VARS.environment as Environment];

const DEFAULT_VALUES = {
  environment: IS_PROD ? undefined : (ENV_VARS.environment as Environment),
};

export const CreateKeyModal = ({ open, onClose }: CreateKeyModalProps) => {
  const { mutate: createKey } = useCreateApiKey();
  const { projectId } = useParams();

  const {
    control,
    formState: { isValid },
    reset,
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: DEFAULT_VALUES,
  });
  const [environment] = useWatch({
    control,
    name: ['environment'],
  });

  const handleCreateClick = () => {
    if (environment && projectId) {
      createKey(
        {
          projectId,
          env: environment.toLowerCase(),
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

  const handleExited = () => {
    reset(DEFAULT_VALUES);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      onExited={handleExited}
      title="Create API Key"
      subtitle="Select the environment for your key"
    >
      <>
        <Content>
          <Controller
            name="environment"
            control={control}
            rules={{
              required: 'Environment is required',
            }}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
              return (
                <CpslSelect
                  placeholder="Select Environment"
                  onCpslSelectValueChange={(e: CpslSelectCustomEvent<string>) => {
                    onChange(e.detail as Environment);
                  }}
                  onCpslBlur={onBlur}
                  selectedValue={value}
                  showFormattedSelectedItem
                  errorText={error?.message}
                >
                  {value && (
                    <EnvItemContainer slot="selected-item">
                      <EnvIcon $environment={value as Environment} />
                      <EnvText>{formatEnvName(value as Environment)}</EnvText>
                    </EnvItemContainer>
                  )}
                  {ENVIRONMENT_OPTIONS.map(env => (
                    <CpslSelectItem key={env} slot="items" value={env}>
                      <EnvItemContainer>
                        <EnvIcon $environment={env} />
                        <EnvText>{formatEnvName(env)}</EnvText>
                      </EnvItemContainer>
                    </CpslSelectItem>
                  ))}
                </CpslSelect>
              );
            }}
          />
        </Content>
        <CpslButton disabled={!isValid} fullWidth onClick={handleCreateClick}>
          Create API Key
        </CpslButton>
      </>
    </Modal>
  );
};

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const EnvItemContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const EnvIcon = styled.div<{ $environment: Environment }>`
  height: 10px;
  width: 10px;
  border-radius: 10px;
  background-color: ${({ $environment }) => getKeyColor($environment)};
`;

const EnvText = styled(CpslText)`
  text-transform: capitalize;
`;
