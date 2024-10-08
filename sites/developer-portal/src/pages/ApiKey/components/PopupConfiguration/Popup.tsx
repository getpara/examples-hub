import { CpslSwitch } from '@usecapsule/react-components';
import { InnerConfigurationCard } from '../InnerConfigurationCard';
import { Controller, useFormContext } from 'react-hook-form';
import { InlineText } from '../../../../components/common';
import styled from 'styled-components';
import { UpdatePopup } from '../../hooks/usePopupConfigFormData';

export const Popup = () => {
  const { control, getValues } = useFormContext<UpdatePopup>();

  const isChecked = getValues('transactionPopupsEnabled');

  return (
    <InnerConfigurationCard>
      <InlineContainer>
        <InlineText weight="medium">
          Status: <SuccessText weight="medium">{isChecked ? 'On' : 'Off'}</SuccessText>
        </InlineText>
        <Controller
          name="transactionPopupsEnabled"
          control={control}
          render={({ field: { onChange, value } }) => (
            <CpslSwitch
              checked={value ?? false}
              onClick={e => {
                onChange(!(e.currentTarget as any).checked);
              }}
            />
          )}
        />
      </InlineContainer>
    </InnerConfigurationCard>
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
