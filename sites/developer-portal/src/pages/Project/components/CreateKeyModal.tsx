import { CpslButton, CpslInput, CpslSelect, CpslSelectItem, CpslText } from '@usecapsule/react-components';
import styled from 'styled-components';
import { CpslSelectCustomEvent } from '@usecapsule/core-components';
import { Environment } from '../../../types/environment';
import { formatEnvName, getKeyColor } from '../../../utils/apiKey';
import { Modal } from '../../../components/Modal/Modal';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useCreateApiKey } from '../../../hooks/api/mutations/useCreateApiKey';
import { triggerToast } from '../../../utils/toasts';
import { useParams } from 'react-router-dom';
import { HTTPS_URL_REGEX } from '../../../utils/regex';
import { useGetAvailableKeyEnvs } from '../../../hooks/api/queries/useOrganizationKeys';

interface CreateKeyModalProps {
  open: boolean;
  onClose: () => void;
}

const DEFAULT_VALUES = {
  environment: '',
  homepageUrl: '',
};

export const CreateKeyModal = ({ open, onClose }: CreateKeyModalProps) => {
  const { mutate: createKey } = useCreateApiKey();
  const { projectId } = useParams();
  const { data: availableKeyEnvs } = useGetAvailableKeyEnvs(projectId ?? '');

  const {
    control,
    formState: { isValid },
    reset,
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: DEFAULT_VALUES,
  });
  const [environment, homepageUrl] = useWatch({
    control,
    name: ['environment', 'homepageUrl'],
  });

  const handleCreateClick = () => {
    if (environment && projectId) {
      createKey(
        {
          projectId,
          env: environment.toLowerCase(),
          data: { homepageUrl },
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
                  {(availableKeyEnvs ?? []).map(env => (
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
