import { CpslSwitch } from '@getpara/react-components';
import { InnerConfigurationCard } from '../InnerConfigurationCard';
import { Controller, useFormContext } from 'react-hook-form';
import { InlineText } from '../../../../components/common';
import styled from 'styled-components';
import { UpdatePopup } from '../../hooks/usePopupConfigFormData';

export const Popup = () => {
  const { control, watch } = useFormContext<UpdatePopup>();

  const forceTransactionPopupsIsChecked = watch('forceTransactionPopups');

  return (
    <InnerConfigurationCard>
      <InlineContainer>
        <InlineText weight="medium">
          Status: <SuccessText weight="medium">{forceTransactionPopupsIsChecked ? 'On' : 'Off'}</SuccessText>
        </InlineText>
        <Controller
          name="forceTransactionPopups"
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
