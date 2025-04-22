import { CpslSwitch, CpslText } from '@getpara/react-components';
import { InnerConfigurationCard } from '../InnerConfigurationCard';
import { Controller } from 'react-hook-form';
import { InlineText } from '../../../../components/common';
import styled from 'styled-components';

export const SupportedAuthMethods = () => {
  return (
    <Controller
      name="supportedAuthMethods"
      rules={{
        validate: {
          isCorrectForm: (value?: any) => {
            return (!!value && value.length > 0) || 'At least one auth method is required.';
          },
        },
      }}
      render={({ field: { onChange: setSupportedAuthMethods, value: supportedAuthMethods }, fieldState }) => {
        return (
          <InnerConfigurationCard>
            <InlineContainer>
              <InlineText weight="medium">
                Passkey:{' '}
                <SuccessText weight="medium">{supportedAuthMethods?.includes('PASSKEY') ? 'On' : 'Off'}</SuccessText>
              </InlineText>

              <CpslSwitch
                checked={supportedAuthMethods?.includes('PASSKEY') ?? false}
                onClick={e => {
                  const isChecked = !e.currentTarget.checked;
                  const newValue = isChecked
                    ? [...supportedAuthMethods!, 'PASSKEY']
                    : (supportedAuthMethods?.filter((v: string) => v !== 'PASSKEY') ?? []);
                  setSupportedAuthMethods(newValue);
                }}
              />
            </InlineContainer>
            <InlineContainer>
              <InlineText weight="medium">
                Password:{' '}
                <SuccessText weight="medium">{supportedAuthMethods?.includes('PASSWORD') ? 'On' : 'Off'}</SuccessText>
              </InlineText>

              <CpslSwitch
                checked={supportedAuthMethods?.includes('PASSWORD') ?? false}
                onClick={e => {
                  const isChecked = !e.currentTarget.checked;
                  const newValue = isChecked
                    ? [...supportedAuthMethods!, 'PASSWORD']
                    : (supportedAuthMethods?.filter((v: string) => v !== 'PASSWORD') ?? []);
                  setSupportedAuthMethods(newValue);
                }}
              />
            </InlineContainer>
            {fieldState.error?.message && (
              <Error color="error" variant="bodyS">
                {fieldState.error?.message ?? null}
              </Error>
            )}
          </InnerConfigurationCard>
        );
      }}
    />
  );
};

const SuccessText = styled(InlineText)`
  --color-override: var(--cpsl-color-utility-green);
`;

const InlineContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const Error = styled(CpslText)`
  min-height: 22px;
`;
