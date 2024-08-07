import { OnRampPurchaseStatus } from '@usecapsule/web-sdk';
import { CreationStepSubheading, Heading, SpinnerContainer } from '../common.js';
import { ON_RAMP_PROVIDERS } from '../../constants/constants.js';
import { useModalStore } from '../../stores/index.js';
import { CpslSpinner } from '@usecapsule/react-components';

export const AddingFunds = () => {
  const onRampPurchase = useModalStore(state => state.onRampPurchase);

  return (
    <>
      <SpinnerContainer>
        <CpslSpinner />
      </SpinnerContainer>
      <Heading>
        <span>Adding Funds...</span>
      </Heading>
      <CreationStepSubheading>
        <span>
          Follow the prompts presented by{' '}
          {OnRampPurchaseStatus ? ON_RAMP_PROVIDERS[onRampPurchase.provider].name : 'the provider'}.
        </span>
      </CreationStepSubheading>
    </>
  );
};
