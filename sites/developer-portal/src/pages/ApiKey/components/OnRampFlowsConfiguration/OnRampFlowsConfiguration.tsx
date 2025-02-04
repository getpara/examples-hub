import { styled } from 'styled-components';
import { ENABLED_FLOW_OPTIONS } from '../../config';
import { InnerConfigurationCard } from '../InnerConfigurationCard';
import { CpslText } from '@getpara/react-components';
import { Controller } from 'react-hook-form';
import { useOnRampConfigFlowsFormData } from '../../hooks/useOnRampConfigFormData';
import { EnabledFlow } from '@getpara/react-sdk';
import { DOCS_LINK } from '../../../../utils/constants';
import { ConfigurationCard } from '../ConfigurationCard';
import { FormProvider } from 'react-hook-form';
import { ConfigurationActions } from '../ConfigurationActions';

const lookup = {
  [EnabledFlow.BUY]: 'isBuyEnabled',
  [EnabledFlow.RECEIVE]: 'isReceiveEnabled',
  [EnabledFlow.WITHDRAW]: 'isWithdrawEnabled',
};

export const OnRampFlowsConfiguration = () => {
  const form = useOnRampConfigFlowsFormData();

  return (
    <ConfigurationCard
      title="On-Ramp Flows"
      subtitle="Configure what options your users will see for on- or off-ramping of funds."
      // TODO: customize the docs link
      docsLink={DOCS_LINK}
    >
      <FormProvider {...form}>
        {ENABLED_FLOW_OPTIONS.map(option => {
          return (
            <Controller
              name={lookup[option.value] as 'isBuyEnabled'}
              key={option.value}
              render={({ field: { onChange, value } }) => (
                <InnerConfigurationCard isSelectable isSelected={!!value} onSelect={() => onChange(!value)}>
                  <SelectableCardContentContainer>
                    <SelectableCardTitleContainer>
                      <CpslText weight="semiBold">{option.title}</CpslText>
                      <CpslText variant="bodyS">{option.subtitle}</CpslText>
                    </SelectableCardTitleContainer>
                  </SelectableCardContentContainer>
                </InnerConfigurationCard>
              )}
            />
          );
        })}
        <ConfigurationActions />
      </FormProvider>
    </ConfigurationCard>
  );
};

const SelectableCardContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SelectableCardTitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;
